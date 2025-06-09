import { createServer } from 'http';
import app from './app';
import { logger } from './logger';
import { authenticateToken } from './auth';
import { initializeDatabase, closeDatabaseConnection } from './db';
import { WebSocketService } from './websocket-service';

// Import route modules
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import contentRoutes from './routes/content';
import adminRoutes from './routes/admin';

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', contentRoutes);

// Legacy API compatibility routes (deprecated)
app.get('/api/users/:id', authenticateToken, async (req, res) => {
  res.redirect(`/api/users/${req.params.id}`);
});

app.get('/api/domains', async (req, res) => {
  res.redirect('/api/domains');
});

app.get('/api/scenarios', async (req, res) => {
  res.redirect('/api/scenarios');
});

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
    // Initialize database
    await initializeDatabase();

    // Start server
    server.listen(port, () => {
      // Initialize WebSocket service after server starts
      wsService = new WebSocketService(server);

      logger.info(`CyberDefense Simulator server started`, {
        port,
        environment: process.env.NODE_ENV || 'development',
        url: `http://localhost:${port}`,
        websocket: `ws://localhost:${port}/ws`,
        database: process.env.DATABASE_URL ? 'Connected' : 'In-memory',
      });
    });
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
}

startServer();
