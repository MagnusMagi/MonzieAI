# 🔐 Environment Variables & Secrets Setup

## Overview

This project uses EAS Secrets for secure management of API keys and sensitive configuration in production builds. For local development, you can use `.env` files or `app.json` placeholders.

## 🚨 Security Notice

**NEVER commit sensitive information to version control!**

- ✅ `.env` files are in `.gitignore`
- ✅ `app.json` should only contain placeholders in production
- ✅ Use EAS Secrets for production builds

---

## 📋 Required Environment Variables

### Supabase
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key (public, but should be in secrets)

### Fal AI
- `FAL_API_KEY` - Your Fal AI API key

### Google OAuth
- `GOOGLE_WEB_CLIENT_ID` - Google OAuth Web Client ID
- `GOOGLE_IOS_CLIENT_ID` - Google OAuth iOS Client ID

### Neon Database (Optional)
- `NEON_DATABASE_URL` - Direct database connection URL (contains password!)
- `NEON_PROJECT_ID` - Neon project identifier

---

## 🛠️ Setup Methods

### Method 1: EAS Secrets (Recommended for Production)

EAS Secrets are automatically injected during build time. They're the most secure method for production builds.

#### Create Secrets

```bash
# Set secrets for production
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://your-project.supabase.co"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your-anon-key"
eas secret:create --scope project --name EXPO_PUBLIC_FAL_API_KEY --value "your-fal-key"
eas secret:create --scope project --name EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID --value "your-web-client-id"
eas secret:create --scope project --name EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID --value "your-ios-client-id"
```

#### List Secrets

```bash
eas secret:list
```

#### Update Secrets

```bash
eas secret:update --name EXPO_PUBLIC_SUPABASE_URL --value "new-value"
```

#### Delete Secrets

```bash
eas secret:delete --name EXPO_PUBLIC_SUPABASE_URL
```

### Method 2: Local `.env` File (Development)

For local development, create a `.env` file in the project root:

```bash
# Copy the example file
cp ENV_EXAMPLE.md .env

# Edit .env with your actual values
```

**Note:** `.env` files are automatically ignored by git (see `.gitignore`).

### Method 3: `app.json` Placeholders (Development Only)

For quick local testing, you can temporarily add values to `app.json`:

```json
{
  "expo": {
    "extra": {
      "supabaseUrl": "your-url-here",
      "supabaseAnonKey": "your-key-here",
      // ... other values
    }
  }
}
```

**⚠️ Warning:** Never commit `app.json` with real secrets to version control!

---

## 🔄 How It Works

### Build Time (EAS Build)

1. EAS reads secrets from your project
2. Secrets are injected into `app.json` `extra` field during build
3. App code accesses via `Constants.expoConfig?.extra`

### Development Time

1. Code reads from `Constants.expoConfig?.extra`
2. Values come from:
   - `app.json` (if present)
   - Environment variables (if using `expo-constants` with `.env`)
   - EAS Secrets (only in EAS builds)

### Code Access Pattern

```typescript
import Constants from 'expo-constants';

// Access configuration
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const apiKey = Constants.expoConfig?.extra?.falApiKey;
```

---

## 📝 Migration from Hardcoded Values

### Before (Insecure)

```json
// app.json
{
  "expo": {
    "extra": {
      "supabaseUrl": "https://actual-url.supabase.co",
      "supabaseAnonKey": "actual-key-here"
    }
  }
}
```

### After (Secure)

```json
// app.json (production)
{
  "expo": {
    "extra": {
      "supabaseUrl": "", // Placeholder - filled by EAS Secrets
      "supabaseAnonKey": "" // Placeholder - filled by EAS Secrets
    }
  }
}
```

```bash
# Set actual values in EAS Secrets
eas secret:create --name EXPO_PUBLIC_SUPABASE_URL --value "https://actual-url.supabase.co"
eas secret:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "actual-key-here"
```

---

## ✅ Verification

### Check if Secrets are Set

```bash
# List all secrets
eas secret:list

# Check specific secret
eas secret:get --name EXPO_PUBLIC_SUPABASE_URL
```

### Test in Development

1. Create `.env` file with test values
2. Run `npx expo start`
3. Check logs for configuration loading

### Test in Production Build

1. Set secrets via EAS CLI
2. Build with `eas build --platform ios --profile production`
3. Verify secrets are injected (check build logs)

---

## 🚨 Security Checklist

- [ ] All secrets removed from `app.json` (or using placeholders)
- [ ] `.env` file added to `.gitignore` ✅ (already done)
- [ ] EAS Secrets created for production
- [ ] Team members have access to EAS Secrets (if needed)
- [ ] No secrets in commit history (use `git filter-branch` if needed)
- [ ] Secrets rotated regularly
- [ ] Different secrets for dev/staging/production

---

## 📚 Resources

- [EAS Secrets Documentation](https://docs.expo.dev/build-reference/variables/)
- [Expo Constants Documentation](https://docs.expo.dev/versions/latest/sdk/constants/)
- [Environment Variables Best Practices](https://12factor.net/config)

---

## 🆘 Troubleshooting

### "Configuration missing" Error

**Problem:** App can't find configuration values.

**Solutions:**
1. Check if secrets are set: `eas secret:list`
2. Verify `app.json` has placeholder keys
3. For local dev, check `.env` file exists
4. Restart Metro bundler after changes

### Secrets Not Working in Build

**Problem:** EAS build doesn't have secrets.

**Solutions:**
1. Verify secrets are project-scoped: `eas secret:list`
2. Check build profile in `eas.json` matches secret scope
3. Rebuild after setting secrets: `eas build --clear-cache`

### Local Development Not Working

**Problem:** Can't access config in local dev.

**Solutions:**
1. Create `.env` file with values
2. Or temporarily add to `app.json` (don't commit!)
3. Restart Expo: `npx expo start --clear`

---

**Last Updated:** 2025-01-27  
**Maintained by:** Development Team

