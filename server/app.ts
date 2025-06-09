import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { logger } from './logger';
import { errorHandler, notFoundHandler, setupGlobalErrorHandlers } from './error-handler';
import { authenticateToken } from './auth';

// Import route modules
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import contentRoutes from './routes/content';
import adminRoutes from './routes/admin';

const app = express();

// Setup global error handlers
setupGlobalErrorHandlers();

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https://replit.com'],
        connectSrc: ["'self'", 'ws:', 'wss:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration
const corsOptions = {
  origin: function (origin: string | undefined, callback: (_err: Error | null, _allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5000',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5000',
    ];

    // Add production domains from environment
    if (process.env.ALLOWED_ORIGINS) {
      allowedOrigins.push(...process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()));
    }

    // Auto-detect Render.com domains
    if (process.env.RENDER_SERVICE_NAME || process.env.RENDER) {
      const renderDomain = `https://${process.env.RENDER_SERVICE_NAME || 'cyberdefensesim'}.onrender.com`;
      allowedOrigins.push(renderDomain);
    }

    // Auto-detect current domain in production
    if (process.env.NODE_ENV === 'production') {
      // Add common production domain patterns
      if (process.env.RENDER_EXTERNAL_URL) {
        allowedOrigins.push(process.env.RENDER_EXTERNAL_URL);
      }

      // Add the specific Render domain we know about
      allowedOrigins.push('https://cyberdefensesim.onrender.com');
    }

    // Remove duplicates
    const uniqueOrigins = [...new Set(allowedOrigins)];

    if (uniqueOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      logger.warn('CORS blocked request from origin', {
        origin,
        allowedOrigins: uniqueOrigins,
        nodeEnv: process.env.NODE_ENV,
        renderServiceName: process.env.RENDER_SERVICE_NAME,
        renderExternalUrl: process.env.RENDER_EXTERNAL_URL
      });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
};

// Apply CORS only to API routes, not static assets
app.use('/api', cors(corsOptions));
app.use('/health', cors(corsOptions));

// Log CORS configuration on startup
logger.info('CORS configuration initialized', {
  nodeEnv: process.env.NODE_ENV,
  allowedOrigins: process.env.ALLOWED_ORIGINS,
  renderServiceName: process.env.RENDER_SERVICE_NAME,
  renderExternalUrl: process.env.RENDER_EXTERNAL_URL,
  render: process.env.RENDER
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });
  });

  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Mount API routes
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

// 404 handler for API routes
app.use('/api/*', notFoundHandler);

// Global error handling middleware (must be last)
app.use(errorHandler);

// Static file serving with proper MIME types and CORS headers
const staticOptions = {
  setHeaders: (res: Response, filePath: string) => {
    // Set proper MIME types
    if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (filePath.endsWith('.json')) {
      res.setHeader('Content-Type', 'application/json');
    }

    // Add CORS headers for static assets in production
    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    }
  },
  maxAge: process.env.NODE_ENV === 'production' ? '1y' : '0',
};

if (process.env.NODE_ENV === 'production') {
  const publicPath = path.resolve(process.cwd(), 'dist', 'public');
  app.use(express.static(publicPath, staticOptions));

  // SPA fallback
  app.get('*', (req: Request, res: Response) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.resolve(publicPath, 'index.html'));
    }
  });
} else {
  // Development static serving
  const distPath = path.resolve(process.cwd(), 'dist', 'public');
  app.use(express.static(distPath, staticOptions));

  app.get('*', (req: Request, res: Response) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.resolve(distPath, 'index.html'));
    }
  });
}

export default app;
