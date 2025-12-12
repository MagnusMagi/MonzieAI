/**
 * Supabase Error Type Helpers
 * Provides type-safe access to Supabase error properties
 */

export interface SupabaseError {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
  statusCode?: number;
}

/**
 * Type guard to check if error is a Supabase error
 */
export function isSupabaseError(error: unknown): error is SupabaseError {
  return (
    typeof error === 'object' &&
    error !== null &&
    ('code' in error || 'message' in error || 'details' in error)
  );
}

/**
 * Safely extract error code from unknown error
 */
export function getErrorCode(error: unknown): string | undefined {
  if (isSupabaseError(error)) {
    return error.code;
  }
  return undefined;
}

/**
 * Safely extract error message from unknown error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (isSupabaseError(error)) {
    return error.message || error.details || 'Unknown error';
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Unknown error';
}

/**
 * Check if error has specific code
 */
export function hasErrorCode(error: unknown, code: string): boolean {
  return getErrorCode(error) === code;
}

