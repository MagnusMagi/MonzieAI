# Logging System Documentation

## Overview

The application uses a centralized, professional logging system with structured logging, log levels, and context support.

## Logger Service

Located at `src/utils/logger.ts`, the Logger service provides:

### Features

- **Log Levels**: DEBUG, INFO, WARN, ERROR
- **Structured Logging**: JSON-formatted logs with context
- **Performance Logging**: Track operation durations
- **Session Tracking**: Automatic session ID generation
- **User Context**: Associate logs with user IDs
- **Memory Management**: Configurable log retention
- **Production Ready**: Automatic log level filtering in production

### Log Levels

- **DEBUG** (0): Detailed information for debugging (only in development)
- **INFO** (1): General informational messages
- **WARN** (2): Warning messages
- **ERROR** (3): Error messages (always logged)

### Usage

```typescript
import { logger } from '../utils/logger';

// Debug log
logger.debug('Processing image', { imageId: '123', size: 1024 });

// Info log
logger.info('User logged in', { userId: 'user123' });

// Warning log
logger.warn('API rate limit approaching', { remaining: 10 });

// Error log
logger.error('Failed to fetch data', error, { endpoint: '/api/data' });

// Performance logging
const start = logger.performance('Image processing');
// ... do work ...
logger.performance('Image processing', start); // Logs duration

// API request logging
logger.apiRequest('GET', '/api/users', { userId: '123' }, 150);

// API error logging
logger.apiError('POST', '/api/images', error, 500, response);

// Group related logs
logger.group('User Registration', () => {
  logger.info('Validating email');
  logger.info('Creating account');
  logger.info('Sending welcome email');
});
```

### Configuration

```typescript
// Configure logger
logger.configure({
  minLevel: LogLevel.INFO, // Only log INFO and above
  enableConsole: true,
  enableRemoteLogging: false,
  maxLogsInMemory: 200,
  enablePerformanceLogging: true,
});
```

### User Context

User context is automatically set when users sign in:

```typescript
// Automatically set in AuthContext
logger.setUserContext(userId);
```

### Production Behavior

In production (`__DEV__ === false`):
- Only WARN and ERROR logs are shown
- DEBUG and INFO logs are filtered out
- Console output is still enabled (can be disabled)
- Remote logging can be enabled for error tracking

## Error Logging Service

Located at `src/services/errorLoggingService.ts`, provides integration with the logger for React error boundaries and error tracking.

### Usage

```typescript
import { errorLoggingService } from '../services/errorLoggingService';

// Log error with React error info
errorLoggingService.logError(error, errorInfo, { component: 'HomeScreen' });

// Log warning
errorLoggingService.logWarning('Deprecated API used', { api: 'oldApi' });

// Log info
errorLoggingService.logInfo('Feature enabled', { feature: 'darkMode' });

// Set user context
errorLoggingService.setUserContext(userId, userEmail);
```

## Migration from console.log

All `console.log`, `console.error`, `console.warn`, and `console.info` calls have been migrated to use the logger service.

### Before
```typescript
console.log('User logged in');
console.error('Failed to fetch data:', error);
```

### After
```typescript
logger.info('User logged in');
logger.error('Failed to fetch data', error);
```

## Best Practices

1. **Use appropriate log levels**
   - DEBUG: Detailed debugging info
   - INFO: Important events (user actions, state changes)
   - WARN: Potential issues (deprecated APIs, rate limits)
   - ERROR: Actual errors that need attention

2. **Include context**
   ```typescript
   logger.error('API request failed', error, {
     endpoint: '/api/users',
     method: 'GET',
     statusCode: 500,
   });
   ```

3. **Don't log sensitive data**
   ```typescript
   // ❌ Bad
   logger.info('User logged in', { password: userPassword });
   
   // ✅ Good
   logger.info('User logged in', { userId: user.id });
   ```

4. **Use performance logging for slow operations**
   ```typescript
   const start = logger.performance('Image generation');
   await generateImage();
   logger.performance('Image generation', start);
   ```

5. **Group related logs**
   ```typescript
   logger.group('User Registration', () => {
     logger.info('Step 1: Validate email');
     logger.info('Step 2: Create account');
     logger.info('Step 3: Send welcome email');
   });
   ```

## Integration with Error Tracking Services

The logger is designed to integrate with external error tracking services:

```typescript
// In logger.ts, remote logging section
if (this.config.enableRemoteLogging && entry.level >= LogLevel.ERROR) {
  // Example: Sentry
  Sentry.captureException(entry.error, {
    extra: entry.context,
    user: { id: entry.userId },
  });
  
  // Example: Firebase Crashlytics
  FirebaseCrashlytics.recordError(entry.error);
}
```

## Log Export

Logs can be exported for debugging:

```typescript
// Get recent logs
const recentLogs = logger.getRecentLogs(50, LogLevel.ERROR);

// Export as JSON
const logsJson = logger.exportLogs();
```

## Testing

Logger can be configured for testing:

```typescript
// Disable console output in tests
logger.configure({ enableConsole: false });

// Clear logs between tests
logger.clearLogs();
```

