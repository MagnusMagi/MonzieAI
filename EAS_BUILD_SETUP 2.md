# 🔨 EAS Build Setup

## ⚠️ Durum

EAS build başlatmak için **credentials setup** gerekiyor. Bu işlem **interaktif mod** gerektiriyor (terminal'den manuel çalıştırılmalı).

## 🚀 Build Başlatma

### Android Build

```bash
eas build --platform android
```

Bu komut:
1. Platform seçimi soracak (Android seçin)
2. Build profile seçimi soracak (preview veya production)
3. Android keystore oluşturma/yönetme seçenekleri sunacak

### iOS Build

```bash
eas build --platform ios
```

Bu komut:
1. Platform seçimi soracak (iOS seçin)
2. Build profile seçimi soracak
3. iOS credentials setup seçenekleri sunacak

### Her İki Platform

```bash
eas build --platform all
```

## 📋 Build Profilleri

`eas.json` dosyasında tanımlı profiller:

1. **development** - Development client build
   - Android: Internal distribution
   - iOS: Simulator build

2. **preview** - Preview build (test için)
   - Internal distribution
   - Store'a gönderilmez

3. **production** - Production build
   - Store'a gönderilebilir
   - Release build

## 🔑 Credentials Yönetimi

### Mevcut Credentials'ları Görüntüleme

```bash
# Android
eas credentials

# iOS
eas credentials
```

### Credentials'ları Manuel Yönetme

```bash
# Android keystore oluşturma
eas credentials

# iOS certificates ve provisioning profiles
eas credentials
```

## 💡 Öneriler

1. **İlk Build:** `preview` profile ile başlayın
2. **Android:** Keystore otomatik oluşturulabilir
3. **iOS:** Apple Developer hesabı gerekiyor
4. **Non-interactive:** Credentials setup sonrası kullanılabilir

## 📝 Notlar

- Keystore oluşturma non-interactive modda desteklenmiyor
- İlk build için interaktif mod gerekli
- Sonraki build'ler için `--non-interactive` kullanılabilir

