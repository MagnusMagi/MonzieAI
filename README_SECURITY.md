# 🔐 Security Setup - READ THIS FIRST

## ⚠️ CRITICAL: Local Development Required

**The API keys have been removed from `app.json` for security.**

You need to set them up for local development. Choose one method below:

---

## 🚀 Quick Setup (Choose One)

### Method 1: Temporary Local Values (Fastest)

For immediate local development, you can temporarily add values to `app.json`:

1. Edit `app.json` and fill in the empty strings in `extra` section:
   ```json
   {
     "expo": {
       "extra": {
         "supabaseUrl": "your-actual-url",
         "supabaseAnonKey": "your-actual-key",
         // ... etc
       }
     }
   }
   ```

2. **⚠️ IMPORTANT:** Before committing, restore placeholders:
   ```bash
   git checkout app.json  # Restores placeholders
   ```

### Method 2: Use Setup Script (Recommended)

1. Run the setup script:
   ```bash
   ./setup-local-dev.sh
   ```

2. Edit `app.json.local` with your actual values

3. Run script again to merge:
   ```bash
   ./setup-local-dev.sh
   ```

### Method 3: EAS Secrets (Production Only)

For production builds, use EAS Secrets (see `ENV_SETUP.md` for details).

---

## 📋 Required Values

You need these values (get them from your service dashboards):

- **Supabase:** URL and Anon Key from Supabase Dashboard
- **Fal AI:** API Key from Fal AI Dashboard  
- **Google:** Client IDs from Google Cloud Console
- **Neon:** Database URL and Project ID (optional)

---

## ✅ Next Steps

1. **Set up local development** (choose method above)
2. **Set EAS Secrets for production** (see `ENV_SETUP.md`)
3. **Test locally** with `npx expo start`
4. **Build production** with `eas build --platform ios`

---

## 🆘 Troubleshooting

### "Configuration missing" Error

You need to add values to `app.json` for local development. See Method 1 above.

### Can't Find API Keys

Check your service dashboards:
- Supabase: Project Settings → API
- Fal AI: Dashboard → API Keys
- Google: Cloud Console → Credentials

---

**See `ENV_SETUP.md` for complete documentation.**

