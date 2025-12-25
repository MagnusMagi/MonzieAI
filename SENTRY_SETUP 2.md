# Sentry Error Tracking Setup

This document explains how to set up Sentry error tracking for the MonzieAI app.

## Overview

Sentry has been integrated into the app to track errors, exceptions, and performance issues. The integration includes:

- Automatic error capture from ErrorBoundary
- Manual error logging via `errorLoggingService`
- User context tracking (user ID, email, username)
- Breadcrumb tracking for debugging
- Performance monitoring

## Setup Steps

### 1. Create a Sentry Account

1. Go to [sentry.io](https://sentry.io) and create an account
2. Create a new project for "React Native" or "Expo"
3. Note your **DSN** (Data Source Name) - you'll need this later

### 2. Configure Sentry DSN

#### Option A: Using EAS Secrets (Recommended for Production)

Add the Sentry DSN as an EAS environment variable:

```bash
eas env:create --name EXPO_PUBLIC_SENTRY_DSN --value "https://YOUR_DSN@sentry.io/PROJECT_ID" --type secret --scope project
```

Then update `app.json` to read from environment:

```json
{
  "extra": {
    "sentryDsn": process.env.EXPO_PUBLIC_SENTRY_DSN || ""
  }
}
```

#### Option B: Direct Configuration (Development Only)

For local development, you can temporarily add the DSN to `app.json`:

```json
{
  "extra": {
    "sentryDsn": "https://YOUR_DSN@sentry.io/PROJECT_ID"
  }
}
```

**⚠️ Warning:** Never commit the actual DSN to version control. Use EAS Secrets for production.

### 3. Configure Sentry Plugin

Update `app.json` with your Sentry organization and project details:

```json
{
  "plugins": [
    [
      "sentry-expo",
      {
        "organization": "your-sentry-org-slug",
        "project": "monzieai",
        "authToken": "" // Optional: for source maps upload
      }
    ]
  ]
}
```

### 4. Get Sentry Auth Token (Optional)

If you want to upload source maps automatically:

1. Go to Sentry → Settings → Account → Auth Tokens
2. Create a new token with `project:releases` scope
3. Add it to EAS Secrets:

```bash
eas env:create --name SENTRY_AUTH_TOKEN --value "YOUR_TOKEN" --type secret --scope project
```

### 5. Rebuild the App

After configuring Sentry, rebuild the app:

```bash
# For iOS
npx expo prebuild --clean
cd ios && pod install && cd ..
npx expo run:ios

# For Android
npx expo run:android
```

## Usage

### Automatic Error Tracking

Errors are automatically captured from:

- **ErrorBoundary**: React component errors
- **Unhandled Promise Rejections**: Global error handler
- **Native Crashes**: iOS/Android native crashes

### Manual Error Logging

Use `errorLoggingService` to log errors manually:

```typescript
import { errorLoggingService } from '../services/errorLoggingService';

try {
  // Your code
} catch (error) {
  errorLoggingService.logError(
    error instanceof Error ? error : new Error(String(error)),
    null,
    { context: 'additional info' }
  );
}
```

### Setting User Context

User context is automatically set when users sign in/out. You can also set it manually:

```typescript
import { errorLoggingService } from '../services/errorLoggingService';

// Set user context
errorLoggingService.setUserContext(userId, userEmail, userName);

// Clear user context
errorLoggingService.clearUserContext();
```

### Adding Breadcrumbs

Add breadcrumbs for debugging:

```typescript
import { sentryService } from '../services/sentryService';

sentryService.addBreadcrumb('User clicked button', 'user-action', 'info');
```

## Testing

To test Sentry integration:

1. Add a test error in your code:

```typescript
import { errorLoggingService } from '../services/errorLoggingService';

// Test error
errorLoggingService.logError(
  new Error('Test error from MonzieAI'),
  null,
  { test: true }
);
```

2. Check your Sentry dashboard - you should see the error appear within a few seconds.

## Configuration Options

Sentry is configured in `src/services/sentryService.ts`. Key options:

- **enableInExpoDevelopment**: Set to `false` to disable in Expo Go
- **debug**: Enable debug mode in development
- **tracesSampleRate**: Set to 0.1 (10%) for production, 1.0 (100%) for development
- **enableNativeCrashHandling**: Enable native crash reporting

## Troubleshooting

### Sentry Not Initializing

- Check that `sentryDsn` is set in `app.json` or environment variables
- Check console logs for initialization errors
- Ensure `sentry-expo` package is installed: `npm list sentry-expo`

### Errors Not Appearing in Sentry

- Check that Sentry is initialized: `sentryService.initialized`
- Verify DSN is correct
- Check network connectivity
- Review Sentry dashboard for rate limiting

### Source Maps Not Working

- Ensure `SENTRY_AUTH_TOKEN` is set in EAS Secrets
- Run `npx expo export` before building
- Check Sentry project settings for source map configuration

## Security Notes

- Never commit Sentry DSN or auth tokens to version control
- Use EAS Secrets for all sensitive configuration
- Sentry automatically filters sensitive data (passwords, tokens) via `beforeSend` hook
- Review Sentry's data privacy settings in your project settings

## Resources

- [Sentry Expo Documentation](https://docs.sentry.io/platforms/javascript/guides/react-native/)
- [Sentry React Native Setup](https://docs.sentry.io/platforms/javascript/guides/react-native/configuration/)
- [EAS Environment Variables](https://docs.expo.dev/build-reference/variables/)

