# 🔧 iOS Build Fix: Sentry RCT-Folly Dependency Issue

## ⚠️ Sorun

iOS build başarısız oluyor çünkü `RNSentry` (sentry-expo) `RCT-Folly` bağımlılığını bulamıyor:

```
Unable to find a specification for `RCT-Folly` depended upon by `RNSentry`
```

## 🔍 Kök Neden

- `sentry-expo` paketi `RNSentry` native modülünü kullanıyor
- `RNSentry` `RCT-Folly`'ye bağımlı (React Native'in internal bağımlılığı)
- CocoaPods `RCT-Folly` podspec'ini bulamıyor

## ✅ Geçici Çözüm: Sentry'yi Devre Dışı Bırak

Build'i tamamlamak için Sentry'yi geçici olarak devre dışı bıraktık:

### 1. app.json'dan Sentry Plugin Kaldırıldı
```json
// plugins array'inden sentry-expo kaldırıldı
```

### 2. react-native.config.js Oluşturuldu
```javascript
module.exports = {
  dependencies: {
    'sentry-expo': {
      platforms: {
        ios: null, // disable iOS platform
      },
    },
  },
};
```

### 3. Podfile'da Source Eklendi
```ruby
source 'https://cdn.cocoapods.org/'
```

## 🚀 Build Yapma

Sentry devre dışı bırakıldıktan sonra:

```bash
# iOS build
npx expo prebuild --clean --platform ios
cd ios && pod install && cd ..
npx expo run:ios

# Veya EAS build
eas build --platform ios
```

## 📝 Notlar

- **Sentry Service:** `src/services/sentryService.ts` hala mevcut ama iOS'ta çalışmayacak
- **Error Logging:** `errorLoggingService` hala çalışıyor (Sentry olmadan)
- **Android:** Android build etkilenmedi

## 🔄 Sentry'yi Tekrar Aktif Etme

Sentry'yi tekrar aktif etmek için:

1. **RCT-Folly sorununu çöz:**
   ```bash
   cd ios
   pod repo update
   pod install
   ```

2. **app.json'a Sentry plugin'i geri ekle:**
   ```json
   [
     "sentry-expo",
     {
       "organization": "your-sentry-org",
       "project": "monzieai",
       "authToken": ""
     }
   ]
   ```

3. **react-native.config.js'i kaldır veya güncelle**

4. **Tekrar prebuild yap:**
   ```bash
   npx expo prebuild --clean --platform ios
   ```

## 🔍 Alternatif Çözümler

### Çözüm 1: RCT-Folly'yi Manuel Ekle
```ruby
# Podfile'a ekle
pod 'RCT-Folly', :path => '../node_modules/react-native/third-party-podspecs/RCT-Folly.podspec'
```

### Çözüm 2: Sentry Versiyonunu Güncelle
```bash
npm install sentry-expo@latest
```

### Çözüm 3: React Native Versiyonunu Kontrol Et
RCT-Folly React Native 0.81.5 ile uyumlu olmalı. Eğer sorun devam ederse, React Native versiyonunu kontrol edin.

## ✅ Durum

- ✅ Sentry plugin app.json'dan kaldırıldı
- ✅ react-native.config.js oluşturuldu
- ✅ Podfile source eklendi
- ⚠️ iOS build test edilmeli
- ⚠️ Sentry tekrar aktif edilmeli (production için)

