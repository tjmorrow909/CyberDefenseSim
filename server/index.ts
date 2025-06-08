import { createServer } from "http";
import app from "./app";
import { logger } from "./logger";
import { authenticateToken } from "./auth";

// Import route modules
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import contentRoutes from "./routes/content";

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api', contentRoutes);

// Legacy API compatibility routes (deprecated)
app.get("/api/users/:id", authenticateToken, async (req, res) => {
  res.redirect(`/api/users/${req.params.id}`);
});

app.get("/api/domains", async (req, res) => {
  res.redirect('/api/domains');
});

app.get("/api/scenarios", async (req, res) => {
  res.redirect('/api/scenarios');
});

// Create HTTP server
const server = createServer(app);
const port = process.env.PORT || 5000;

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Start server
server.listen(port, () => {
  logger.info(`CyberDefense Simulator server started`, {
    port,
    environment: process.env.NODE_ENV || 'development',
    url: `http://localhost:${port}`
  });
});
