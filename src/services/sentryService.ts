// import * as Sentry from 'sentry-expo'; // Temporarily disabled
import Constants from 'expo-constants';
import { logger } from '../utils/logger';

/**
 * Sentry Error Tracking Service
 * Handles initialization and configuration of Sentry for error tracking
 */
class SentryService {
  private isInitialized = false;

  /**
   * Initialize Sentry
   * Call this once at app startup (in App.tsx)
   */
  initialize(): void {
    if (this.isInitialized) {
      logger.warn('Sentry already initialized');
      return;
    }

    // Get DSN from environment or app.json
    const dsn = Constants.expoConfig?.extra?.sentryDsn;
    
    if (!dsn) {
      if (__DEV__) {
        logger.debug('Sentry DSN not configured. Error tracking will be disabled.');
      }
      return;
    }

    try {
      // Sentry is temporarily disabled - uncomment when needed
      // const Sentry = require('sentry-expo');
      // Sentry.init({
      //   dsn,
      //   enableInExpoDevelopment: false,
      //   debug: __DEV__,
      //   environment: __DEV__ ? 'development' : 'production',
      //   tracesSampleRate: __DEV__ ? 1.0 : 0.1,
      //   enableNativeCrashHandling: true,
      //   attachStacktrace: true,
      //   beforeSend(event) {
      //     if (event.request) {
      //       if (event.request.headers) {
      //         delete event.request.headers['Authorization'];
      //         delete event.request.headers['authorization'];
      //       }
      //       if (event.request.query_string) {
      //         const queryString = event.request.query_string as string;
      //         if (queryString.includes('password') || queryString.includes('token')) {
      //           event.request.query_string = '[Filtered]';
      //         }
      //       }
      //     }
      //     return event;
      //   },
      // });

      this.isInitialized = true;
      logger.info('Sentry initialized successfully');
    } catch (error) {
      logger.error(
        'Failed to initialize Sentry',
        error instanceof Error ? error : new Error('Unknown error')
      );
    }
  }

  /**
   * Set user context for error tracking
   */
  setUser(userId?: string, email?: string, username?: string): void {
    if (!this.isInitialized) return;

    try {
      // Sentry is temporarily disabled
      // const Sentry = require('sentry-expo');
      // Sentry.setUser(
      //   userId
      //     ? {
      //         id: userId,
      //         email,
      //         username,
      //       }
      //     : null
      // );
    } catch (error) {
      logger.error(
        'Failed to set Sentry user context',
        error instanceof Error ? error : new Error('Unknown error')
      );
    }
  }

  /**
   * Clear user context
   */
  clearUser(): void {
    if (!this.isInitialized) return;
    try {
      // Sentry is temporarily disabled
      // const Sentry = require('sentry-expo');
      // Sentry.setUser(null);
    } catch (error) {
      logger.error(
        'Failed to clear Sentry user context',
        error instanceof Error ? error : new Error('Unknown error')
      );
    }
  }

  /**
   * Capture an exception
   */
  captureException(error: Error, context?: Record<string, unknown>): void {
    if (!this.isInitialized) return;

    try {
      // Sentry is temporarily disabled
      // const Sentry = require('sentry-expo');
      // Sentry.captureException(error, {
      //   extra: context as Record<string, any> | undefined,
      // });
    } catch (err) {
      // Silently fail - don't break the app if Sentry fails
      if (__DEV__) {
        logger.debug('Failed to capture exception in Sentry', err instanceof Error ? err : new Error(String(err)));
      }
    }
  }

  /**
   * Capture a message
   */
  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
    if (!this.isInitialized) return;

    try {
      // Sentry is temporarily disabled
      // const Sentry = require('sentry-expo');
      // Sentry.captureMessage(message, {
      //   level: level === 'info' ? 'info' : level === 'warning' ? 'warning' : 'error',
      // });
    } catch (err) {
      // Silently fail
      if (__DEV__) {
        logger.debug('Failed to capture message in Sentry', err instanceof Error ? err : new Error(String(err)));
      }
    }
  }

  /**
   * Add breadcrumb for debugging
   */
  addBreadcrumb(message: string, category?: string, level: 'info' | 'warning' | 'error' = 'info'): void {
    if (!this.isInitialized) return;

    try {
      // Sentry is temporarily disabled
      // const Sentry = require('sentry-expo');
      // Sentry.addBreadcrumb({
      //   message,
      //   category,
      //   level: level === 'info' ? 'info' : level === 'warning' ? 'warning' : 'error',
      //   timestamp: Date.now() / 1000,
      // });
    } catch (err) {
      // Silently fail
      if (__DEV__) {
        logger.debug('Failed to add breadcrumb in Sentry', err instanceof Error ? err : new Error(String(err)));
      }
    }
  }

  /**
   * Set additional context
   */
  setContext(key: string, context: Record<string, unknown>): void {
    if (!this.isInitialized) return;

    try {
      // Sentry is temporarily disabled
      // const Sentry = require('sentry-expo');
      // Sentry.setContext(key, context as Record<string, any>);
    } catch (err) {
      if (__DEV__) {
        logger.debug('Failed to set context in Sentry', err instanceof Error ? err : new Error(String(err)));
      }
    }
  }

  /**
   * Check if Sentry is initialized
   */
  get initialized(): boolean {
    return this.isInitialized;
  }
}

export const sentryService = new SentryService();

