import { Router, Response } from 'express';
import { nanoid } from 'nanoid';
import { AuthService, AuthenticatedRequest } from '../auth';
import { storage } from '../storage';
import { logger } from '../logger';
import {
  validateBody,
  registerSchema,
  loginSchema,
  refreshTokenSchema
} from '../validation';

const router = Router();

// Register new user
router.post('/register', validateBody(registerSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const passwordHash = await AuthService.hashPassword(password);

    // Create user
    const userId = nanoid();
    const user = await storage.upsertUser({
      id: userId,
      email,
      firstName,
      lastName,
      passwordHash,
      profileImageUrl: null
    });

    // Generate tokens
    const { accessToken, refreshToken } = AuthService.generateTokens(userId, email);

    // Store refresh token
    await storage.storeRefreshToken(userId, refreshToken);

    logger.info('User registered successfully', { userId, email });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          xp: user.xp,
          streak: user.streak
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    logger.error('Registration error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
});

// Login user
router.post('/login', validateBody(loginSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await storage.getUserByEmail(email);
    if (!user || !user.passwordHash) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isValidPassword = await AuthService.comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = AuthService.generateTokens(user.id, user.email);

    // Store refresh token
    await storage.storeRefreshToken(user.id, refreshToken);

    // Update last activity
    await storage.updateUserActivity(user.id);

    logger.info('User logged in successfully', { userId: user.id, email });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          xp: user.xp,
          streak: user.streak
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    logger.error('Login error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

// Refresh access token
router.post('/refresh', validateBody(refreshTokenSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { refreshToken } = req.body;

    // Verify refresh token
    const payload = AuthService.verifyToken(refreshToken);
    if (!payload || payload.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Check if refresh token exists in database
    const storedToken = await storage.getRefreshToken(refreshToken);
    if (!storedToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not found'
      });
    }

    // Check if token is expired
    if (new Date() > storedToken.expiresAt) {
      await storage.deleteRefreshToken(refreshToken);
      return res.status(401).json({
        success: false,
        message: 'Refresh token expired'
      });
    }

    // Verify user still exists
    const user = await storage.getUser(payload.userId);
    if (!user) {
      await storage.deleteRefreshToken(refreshToken);
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = AuthService.generateTokens(user.id, user.email);

    // Replace old refresh token with new one
    await storage.deleteRefreshToken(refreshToken);
    await storage.storeRefreshToken(user.id, newRefreshToken);

    logger.info('Token refreshed successfully', { userId: user.id });

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    logger.error('Token refresh error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Token refresh failed'
    });
  }
});

// Logout user
router.post('/logout', validateBody(refreshTokenSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { refreshToken } = req.body;

    // Delete refresh token from database
    await storage.deleteRefreshToken(refreshToken);

    logger.info('User logged out successfully');

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    logger.error('Logout error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
});

// Get current user profile
router.get('/me', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const user = await storage.getUser(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          xp: user.xp,
          streak: user.streak,
          lastActivity: user.lastActivity,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    logger.error('Get profile error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile'
    });
  }
});

export default router;
