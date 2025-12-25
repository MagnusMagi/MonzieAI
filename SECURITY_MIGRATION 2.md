# 🔐 Security Migration Guide

## ⚠️ IMPORTANT: Local Development Setup Required

The sensitive values have been removed from `app.json` for security. You need to set them up for local development.

## 🚀 Quick Start

### Option 1: Use app.json.local.example (Recommended)

1. Copy the example file:
   ```bash
   cp app.json.local.example app.json.local
   ```

2. Edit `app.json.local` with your actual values

3. For local development, temporarily merge values:
   ```bash
   # You can manually copy values from app.json.local to app.json for local dev
   # Or use a script to merge them
   ```

### Option 2: Use EAS Secrets (Production)

For production builds, use EAS Secrets:

```bash
# Set secrets
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "your-url"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your-key"
eas secret:create --scope project --name EXPO_PUBLIC_FAL_API_KEY --value "your-key"
eas secret:create --scope project --name EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID --value "your-id"
eas secret:create --scope project --name EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID --value "your-id"
```

## 📝 Current Status

✅ `app.json` - Placeholders only (secure)  
✅ `eas.json` - EAS Secrets configuration  
✅ `.gitignore` - Updated to ignore sensitive files  
✅ `ENV_SETUP.md` - Complete documentation  
✅ `app.json.local.example` - Template for local dev  

## ⚡ Next Steps

1. **For Local Development:**
   - Copy `app.json.local.example` to `app.json.local`
   - Fill in your actual values
   - Temporarily copy values to `app.json` for local testing
   - **Never commit `app.json` with real values!**

2. **For Production:**
   - Set EAS Secrets (see commands above)
   - Build with `eas build --platform ios --profile production`
   - Secrets will be automatically injected

## 🔒 Security Checklist

- [x] Sensitive values removed from `app.json`
- [x] `.gitignore` updated
- [x] EAS Secrets configuration ready
- [ ] EAS Secrets created (you need to do this)
- [ ] Local development values configured
- [ ] Team members informed about new setup

## 🆘 Troubleshooting

### "Configuration missing" Error

If you see this error, you need to:
1. For local dev: Add values to `app.json` temporarily (don't commit!)
2. For production: Set EAS Secrets

### Local Development Not Working

1. Check `app.json.local.example` for required fields
2. Copy values to `app.json` for local testing
3. Restart Expo: `npx expo start --clear`

---

**Note:** This is a one-time migration. After setting up EAS Secrets, production builds will work automatically.

