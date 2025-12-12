# 🚀 EAS ile TestFlight'a Yükleme Kılavuzu

## ✅ Evet, EAS ile TestFlight'a yükleyebilirsiniz!

EAS iki adımlı bir süreç kullanır:
1. **Build:** iOS uygulamasını build edin
2. **Submit:** Build'i TestFlight'a yükleyin

## 📋 Önkoşullar

### 1. Apple Developer Hesabı
- ✅ Apple Developer Program üyeliği gerekli
- ✅ Team: **Some Planets LLC (XM8HSLMRQV)**
- ✅ App ID oluşturulmuş olmalı (`com.someplanets.monzieaiv2`)

### 2. App Store Connect
- App Store Connect'te uygulama oluşturulmuş olmalı
- Bundle ID: `com.someplanets.monzieaiv2`

## 🚀 Adım Adım Süreç

### Adım 1: iOS Build Yap

```bash
eas build --platform ios --profile production
```

**Not:** `--profile production` kullanın (preview değil).

### Adım 2: Build Tamamlandıktan Sonra Submit Et

Build tamamlandıktan sonra (EAS size bildirim gönderir):

```bash
eas submit --platform ios --latest
```

**Veya belirli bir build ID ile:**

```bash
eas submit --platform ios --id <build-id>
```

## 🔧 Otomatik Submit (Önerilen)

Build ve submit'i tek seferde yapmak için `eas.json`'u güncelleyebilirsiniz:

```json
{
  "build": {
    "production": {
      "autoIncrement": true,
      "ios": {
        "simulator": false
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "ascAppId": "YOUR_APP_STORE_CONNECT_APP_ID"
      }
    }
  }
}
```

Sonra:

```bash
eas build --platform ios --profile production --auto-submit
```

## 📝 App Store Connect App ID Bulma

1. **App Store Connect**'e gidin: https://appstoreconnect.apple.com
2. **My Apps** → Uygulamanızı seçin
3. **App Information** → **General Information**
4. **Apple ID** değerini kopyalayın (örnek: `1234567890`)

## ⚙️ eas.json Konfigürasyonu

Mevcut `eas.json`:

```json
{
  "submit": {
    "production": {}
  }
}
```

App Store Connect App ID eklemek için:

```json
{
  "submit": {
    "production": {
      "ios": {
        "ascAppId": "YOUR_APP_STORE_CONNECT_APP_ID"
      }
    }
  }
}
```

## 🔐 Kimlik Doğrulama

EAS submit için Apple kimlik doğrulaması gerekiyor:

### Yöntem 1: App Store Connect API Key (Önerilen)

1. **App Store Connect** → **Users and Access** → **Keys**
2. **App Store Connect API** → **Generate API Key**
3. Key'i indirin (`.p8` dosyası)
4. Key ID ve Issuer ID'yi not edin

Sonra EAS'a ekleyin:

```bash
eas credentials
```

Veya manuel olarak:

```bash
eas secret:create --scope project --name APP_STORE_CONNECT_API_KEY_ID --value "YOUR_KEY_ID"
eas secret:create --scope project --name APP_STORE_CONNECT_ISSUER_ID --value "YOUR_ISSUER_ID"
```

### Yöntem 2: Apple ID ile Giriş (Daha Kolay)

EAS otomatik olarak Apple ID ile giriş yapmanızı isteyecek:

```bash
eas submit --platform ios
```

## 📊 Build ve Submit Durumu

### Build Listesi

```bash
eas build:list --platform ios
```

### Submit Durumu

```bash
eas submit:list --platform ios
```

## 🎯 Hızlı Başlangıç

### İlk Kez TestFlight'a Yükleme

1. **Build yap:**
   ```bash
   eas build --platform ios --profile production
   ```

2. **Build tamamlanınca submit et:**
   ```bash
   eas submit --platform ios --latest
   ```

3. **Apple ID ile giriş yap** (ilk seferde)

4. **TestFlight'ta kontrol et:**
   - App Store Connect → TestFlight
   - Build'in yüklendiğini görün

### Sonraki Yüklemeler

```bash
# Build ve submit tek seferde
eas build --platform ios --profile production --auto-submit
```

## ⚠️ Önemli Notlar

1. **Build Number:** Her build için otomatik artırılır (`autoIncrement: true`)
2. **Version:** `app.json`'daki `version` kullanılır
3. **Processing Time:** TestFlight'a yükleme 10-30 dakika sürebilir
4. **Beta Review:** İlk yüklemede Apple review yapabilir (1-2 gün)

## 🔍 Sorun Giderme

### "App not found in App Store Connect"

- App Store Connect'te uygulama oluşturulmuş olmalı
- Bundle ID eşleşmeli (`com.someplanets.monzieaiv2`)

### "Authentication failed"

- App Store Connect API Key doğru mu?
- Veya Apple ID ile tekrar giriş yapın

### "Build not found"

- Build ID'yi kontrol edin: `eas build:list`
- `--latest` flag'i kullanın

## ✅ Checklist

- [ ] Apple Developer Program üyeliği var
- [ ] App ID oluşturuldu (`com.someplanets.monzieaiv2`)
- [ ] App Store Connect'te uygulama oluşturuldu
- [ ] iOS build yapıldı (`eas build --platform ios`)
- [ ] Build başarılı
- [ ] Submit yapıldı (`eas submit --platform ios --latest`)

## 🚀 Hemen Başlayın

```bash
# 1. Build yap
eas build --platform ios --profile production

# 2. Build tamamlanınca (EAS bildirim gönderir)
eas submit --platform ios --latest
```

Detaylar için: https://docs.expo.dev/submit/introduction/

