import { getAuthErrorMessage } from '../../utils/errorMessages';
import { logger } from '../../utils/logger';

export interface AuthFormState {
  isLogin: boolean;
  email: string;
  password: string;
  name: string;
  loading: boolean;
  socialLoading: 'google' | 'apple' | null;
  error: string | null;
}

/**
 * Auth ViewModel
 * Manages form state and validation for Auth screen
 * Note: Actual auth operations are handled by AuthContext
 */
export class AuthViewModel {
  private state: AuthFormState = {
    isLogin: true,
    email: '',
    password: '',
    name: '',
    loading: false,
    socialLoading: null,
    error: null,
  };

  /**
   * Toggle between login and signup
   */
  toggleMode(): void {
    this.state.isLogin = !this.state.isLogin;
    this.state.error = null;
    // Clear form when switching modes
    if (this.state.isLogin) {
      this.state.name = '';
    }
  }

  /**
   * Set email
   */
  setEmail(email: string): void {
    this.state.email = email;
    this.state.error = null;
  }

  /**
   * Set password
   */
  setPassword(password: string): void {
    this.state.password = password;
    this.state.error = null;
  }

  /**
   * Set name
   */
  setName(name: string): void {
    this.state.name = name;
    this.state.error = null;
  }

  /**
   * Set loading state
   */
  setLoading(loading: boolean): void {
    this.state.loading = loading;
  }

  /**
   * Set social loading state
   */
  setSocialLoading(provider: 'google' | 'apple' | null): void {
    this.state.socialLoading = provider;
  }

  /**
   * Set error
   */
  setError(error: unknown): void {
    logger.error('Auth error', error instanceof Error ? error : new Error('Unknown error'));
    this.state.error = getAuthErrorMessage(error);
  }

  /**
   * Clear error
   */
  clearError(): void {
    this.state.error = null;
  }

  /**
   * Validate form
   */
  validateForm(): { valid: boolean; error?: string } {
    if (!this.state.email.trim()) {
      return { valid: false, error: 'Email Required: Please enter your email address.' };
    }

    if (!this.state.password.trim()) {
      return { valid: false, error: 'Password Required: Please enter your password.' };
    }

    if (!this.state.isLogin && !this.state.name.trim()) {
      return { valid: false, error: 'Name Required: Please enter your full name.' };
    }

    if (this.state.password.length < 6) {
      return {
        valid: false,
        error: 'Invalid Password: Password must be at least 6 characters long.',
      };
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.state.email.trim())) {
      return { valid: false, error: 'Invalid Email: Please enter a valid email address.' };
    }

    return { valid: true };
  }

  /**
   * Get form data
   */
  getFormData(): { email: string; password: string; name: string } {
    return {
      email: this.state.email.trim(),
      password: this.state.password,
      name: this.state.name.trim(),
    };
  }

  /**
   * Get current state
   */
  getState(): AuthFormState {
    return { ...this.state };
  }
}
