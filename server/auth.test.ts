import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from './auth';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock dependencies
vi.mock('bcryptjs');
vi.mock('jsonwebtoken');
vi.mock('./logger', () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

const mockedBcrypt = vi.mocked(bcrypt);
const mockedJwt = vi.mocked(jwt);

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret-key';
    process.env.JWT_EXPIRES_IN = '7d';
    process.env.REFRESH_TOKEN_EXPIRES_IN = '30d';
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', () => {
      const userId = 'user123';
      const email = 'test@example.com';

      mockedJwt.sign.mockReturnValueOnce('access-token').mockReturnValueOnce('refresh-token');

      const result = AuthService.generateTokens(userId, email);

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      expect(mockedJwt.sign).toHaveBeenCalledTimes(2);
      expect(mockedJwt.sign).toHaveBeenNthCalledWith(1, { userId, email, type: 'access' }, 'test-secret-key', {
        expiresIn: '7d',
      });
      expect(mockedJwt.sign).toHaveBeenNthCalledWith(2, { userId, email, type: 'refresh' }, 'test-secret-key', {
        expiresIn: '30d',
      });
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token', () => {
      const mockPayload = { userId: 'user123', email: 'test@example.com', type: 'access' };
      mockedJwt.verify.mockReturnValue(mockPayload as any);

      const result = AuthService.verifyToken('valid-token');

      expect(result).toEqual(mockPayload);
      expect(mockedJwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret-key');
    });

    it('should return null for invalid token', () => {
      mockedJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = AuthService.verifyToken('invalid-token');

      expect(result).toBeNull();
    });
  });

  describe('hashPassword', () => {
    it('should hash password with correct salt rounds', async () => {
      const password = 'testpassword';
      const hashedPassword = 'hashed-password';

      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);

      const result = await AuthService.hashPassword(password);

      expect(result).toBe(hashedPassword);
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(password, 12);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching passwords', async () => {
      mockedBcrypt.compare.mockResolvedValue(true as never);

      const result = await AuthService.comparePassword('password', 'hashed-password');

      expect(result).toBe(true);
      expect(mockedBcrypt.compare).toHaveBeenCalledWith('password', 'hashed-password');
    });

    it('should return false for non-matching passwords', async () => {
      mockedBcrypt.compare.mockResolvedValue(false as never);

      const result = await AuthService.comparePassword('wrong-password', 'hashed-password');

      expect(result).toBe(false);
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from valid Bearer header', () => {
      const authHeader = 'Bearer valid-token';
      const result = AuthService.extractTokenFromHeader(authHeader);
      expect(result).toBe('valid-token');
    });

    it('should return null for invalid header format', () => {
      const authHeader = 'Invalid header';
      const result = AuthService.extractTokenFromHeader(authHeader);
      expect(result).toBeNull();
    });

    it('should return null for undefined header', () => {
      const result = AuthService.extractTokenFromHeader(undefined);
      expect(result).toBeNull();
    });

    it('should return null for empty header', () => {
      const result = AuthService.extractTokenFromHeader('');
      expect(result).toBeNull();
    });
  });
});
