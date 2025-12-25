---
sidebar_position: 3
title: Deployment
---

# MonzieAI - Deployment Kılavuzu

## 📋 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [EAS Build Setup](#eas-build-setup)
4. [iOS Deployment](#ios-deployment)
5. [Android Deployment](#android-deployment)
6. [App Store Submission](#app-store-submission)
7. [Play Store Submission](#play-store-submission)
8. [CI/CD Pipeline](#cicd-pipeline)
9. [Monitoring & Analytics](#monitoring--analytics)
10. [Rollback Strategy](#rollback-strategy)

## 🎯 Genel Bakış

MonzieAI, Expo Application Services (EAS) kullanarak build ve deployment işlemlerini yönetir.

### Deployment Environment'ları

- **Development**: Local testing ve development builds
- **Preview**: Internal testing ve QA
- **Production**: App Store ve Play Store releases

### Build Profiles

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "distribution": "store"
    }
  }
}
```

## ✅ Pre-Deployment Checklist

### 1. Code Quality

```bash
# Linting
npm run lint

# Type checking
npx tsc --noEmit

# Format check
npm run format:check

# Tests
npm test
npm run test:coverage

# E2E tests
npm run test:e2e
```

### 2. Environment Variables

**app.json kontrol**:
```json
{
  "expo": {
    "extra": {
      "supabaseUrl": "PRODUCTION_URL",
      "supabaseAnonKey": "PRODUCTION_KEY",
      "falApiKey": "PRODUCTION_KEY",
      "revenueCatApiKey": "PRODUCTION_KEY",
      "sentryDsn": "PRODUCTION_DSN"
    }
  }
}
```

### 3. Version Bump

**iOS (app.json)**:
```json
{
  "expo": {
    "version": "1.0.1",
    "ios": {
      "buildNumber": "23"
    }
  }
}
```

**Android (app.json)**:
```json
{
  "expo": {
    "android": {
      "versionCode": 2
    }
  }
}
```

### 4. Assets Check

```bash
# Icon ve splash screen kontrol
ls -la assets/icon.png
ls -la assets/splash-icon.png
ls -la assets/adaptive-icon.png

# iOS icon set
ls -la ios-iconset/

# Boyut ve format kontrol
file assets/icon.png  # 1024x1024 PNG olmalı
```

### 5. Permissions Check

**iOS (app.json)**:
- NSPhotoLibraryUsageDescription ✓
- NSPhotoLibraryAddUsageDescription ✓
- NSCameraUsageDescription ✓
- NSUserTrackingUsageDescription ✓

**Android (AndroidManifest.xml)**:
- READ_EXTERNAL_STORAGE ✓
- WRITE_EXTERNAL_STORAGE ✓
- CAMERA ✓
- INTERNET ✓

### 6. API Keys Production Check

```bash
# Supabase
curl https://YOUR_PROJECT.supabase.co/rest/v1/

# FAL.AI
curl -H "Authorization: Key YOUR_KEY" https://fal.run/health

# RevenueCat
# Dashboard'dan production mode kontrol

# Sentry
# Dashboard'dan DSN kontrol
```

## 🏗️ EAS Build Setup

### 1. EAS CLI Installation

```bash
# Global installation
npm install -g eas-cli

# Login
eas login

# Account info
eas whoami
```

### 2. Project Configuration

```bash
# EAS project init (ilk defa)
eas init

# Build configure
eas build:configure

# Project ID check
cat eas.json
```

### 3. Credentials Setup

**iOS**:
```bash
# Apple Developer credentials
eas credentials

# Select iOS
# Select Build Credentials
# Set up push notifications
# Set up App Store Connect API Key
```

**Android**:
```bash
# Android keystore
eas credentials

# Select Android
# Generate new keystore or upload existing
```

## 📱 iOS Deployment

### Development Build

```bash
# iOS simulator build
eas build --profile development --platform ios --local

# iOS device build (internal distribution)
eas build --profile development --platform ios

# Download ve install
eas build:list
# .tar.gz indir ve Xcode ile simulator'a install
```

### Preview Build

```bash
# Internal testing için
eas build --profile preview --platform ios

# TestFlight'a submit olmadan test
# Ad-hoc veya enterprise distribution
```

### Production Build

```bash
# App Store build
eas build --profile production --platform ios

# Build status kontrol
eas build:list

# Build details
eas build:view <build-id>
```

### Build Logs

```bash
# Real-time logs
eas build --profile production --platform ios --wait

# Log görüntüleme
eas build:view <build-id>
```

### Common iOS Build Issues

**1. Provisioning Profile Hatası**:
```bash
# Credentials sıfırla
eas credentials --platform ios
# Remove all credentials
# Rebuild
```

**2. CocoaPods Hatası**:
```bash
# ios/Podfile.lock sil
rm ios/Podfile.lock
# Rebuild
```

**3. Archive Hatası**:
```bash
# Clean build
eas build --profile production --platform ios --clear-cache
```

## 🤖 Android Deployment

### Development Build

```bash
# Android emulator build
eas build --profile development --platform android --local

# Android device build
eas build --profile development --platform android

# APK install
adb install app.apk
```

### Preview Build

```bash
# Internal testing APK
eas build --profile preview --platform android

# Internal testing AAB (Google Play)
eas build --profile preview --platform android --wait
```

### Production Build

```bash
# Play Store build (AAB)
eas build --profile production --platform android

# Build status
eas build:list --platform android
```

### Android Build Configuration

**app.json**:
```json
{
  "android": {
    "package": "com.someplanets.monzieai",
    "versionCode": 1,
    "adaptiveIcon": {
      "foregroundImage": "./assets/adaptive-icon.png",
      "backgroundColor": "#ffffff"
    },
    "permissions": [
      "CAMERA",
      "READ_EXTERNAL_STORAGE",
      "WRITE_EXTERNAL_STORAGE"
    ]
  }
}
```

## 🍎 App Store Submission

### 1. App Store Connect Setup

**App Information**:
- Name: MonzieAI
- Bundle ID: com.someplanets.monzieaiv2
- SKU: monzieai-ios
- Category: Photo & Video
- Subcategory: Photo Editing

**Pricing**:
- Free with In-App Purchases
- Available in all countries
- Premium subscriptions:
  - Weekly: $9.99
  - Monthly: $29.99
  - Annual: $299.99

### 2. App Store Screenshots

**Required Sizes**:
- 6.7" (iPhone 15 Pro Max): 1290x2796
- 6.5" (iPhone 11 Pro Max): 1242x2688
- 5.5" (iPhone 8 Plus): 1242x2208
- iPad Pro 12.9": 2048x2732

**Screenshots Needed**:
- 5-10 screenshots per device size
- App preview video (opsiyonel)
- Feature highlights

### 3. App Store Description

**Short Description** (170 char):
```
Transform your photos with AI. Create stunning portraits, scenes, 
and artistic images in seconds. Premium quality, unlimited creativity.
```

**Full Description**:
```
MonzieAI - AI-Powered Photo Transformation

Transform your ordinary photos into extraordinary AI-generated masterpieces! 
MonzieAI uses cutting-edge artificial intelligence to create stunning images 
in various styles and scenes.

KEY FEATURES:
• 100+ Professional Scenes - Portrait, outdoor, business, creative, and more
• AI-Powered Generation - State-of-the-art Flux Pro AI model
• High Quality Output - Up to 1024x1024 resolution
• Easy to Use - Just select a scene, upload your photo, and let AI do the magic
• Gallery & Favorites - Organize and save your favorite creations
• Instant Sharing - Share directly to social media

PERFECT FOR:
✓ Professional portraits
✓ Social media content
✓ Creative projects
✓ Personal branding
✓ Gift ideas
✓ Fun and entertainment

FREE FEATURES:
- 10 images per day
- Access to basic scenes
- Save to gallery
- Share to social media

PREMIUM FEATURES:
- Unlimited image generation
- Access to all premium scenes
- No watermarks
- Priority processing
- HD downloads
- Cloud backup

Download now and unleash your creativity with AI!
```

**Keywords**:
```
AI photo, photo editor, portrait, AI art, image generator, photo transformation, 
AI portraits, professional photos, photo effects, creative photos
```

### 4. App Store Metadata

**What's New** (ilk release):
```
🎉 MonzieAI v1.0 - Launch Release!

Welcome to MonzieAI, your AI-powered photo transformation app!

✨ Features:
• 100+ professional scenes and styles
• Instant AI-powered photo transformation
• High-quality image generation
• Easy-to-use interface
• Gallery and favorites management
• Social media sharing

🚀 Get Started:
1. Choose a scene that matches your style
2. Upload your photo
3. Let AI create amazing results
4. Save, share, and enjoy!

Thank you for being part of our journey! 
We're excited to see what you'll create!
```

### 5. App Privacy

**Data Collection**:
- Email (for authentication)
- Photos (processed locally and in cloud)
- Purchase history
- Analytics data

**Privacy Policy**: https://monzieai.com/privacy
**Terms of Service**: https://monzieai.com/terms

### 6. Submit via EAS

```bash
# Build production
eas build --profile production --platform ios --auto-submit

# Veya manuel submit
eas submit --platform ios --latest

# Submit options
eas submit --platform ios --latest --verbose
```

### 7. App Store Review Notes

```
IMPORTANT NOTES FOR REVIEWERS:

1. TEST ACCOUNT:
   Email: reviewer@test.com
   Password: TestReview123!
   
2. DEMO INSTRUCTIONS:
   - Launch the app
   - Skip onboarding or create account
   - Select "Professional Portrait" scene
   - Use provided test image or upload from gallery
   - Wait 30-60 seconds for AI generation
   - View, save, or share result
   
3. AI GENERATION:
   - Uses FAL.AI Flux Pro API
   - Requires active internet connection
   - Processing time: 30-60 seconds
   - NSFW content filter enabled
   
4. IN-APP PURCHASES:
   - Subscriptions managed via RevenueCat
   - Test with sandbox account
   - Free tier: 10 generations/day
   - Premium: Unlimited generations
   
5. PERMISSIONS:
   - Photos: Required for image selection and saving
   - Camera: Optional for taking photos
   - Notifications: Optional for generation complete alerts
   
6. CONTACT:
   Email: support@monzieai.com
   
Thank you for reviewing MonzieAI!
```

## 🤖 Play Store Submission (Yakında)

### 1. Play Console Setup

**App Details**:
- App name: MonzieAI
- Package name: com.someplanets.monzieai
- Category: Photography
- Content rating: Everyone
- Privacy policy: Required

### 2. Submit via EAS

```bash
# Android production build
eas build --profile production --platform android

# Submit to Play Store
eas submit --platform android --latest
```

### 3. Play Store Assets

**Screenshots**:
- Phone: 1080x1920 (min 2, max 8)
- Tablet 7": 1536x2048
- Tablet 10": 2048x1536

**Feature Graphic**:
- Size: 1024x500
- Format: PNG or JPEG

**Icon**:
- Size: 512x512
- Format: PNG (32-bit)

## 🔄 CI/CD Pipeline

### GitHub Actions Setup

**.github/workflows/build.yml**:
```yaml
name: EAS Build

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20.x'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      
      - name: Build iOS
        if: github.ref == 'refs/heads/main'
        run: eas build --platform ios --profile production --non-interactive
      
      - name: Build Android
        if: github.ref == 'refs/heads/main'
        run: eas build --platform android --profile production --non-interactive
```

### Automated Testing

**.github/workflows/test.yml**:
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20.x'
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
```

## 📊 Monitoring & Analytics

### Post-Deployment Monitoring

**Metrics to Track**:
- Crash-free rate (target: greater than 99.5%)
- App launch time (target: less than 3s)
- API response times (target: less than 2s)
- Image generation success rate (target: greater than 95%)
- Daily/Monthly Active Users
- Conversion rate (free to premium)
- Retention rates (D1, D7, D30)

### Crash Reporting (Sentry)

**Setup**:
```bash
# Sentry init (already done)
# Monitor crashes in dashboard
# https://sentry.io/organizations/yourorg/projects/monzieai/
```

**Alert Configuration**:
- Critical errors: Immediate notification
- High error rate: 15 min notification
- New error types: Daily digest

### Analytics (Custom)

**Key Events**:
```typescript
// Track important events
analyticsService.trackEvent('app_launched');
analyticsService.trackEvent('image_generated', { sceneId, success: true });
analyticsService.trackEvent('subscription_started', { plan: 'monthly' });
```

**Dashboards**:
- Real-time usage
- Generation metrics
- Revenue metrics
- User cohorts
- Funnel analysis

### Performance Monitoring

```bash
# Bundle size analysis
npm run analyze:bundle

# Lighthouse CI (web)
npm run lighthouse

# React DevTools Profiler
# Monitor component render times
```

## 🔙 Rollback Strategy

### Version Rollback

**App Store**:
1. App Store Connect > App Store > Version History
2. Select previous version
3. Submit for review (if removed)
4. Or: Release new build with old code

**Play Store**:
1. Play Console > Release > Production
2. Click "Create new release"
3. Upload previous AAB
4. Roll out to percentage

### Emergency Hotfix

```bash
# 1. Create hotfix branch
git checkout -b hotfix/critical-bug

# 2. Fix the bug
# ... make changes ...

# 3. Test locally
npm test

# 4. Bump version
# Update app.json version & buildNumber

# 5. Build
eas build --profile production --platform all

# 6. Submit
eas submit --platform all --latest

# 7. Merge to main
git checkout main
git merge hotfix/critical-bug
git push
```

### Feature Flags

```typescript
// Use for gradual rollout
const FEATURE_FLAGS = {
  newImageEditor: false,
  videoGeneration: false,
  socialSharing: true
};

// Toggle via remote config
if (FEATURE_FLAGS.newImageEditor) {
  // Show new feature
}
```

### Gradual Rollout

**App Store**:
- Phased Release (7 days)
- Day 1: 1% users
- Day 2: 2% users
- Day 3: 5% users
- Day 4: 10% users
- Day 5: 20% users
- Day 6: 50% users
- Day 7: 100% users

**Play Store**:
- Manual percentage control
- Start with 1-5%
- Monitor metrics
- Increase gradually
- Can pause or halt anytime

## 📝 Release Checklist

### Pre-Release

- [ ] Code review completed
- [ ] Tests passing (unit, integration, e2e)
- [ ] Linting and formatting
- [ ] Version bumped
- [ ] Changelog updated
- [ ] Environment variables verified
- [ ] API keys verified (production)
- [ ] Assets updated (icons, splash)
- [ ] Permissions checked
- [ ] Performance tested
- [ ] Security audit completed
- [ ] Privacy policy updated
- [ ] Terms of service updated

### Build & Submit

- [ ] Production build created
- [ ] Build tested on real devices
- [ ] Screenshots captured
- [ ] App Store/Play Store metadata updated
- [ ] Review notes prepared
- [ ] Test account credentials ready
- [ ] Submitted for review

### Post-Release

- [ ] Monitoring dashboards checked
- [ ] Crash reports reviewed
- [ ] User feedback monitored
- [ ] Analytics data reviewed
- [ ] Performance metrics checked
- [ ] App Store/Play Store rating monitored
- [ ] Customer support prepared
- [ ] Marketing materials updated
- [ ] Social media announced
- [ ] Documentation updated

## 🚨 Emergency Procedures

### Critical Bug Found

1. **Assess Impact**: How many users affected?
2. **Triage**: Can it wait for next release?
3. **Hotfix**: If critical, create hotfix immediately
4. **Communication**: Notify users if necessary
5. **Deploy**: Emergency deployment procedure
6. **Monitor**: Watch metrics closely
7. **Post-Mortem**: Analyze what went wrong

### App Store Rejection

1. **Read Rejection Reason**: Carefully review feedback
2. **Fix Issues**: Address all points mentioned
3. **Test Thoroughly**: Ensure fixes work
4. **Update Review Notes**: Add clarifications
5. **Resubmit**: With detailed response to reviewer
6. **Follow Up**: Check status regularly

### Server Downtime

1. **Check Status**: Supabase, FAL.AI, RevenueCat
2. **Enable Maintenance Mode**: Show friendly message
3. **Notify Users**: In-app banner or push notification
4. **Monitor Recovery**: Real-time status checks
5. **Restore Service**: Gradual rollout
6. **Post-Incident**: Review and improve

## 📞 Support Contacts

### Platform Support

- **EAS Support**: https://expo.dev/support
- **App Store Connect**: https://developer.apple.com/contact/
- **Play Console**: https://support.google.com/googleplay/android-developer/

### Third-Party Services

- **Supabase**: https://supabase.com/support
- **FAL.AI**: support@fal.ai
- **RevenueCat**: https://www.revenuecat.com/support

### Team Contacts

- **Engineering**: dev@monzieai.com
- **Product**: product@monzieai.com
- **Support**: support@monzieai.com

---

**Son Güncelleme**: 2024
**Platform**: iOS (Android yakında)
**Build System**: EAS Build
**Distribution**: App Store, TestFlight