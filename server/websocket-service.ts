import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { logger } from './logger';
import { AuthService } from './auth';
import { storage } from './storage';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  isAlive?: boolean;
}

interface WebSocketMessage {
  type: string;
  data?: any;
  timestamp: number;
}

export class WebSocketService {
  private wss: WebSocketServer;
  private clients: Map<string, AuthenticatedWebSocket[]> = new Map();

  constructor(server: any) {
    this.wss = new WebSocketServer({
      server,
      path: '/ws',
      verifyClient: this.verifyClient.bind(this),
    });

    this.wss.on('connection', this.handleConnection.bind(this));
    this.setupHeartbeat();

    logger.info('WebSocket service initialized');
  }

  private async verifyClient(info: { origin: string; secure: boolean; req: IncomingMessage }): Promise<boolean> {
    try {
      const url = new URL(info.req.url || '', `http://${info.req.headers.host}`);
      const token = url.searchParams.get('token');

      if (!token) {
        logger.warn('WebSocket connection rejected: No token provided');
        return false;
      }

      const payload = AuthService.verifyToken(token);
      if (!payload || payload.type !== 'access') {
        logger.warn('WebSocket connection rejected: Invalid token');
        return false;
      }

      // Store userId for later use
      (info.req as any).userId = payload.userId;
      return true;
    } catch (error) {
      logger.warn('WebSocket verification failed', { error: error.message });
      return false;
    }
  }

  private handleConnection(ws: AuthenticatedWebSocket, req: IncomingMessage) {
    const userId = (req as any).userId;
    ws.userId = userId;
    ws.isAlive = true;

    // Add client to user's connection list
    if (!this.clients.has(userId)) {
      this.clients.set(userId, []);
    }
    this.clients.get(userId)!.push(ws);

    logger.info('WebSocket client connected', { userId, totalConnections: this.wss.clients.size });

    // Send welcome message
    this.sendToClient(ws, {
      type: 'connected',
      data: { message: 'Connected to CyberDefense Simulator' },
      timestamp: Date.now(),
    });

    // Handle incoming messages
    ws.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString()) as WebSocketMessage;
        this.handleMessage(ws, message);
      } catch (error) {
        logger.warn('Invalid WebSocket message', { error: error.message, userId });
      }
    });

    // Handle client disconnect
    ws.on('close', () => {
      this.removeClient(userId, ws);
      logger.info('WebSocket client disconnected', { userId });
    });

    // Handle pong responses for heartbeat
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    // Handle errors
    ws.on('error', error => {
      logger.error('WebSocket error', { error: error.message, userId });
      this.removeClient(userId, ws);
    });
  }

  private handleMessage(ws: AuthenticatedWebSocket, message: WebSocketMessage) {
    const userId = ws.userId!;

    switch (message.type) {
      case 'ping':
        this.sendToClient(ws, {
          type: 'pong',
          timestamp: Date.now(),
        });
        break;

      case 'subscribe':
        // Handle subscription to specific events
        this.handleSubscription(ws, message.data);
        break;

      case 'scenario_start':
        // Notify when user starts a scenario
        this.broadcastToUser(userId, {
          type: 'scenario_started',
          data: { scenarioId: message.data.scenarioId },
          timestamp: Date.now(),
        });
        break;

      case 'scenario_progress':
        // Real-time scenario progress updates
        this.broadcastToUser(userId, {
          type: 'scenario_progress_update',
          data: message.data,
          timestamp: Date.now(),
        });
        break;

      default:
        logger.warn('Unknown WebSocket message type', { type: message.type, userId });
    }
  }

  private handleSubscription(ws: AuthenticatedWebSocket, subscriptionData: any) {
    // Store subscription preferences on the WebSocket
    (ws as any).subscriptions = subscriptionData;

    this.sendToClient(ws, {
      type: 'subscription_confirmed',
      data: subscriptionData,
      timestamp: Date.now(),
    });
  }

  private removeClient(userId: string, ws: AuthenticatedWebSocket) {
    const userClients = this.clients.get(userId);
    if (userClients) {
      const index = userClients.indexOf(ws);
      if (index > -1) {
        userClients.splice(index, 1);
      }

      if (userClients.length === 0) {
        this.clients.delete(userId);
      }
    }
  }

  private sendToClient(ws: AuthenticatedWebSocket, message: WebSocketMessage) {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(message));
      } catch (error) {
        logger.error('Failed to send WebSocket message', { error: error.message });
      }
    }
  }

  // Public methods for broadcasting events

  public broadcastToUser(userId: string, message: WebSocketMessage) {
    const userClients = this.clients.get(userId);
    if (userClients) {
      userClients.forEach(ws => {
        this.sendToClient(ws, message);
      });
    }
  }

  public broadcastToAll(message: WebSocketMessage) {
    this.wss.clients.forEach(ws => {
      this.sendToClient(ws as AuthenticatedWebSocket, message);
    });
  }

  public notifyAchievementEarned(userId: string, achievement: any) {
    this.broadcastToUser(userId, {
      type: 'achievement_earned',
      data: achievement,
      timestamp: Date.now(),
    });
  }

  public notifyProgressUpdate(userId: string, progress: any) {
    this.broadcastToUser(userId, {
      type: 'progress_updated',
      data: progress,
      timestamp: Date.now(),
    });
  }

  public notifyScenarioCompleted(userId: string, scenarioData: any) {
    this.broadcastToUser(userId, {
      type: 'scenario_completed',
      data: scenarioData,
      timestamp: Date.now(),
    });
  }

  public notifyLeaderboardUpdate(leaderboardData: any) {
    this.broadcastToAll({
      type: 'leaderboard_updated',
      data: leaderboardData,
      timestamp: Date.now(),
    });
  }

  // Heartbeat to detect broken connections
  private setupHeartbeat() {
    setInterval(() => {
      this.wss.clients.forEach((ws: AuthenticatedWebSocket) => {
        if (ws.isAlive === false) {
          ws.terminate();
          return;
        }

        ws.isAlive = false;
        ws.ping();
      });
    }, 30000); // 30 seconds
  }

  public getConnectionStats() {
    return {
      totalConnections: this.wss.clients.size,
      uniqueUsers: this.clients.size,
      userConnections: Array.from(this.clients.entries()).map(([userId, connections]) => ({
        userId,
        connections: connections.length,
      })),
    };
  }

  public close() {
    this.wss.close();
    logger.info('WebSocket service closed');
  }
}
