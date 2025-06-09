import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import authRoutes from './auth';
import { AuthService } from '../auth';

// Mock dependencies
vi.mock('../auth');
vi.mock('../storage', () => ({
  storage: {
    getUserByEmail: vi.fn(),
    upsertUser: vi.fn(),
    storeRefreshToken: vi.fn(),
    getRefreshToken: vi.fn(),
    deleteRefreshToken: vi.fn(),
    updateUserActivity: vi.fn(),
    getUser: vi.fn(),
  },
}));
vi.mock('../logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

const mockedAuthService = vi.mocked(AuthService);
const { storage } = await import('../storage');
const mockedStorage = vi.mocked(storage);

// Create test app
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'StrongPass123!',
      };

      const hashedPassword = 'hashed-password';
      const userId = 'user123';
      const tokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      const createdUser = {
        id: userId,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        passwordHash: hashedPassword,
        xp: 0,
        streak: 0,
        profileImageUrl: null,
        lastActivity: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockedStorage.getUserByEmail.mockResolvedValue(undefined);
      mockedAuthService.hashPassword.mockResolvedValue(hashedPassword);
      mockedStorage.upsertUser.mockResolvedValue(createdUser);
      mockedAuthService.generateTokens.mockReturnValue(tokens);
      mockedStorage.storeRefreshToken.mockResolvedValue(undefined);

      const response = await request(app).post('/api/auth/register').send(userData).expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.accessToken).toBe(tokens.accessToken);
      expect(response.body.data.refreshToken).toBe(tokens.refreshToken);

      expect(mockedStorage.getUserByEmail).toHaveBeenCalledWith(userData.email);
      expect(mockedAuthService.hashPassword).toHaveBeenCalledWith(userData.password);
      expect(mockedStorage.upsertUser).toHaveBeenCalled();
      expect(mockedAuthService.generateTokens).toHaveBeenCalled();
      expect(mockedStorage.storeRefreshToken).toHaveBeenCalled();
    });

    it('should reject registration with existing email', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'existing@example.com',
        password: 'StrongPass123!',
      };

      const existingUser = {
        id: 'existing-user',
        email: userData.email,
        firstName: 'Existing',
        lastName: 'User',
        passwordHash: 'hash',
        xp: 0,
        streak: 0,
        profileImageUrl: null,
        lastActivity: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockedStorage.getUserByEmail.mockResolvedValue(existingUser);

      const response = await request(app).post('/api/auth/register').send(userData).expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    it('should reject registration with invalid data', async () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        password: 'weak',
      };

      const response = await request(app).post('/api/auth/register').send(invalidData).expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user successfully', async () => {
      const loginData = {
        email: 'john.doe@example.com',
        password: 'StrongPass123!',
      };

      const user = {
        id: 'user123',
        email: loginData.email,
        firstName: 'John',
        lastName: 'Doe',
        passwordHash: 'hashed-password',
        xp: 100,
        streak: 5,
        profileImageUrl: null,
        lastActivity: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const tokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      mockedStorage.getUserByEmail.mockResolvedValue(user);
      mockedAuthService.comparePassword.mockResolvedValue(true);
      mockedAuthService.generateTokens.mockReturnValue(tokens);
      mockedStorage.storeRefreshToken.mockResolvedValue(undefined);
      mockedStorage.updateUserActivity.mockResolvedValue(undefined);

      const response = await request(app).post('/api/auth/login').send(loginData).expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(loginData.email);
      expect(response.body.data.accessToken).toBe(tokens.accessToken);

      expect(mockedStorage.getUserByEmail).toHaveBeenCalledWith(loginData.email);
      expect(mockedAuthService.comparePassword).toHaveBeenCalledWith(loginData.password, user.passwordHash);
      expect(mockedStorage.updateUserActivity).toHaveBeenCalledWith(user.id);
    });

    it('should reject login with invalid credentials', async () => {
      const loginData = {
        email: 'john.doe@example.com',
        password: 'wrong-password',
      };

      const user = {
        id: 'user123',
        email: loginData.email,
        firstName: 'John',
        lastName: 'Doe',
        passwordHash: 'hashed-password',
        xp: 0,
        streak: 0,
        profileImageUrl: null,
        lastActivity: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockedStorage.getUserByEmail.mockResolvedValue(user);
      mockedAuthService.comparePassword.mockResolvedValue(false);

      const response = await request(app).post('/api/auth/login').send(loginData).expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid email or password');
    });

    it('should reject login for non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password',
      };

      mockedStorage.getUserByEmail.mockResolvedValue(undefined);

      const response = await request(app).post('/api/auth/login').send(loginData).expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid email or password');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh tokens successfully', async () => {
      const refreshData = {
        refreshToken: 'valid-refresh-token',
      };

      const payload = {
        userId: 'user123',
        email: 'john.doe@example.com',
        type: 'refresh' as const,
      };

      const storedToken = {
        id: 1,
        userId: payload.userId,
        token: refreshData.refreshToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        createdAt: new Date(),
      };

      const user = {
        id: payload.userId,
        email: payload.email,
        firstName: 'John',
        lastName: 'Doe',
        passwordHash: 'hash',
        xp: 0,
        streak: 0,
        profileImageUrl: null,
        lastActivity: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const newTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      mockedAuthService.verifyToken.mockReturnValue(payload);
      mockedStorage.getRefreshToken.mockResolvedValue(storedToken);
      mockedStorage.getUser.mockResolvedValue(user);
      mockedAuthService.generateTokens.mockReturnValue(newTokens);
      mockedStorage.deleteRefreshToken.mockResolvedValue(undefined);
      mockedStorage.storeRefreshToken.mockResolvedValue(undefined);

      const response = await request(app).post('/api/auth/refresh').send(refreshData).expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBe(newTokens.accessToken);
      expect(response.body.data.refreshToken).toBe(newTokens.refreshToken);

      expect(mockedStorage.deleteRefreshToken).toHaveBeenCalledWith(refreshData.refreshToken);
      expect(mockedStorage.storeRefreshToken).toHaveBeenCalledWith(user.id, newTokens.refreshToken);
    });

    it('should reject invalid refresh token', async () => {
      const refreshData = {
        refreshToken: 'invalid-refresh-token',
      };

      mockedAuthService.verifyToken.mockReturnValue(null);

      const response = await request(app).post('/api/auth/refresh').send(refreshData).expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid refresh token');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const logoutData = {
        refreshToken: 'refresh-token-to-delete',
      };

      mockedStorage.deleteRefreshToken.mockResolvedValue(undefined);

      const response = await request(app).post('/api/auth/logout').send(logoutData).expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Logout successful');

      expect(mockedStorage.deleteRefreshToken).toHaveBeenCalledWith(logoutData.refreshToken);
    });
  });
});
