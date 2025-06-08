import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';
import { ZodError } from 'zod';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  code?: string;
}

export class CustomError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific error classes
export class ValidationError extends CustomError {
  constructor(message: string, details?: any) {
    super(message, 400, true, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends CustomError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, true, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends CustomError {
  constructor(message: string = 'Access denied') {
    super(message, 403, true, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, true, 'NOT_FOUND_ERROR');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends CustomError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409, true, 'CONFLICT_ERROR');
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends CustomError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, true, 'RATE_LIMIT_ERROR');
    this.name = 'RateLimitError';
  }
}

export class DatabaseError extends CustomError {
  constructor(message: string = 'Database operation failed') {
    super(message, 500, true, 'DATABASE_ERROR');
    this.name = 'DatabaseError';
  }
}

// Error response formatter
function formatErrorResponse(error: AppError, req: Request) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const baseResponse = {
    success: false,
    message: error.message,
    code: error.code,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
  };

  if (isDevelopment) {
    return {
      ...baseResponse,
      stack: error.stack,
      details: error,
    };
  }

  return baseResponse;
}

// Handle Zod validation errors
function handleZodError(error: ZodError): ValidationError {
  const messages = error.errors.map(err => {
    const path = err.path.join('.');
    return `${path}: ${err.message}`;
  });
  
  return new ValidationError(`Validation failed: ${messages.join(', ')}`);
}

// Handle database errors
function handleDatabaseError(error: any): DatabaseError {
  // PostgreSQL error codes
  switch (error.code) {
    case '23505': // Unique violation
      return new ConflictError('Resource already exists');
    case '23503': // Foreign key violation
      return new ValidationError('Referenced resource does not exist');
    case '23502': // Not null violation
      return new ValidationError('Required field is missing');
    case '42P01': // Undefined table
      return new DatabaseError('Database table not found');
    default:
      return new DatabaseError('Database operation failed');
  }
}

// Main error handling middleware
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let appError: AppError = error as AppError;

  // Handle specific error types
  if (error instanceof ZodError) {
    appError = handleZodError(error);
  } else if (error.name === 'DatabaseError' || (error as any).code) {
    appError = handleDatabaseError(error);
  } else if (!appError.statusCode) {
    // Unknown error - treat as internal server error
    appError = new CustomError(
      process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
      500,
      false
    );
  }

  // Log error
  const logLevel = appError.statusCode >= 500 ? 'error' : 'warn';
  logger[logLevel]('Request error', {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      statusCode: appError.statusCode,
      code: appError.code,
    },
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
      params: req.params,
      query: req.query,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    },
    user: (req as any).user?.id,
  });

  // Send error response
  const response = formatErrorResponse(appError, req);
  res.status(appError.statusCode || 500).json(response);
};

// 404 handler for unmatched routes
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new NotFoundError(`Route ${req.method} ${req.path} not found`);
  next(error);
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Global unhandled rejection handler
export const setupGlobalErrorHandlers = (): void => {
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    logger.error('Unhandled Rejection', {
      reason: reason?.message || reason,
      stack: reason?.stack,
      promise: promise.toString(),
    });
    
    // In production, you might want to gracefully shutdown
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  });

  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception', {
      error: error.message,
      stack: error.stack,
    });
    
    // Always exit on uncaught exception
    process.exit(1);
  });
};

// Health check error
export class HealthCheckError extends CustomError {
  constructor(service: string, details?: any) {
    super(`Health check failed for ${service}`, 503, true, 'HEALTH_CHECK_ERROR');
    this.name = 'HealthCheckError';
  }
}
