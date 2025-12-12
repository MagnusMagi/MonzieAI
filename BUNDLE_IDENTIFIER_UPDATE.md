# 📦 Bundle Identifier Güncelleme

## ✅ Yapılan Değişiklik

Bundle identifier `com.someplanets.monzieai` → `com.someplanets.monzieaiv2` olarak güncellendi.

## 📝 Güncellenen Dosyalar

### 1. app.json
```json
"ios": {
  "bundleIdentifier": "com.someplanets.monzieaiv2"
}
```

### 2. ios/monzieai.xcodeproj/project.pbxproj
```pbxproj
PRODUCT_BUNDLE_IDENTIFIER = com.someplanets.monzieaiv2;
```
(2 yerde güncellendi: Debug ve Release konfigürasyonları)

### 3. ios/monzieai/Info.plist
```xml
<string>com.someplanets.monzieaiv2</string>
```
(CFBundleURLSchemes içinde)

## 🚀 Sonraki Adımlar

### 1. Apple Developer Console'da Yeni App ID Oluştur

1. **https://developer.apple.com/account/resources/identifiers/list/bundleId** adresine gidin
2. **+** (Plus) butonuna tıklayın
3. **App IDs** → **Continue**
4. **Description:** `MonzieAI v2`
5. **Bundle ID:** 
   - **Explicit** seçin
   - **Bundle ID:** `com.someplanets.monzieaiv2`
6. **Capabilities:**
   - ✅ Push Notifications
   - ✅ Sign in with Apple
   - ✅ Associated Domains (opsiyonel)
7. **Continue** → **Register** → **Done**

### 2. EAS Build Yap

App ID oluşturulduktan sonra:

```bash
eas build --platform ios
```

## ⚠️ Önemli Notlar

- **Android Package Name:** Değiştirilmedi (hala `com.someplanets.monzieai`)
- **iOS Bundle Identifier:** `com.someplanets.monzieaiv2` olarak güncellendi
- **Apple Developer App ID:** Yeni App ID oluşturulmalı (`com.someplanets.monzieaiv2`)

## 🔍 Kontrol

Bundle identifier'ın doğru güncellendiğini kontrol etmek için:

```bash
# app.json
grep bundleIdentifier app.json

# Xcode project
grep PRODUCT_BUNDLE_IDENTIFIER ios/monzieai.xcodeproj/project.pbxproj

# Info.plist
grep monzieaiv2 ios/monzieai/Info.plist
```

## ✅ Durum

- ✅ app.json güncellendi
- ✅ Xcode project güncellendi
- ✅ Info.plist güncellendi
- ⚠️ Apple Developer App ID oluşturulmalı
- ⚠️ EAS build yapılmalı

