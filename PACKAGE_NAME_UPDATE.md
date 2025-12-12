# 📦 Package Name Güncellemesi

## ✅ Tamamlandı

Package name başarıyla `com.magnusmagi.monzieai` → `com.someplanets.monzieai` olarak güncellendi.

---

## 🔄 Güncellenen Dosyalar

### 1. app.json ✅
- **Android package:** `com.someplanets.monzieai`
- **iOS bundleIdentifier:** `com.someplanets.monzieai`
- **iOS URL Schemes:** `com.someplanets.monzieai` eklendi

### 2. Android Native Dosyalar ✅
- **android/app/build.gradle:**
  - `namespace`: `com.someplanets.monzieai`
  - `applicationId`: `com.someplanets.monzieai`

- **android/app/src/main/java/com/someplanets/monzieai/:**
  - `MainActivity.kt`: Package declaration güncellendi
  - `MainApplication.kt`: Package declaration güncellendi
  - Dizin yapısı güncellendi: `com/magnusmagi/monzieai` → `com/someplanets/monzieai`

### 3. iOS Native Dosyalar ✅
- **ios/monzieai.xcodeproj/project.pbxproj:**
  - `PRODUCT_BUNDLE_IDENTIFIER`: `com.someplanets.monzieai`

- **ios/monzieai/Info.plist:**
  - `CFBundleURLSchemes`: `com.someplanets.monzieai` eklendi

---

## ⚠️ Önemli Notlar

### 1. Clean Build Gerekli
Package name değiştiği için **clean build** yapmanız önerilir:

```bash
# Android
cd android && ./gradlew clean

# iOS
cd ios && xcodebuild clean
```

### 2. EAS Build
EAS build yaparken yeni package name kullanılacak:
- Android: `com.someplanets.monzieai`
- iOS: `com.someplanets.monzieai`

### 3. Credentials
- **Android:** Yeni package name için yeni keystore oluşturulacak
- **iOS:** Yeni bundle identifier için yeni certificates gerekecek

### 4. App Store / Play Store
- Eski package name ile yüklenmiş uygulamalar **güncellenemez**
- Yeni package name ile **yeni uygulama** olarak yüklenir
- Store'da yeni bir listing oluşturmanız gerekebilir

---

## 🚀 Sonraki Adımlar

1. **Clean build yapın:**
   ```bash
   cd android && ./gradlew clean
   ```

2. **EAS build başlatın:**
   ```bash
   eas build --platform android
   ```

3. **Test edin:**
   - Yeni package name ile uygulama yükleniyor mu?
   - Deep linking çalışıyor mu?
   - Push notifications çalışıyor mu?

---

## ✅ Kontrol

Tüm değişiklikler doğrulandı:
- ✅ app.json güncellendi
- ✅ Android native dosyalar güncellendi
- ✅ iOS native dosyalar güncellendi
- ✅ Dizin yapıları güncellendi

**Yeni Package Name:** `com.someplanets.monzieai`

