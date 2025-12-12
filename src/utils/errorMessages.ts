/**
 * User-facing Error Messages
 * Provides friendly error messages for API and service errors
 */

export interface ErrorContext {
  service?: string;
  operation?: string;
  [key: string]: any;
}

/**
 * Get user-friendly error message from Supabase Auth error
 */
export function getAuthErrorMessage(error: any): string {
  if (!error) {
    return 'An unexpected error occurred. Please try again.';
  }

  // Check for Supabase AuthApiError
  const errorMessage = error.message || '';
  const errorCode = error.code || error.status || '';

  // Handle specific Supabase auth error codes
  if (errorCode === 'invalid_credentials' || errorMessage.includes('Invalid login credentials')) {
    return 'Email or password is incorrect. Please check your credentials and try again.';
  }
  if (errorCode === 'email_not_confirmed' || errorMessage.includes('Email not confirmed')) {
    return 'Please verify your email address. Check your inbox for a confirmation email.';
  }
  if (errorCode === 'user_already_registered' || errorMessage.includes('User already registered')) {
    return 'An account with this email already exists. Please sign in instead.';
  }
  if (errorCode === 'signup_disabled' || errorMessage.includes('Signup is disabled')) {
    return 'New account registration is currently disabled. Please contact support.';
  }
  if (errorMessage.includes('missing email or phone')) {
    return 'Please enter your email address.';
  }
  if (
    errorMessage.includes('Password should be at least') ||
    errorMessage.includes('password_too_short')
  ) {
    return 'Password must be at least 6 characters long.';
  }
  if (errorMessage.includes('Invalid email') || errorMessage.includes('invalid_email')) {
    return 'Please enter a valid email address.';
  }
  if (errorMessage.includes('Email rate limit exceeded')) {
    return 'Too many requests. Please wait a moment and try again.';
  }

  // Fallback to general error message handler
  return getUserFriendlyErrorMessage(error, { service: 'SUPABASE', operation: 'AUTH' });
}

/**
 * Get user-friendly error message from error
 */
export function getUserFriendlyErrorMessage(
  error: Error | string | unknown,
  context?: ErrorContext
): string {
  const errorMessage =
    typeof error === 'string'
      ? error
      : error instanceof Error
        ? error.message
        : 'An unexpected error occurred';

  // Network errors
  if (
    errorMessage.includes('network') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('Network request failed')
  ) {
    return 'Connection error. Please check your internet connection and try again.';
  }

  // Timeout errors
  if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
    return 'Request timed out. Please try again.';
  }

  // FAL AI specific errors
  if (errorMessage.includes('FAL') || errorMessage.includes('fal-ai')) {
    if (errorMessage.includes('API key') || errorMessage.includes('API_KEY')) {
      return 'AI service configuration error. Please contact support.';
    }
    if (errorMessage.includes('timeout')) {
      return 'Image generation is taking longer than expected. Please try again.';
    }
    if (errorMessage.includes('failed') || errorMessage.includes('Failed')) {
      return 'Image generation failed. Please try with a different image or scene.';
    }
    return 'Image generation error. Please try again.';
  }

  // Supabase specific errors
  if (errorMessage.includes('Supabase') || errorMessage.includes('PGRST')) {
    if (errorMessage.includes('configuration') || errorMessage.includes('config')) {
      return 'Service configuration error. Please contact support.';
    }
    if (errorMessage.includes('PGRST116')) {
      return 'Item not found.';
    }
    if (errorMessage.includes('permission') || errorMessage.includes('policy')) {
      return 'You do not have permission to perform this action.';
    }
    return 'Database error. Please try again.';
  }

  // Image processing errors
  if (
    errorMessage.includes('image') ||
    errorMessage.includes('Image') ||
    errorMessage.includes('base64')
  ) {
    if (errorMessage.includes('convert') || errorMessage.includes('conversion')) {
      return 'Image processing error. Please try with a different image.';
    }
    if (errorMessage.includes('size') || errorMessage.includes('large')) {
      return 'Image is too large. Please use a smaller image.';
    }
    return 'Image error. Please try again.';
  }

  // Authentication errors - Supabase specific
  if (errorMessage.includes('missing email or phone')) {
    return 'Please enter your email address.';
  }
  if (
    errorMessage.includes('Invalid login credentials') ||
    errorMessage.includes('invalid_credentials')
  ) {
    return 'Email or password is incorrect. Please try again.';
  }
  if (
    errorMessage.includes('Email not confirmed') ||
    errorMessage.includes('email_not_confirmed')
  ) {
    return 'Please verify your email address. Check your inbox for a confirmation email.';
  }
  if (
    errorMessage.includes('User already registered') ||
    errorMessage.includes('user_already_registered')
  ) {
    return 'An account with this email already exists. Please sign in instead.';
  }
  if (
    errorMessage.includes('Password should be at least') ||
    errorMessage.includes('password_too_short')
  ) {
    return 'Password must be at least 6 characters long.';
  }
  if (errorMessage.includes('Invalid email') || errorMessage.includes('invalid_email')) {
    return 'Please enter a valid email address.';
  }
  if (errorMessage.includes('Email rate limit exceeded')) {
    return 'Too many requests. Please wait a moment and try again.';
  }
  if (errorMessage.includes('Signup is disabled')) {
    return 'New account registration is currently disabled. Please contact support.';
  }
  if (
    errorMessage.includes('auth') ||
    errorMessage.includes('unauthorized') ||
    errorMessage.includes('Unauthorized')
  ) {
    return 'Authentication required. Please sign in and try again.';
  }

  // Generic fallback
  if (context?.service === 'FAL_AI') {
    return 'Image generation failed. Please try again.';
  }

  if (context?.service === 'SUPABASE') {
    return 'Data service error. Please try again.';
  }

  return 'Something went wrong. Please try again.';
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: Error | string | unknown): boolean {
  const errorMessage =
    typeof error === 'string' ? error : error instanceof Error ? error.message : '';

  const retryablePatterns = [
    'network',
    'timeout',
    'fetch',
    'connection',
    'ECONNREFUSED',
    'ETIMEDOUT',
  ];

  return retryablePatterns.some(pattern =>
    errorMessage.toLowerCase().includes(pattern.toLowerCase())
  );
}

/**
 * Get error severity level
 */
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export function getErrorSeverity(
  error: Error | string | unknown,
  context?: ErrorContext
): ErrorSeverity {
  const errorMessage =
    typeof error === 'string' ? error : error instanceof Error ? error.message : '';

  // Critical: Configuration errors, auth failures
  if (
    errorMessage.includes('configuration') ||
    errorMessage.includes('API key') ||
    errorMessage.includes('unauthorized')
  ) {
    return 'critical';
  }

  // High: Service failures, data corruption
  if (
    errorMessage.includes('database') ||
    errorMessage.includes('service') ||
    errorMessage.includes('failed')
  ) {
    return 'high';
  }

  // Medium: Network issues, timeouts
  if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
    return 'medium';
  }

  // Low: User input errors, validation
  return 'low';
}
