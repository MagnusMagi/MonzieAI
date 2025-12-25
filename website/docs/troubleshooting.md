---
sidebar_position: 12
title: Troubleshooting
---

# MonzieAI - Sorun Giderme Kılavuzu

## 📋 İçindekiler

1. [Genel Sorunlar](#genel-sorunlar)
2. [Kurulum Sorunları](#kurulum-sorunları)
3. [Build Sorunları](#build-sorunları)
4. [Runtime Sorunları](#runtime-sorunları)
5. [API Sorunları](#api-sorunları)
6. [Platform Specific Sorunlar](#platform-specific-sorunlar)
7. [Performance Sorunları](#performance-sorunları)
8. [Network Sorunları](#network-sorunları)

## 🔧 Genel Sorunlar

### "Cannot find module" Hatası

**Sorun**: Module import hataları
```
Error: Cannot find module '@supabase/supabase-js'
```

**Çözüm**:
```bash
# 1. node_modules temizle
rm -rf node_modules

# 2. Package lock temizle
rm package-lock.json
# veya yarn için
rm yarn.lock

# 3. Cache temizle
npm cache clean --force

# 4. Yeniden yükle
npm install

# 5. Metro bundler'ı temizle
npm start -- --clear
```

---

### Metro Bundler Donması

**Sorun**: Metro bundler yanıt vermiyor veya çok yavaş

**Çözüm**:
```bash
# Watchman temizle (macOS)
watchman watch-del-all

# Metro cache temizle
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-*

# Restart with fresh cache
npm start -- --reset-cache
```

---

### "Unable to resolve module" Hatası

**Sorun**: Module resolution hatası

**Çözüm**:
```bash
# 1. metro.config.js kontrol et
# 2. tsconfig.json paths kontrol et
# 3. Restart metro bundler
npm start -- --clear

# 4. Eğer devam ederse, absolute path kullan
import { service } from '../../../services/service';
# yerine
import { service } from '@/services/service';
```

## 💻 Kurulum Sorunları

### Node Version Uyumsuzluğu

**Sorun**: 
```
The engine "node" is incompatible with this module
```

**Çözüm**:
```bash
# Node version kontrol
node --version

# NVM ile doğru version yükle
nvm install 20.18.0
nvm use 20.18.0

# Package.json'da engine belirt
"engines": {
  "node": ">=20.18.0"
}
```

---

### CocoaPods Kurulum Hatası (iOS)

**Sorun**: 
```
[!] CocoaPods could not find compatible versions for pod
```

**Çözüm**:
```bash
cd ios

# Pod cache temizle
pod cache clean --all

# Podfile.lock sil
rm Podfile.lock

# Pods klasörünü sil
rm -rf Pods

# Repo update
pod repo update

# Yeniden install
pod install

cd ..
```

---

### Xcode Command Line Tools Hatası

**Sorun**: Xcode tools bulunamıyor

**Çözüm**:
```bash
# Install command line tools
xcode-select --install

# Path ayarla
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer

# Verify
xcode-select -p
```

---

### Android Gradle Build Hatası

**Sorun**: Gradle sync veya build hatası

**Çözüm**:
```bash
# Android dizinine git
cd android

# Gradle wrapper permissions
chmod +x gradlew

# Clean build
./gradlew clean

# Cache temizle
./gradlew cleanBuildCache

# Gradle cache temizle (global)
rm -rf ~/.gradle/caches/

cd ..
```

## 🏗️ Build Sorunları

### iOS Build Fail: Code Signing

**Sorun**: 
```
Code signing error: No signing certificate
```

**Çözüm**:
```bash
# 1. Xcode'da Preferences > Accounts kontrol et
# 2. Certificate indır
# 3. Provisioning profile yenile

# Veya EAS Build kullan
eas build --profile development --platform ios
```

---

### iOS Build Fail: Missing Info.plist Keys

**Sorun**: Info.plist eksik permission key'leri

**Çözüm**:
```xml
<!-- ios/YourApp/Info.plist -->
<key>NSPhotoLibraryUsageDescription</key>
<string>We need access to your photos</string>

<key>NSPhotoLibraryAddUsageDescription</key>
<string>We need to save generated images</string>

<key>NSCameraUsageDescription</key>
<string>We need camera access</string>
```

---

### Android Build Fail: Duplicate Classes

**Sorun**: 
```
Duplicate class found in modules
```

**Çözüm**:
```gradle
// android/app/build.gradle
configurations.all {
    exclude group: 'com.google.android.gms', module: 'play-services-basement'
}
```

---

### EAS Build Timeout

**Sorun**: EAS build timeout oluyor

**Çözüm**:
```json
// eas.json
{
  "build": {
    "production": {
      "node": "20.18.0",
      "cache": {
        "disabled": false
      }
    }
  }
}
```

```bash
# Clear EAS cache
eas build --clear-cache

# Build with more workers
eas build --profile production --platform ios
```

---

### Native Module Not Found

**Sorun**: 
```
Native module cannot be null
```

**Çözüm**:
```bash
# iOS
cd ios && pod install && cd ..

# Android - ensure linking
npx react-native link

# Clean build
rm -rf node_modules
npm install

# iOS
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..

# Rebuild
npm run ios
# or
npm run android
```

## 🚀 Runtime Sorunları

### White Screen / Blank Screen

**Sorun**: Uygulama açılıyor ama beyaz ekran görünüyor

**Çözüm**:
```bash
# 1. Error boundary kontrol et
# App.tsx'de ErrorBoundary var mı?

# 2. Console'da error kontrol et
# Chrome DevTools veya React Native Debugger

# 3. Try-catch ile hata yakala
try {
  // Your code
} catch (error) {
  console.error('App error:', error);
}

# 4. Splash screen timeout
# app.json splash screen settings kontrol et
```

---

### App Crashes on Launch

**Sorun**: Uygulama açılır açılmaz crash oluyor

**Çözüm**:
```bash
# iOS - Check logs
xcrun simctl spawn booted log stream --level=debug

# Android - Check logcat
adb logcat *:E

# Common causes:
# - Missing API keys in env
# - Invalid Supabase configuration
# - Sentry initialization error
# - Native module error

# Disable problematic services temporarily
// App.tsx
// sentryService.initialize(); // Comment out
```

---

### Images Not Loading

**Sorun**: Görseller yüklenmiyor

**Çözüm**:
```typescript
// Check network permissions
// Android: AndroidManifest.xml
<uses-permission android:name="android.permission.INTERNET" />

// Check image URLs
console.log('Image URL:', imageUrl);

// Use expo-image fallback
<Image
  source={{ uri: imageUrl }}
  defaultSource={require('./assets/placeholder.png')}
  onError={(error) => console.log('Image error:', error)}
/>

// Clear cache
import { Image } from 'expo-image';
await Image.clearDiskCache();
await Image.clearMemoryCache();
```

---

### Navigation Not Working

**Sorun**: Screen navigation çalışmıyor

**Çözüm**:
```typescript
// Check navigation prop exists
const { navigation } = props;
if (!navigation) {
  console.error('Navigation prop missing');
}

// Use useNavigation hook
import { useNavigation } from '@react-navigation/native';
const navigation = useNavigation();

// Check screen is registered
<Stack.Screen name="YourScreen" component={YourScreen} />

// Debug navigation state
console.log(navigation.getState());
```

## 🌐 API Sorunları

### Supabase Connection Failed

**Sorun**: 
```
Error: Failed to connect to Supabase
```

**Çözüm**:
```bash
# 1. Environment variables kontrol
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY

# 2. Network test
curl https://your-project.supabase.co/rest/v1/

# 3. Check if keys are valid
# Supabase Dashboard > Settings > API

# 4. app.json extra kontrol
"extra": {
  "supabaseUrl": "https://...",
  "supabaseAnonKey": "..."
}
```

---

### FAL.AI Rate Limit

**Sorun**: 
```
Error: Rate limit exceeded
```

**Çözüm**:
```typescript
// Implement retry with backoff
async function generateWithRetry(params, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await falAIService.generate(params);
    } catch (error) {
      if (error.status === 429 && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
}

// Check quota
// FAL.AI Dashboard > Usage
```

---

### RevenueCat Purchase Failed

**Sorun**: Purchase işlemi başarısız

**Çözüm**:
```typescript
// 1. Sandbox test account kullan (iOS)
// Settings > App Store > Sandbox Account

// 2. Debug logs aktif
Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);

// 3. Check customer info
const info = await Purchases.getCustomerInfo();
console.log('Customer Info:', info);

// 4. Restore purchases
const restored = await Purchases.restorePurchases();
console.log('Restored:', restored);

// 5. Check product IDs match
// RevenueCat Dashboard > Products
// App Store Connect > In-App Purchases
```

---

### Network Timeout

**Sorun**: API calls timeout oluyor

**Çözüm**:
```typescript
// Increase timeout
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 seconds

try {
  const response = await fetch(url, {
    signal: controller.signal,
    // ... other options
  });
} finally {
  clearTimeout(timeoutId);
}

// Or use axios with timeout
import axios from 'axios';
const response = await axios.get(url, {
  timeout: 30000, // 30 seconds
});
```

## 📱 Platform Specific Sorunlar

### iOS Specific

#### Simulator Keyboard Not Showing

**Çözüm**:
```
Hardware > Keyboard > Connect Hardware Keyboard (uncheck)
```

#### Push Notifications Not Working

**Çözüm**:
```bash
# 1. Check capabilities
# Xcode > Signing & Capabilities > Push Notifications

# 2. Check provisioning profile
# Should include Push Notifications

# 3. Test with physical device
# Simulator doesn't support push notifications
```

#### App Store Rejection

**Çözüm**:
```
Common reasons:
1. Missing privacy policy
2. Missing terms of service
3. Incomplete metadata
4. Missing required permissions explanations
5. Test account not working

Check:
- app.json permissions descriptions
- Review notes detailed
- Test account valid
```

---

### Android Specific

#### APK Not Installing

**Çözüm**:
```bash
# Check device
adb devices

# Uninstall old version
adb uninstall com.yourapp.packagename

# Install fresh
adb install app.apk

# Check logs
adb logcat | grep "Package Manager"
```

#### Google Play Services Error

**Çözüm**:
```gradle
// android/app/build.gradle
dependencies {
  implementation 'com.google.android.gms:play-services-base:18.0.1'
}
```

#### ProGuard Issues (Release Build)

**Çözüm**:
```
// android/app/proguard-rules.pro
-keep class com.facebook.react.** { *; }
-keep class com.supabase.** { *; }
-keep class io.github.jan.supabase.** { *; }
```

## ⚡ Performance Sorunları

### Slow App Launch

**Sorun**: Uygulama açılması çok yavaş

**Çözüm**:
```typescript
// 1. Lazy load screens
const HomeScreen = lazy(() => import('./screens/HomeScreen'));

// 2. Defer heavy operations
useEffect(() => {
  const timer = setTimeout(() => {
    // Heavy operation
  }, 100);
  return () => clearTimeout(timer);
}, []);

// 3. Optimize imports
// Bad:
import _ from 'lodash';
// Good:
import debounce from 'lodash/debounce';

// 4. Remove console.log in production
if (!__DEV__) {
  console.log = () => {};
}
```

---

### High Memory Usage

**Sorun**: Memory usage çok yüksek

**Çözüm**:
```typescript
// 1. Use React.memo
const Component = React.memo(({ prop }) => {
  return <View>{prop}</View>;
});

// 2. Clear image cache periodically
import { Image } from 'expo-image';
await Image.clearMemoryCache();

// 3. Limit list items
<FlatList
  data={items}
  maxToRenderPerBatch={10}
  windowSize={21}
  removeClippedSubviews={true}
/>

// 4. Release large objects
useEffect(() => {
  return () => {
    // Cleanup
    largeObject = null;
  };
}, []);
```

---

### Slow Scrolling

**Sorun**: List scrolling janky

**Çözüm**:
```typescript
// Use FlatList instead of ScrollView
<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={item => item.id}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  updateCellsBatchingPeriod={50}
  windowSize={21}
/>

// Optimize renderItem
const renderItem = useCallback(({ item }) => (
  <MemoizedItem item={item} />
), []);
```

## 🌐 Network Sorunları

### "Network request failed"

**Sorun**: Network requests başarısız

**Çözüm**:
```bash
# 1. Check internet connection
ping google.com

# 2. iOS - Add App Transport Security exception
# Info.plist
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsArbitraryLoads</key>
  <true/>
</dict>

# 3. Android - Check network permissions
# AndroidManifest.xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

# 4. Test with curl
curl -v https://your-api.com/endpoint
```

---

### CORS Error (Web)

**Sorun**: CORS policy error

**Çözüm**:
```javascript
// This is a backend issue
// Server needs to allow CORS

// Express example:
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Or use proxy in development
// package.json
"proxy": "https://your-api.com"
```

---

### SSL Certificate Error

**Sorun**: SSL verification failed

**Çözüm**:
```typescript
// Development only - DO NOT use in production
// Disable SSL verification
if (__DEV__) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

// Better: Use proper SSL certificates
// Check certificate chain
openssl s_client -connect your-domain.com:443
```

## 🔍 Debug Tips

### Enable Debug Mode

```typescript
// App.tsx
if (__DEV__) {
  console.log('🐛 Debug mode enabled');
  
  // Enable network inspector
  // Shake device > Debug > Enable Network Inspector
  
  // Enable performance monitor
  // Shake device > Show Perf Monitor
}
```

### React Native Debugger

```bash
# Install
brew install --cask react-native-debugger

# Run
open "rndebugger://set-debugger-loc?host=localhost&port=8081"
```

### Flipper (Advanced)

```bash
# Install
brew install --cask flipper

# Enable in app
# Add to Podfile (iOS)
use_flipper!
```

## 📞 Getting Help

### Before Asking for Help

1. ✅ Check this troubleshooting guide
2. ✅ Search GitHub issues
3. ✅ Check Expo docs
4. ✅ Review error logs
5. ✅ Try on clean install

### When Reporting Issues

Include:
- Platform (iOS/Android)
- OS version
- Node version
- Package versions
- Error message
- Steps to reproduce
- Screenshots/videos

### Useful Commands

```bash
# System info
npx react-native info

# Doctor check
npx expo-doctor

# Environment
npx expo config

# Debug build
npx expo run:ios --configuration Debug

# Logs
npx expo start --dev-client --clear
```

## 🆘 Emergency Quick Fixes

### Nuclear Option (Last Resort)

```bash
# ⚠️ This will delete everything and start fresh

# 1. Backup your code
git commit -am "Backup before nuclear option"

# 2. Delete everything
rm -rf node_modules
rm -rf ios/Pods ios/Podfile.lock
rm -rf android/build android/.gradle
rm -rf .expo
rm package-lock.json yarn.lock

# 3. Clear all caches
npm cache clean --force
watchman watch-del-all
rm -rf $TMPDIR/react-*
rm -rf $TMPDIR/metro-*

# 4. Reinstall
npm install

# 5. iOS pods
cd ios && pod install && cd ..

# 6. Start fresh
npm start -- --reset-cache
```

---

**Son Güncelleme**: 2024
**Platform**: iOS, Android
**Support**: support@monzieai.com