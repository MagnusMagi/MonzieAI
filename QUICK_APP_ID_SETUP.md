# 🍎 Hızlı App ID Oluşturma Kılavuzu

## ⚠️ Sorun

EAS build başarısız çünkü `com.someplanets.monzieai` bundle identifier'ı Apple Developer hesabınızda kayıtlı değil.

## ✅ Hızlı Çözüm (5 Dakika)

### Adım 1: Apple Developer Console'a Giriş
1. Tarayıcıda şu adresi açın:
   **https://developer.apple.com/account/resources/identifiers/list/bundleId**

2. Apple ID ile giriş yapın:
   - **Email:** `magnus.magi@icloud.com`
   - Şifrenizi girin

### Adım 2: Yeni App ID Oluştur
1. Sağ üstteki **+** (Plus) butonuna tıklayın
2. **App IDs** seçeneğini seçin → **Continue**

### Adım 3: App ID Bilgilerini Girin
- **Description:** `MonzieAI`
- **Bundle ID:** 
  - **Explicit** seçin (önerilen)
  - **Bundle ID:** `com.someplanets.monzieai` (tam olarak bu şekilde)

### Adım 4: Capabilities Seçin
Aşağıdaki capabilities'leri seçin:
- ✅ **Push Notifications** (expo-notifications için)
- ✅ **Sign in with Apple** (expo-apple-authentication için)
- ✅ **Associated Domains** (deep linking için, opsiyonel)

### Adım 5: Register
- **Continue** → **Register** → **Done**

## 🔄 Build Tekrar Deneme

App ID oluşturulduktan sonra:

```bash
eas build --platform ios
```

## ⚡ Alternatif: Farklı Bundle Identifier

Eğer `com.someplanets.monzieai` kullanılamıyorsa (başka bir hesap tarafından alınmışsa), farklı bir bundle identifier kullanabilirsiniz:

### Örnekler:
- `com.someplanets.monzieai.app`
- `com.someplanets.monzieai.ios`
- `com.someplanets.monzieai.mobile`

### Değiştirme:
1. `app.json` dosyasında:
   ```json
   "ios": {
     "bundleIdentifier": "com.someplanets.monzieai.app"
   }
   ```

2. `ios/monzieai.xcodeproj/project.pbxproj` dosyasında:
   - `PRODUCT_BUNDLE_IDENTIFIER` değerini güncelleyin

3. Tekrar build deneyin

## 📝 Notlar

- App ID oluşturma **ücretsizdir** (Apple Developer Program üyeliği gerektirmez)
- App ID oluşturulduktan sonra hemen kullanılabilir
- Bundle identifier **değiştirilemez**, sadece yeni oluşturulabilir
- Team: **Some Planets LLC (XM8HSLMRQV)**

## ✅ Kontrol

App ID oluşturulduktan sonra:
1. Apple Developer Console'da görünüyor mu?
2. Bundle identifier doğru mu? (`com.someplanets.monzieai`)
3. Capabilities doğru mu?

Sonra tekrar build deneyin!

