import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, generateTemporaryPassword } from './auth';

describe('Authentication', () => {
  describe('hashPassword and verifyPassword', () => {
    it('should hash a password and verify it correctly', () => {
      const password = 'test-password-123';
      const hash = hashPassword(password);

      expect(hash).toBeTruthy();
      expect(hash).toContain(':');
      expect(verifyPassword(password, hash)).toBe(true);
    });

    it('should reject an incorrect password', () => {
      const password = 'test-password-123';
      const hash = hashPassword(password);

      expect(verifyPassword('wrong-password', hash)).toBe(false);
    });

    it('should generate different hashes for the same password', () => {
      const password = 'test-password-123';
      const hash1 = hashPassword(password);
      const hash2 = hashPassword(password);

      expect(hash1).not.toBe(hash2);
      expect(verifyPassword(password, hash1)).toBe(true);
      expect(verifyPassword(password, hash2)).toBe(true);
    });
  });

  describe('generateTemporaryPassword', () => {
    it('should generate a temporary password', () => {
      const password = generateTemporaryPassword();

      expect(password).toBeTruthy();
      expect(password.length).toBeGreaterThan(0);
    });

    it('should generate different temporary passwords', () => {
      const password1 = generateTemporaryPassword();
      const password2 = generateTemporaryPassword();

      expect(password1).not.toBe(password2);
    });
  });
});
