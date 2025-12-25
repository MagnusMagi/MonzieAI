# MonzieAI - Kurulum Kılavuzu

## 📋 İçindekiler

1. [Sistem Gereksinimleri](#sistem-gereksinimleri)
2. [Ön Gereksinimler](#ön-gereksinimler)
3. [Proje Kurulumu](#proje-kurulumu)
4. [Environment Variables](#environment-variables)
5. [Supabase Kurulumu](#supabase-kurulumu)
6. [FAL.AI Kurulumu](#falai-kurulumu)
7. [RevenueCat Kurulumu](#revenuecat-kurulumu)
8. [iOS Kurulumu](#ios-kurulumu)
9. [Android Kurulumu](#android-kurulumu)
10. [Development Server](#development-server)
11. [Sorun Giderme](#sorun-giderme)

## 💻 Sistem Gereksinimleri

### macOS (iOS Development için gerekli)
- macOS 13.0 (Ventura) veya üzeri
- Xcode 15.0 veya üzeri
- Command Line Tools
- Rosetta 2 (Apple Silicon için)

### Windows/Linux (Android Development)
- Windows 10/11 veya Ubuntu 20.04+
- Android Studio Arctic Fox veya üzeri
- JDK 17

### Genel
- Node.js 20.18.0 (LTS)
- npm 10.x veya yarn 1.22.x
- Git 2.x
- 10 GB boş disk alanı
- 8 GB RAM (minimum), 16 GB (önerilen)

## 📦 Ön Gereksinimler

### 1. Node.js ve npm Kurulumu

```bash
# Node.js versiyon kontrolü
node --version  # v20.18.0 olmalı

# Eğer yüklü değilse:
# macOS (Homebrew ile)
brew install node@20

# Node Version Manager (nvm) ile
nvm install 20.18.0
nvm use 20.18.0
```

### 2. Expo CLI Kurulumu

```bash
# Global Expo CLI (opsiyonel, local tercih edilir)
npm install -g @expo/cli

# EAS CLI (deployment için)
npm install -g eas-cli
```

### 3. iOS Development Tools (macOS)

```bash
# Xcode yükleyin (App Store'dan)
# Command Line Tools yükleyin
xcode-select --install

# CocoaPods yükleyin
sudo gem install cocoapods

# CocoaPods version kontrolü
pod --version  # 1.12.0 veya üzeri
```

### 4. Android Development Tools

```bash
# Android Studio yükleyin
# https://developer.android.com/studio

# Android SDK kurulumu
# Android Studio > Preferences > Appearance & Behavior > System Settings > Android SDK
# SDK Platforms: Android 13 (API 33)
# SDK Tools: Android SDK Build-Tools 33, Android Emulator, Android SDK Platform-Tools

# Environment variables (Linux/macOS)
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### 5. Git Kurulumu

```bash
# Git version kontrolü
git --version

# macOS
brew install git

# Configure git
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## 🚀 Proje Kurulumu

### 1. Repository Klonlama

```bash
# HTTPS ile
git clone https://github.com/yourorg/monzieai.git
cd monzieai

# SSH ile
git clone git@github.com:yourorg/monzieai.git
cd monzieai
```

### 2. Bağımlılıkları Yükleme

```bash
# npm ile
npm install

# yarn ile
yarn install

# Bağımlılık kontrolü
npm list --depth=0
```

### 3. iOS Pods Yükleme (sadece macOS)

```bash
cd ios
pod install
cd ..

# Eğer hata alırsanız:
cd ios
pod deintegrate
pod install
cd ..
```

### 4. Environment Variables Ayarlama

```bash
# .env dosyası oluşturun (root dizinde)
touch .env

# .env dosyasını düzenleyin
nano .env
```

## 🔐 Environment Variables

### .env Dosyası

`.env` dosyanızı aşağıdaki template'e göre oluşturun:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here

# FAL.AI Configuration
FAL_API_KEY=your-fal-api-key:secret-here

# Google OAuth
GOOGLE_WEB_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com
GOOGLE_ANDROID_CLIENT_ID=your-android-client-id.apps.googleusercontent.com

# RevenueCat
REVENUECAT_API_KEY_IOS=appl_your_ios_key
REVENUECAT_API_KEY_ANDROID=goog_your_android_key

# Sentry (Optional)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# App Configuration
APP_ENV=development
APP_VERSION=1.0.0
```

### app.json'da Environment Variables

`app.json` dosyası zaten environment variable'ları içeriyor, ancak production build için bu değerleri güncelleyin:

```json
{
  "expo": {
    "extra": {
      "supabaseUrl": "https://groguatbjerebweinuef.supabase.co",
      "supabaseAnonKey": "your-key",
      "falApiKey": "your-key",
      "revenueCatApiKey": "your-key"
    }
  }
}
```

## 🗄️ Supabase Kurulumu

### 1. Supabase Hesabı Oluşturma

1. [Supabase](https://supabase.com) hesabı oluşturun
2. Yeni proje oluşturun
3. Proje URL ve Anon Key'i alın

### 2. Database Schema Oluşturma

```bash
# Supabase SQL Editor'ı açın
# https://app.supabase.com/project/YOUR_PROJECT/editor

# supabase_schema.sql dosyasındaki SQL'i çalıştırın
```

Veya komut satırından:

```bash
# Supabase CLI yükleyin
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### 3. Storage Buckets Oluşturma

Supabase Dashboard'da:

1. Storage > Create Bucket
2. Bucket name: `generated-images`
3. Public: ✅ (checked)
4. File size limit: 50 MB
5. Allowed MIME types: `image/jpeg, image/png, image/webp`

### 4. Authentication Providers Ayarlama

#### Email Authentication
1. Authentication > Providers > Email
2. Enable email provider
3. Enable email confirmations (opsiyonel)

#### Google Authentication
1. Authentication > Providers > Google
2. Enable Google provider
3. Client ID ve Client Secret ekleyin
4. Authorized redirect URIs:
   - `https://your-project.supabase.co/auth/v1/callback`
   - `monzieai://auth/callback`

#### Apple Authentication
1. Authentication > Providers > Apple
2. Enable Apple provider
3. Services ID, Team ID, Key ID ekleyin
4. Private key (.p8 file) yükleyin

### 5. Row Level Security (RLS) Policies

```sql
-- Scenes table policies
CREATE POLICY "Allow public read access to active scenes"
  ON public.scenes FOR SELECT
  USING (is_active = true);

-- Generated images policies
CREATE POLICY "Users can view own images"
  ON public.generated_images FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own images"
  ON public.generated_images FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own images"
  ON public.generated_images FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own images"
  ON public.generated_images FOR DELETE
  USING (auth.uid() = user_id);

-- Profiles table policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);
```

## 🎨 FAL.AI Kurulumu

### 1. FAL.AI Hesabı

1. [FAL.AI](https://fal.ai) hesabı oluşturun
2. Dashboard > API Keys
3. Yeni API key oluşturun
4. Key'i kopyalayın (format: `key_id:secret`)

### 2. Model Erişimi

1. Dashboard > Models
2. `fal-ai/flux-pro/v1.1` model erişimini aktifleştirin
3. Billing bilgilerinizi ekleyin

### 3. Test

```bash
# Test script çalıştırın
npm run test:fal

# Veya manuel test
curl -X POST "https://fal.run/fal-ai/flux-pro/v1.1" \
  -H "Authorization: Key YOUR_KEY:SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A test image",
    "image_size": "square_hd"
  }'
```

## 💎 RevenueCat Kurulumu

### 1. RevenueCat Hesabı

1. [RevenueCat](https://www.revenuecat.com) hesabı oluşturun
2. Yeni app oluşturun:
   - Name: MonzieAI
   - Bundle ID (iOS): `com.someplanets.monzieaiv2`
   - Package name (Android): `com.someplanets.monzieai`

### 2. iOS App Store Connect Integration

1. RevenueCat Dashboard > Apps > iOS
2. App Store Connect API Key oluşturun:
   - App Store Connect > Users and Access > Keys
   - Key oluşturun (In-App Purchase yetkileri ile)
   - Key'i indirin (.p8 file)
3. RevenueCat'e yükleyin:
   - Issuer ID
   - Key ID
   - Private key (.p8)

### 3. Products & Entitlements

#### Products Oluşturma
1. App Store Connect > My Apps > In-App Purchases
2. Yeni subscriptions oluşturun:
   - Weekly: `com.someplanets.monzieai.weekly`
   - Monthly: `com.someplanets.monzieai.monthly`
   - Annual: `com.someplanets.monzieai.annual`

#### RevenueCat'te Konfigürasyon
1. RevenueCat > Products
2. Her product'ı ekleyin ve App Store Connect product ID'leri ile eşleştirin
3. Entitlements:
   - Identifier: `premium`
   - Description: `Premium Features`
4. Offerings:
   - Identifier: `default`
   - Packages: Weekly, Monthly, Annual

### 4. Webhook Kurulumu (Opsiyonel)

Supabase ile entegrasyon için:

```bash
# Supabase Edge Function oluşturun
supabase functions new revenuecat-webhook

# Webhook URL'i RevenueCat'e ekleyin
# https://your-project.supabase.co/functions/v1/revenuecat-webhook
```

## 📱 iOS Kurulumu

### 1. Apple Developer Account

1. [Apple Developer](https://developer.apple.com) hesabınıza login olun
2. Certificates, Identifiers & Profiles

### 2. Bundle Identifier

1. Identifiers > App IDs
2. Yeni App ID oluşturun:
   - Description: MonzieAI
   - Bundle ID: `com.someplanets.monzieaiv2`
   - Capabilities:
     - ✅ Sign in with Apple
     - ✅ In-App Purchase
     - ✅ Push Notifications

### 3. Provisioning Profile

```bash
# EAS Build otomatik halleder, ancak local build için:
# Xcode > Preferences > Accounts > Download Manual Profiles
```

### 4. GoogleService-Info.plist

1. [Firebase Console](https://console.firebase.google.com)
2. iOS app ekleyin
3. Bundle ID: `com.someplanets.monzieaiv2`
4. `GoogleService-Info.plist` dosyasını indirin
5. Projeye ekleyin: `monzieai/GoogleService-Info.plist`

### 5. URL Schemes

`ios/monzieai/Info.plist` dosyasında:

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>monzieai</string>
      <string>com.someplanets.monzieai</string>
      <string>com.googleusercontent.apps.YOUR_CLIENT_ID</string>
    </array>
  </dict>
</array>
```

### 6. Info.plist Permissions

```xml
<key>NSPhotoLibraryUsageDescription</key>
<string>We need access to your photos to select images for AI generation</string>

<key>NSPhotoLibraryAddUsageDescription</key>
<string>We need access to save generated images to your photo library</string>

<key>NSCameraUsageDescription</key>
<string>We need access to your camera to take photos for AI generation</string>

<key>NSUserTrackingUsageDescription</key>
<string>We use tracking to provide personalized content</string>
```

## 🤖 Android Kurulumu

### 1. Package Name Configuration

`android/app/build.gradle`:

```gradle
android {
    defaultConfig {
        applicationId "com.someplanets.monzieai"
        // ...
    }
}
```

### 2. Google Services

1. Firebase Console > Android app ekleyin
2. Package name: `com.someplanets.monzieai`
3. `google-services.json` dosyasını indirin
4. `android/app/google-services.json` konumuna kopyalayın

### 3. Signing Configuration

```bash
# Keystore oluşturun
keytool -genkeypair -v -storetype PKCS12 -keystore monzieai.keystore \
  -alias monzieai -keyalg RSA -keysize 2048 -validity 10000

# keystore.properties oluşturun
# android/keystore.properties
MYAPP_UPLOAD_STORE_FILE=monzieai.keystore
MYAPP_UPLOAD_KEY_ALIAS=monzieai
MYAPP_UPLOAD_STORE_PASSWORD=your_password
MYAPP_UPLOAD_KEY_PASSWORD=your_password
```

### 4. Permissions

`android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
```

## 🖥️ Development Server

### Expo Development Server

```bash
# Start development server
npm start

# With LAN support (device testing)
npm start -- --lan

# Clear cache
npm start -- --clear

# Development build
npm start -- --dev-client
```

### Platform Specific

```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Web (if configured)
npm run web
```

### Expo Go (Quick Testing)

1. App Store/Play Store'dan Expo Go uygulamasını yükleyin
2. QR code'u tarayın
3. ⚠️ Not: Native modules çalışmaz, sadece JS değişiklikleri için

### Development Build (Önerilen)

```bash
# iOS development build
eas build --profile development --platform ios

# Android development build
eas build --profile development --platform android

# Build'i cihaza yükleyin
# iOS: .ipa dosyasını TestFlight veya Xcode ile
# Android: .apk dosyasını direkt yükleyin
```

## 🧪 Testing Setup

### Unit Tests

```bash
# Test çalıştır
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### E2E Tests (Maestro)

```bash
# Maestro yükleyin
curl -Ls "https://get.maestro.mobile.dev" | bash

# Test çalıştırın
npm run test:e2e

# Veya manuel
maestro test .maestro/
```

## 🔍 Sorun Giderme

### Metro Bundler Hataları

```bash
# Cache temizle
npm start -- --clear

# node_modules temizle
rm -rf node_modules
npm install

# Watchman temizle (macOS)
watchman watch-del-all
```

### iOS Build Hataları

```bash
# Pods temizle
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..

# Xcode derived data temizle
rm -rf ~/Library/Developer/Xcode/DerivedData

# Build folder temizle
cd ios
xcodebuild clean
cd ..
```

### Android Build Hataları

```bash
# Gradle cache temizle
cd android
./gradlew clean
./gradlew cleanBuildCache
cd ..

# .gradle folder temizle
rm -rf ~/.gradle/caches/
```

### Supabase Connection Issues

```bash
# Network kontrolü
curl https://your-project.supabase.co/rest/v1/

# Token kontrolü
# Supabase Dashboard > API > Anon key'i kopyalayın
# .env dosyasında güncelleyin
```

### FAL.AI API Errors

```bash
# API key kontrolü
curl -H "Authorization: Key YOUR_KEY:SECRET" \
  https://fal.run/fal-ai/flux-pro/v1.1/health

# Rate limit kontrolü
# FAL.AI Dashboard > Usage
```

### RevenueCat Issues

```bash
# SDK debug mode
# iOS: Purchases.setDebugLogsEnabled(true)
# Android: Purchases.setLogLevel(LogLevel.DEBUG)

# Test purchase
# iOS: Use sandbox account
# Android: Use test account

# Restore purchases
# Settings > Restore Purchases
```

## 📱 Device Testing

### iOS Device

```bash
# 1. Developer account ekleyin (Xcode)
# 2. Device'ı register edin
# 3. Provisioning profile oluşturun

# Development build ile
npm run ios --device

# Veya EAS build
eas device:create
```

### Android Device

```bash
# 1. USB debugging aktif edin
# 2. Device'ı bağlayın
# 3. Developer mode aktif edin

# Development build ile
npm run android --device

# Veya .apk yükleyin
adb install app.apk
```

## ✅ Kurulum Kontrolü

Tüm kurulum adımlarını tamamladıktan sonra:

```bash
# 1. Dependencies check
npm list

# 2. TypeScript check
npx tsc --noEmit

# 3. Lint check
npm run lint

# 4. Test check
npm test

# 5. Start development server
npm start
```

Her şey düzgün çalışıyorsa development'a başlayabilirsiniz! 🎉

## 📞 Yardım

Sorun yaşıyorsanız:
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) dokümantasyonuna bakın
- GitHub Issues kontrol edin
- Team'e ulaşın

---

**Son Güncelleme**: 2024
**Versiyon**: 1.0.0