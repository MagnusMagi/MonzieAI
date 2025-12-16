import { ErrorInfo } from 'react';
import { logger } from '../utils/logger';
import { sentryService } from './sentryService';

/**
 * Error Logging Service
 * Centralized error logging - integrates with logger utility
 */

export interface ErrorLog {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: string;
  userAgent?: string;
  userId?: string;
  context?: Record<string, unknown>;
}

class ErrorLoggingService {
  private isEnabled: boolean = true;

  /**
   * Enable or disable error logging
   */
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  /**
   * Log an error
   */
  logError(error: Error, errorInfo?: ErrorInfo | null, context?: Record<string, unknown>): void {
    if (!this.isEnabled) return;

    const errorContext: Record<string, unknown> = {
      ...context,
      componentStack: errorInfo?.componentStack,
    };

    // Log to local logger
    logger.error(error.message || 'Unknown error occurred', error, errorContext);

    // Send to Sentry
    sentryService.captureException(error, errorContext);
  }

  /**
   * Log a warning
   */
  logWarning(message: string, context?: Record<string, unknown>): void {
    if (!this.isEnabled) return;
    logger.warn(message, context);

    // Send to Sentry as warning
    sentryService.captureMessage(message, 'warning');
  }

  /**
   * Log an info message
   */
  logInfo(message: string, context?: Record<string, any>): void {
    if (!this.isEnabled) return;
    logger.info(message, context);
  }

  /**
   * Log a debug message
   */
  logDebug(message: string, context?: Record<string, any>): void {
    if (!this.isEnabled) return;
    logger.debug(message, context);
  }

  /**
   * Set user context for error tracking
   */
  setUserContext(userId?: string, userEmail?: string, userName?: string): void {
    logger.setUserContext(userId);
    // Set user context in Sentry
    sentryService.setUser(userId, userEmail, userName);
  }

  /**
   * Clear user context
   */
  clearUserContext(): void {
    logger.setUserContext(undefined);
    sentryService.clearUser();
  }
}

export const errorLoggingService = new ErrorLoggingService();
