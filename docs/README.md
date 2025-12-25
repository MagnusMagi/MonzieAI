# MonzieAI - Proje Dokümantasyonu

## 📋 İçindekiler

1. [Proje Hakkında](#proje-hakkında)
2. [Teknoloji Stack](#teknoloji-stack)
3. [Proje Yapısı](#proje-yapısı)
4. [Kurulum](#kurulum)
5. [Geliştirme](#geliştirme)
6. [Deployment](#deployment)
7. [Dokümantasyon](#dokümantasyon)

## 🎯 Proje Hakkında

MonzieAI, kullanıcıların fotoğraflarını yapay zeka ile işleyerek farklı sahneler ve stiller oluşturmasını sağlayan bir mobil uygulamadır. Uygulama, React Native ve Expo kullanılarak geliştirilmiştir.

### Temel Özellikler

- 🎨 **AI Görsel Oluşturma**: FAL.AI API ile güçlendirilmiş görsel üretimi
- 📸 **Fotoğraf Yönetimi**: Galeri, favoriler ve geçmiş
- 🎭 **Sahne Seçimi**: 100+ farklı sahne ve stil seçeneği
- 👤 **Kullanıcı Profili**: Cinsiyet tabanlı kişiselleştirme
- 💎 **Premium Abonelik**: RevenueCat ile yönetilen abonelik sistemi
- 🔐 **Güvenli Kimlik Doğrulama**: Supabase Auth (Google, Apple, Email)
- ☁️ **Cloud Storage**: Supabase Storage ile güvenli dosya depolama
- 📊 **Analytics**: Kullanım istatistikleri ve analitik

### Platform Desteği

- ✅ iOS (Öncelikli)
- ⏳ Android (Gelecek)
- ❌ Web (Şu an desteklenmiyor)

## 🛠 Teknoloji Stack

### Frontend & Mobil

- **Framework**: React Native 0.81.5
- **Expo SDK**: 54.0.30
- **Navigation**: React Navigation 7.x
- **State Management**: React Context API + React Query
- **UI Components**: Custom Components + Expo Components
- **Animasyonlar**: Lottie React Native
- **Tip Güvenliği**: TypeScript 5.9.2

### Backend & Servisler

- **Backend as a Service**: Supabase
  - Authentication (Google, Apple, Email)
  - PostgreSQL Database
  - Storage
  - Realtime Subscriptions
- **AI Service**: FAL.AI (Flux Pro model)
- **Subscription Management**: RevenueCat
- **Analytics**: Custom Analytics Service
- **Error Tracking**: Sentry (opsiyonel)

### DevOps & Araçlar

- **Build System**: EAS Build (Expo Application Services)
- **CI/CD**: EAS Submit
- **Testing**: Jest + React Native Testing Library
- **E2E Testing**: Maestro
- **Code Quality**: ESLint + Prettier
- **Version Control**: Git

## 📁 Proje Yapısı

```
monzieai/
├── .expo/                      # Expo cache ve config
├── .maestro/                   # E2E test dosyaları
├── android/                    # Android native kod
├── ios/                        # iOS native kod
├── assets/                     # Statik dosyalar (icon, splash, vb)
├── docs/                       # Proje dokümantasyonu
│   ├── README.md              # Ana dokümantasyon (bu dosya)
│   ├── ARCHITECTURE.md        # Mimari dokümantasyon
│   ├── API.md                 # API dokümantasyonu
│   ├── SETUP.md               # Kurulum kılavuzu
│   ├── DEPLOYMENT.md          # Deployment kılavuzu
│   ├── FEATURES.md            # Özellik dokümantasyonu
│   └── TROUBLESHOOTING.md     # Sorun giderme
├── src/                       # Ana kaynak kod
│   ├── components/            # Yeniden kullanılabilir UI bileşenleri
│   ├── config/                # Konfigürasyon dosyaları
│   ├── contexts/              # React Context providers
│   ├── data/                  # Veri katmanı
│   │   └── repositories/      # Repository pattern
│   ├── domain/                # İş mantığı katmanı
│   ├── hooks/                 # Custom React hooks
│   ├── infrastructure/        # Altyapı katmanı
│   ├── navigation/            # Navigation yapılandırması
│   ├── presentation/          # Presentation katmanı
│   ├── screens/               # Ekran bileşenleri
│   ├── services/              # Servis katmanı
│   ├── theme/                 # Tema ve stil tanımları
│   ├── types/                 # TypeScript tip tanımları
│   └── utils/                 # Yardımcı fonksiyonlar
├── supabase/                  # Supabase ilgili dosyalar
├── App.tsx                    # Ana uygulama bileşeni
├── index.ts                   # Uygulama giriş noktası
├── app.json                   # Expo/React Native config
├── eas.json                   # EAS Build config
├── package.json               # NPM dependencies
├── tsconfig.json              # TypeScript config
├── babel.config.js            # Babel config
├── metro.config.js            # Metro bundler config
├── jest.config.js             # Jest test config
└── eslint.config.js           # ESLint config
```

## 🚀 Kurulum

Detaylı kurulum talimatları için [SETUP.md](./SETUP.md) dosyasına bakın.

### Hızlı Başlangıç

```bash
# 1. Repository'yi klonlayın
git clone <repository-url>
cd monzieai

# 2. Bağımlılıkları yükleyin
npm install

# 3. Environment variables'ları ayarlayın
cp .env.example .env
# .env dosyasını düzenleyin

# 4. iOS pods yükleyin (sadece macOS)
cd ios && pod install && cd ..

# 5. Development server'ı başlatın
npm start
```

## 💻 Geliştirme

### Geliştirme Ortamı

```bash
# Expo development server
npm start

# iOS simulator
npm run ios

# Android emulator
npm run android

# Metro bundler'ı temizle
npm start -- --clear
```

### Test

```bash
# Unit testleri çalıştır
npm test

# Test coverage
npm run test:coverage

# Test watch mode
npm run test:watch

# E2E testleri
npm run test:e2e
```

### Code Quality

```bash
# Lint kontrolü
npm run lint

# Lint düzeltme
npm run lint:fix

# Format kontrolü
npm run format:check

# Format düzeltme
npm run format
```

## 📦 Deployment

### EAS Build

```bash
# Development build
eas build --profile development --platform ios

# Preview build
eas build --profile preview --platform ios

# Production build
eas build --profile production --platform ios
```

### TestFlight Submit

```bash
# App Store'a submit
eas submit --platform ios --latest
```

Detaylı deployment bilgileri için [DEPLOYMENT.md](./DEPLOYMENT.md) dosyasına bakın.

## 📚 Dokümantasyon

### Detaylı Dokümantasyon

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Uygulama mimarisi ve tasarım desenleri
- **[API.md](./API.md)** - API endpoint'leri ve servis dokümantasyonu
- **[SETUP.md](./SETUP.md)** - Detaylı kurulum ve konfigürasyon
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Build ve deployment süreçleri
- **[FEATURES.md](./FEATURES.md)** - Özellik detayları ve kullanım
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Yaygın sorunlar ve çözümler
- **[DATABASE.md](./DATABASE.md)** - Veritabanı şeması ve yapısı
- **[SERVICES.md](./SERVICES.md)** - Servis katmanı dokümantasyonu
- **[COMPONENTS.md](./COMPONENTS.md)** - UI bileşenleri dokümantasyonu
- **[SCREENS.md](./SCREENS.md)** - Ekran detayları ve flow'lar

## 🔑 Önemli Bilgiler

### Environment Variables

Uygulama aşağıdaki environment variable'ları kullanır:

- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `FAL_API_KEY` - FAL.AI API key
- `GOOGLE_WEB_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_IOS_CLIENT_ID` - Google iOS client ID
- `REVENUECAT_API_KEY_IOS` - RevenueCat iOS API key
- `SENTRY_DSN` - Sentry DSN (opsiyonel)

### Bundle Identifiers

- **iOS**: `com.someplanets.monzieaiv2`
- **Android**: `com.someplanets.monzieai` (henüz aktif değil)

### App Store Info

- **App Store ID**: 6756293363
- **Team ID**: 56FF2L729K
- **EAS Project ID**: 48881a23-7bea-4810-836d-f6e57a63145f

## 👥 Takım

- **Owner**: magnus.magi
- **Organization**: Some Planets

## 📄 Lisans

Private - Tüm hakları saklıdır.

## 🆘 Destek

Sorun yaşıyorsanız:

1. [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) dosyasına bakın
2. GitHub Issues'da arama yapın
3. Yeni bir issue oluşturun

## 📝 Versiyon Geçmişi

- **v1.0.0** - İlk production release (iOS)
  - Temel AI görsel oluşturma
  - Kullanıcı kimlik doğrulama
  - Premium abonelik sistemi
  - Galeri ve favoriler
  - 100+ sahne desteği

---

**Son Güncelleme**: 2024
**Durum**: ✅ Production (iOS)