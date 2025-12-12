# 🚀 EAS Build Kılavuzu

## ⚠️ Önemli Not

EAS build **interaktif mod** gerektirir çünkü:
- Android keystore oluşturma/güncelleme için onay gerekiyor
- iOS credentials yönetimi için onay gerekiyor

## 📝 Yapılan Güncellemeler

### eas.json
- `cli.appVersionSource: "remote"` eklendi (uyarıyı kaldırmak için)

## 🚀 Build Komutları

### iOS Build
```bash
eas build --platform ios
```

**Önkoşul:**
- Apple Developer Console'da `com.someplanets.monzieai` App ID oluşturulmalı
- Detaylar için: `APPLE_DEVELOPER_SETUP.md`

### Android Build
```bash
eas build --platform android
```

**İlk Build:**
- EAS otomatik olarak keystore oluşturacak
- Interaktif modda "Generate a new Android Keystore?" sorusuna "Yes" yanıtı verin

### Her İki Platform
```bash
eas build --platform all
```

## 🔧 Credentials Yönetimi

### Mevcut Credentials Görüntüleme
```bash
# iOS
eas credentials

# Android
eas credentials
```

### Credentials Oluşturma/Güncelleme
```bash
# iOS
eas credentials -p ios

# Android
eas credentials -p android
```

## 📊 Build Durumu

Build başladıktan sonra:
```bash
eas build:list
```

## 🔍 Sorun Giderme

### "Input is required, but stdin is not readable"
- **Çözüm:** Komutu terminal'de manuel olarak çalıştırın (interaktif mod için)

### "The bundle identifier is not available"
- **Çözüm:** Apple Developer Console'da App ID oluşturun
- Detaylar: `APPLE_DEVELOPER_SETUP.md`

### Android Keystore Sorunları
- İlk build'de EAS otomatik oluşturur
- Sonraki build'lerde mevcut keystore kullanılır

## ✅ Build Öncesi Kontrol Listesi

- [ ] `eas.json` güncel (appVersionSource eklendi)
- [ ] `app.json` güncel (bundle identifier doğru)
- [ ] Apple Developer App ID oluşturuldu (iOS için)
- [ ] EAS CLI güncel (`npm install -g eas-cli`)
- [ ] EAS hesabına giriş yapıldı (`eas login`)

## 📝 Notlar

- **Production Environment:** EAS otomatik olarak "production" environment kullanır
- **Environment Variables:** EAS Secrets ile yönetilir
- **Build Time:** İlk build ~15-20 dakika sürebilir
- **Subsequent Builds:** Daha hızlı (cache sayesinde)

