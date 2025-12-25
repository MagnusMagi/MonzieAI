# 🎨 MonzieAI - AI-Powered Image Generation Platform

<div align="center">

**Transform your photos into stunning AI-generated portraits with cutting-edge technology**

[![React Native](https://img.shields.io/badge/React%20Native-0.83.0-61DAFB?logo=react)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Expo](https://img.shields.io/badge/Expo-54.0-000020?logo=expo)](https://expo.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase)](https://supabase.com/)

[Features](#-features) • [Architecture](#-architecture) • [Tech Stack](#-tech-stack) • [Demo](#-demo)

</div>

---

## 📱 Overview

**MonzieAI** is a modern, production-ready mobile application that leverages artificial intelligence to transform user photos into professional-quality portraits. Built with React Native and Expo, the app combines advanced AI image generation capabilities with a seamless user experience, real-time features, and robust subscription management.

### Key Highlights

- ✨ **AI-Powered Generation** - Transform photos using state-of-the-art AI models
- 🎨 **Scene Library** - Choose from curated AI scenes and styles
- ⚡ **Real-Time Updates** - Live synchronization across devices
- 🔍 **Smart Search** - Full-text search with typo tolerance
- 💎 **Premium Features** - Subscription-based monetization
- 🏗️ **Clean Architecture** - Maintainable, scalable codebase
- 📊 **Production Ready** - 70%+ test coverage, comprehensive monitoring

---

## ✨ Features

### 🎯 Core Functionality

#### AI Image Generation

- **Scene-Based Generation** - Select from a library of AI scenes (portrait, fantasy, professional, etc.)
- **Custom Prompts** - Generate images with custom AI prompts
- **Gender Selection** - Personalized generation based on user preferences
- **High-Quality Output** - Professional-grade image generation using Fal AI

#### Image Enhancement

- **Crystal Upscaler** - Upscale and enhance generated images
- **Image Optimization** - Automatic compression and optimization pipeline
- **CDN Delivery** - Fast image loading via Supabase Storage CDN

#### User Experience

- **Gallery View** - Browse all generated images in a beautiful grid layout
- **Favorites System** - Save and organize favorite images
- **Real-Time Updates** - Live synchronization of likes, views, and new images
- **Full-Text Search** - Intelligent search with PostgreSQL trigram similarity
- **User Profiles** - Manage profile and view generation history

### 🔐 Authentication & Security

- **Multi-Provider Auth** - Email, Google Sign-In, and Apple Sign-In
- **Secure Storage** - API keys managed via EAS Secrets
- **Privacy Compliant** - Proper permission handling and usage descriptions
- **RLS Policies** - Row-Level Security for data protection

### 💰 Monetization

- **Subscription Management** - RevenueCat integration for iOS/Android
- **Premium Features** - Monthly and yearly subscription plans
- **Paywall UI** - Native subscription purchase flows
- **Restore Purchases** - Seamless subscription restoration

### ⚡ Performance & Quality

- **Image Optimization** - 40-60% file size reduction
- **CDN Delivery** - 30-50% faster image loading
- **Real-Time Subscriptions** - <100ms UI update latency
- **Smart Caching** - React Query for efficient data management
- **Bundle Optimization** - Code splitting and tree shaking

---

## 🏗️ Architecture

MonzieAI follows **Clean Architecture** principles with **MVVM (Model-View-ViewModel)** pattern, ensuring maintainability, testability, and scalability.

### Architecture Layers

```text
┌─────────────────────────────────────────┐
│     PRESENTATION LAYER                  │
│  (Screens, ViewModels, Hooks)          │
├─────────────────────────────────────────┤
│     DOMAIN LAYER                        │
│  (Entities, Use Cases, Repository IF)  │
├─────────────────────────────────────────┤
│     DATA LAYER                          │
│  (Repository Impl, Data Sources)       │
├─────────────────────────────────────────┤
│     INFRASTRUCTURE LAYER                 │
│  (Services, DI Container, Config)      │
└─────────────────────────────────────────┘
```

### Key Design Patterns

- **Clean Architecture** - Separation of concerns across layers
- **MVVM Pattern** - ViewModels for business logic separation
- **Repository Pattern** - Abstracted data access layer
- **Dependency Injection** - Loose coupling and testability
- **Use Cases** - Single responsibility business logic

### Project Structure

```text
src/
├── domain/          # Business logic (Entities, Use Cases, Repository Interfaces)
├── data/            # Data layer (Repository Implementations)
├── presentation/    # UI layer (Screens, ViewModels, Hooks)
├── infrastructure/  # External services (DI Container, Services)
├── config/          # Configuration (Supabase client)
├── utils/           # Utilities (Logger, Error messages, Image optimization)
└── theme/           # Design system (Colors, Typography, Spacing)
```

---

## 🛠️ Tech Stack

### Frontend & Mobile

| Technology | Version | Purpose |
|------------|---------|---------|
| **React Native** | 0.83.0 | Mobile framework |
| **Expo** | ~54.0.27 | Development platform |
| **TypeScript** | 5.9 | Type safety |
| **React Navigation** | 7.x | Navigation |
| **React Query** | 5.x | State management & caching |

### Backend & Services

| Service | Purpose |
|---------|---------|
| **Supabase** | Backend-as-a-Service (Auth, Database, Storage) |
| **Fal AI** | AI image generation service |
| **RevenueCat** | Subscription management |
| **PostgreSQL** | Database with full-text search |

### Development Tools

- **Jest 30** - Unit testing
- **Maestro** - E2E testing
- **ESLint 9** - Code linting
- **TypeScript ESLint 8** - TypeScript linting
- **EAS Build** - Cloud builds
- **Prettier** - Code formatting

### Key Libraries

- `@tanstack/react-query` - Server state management
- `@supabase/supabase-js` - Supabase client
- `react-native-purchases` - RevenueCat SDK
- `expo-image` - Optimized image component
- `lottie-react-native` - Animations
- `expo-blur` - Blur effects

---

## 📊 Technical Metrics

### Code Quality

- **Test Coverage:** ~70% (targeting 80%+)
- **Health Score:** 82/100
- **Linter:** ESLint 9 + TypeScript ESLint 8
- **Type Safety:** Full TypeScript coverage

### Performance

- **Image Optimization:** 40-60% file size reduction
- **CDN Delivery:** 30-50% faster loading
- **Real-Time Latency:** <100ms UI updates
- **Search Performance:** <200ms query time

### Architecture Quality

- ✅ Clean Architecture implementation
- ✅ MVVM pattern throughout
- ✅ Dependency Injection
- ✅ Repository pattern
- ✅ Use Cases for business logic

---

## 🚀 Key Features in Detail

### 1. AI Image Generation Pipeline

```typescript
// Scene-based generation with custom prompts
const result = await generateImageUseCase.execute({
  sceneId: 'portrait-001',
  gender: 'male',
  imageUri: 'file://...',
  userId: currentUser.id
});
```

**Capabilities:**

- Scene library with pre-configured prompts
- Custom prompt support
- Gender-aware generation
- Progress tracking
- Error handling with retry logic

### 2. Real-Time Subscriptions

```typescript
// Live updates for images
const { image, isSubscribed } = useRealtimeImage(imageId);
// Automatically updates on like/view changes
```

**Features:**

- Real-time database subscriptions
- Multi-device synchronization
- Automatic UI updates
- Efficient subscription management

### 3. Full-Text Search

```typescript
// Typo-tolerant search with PostgreSQL
const results = await imageRepository.fullTextSearch('portrait', 20);
```

**Capabilities:**

- PostgreSQL trigram similarity
- Typo tolerance
- Relevance-based sorting
- Fast query performance (<200ms)

### 4. Image Optimization Pipeline

```typescript
// Automatic optimization on upload
await storageService.uploadImage({
  imageUri: 'file://...',
  bucket: 'generated-images',
  optimize: true, // 40-60% size reduction
});
```

**Benefits:**

- Automatic compression
- Size optimization
- CDN delivery
- Bandwidth savings

---

## 📱 Platform Support

### iOS

- ✅ Native iOS app
- ✅ App Store ready
- ✅ TestFlight distribution
- ✅ Apple Sign-In integration
- ✅ RevenueCat subscriptions

### Android

- ✅ Native Android app
- ✅ Google Play ready
- ✅ Google Sign-In integration
- ✅ RevenueCat subscriptions

### Web (Future)

- 🔄 Web version planned
- 🔄 Progressive Web App support

---

## 🔒 Security & Privacy

### Security Measures

- ✅ **API Keys** - Managed via EAS Secrets (never in code)
- ✅ **Authentication** - Secure multi-provider auth
- ✅ **Data Protection** - Row-Level Security (RLS) policies
- ✅ **Storage Security** - Authenticated uploads only
- ✅ **HTTPS** - All API communications encrypted

### Privacy Compliance

- ✅ **Permission Handling** - Proper usage descriptions
- ✅ **User Data** - Secure storage and transmission
- ✅ **Tracking** - ATT framework compliance
- ✅ **Privacy Manifest** - Apple compliance ready

---

## 📈 Project Status

### ✅ Completed Features

- [x] Clean Architecture + MVVM implementation
- [x] AI image generation with Fal AI
- [x] Scene library and selection
- [x] Image enhancement (upscaling)
- [x] User authentication (Email, Google, Apple)
- [x] Gallery and favorites
- [x] Real-time subscriptions
- [x] Full-text search
- [x] Subscription management (RevenueCat)
- [x] Image optimization pipeline
- [x] Supabase Storage integration
- [x] Test coverage (~70%)
- [x] E2E tests (Maestro)
- [x] Performance monitoring
- [x] Analytics integration
- [x] Comprehensive documentation

### 🔄 In Progress

- [ ] Test coverage increase to 80%+
- [ ] CI/CD pipeline setup
- [ ] Error tracking (Sentry)

### 📋 Planned

- [ ] Dark mode support
- [ ] Internationalization (i18n)
- [ ] Web version
- [ ] Advanced analytics dashboard

---

## 🎯 Use Cases

### For Users

- **Professional Portraits** - Generate professional headshots
- **Creative Projects** - Create unique AI-generated images
- **Social Media** - Share stunning AI-generated content
- **Personal Branding** - Create consistent visual identity

### For Developers

- **Learning** - Study Clean Architecture + MVVM patterns
- **Reference** - Production-ready React Native codebase
- **Integration** - Example Supabase + RevenueCat setup
- **Best Practices** - TypeScript, testing, and documentation examples

---

## 📚 Documentation

Comprehensive documentation is available in the repository:

- [Architecture Guide](./ARCHITECTURE.md) - Detailed architecture documentation
- [Performance Audit](./PERFORMANCE_AUDIT.md) - Performance analysis
- [Test Coverage Report](./TEST_COVERAGE_REPORT.md) - Testing details
- [Security Setup](./README_SECURITY.md) - Security best practices
- [EAS Build Guide](./EAS_BUILD_GUIDE.md) - Build configuration
- [Analytics Guide](./ANALYTICS_GUIDE.md) - Analytics integration

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. Follow Clean Architecture + MVVM patterns
2. Write tests for new features
3. Update documentation
4. Follow TypeScript best practices
5. Never commit API keys or secrets

---

## 📄 License

[Add your license here]

---

## 📞 Contact & Support

For questions, issues, or feature requests:

- **GitHub Issues** - Open an issue in the repository
- **Documentation** - Check the docs folder for detailed guides

---

## 🌟 Acknowledgments

Built with:

- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [Supabase](https://supabase.com/)
- [Fal AI](https://fal.ai/)
- [RevenueCat](https://www.revenuecat.com/)

---

<div align="center">

**Made with ❤️ using React Native and Expo**

[⬆ Back to Top](#-monzieai---ai-powered-image-generation-platform)

</div>


