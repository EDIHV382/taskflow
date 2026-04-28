import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema, taskSchema } from '../validations';

describe('validations', () => {
  describe('loginSchema', () => {
    it('validates correct login data', () => {
      const data = {
        email: 'test@example.com',
        password: 'password123',
      };
      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('fails with invalid email', () => {
      const data = {
        email: 'invalid-email',
        password: 'password123',
      };
      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Invalid email address');
      }
    });

    it('fails with empty password', () => {
      const data = {
        email: 'test@example.com',
        password: '',
      };
      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('registerSchema', () => {
    it('validates correct registration data', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('fails with short name', () => {
      const data = {
        name: 'J',
        email: 'john@example.com',
        password: 'password123',
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Name must be at least 2 characters');
      }
    });

    it('fails with short password', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        password: '12345',
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Password must be at least 6 characters');
      }
    });
  });

  describe('taskSchema', () => {
    it('validates correct task data', () => {
      const data = {
        title: 'Test Task',
        description: 'Test description',
        priority: 'HIGH',
        status: 'PENDING',
        dueDate: '2024-12-31',
      };
      const result = taskSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('fails with short title', () => {
      const data = {
        title: 'Te',
        description: '',
        priority: 'MEDIUM',
        status: 'PENDING',
      };
      const result = taskSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Title must be at least 3 characters');
      }
    });

    it('validates optional description', () => {
      const data = {
        title: 'Test Task',
        priority: 'LOW',
        status: 'COMPLETED',
      };
      const result = taskSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});
