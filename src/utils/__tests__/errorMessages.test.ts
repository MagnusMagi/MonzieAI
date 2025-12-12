import { getAuthErrorMessage, getUserFriendlyErrorMessage } from '../errorMessages';

describe('errorMessages', () => {
  describe('getAuthErrorMessage', () => {
    it('should return friendly message for invalid credentials', () => {
      const error = { code: 'invalid_credentials', message: 'Invalid login credentials' };
      const result = getAuthErrorMessage(error);
      expect(result).toContain('Email or password is incorrect');
    });

    it('should return friendly message for email not confirmed', () => {
      const error = { code: 'email_not_confirmed', message: 'Email not confirmed' };
      const result = getAuthErrorMessage(error);
      expect(result).toContain('verify your email');
    });

    it('should return friendly message for user already registered', () => {
      const error = { code: 'user_already_registered', message: 'User already registered' };
      const result = getAuthErrorMessage(error);
      expect(result).toContain('already exists');
    });

    it('should return friendly message for password too short', () => {
      const error = { message: 'Password should be at least 6 characters' };
      const result = getAuthErrorMessage(error);
      expect(result).toContain('at least 6 characters');
    });

    it('should return friendly message for invalid email', () => {
      const error = { message: 'Invalid email', code: 'invalid_email' };
      const result = getAuthErrorMessage(error);
      expect(result).toContain('valid email address');
    });

    it('should return fallback message for unknown errors', () => {
      const error = { message: 'Unknown error', code: 'unknown' };
      const result = getAuthErrorMessage(error);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should handle null/undefined errors', () => {
      const result = getAuthErrorMessage(null);
      expect(result).toContain('unexpected error');
    });
  });

  describe('getUserFriendlyErrorMessage', () => {
    it('should handle network errors', () => {
      const error = new Error('Network request failed');
      const result = getUserFriendlyErrorMessage(error);
      expect(result).toContain('Connection error');
    });

    it('should handle timeout errors', () => {
      const error = new Error('Request timeout');
      const result = getUserFriendlyErrorMessage(error);
      expect(result).toContain('timed out');
    });

    it('should handle FAL AI errors', () => {
      const error = new Error('FAL API key is missing');
      const result = getUserFriendlyErrorMessage(error);
      expect(result).toContain('AI service');
    });

    it('should handle Supabase errors', () => {
      const error = new Error('Supabase PGRST116');
      const result = getUserFriendlyErrorMessage(error);
      expect(result).toContain('not found');
    });

    it('should handle string errors', () => {
      const result = getUserFriendlyErrorMessage('Network error');
      expect(result).toContain('Connection error');
    });

    it('should return default message for unknown errors', () => {
      const error = new Error('Some random error');
      const result = getUserFriendlyErrorMessage(error);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });
  });
});
