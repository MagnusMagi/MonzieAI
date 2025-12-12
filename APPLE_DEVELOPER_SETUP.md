# 🍎 Apple Developer App ID Kurulumu

## ⚠️ Sorun

EAS build başarısız oldu çünkü `com.someplanets.monzieai` bundle identifier'ı Apple Developer hesabınızda kayıtlı değil.

**Hata:**
```
The bundle identifier com.someplanets.monzieai is not available to team "Some Planets LLC"
An App ID with Identifier 'com.someplanets.monzieai' is not available.
```

---

## ✅ Çözüm: App ID Oluşturma

### Adım 1: Apple Developer Console'a Giriş
1. https://developer.apple.com/account/ adresine gidin
2. Apple ID ile giriş yapın: `magnus.magi@icloud.com`
3. **Certificates, Identifiers & Profiles** bölümüne gidin

### Adım 2: App ID Oluştur
1. Sol menüden **Identifiers** seçin
2. **+** (Plus) butonuna tıklayın
3. **App IDs** seçin → **Continue**

### Adım 3: App ID Bilgilerini Girin
- **Description:** `MonzieAI`
- **Bundle ID:** 
  - **Explicit** seçin
  - **Bundle ID:** `com.someplanets.monzieai`

### Adım 4: Capabilities Seçin
Aşağıdaki capabilities'leri seçin (ihtiyacınıza göre):
- ✅ **Push Notifications** (expo-notifications için)
- ✅ **Sign in with Apple** (expo-apple-authentication için)
- ✅ **Associated Domains** (deep linking için, opsiyonel)

### Adım 5: Register
- **Continue** → **Register** → **Done**

---

## 🔄 Alternatif: Farklı Bundle Identifier

Eğer `com.someplanets.monzieai` kullanılamıyorsa, farklı bir bundle identifier kullanabilirsiniz:

### Örnekler:
- `com.someplanets.monzieai.app`
- `com.someplanets.monzieai.ios`
- `com.someplanets.monzieai.mobile`

### Değiştirme:
```bash
# app.json dosyasında bundleIdentifier'ı güncelleyin
# Sonra tekrar build deneyin
```

---

## 🚀 Build Tekrar Deneme

App ID oluşturduktan sonra:

```bash
eas build --platform ios
```

---

## 📝 Notlar

- App ID oluşturma **ücretsizdir** (Apple Developer Program üyeliği gerektirmez)
- App ID oluşturulduktan sonra hemen kullanılabilir
- Bundle identifier **değiştirilemez**, sadece yeni oluşturulabilir
- Team: **Some Planets LLC (XM8HSLMRQV)**

---

## ✅ Kontrol

App ID oluşturulduktan sonra:
1. Apple Developer Console'da görünüyor mu?
2. Bundle identifier doğru mu? (`com.someplanets.monzieai`)
3. Capabilities doğru mu?

Sonra tekrar build deneyin!

