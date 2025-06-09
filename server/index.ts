import { createServer } from 'http';
import app from './app';
import { logger } from './logger';
import { initializeDatabase, closeDatabaseConnection } from './db';
import { WebSocketService } from './websocket-service';

// Create HTTP server
const server = createServer(app);
const port = process.env.PORT || 5000;

// Initialize WebSocket service
let wsService: WebSocketService;

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(async () => {
    if (wsService) wsService.close();
    await closeDatabaseConnection();
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(async () => {
    if (wsService) wsService.close();
    await closeDatabaseConnection();
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Initialize database and start server
async function startServer() {
  try {
    // Validate environment configuration
    if (process.env.NODE_ENV === 'production') {
      const requiredEnvVars = ['JWT_SECRET', 'SESSION_SECRET'];
      const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

      if (missingVars.length > 0) {
        logger.error('Missing required environment variables for production', { missingVars });
        process.exit(1);
      }

      // Log CORS configuration for debugging
      logger.info('Production CORS configuration', {
        allowedOrigins: process.env.ALLOWED_ORIGINS,
        renderServiceName: process.env.RENDER_SERVICE_NAME,
        renderExternalUrl: process.env.RENDER_EXTERNAL_URL,
        render: process.env.RENDER
      });
    }

    // Initialize database
    await initializeDatabase();

    // Start server
    server.listen(port, () => {
      // Initialize WebSocket service after server starts
      wsService = new WebSocketService(server);

      const baseUrl = process.env.NODE_ENV === 'production'
        ? (process.env.RENDER_EXTERNAL_URL || `https://cyberdefensesim.onrender.com`)
        : `http://localhost:${port}`;

      logger.info(`CyberDefense Simulator server started`, {
        port,
        environment: process.env.NODE_ENV || 'development',
        url: baseUrl,
        websocket: `${baseUrl.replace('http', 'ws')}/ws`,
        database: process.env.DATABASE_URL ? 'Connected' : 'In-memory',
      });
    });
  } catch (error) {
    logger.error('Failed to start server', { error: error instanceof Error ? error.message : String(error) });
    process.exit(1);
  }
}

startServer();
