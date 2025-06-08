import { describe, it, expect } from 'vitest';
import {
  registerSchema,
  loginSchema,
  updateUserSchema,
  updateProgressSchema,
  updateScenarioSchema,
  userIdParamSchema,
  domainIdParamSchema,
  scenarioIdParamSchema,
} from './validation';

describe('Validation Schemas', () => {
  describe('registerSchema', () => {
    it('should validate correct registration data', () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'StrongPass123!',
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        password: 'StrongPass123!',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Invalid email format');
      }
    });

    it('should reject weak password', () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'weak',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Password must be at least 8 characters');
      }
    });

    it('should reject password without special characters', () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'NoSpecialChars123',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Password must contain');
      }
    });

    it('should reject names with numbers', () => {
      const invalidData = {
        firstName: 'John123',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'StrongPass123!',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('can only contain letters and spaces');
      }
    });
  });

  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const validData = {
        email: 'john.doe@example.com',
        password: 'anypassword',
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'anypassword',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty password', () => {
      const invalidData = {
        email: 'john.doe@example.com',
        password: '',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('updateUserSchema', () => {
    it('should validate partial user updates', () => {
      const validData = {
        firstName: 'Jane',
      };

      const result = updateUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate full user updates', () => {
      const validData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
      };

      const result = updateUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email in update', () => {
      const invalidData = {
        email: 'invalid-email',
      };

      const result = updateUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('updateProgressSchema', () => {
    it('should validate correct progress data', () => {
      const validData = {
        domainId: 1,
        progress: 75,
        questionsCompleted: 10,
        questionsCorrect: 8,
        timeSpent: 120,
      };

      const result = updateProgressSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject progress over 100', () => {
      const invalidData = {
        domainId: 1,
        progress: 150,
      };

      const result = updateProgressSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject negative progress', () => {
      const invalidData = {
        domainId: 1,
        progress: -10,
      };

      const result = updateProgressSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('updateScenarioSchema', () => {
    it('should validate scenario completion data', () => {
      const validData = {
        completed: true,
        score: 85,
        attempts: 2,
        timeSpent: 45,
      };

      const result = updateScenarioSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject score over 100', () => {
      const invalidData = {
        score: 150,
      };

      const result = updateScenarioSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Parameter validation schemas', () => {
    describe('userIdParamSchema', () => {
      it('should validate valid user ID', () => {
        const validData = { id: 'user123' };
        const result = userIdParamSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('should reject empty user ID', () => {
        const invalidData = { id: '' };
        const result = userIdParamSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });
    });

    describe('domainIdParamSchema', () => {
      it('should validate and transform numeric string', () => {
        const validData = { id: '123' };
        const result = domainIdParamSchema.safeParse(validData);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.id).toBe(123);
        }
      });

      it('should reject non-numeric string', () => {
        const invalidData = { id: 'abc' };
        const result = domainIdParamSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });
    });

    describe('scenarioIdParamSchema', () => {
      it('should validate and transform numeric string', () => {
        const validData = { id: '456' };
        const result = scenarioIdParamSchema.safeParse(validData);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.id).toBe(456);
        }
      });

      it('should reject non-numeric string', () => {
        const invalidData = { id: 'xyz' };
        const result = scenarioIdParamSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });
    });
  });
});
