import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';

// Auth validation schemas
export const registerSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces'),
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces'),
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

// User validation schemas
export const updateUserSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces')
    .optional(),
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces')
    .optional(),
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters')
    .optional()
});

// Progress validation schemas
export const updateProgressSchema = z.object({
  domainId: z.number().int().positive('Domain ID must be a positive integer'),
  progress: z.number().int().min(0).max(100, 'Progress must be between 0 and 100'),
  questionsCompleted: z.number().int().min(0).optional(),
  questionsCorrect: z.number().int().min(0).optional(),
  timeSpent: z.number().int().min(0).optional()
});

// Scenario validation schemas
export const updateScenarioSchema = z.object({
  completed: z.boolean().optional(),
  score: z.number().int().min(0).max(100).optional(),
  attempts: z.number().int().min(0).optional(),
  timeSpent: z.number().int().min(0).optional()
});

// Parameter validation schemas
export const userIdParamSchema = z.object({
  id: z.string().min(1, 'User ID is required')
});

export const domainIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Domain ID must be a number').transform(Number)
});

export const scenarioIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Scenario ID must be a number').transform(Number)
});

// Validation middleware factory
export function validateBody<T extends z.ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body);
      
      if (!result.success) {
        const errors = result.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        logger.warn('Request body validation failed', { 
          url: req.url, 
          method: req.method, 
          errors 
        });
        
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors
        });
      }
      
      req.body = result.data;
      next();
    } catch (error) {
      logger.error('Validation middleware error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
}

export function validateParams<T extends z.ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.params);
      
      if (!result.success) {
        const errors = result.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        logger.warn('Request params validation failed', { 
          url: req.url, 
          method: req.method, 
          errors 
        });
        
        return res.status(400).json({
          success: false,
          message: 'Invalid parameters',
          errors
        });
      }
      
      req.params = result.data;
      next();
    } catch (error) {
      logger.error('Validation middleware error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
}

export function validateQuery<T extends z.ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.query);
      
      if (!result.success) {
        const errors = result.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        logger.warn('Request query validation failed', { 
          url: req.url, 
          method: req.method, 
          errors 
        });
        
        return res.status(400).json({
          success: false,
          message: 'Invalid query parameters',
          errors
        });
      }
      
      req.query = result.data;
      next();
    } catch (error) {
      logger.error('Validation middleware error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
}
