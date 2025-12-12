import Constants from 'expo-constants';

/**
 * Log Levels
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/**
 * Log Entry Interface
 */
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: Error;
  stack?: string;
  userId?: string;
  sessionId?: string;
}

/**
 * Logger Configuration
 */
interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableRemoteLogging: boolean;
  maxLogsInMemory: number;
  enablePerformanceLogging: boolean;
  // Production'da debug logları otomatik kapatılır
}

/**
 * Professional Logger Service
 * Provides structured logging with different log levels and context support
 */
class Logger {
  private config: LoggerConfig;
  private logs: LogEntry[] = [];
  private sessionId: string;
  private userId?: string;
  private performanceMarks: Map<string, number> = new Map();

  constructor() {
    this.sessionId = this.generateSessionId();
    this.config = {
      minLevel: __DEV__ ? LogLevel.DEBUG : LogLevel.INFO, // Production'da INFO ve üzeri
      enableConsole: true,
      enableRemoteLogging: false, // Can be enabled for production
      maxLogsInMemory: __DEV__ ? 200 : 100, // Production'da daha az log tut
      enablePerformanceLogging: __DEV__,
    };
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Set user context
   */
  setUserContext(userId?: string): void {
    this.userId = userId;
  }

  /**
   * Update configuration
   */
  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Format log entry for console
   */
  private formatLogEntry(entry: LogEntry): string {
    const levelEmoji = {
      [LogLevel.DEBUG]: '🔍',
      [LogLevel.INFO]: 'ℹ️',
      [LogLevel.WARN]: '⚠️',
      [LogLevel.ERROR]: '❌',
    };

    const levelName = LogLevel[entry.level];
    const emoji = levelEmoji[entry.level];
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();

    let formatted = `${emoji} [${timestamp}] ${levelName}: ${entry.message}`;

    if (entry.context && Object.keys(entry.context).length > 0) {
      formatted += `\n  Context: ${JSON.stringify(entry.context, null, 2)}`;
    }

    if (entry.error) {
      formatted += `\n  Error: ${entry.error.message}`;
      if (entry.stack) {
        formatted += `\n  Stack: ${entry.stack.split('\n').slice(0, 3).join('\n')}`;
      }
    }

    return formatted;
  }

  /**
   * Store log entry
   */
  private storeLog(entry: LogEntry): void {
    this.logs.push(entry);

    // Keep only last N logs in memory
    if (this.logs.length > this.config.maxLogsInMemory) {
      this.logs.shift();
    }

    // Remote logging (Sentry integration)
    if (this.config.enableRemoteLogging && entry.level >= LogLevel.ERROR && entry.error) {
      try {
        // Import sentryService dynamically to avoid circular dependencies
        const { sentryService } = require('../services/sentryService');
        if (sentryService.initialized) {
          sentryService.captureException(entry.error, entry.context);
        }
      } catch (err) {
        // Silently fail if Sentry is not available
        if (__DEV__) {
          console.warn('Failed to send error to Sentry:', err);
        }
      }
    }
  }

  /**
   * Core log method
   */
  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error
  ): void {
    if (level < this.config.minLevel) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
      stack: error?.stack,
      userId: this.userId,
      sessionId: this.sessionId,
    };

    // Store log
    this.storeLog(entry);

    // Console output
    if (this.config.enableConsole) {
      const formatted = this.formatLogEntry(entry);

      switch (level) {
        case LogLevel.DEBUG:
          console.debug(formatted);
          break;
        case LogLevel.INFO:
          console.info(formatted);
          break;
        case LogLevel.WARN:
          console.warn(formatted);
          break;
        case LogLevel.ERROR:
          console.error(formatted);
          if (error) {
            console.error('Full error:', error);
          }
          break;
      }
    }
  }

  /**
   * Debug log - detailed information for debugging
   */
  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Info log - general information
   */
  info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Warn log - warning messages
   */
  warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * Error log - error messages
   */
  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  /**
   * Performance logging
   */
  performance(label: string, startTime?: number): number {
    if (!this.config.enablePerformanceLogging) {
      return Date.now();
    }

    if (startTime) {
      const duration = Date.now() - startTime;
      this.debug(`Performance: ${label}`, { duration: `${duration}ms` });
      this.performanceMarks.delete(label);
      return duration;
    } else {
      const mark = Date.now();
      this.performanceMarks.set(label, mark);
      this.debug(`Performance: ${label} started`);
      return mark;
    }
  }

  /**
   * Group related logs
   */
  group(label: string, callback: () => void): void {
    if (this.config.enableConsole) {
      console.group(`📦 ${label}`);
    }
    try {
      callback();
    } finally {
      if (this.config.enableConsole) {
        console.groupEnd();
      }
    }
  }

  /**
   * Log API request
   */
  apiRequest(
    method: string,
    url: string,
    params?: Record<string, any>,
    responseTime?: number
  ): void {
    const context: Record<string, any> = {
      method,
      url: url.replace(Constants.expoConfig?.extra?.supabaseUrl || '', '[SUPABASE_URL]'),
      ...params,
    };

    if (responseTime) {
      context.responseTime = `${responseTime}ms`;
    }

    this.info(`API ${method} ${url}`, context);
  }

  /**
   * Log API error
   */
  apiError(
    method: string,
    url: string,
    error: Error,
    statusCode?: number,
    response?: unknown
  ): void {
    const context: Record<string, unknown> = {
      method,
      url: url.replace(Constants.expoConfig?.extra?.supabaseUrl || '', '[SUPABASE_URL]'),
    };

    if (statusCode) {
      context.statusCode = statusCode;
    }

    if (response) {
      context.response = response;
    }

    this.error(`API ${method} ${url} failed`, error, context);
  }

  /**
   * Get recent logs
   */
  getRecentLogs(limit: number = 50, level?: LogLevel): LogEntry[] {
    let filtered = this.logs;

    if (level !== undefined) {
      filtered = filtered.filter(log => log.level >= level);
    }

    return filtered.slice(-limit);
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Export singleton instance
export const logger = new Logger();

// Set user context when available
if (typeof global !== 'undefined') {
  // Can be set from AuthContext
  (global as any).setLoggerUserContext = (userId?: string) => {
    logger.setUserContext(userId);
  };
}
