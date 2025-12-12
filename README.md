# 🎨 MonzieAI

AI-powered image generation mobile application built with React Native and Expo.

## 📱 Features

- **AI Image Generation** - Transform your photos with AI-powered scene generation
- **Image Enhancement** - Upscale and enhance images using Crystal Upscaler
- **Scene Library** - Browse and select from various AI scenes
- **User Profiles** - Manage your profile and generated images
- **Favorites** - Save your favorite generated images
- **Gallery** - View all your generated images
- **Subscriptions** - Premium features with monthly/yearly plans

## 🏗️ Architecture

This project follows **Clean Architecture** principles with **MVVM (Model-View-ViewModel)** pattern:

```
┌─────────────────────────────────────────┐
│     PRESENTATION LAYER                  │
│  (Screens, ViewModels, Hooks)           │
├─────────────────────────────────────────┤
│     DOMAIN LAYER                        │
│  (Entities, Use Cases, Repository IF)   │
├─────────────────────────────────────────┤
│     DATA LAYER                          │
│  (Repository Impl, Data Sources)        │
├─────────────────────────────────────────┤
│     INFRASTRUCTURE LAYER                 │
│  (Services, DI Container, Config)       │
└─────────────────────────────────────────┘
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development) or Android Emulator
- Xcode (for iOS builds)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd monzieai

# Install dependencies
npm install

# Start Expo development server
npm start
```

### Configuration

**⚠️ IMPORTANT:** Before running the app, you need to configure API keys.

See [README_SECURITY.md](./README_SECURITY.md) for quick setup instructions.

**For Local Development:**
1. Add your API keys to `app.json` temporarily (see `README_SECURITY.md`)
2. **Never commit** `app.json` with real values!

**For Production:**
1. Set up EAS Environment Variables (see [EAS_MANUAL_SETUP.md](./EAS_MANUAL_SETUP.md))
2. Build with `eas build --platform ios --profile production`

### Running the App

```bash
# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web
npm run web
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

**Current Test Coverage:** ~70%  
See [TEST_COVERAGE_REPORT.md](./TEST_COVERAGE_REPORT.md) for details.

## 📦 Building

### iOS

```bash
# Using EAS Build (Recommended)
eas build --platform ios --profile production

# Or using Xcode
npm run build:ios
```

### Android

```bash
# Using EAS Build (Recommended)
eas build --platform android --profile production

# Or using Gradle
npm run build:android
```

## 🔐 Security

**API Keys Management:**
- ✅ EAS Secrets configuration ready
- ✅ `.gitignore` configured
- ⚠️ **IMPORTANT:** Never commit `app.json` with real API keys!

See [ENV_SETUP.md](./ENV_SETUP.md) for complete security documentation.

## 📚 Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture overview
- [PERFORMANCE_AUDIT.md](./PERFORMANCE_AUDIT.md) - Performance analysis
- [ENV_SETUP.md](./ENV_SETUP.md) - Environment variables setup
- [TEST_COVERAGE_REPORT.md](./TEST_COVERAGE_REPORT.md) - Test coverage details
- [LOGGING.md](./LOGGING.md) - Logging system documentation
- [README_SECURITY.md](./README_SECURITY.md) - Security quick start
- [DYNAMIC_TYPE_GUIDE.md](./DYNAMIC_TYPE_GUIDE.md) - Dynamic Type support guide
- [PERFORMANCE_MONITORING.md](./PERFORMANCE_MONITORING.md) - Performance monitoring guide
- [ANALYTICS_GUIDE.md](./ANALYTICS_GUIDE.md) - Analytics tracking guide
- [MAESTRO_E2E_TESTS.md](./MAESTRO_E2E_TESTS.md) - E2E testing with Maestro

## 🛠️ Tech Stack

- **Framework:** React Native 0.83.0
- **Expo:** ~54.0.27
- **Language:** TypeScript 5.9
- **State Management:** React Query (@tanstack/react-query)
- **Navigation:** React Navigation 7
- **Backend:** Supabase
- **AI Service:** Fal AI
- **Authentication:** Supabase Auth (Email, Google, Apple)
- **Testing:** Jest 30, Maestro (E2E)
- **Linting:** ESLint 9, TypeScript ESLint 8

## 📁 Project Structure

```
src/
├── domain/          # Business logic (Entities, Use Cases, Repository Interfaces)
├── data/            # Data layer (Repository Implementations)
├── presentation/   # UI layer (Screens, ViewModels, Hooks)
├── infrastructure/  # External services (DI Container, Services)
├── config/          # Configuration (Supabase client)
├── utils/           # Utilities (Logger, Error messages, Image optimization)
└── theme/           # Design system (Colors, Typography, Spacing)
```

## 🎯 Current Status

**Version:** 1.0.0  
**Status:** Development  
**Health Score:** 82/100

### ✅ Completed
- Clean Architecture implementation
- MVVM pattern
- Core features (Image generation, Enhancement, Gallery)
- User authentication
- Subscription management
- Test coverage (~70%)
- ESLint v9 + TypeScript ESLint v8
- Jest v30
- React Native 0.83.0
- E2E tests (Maestro)
- Dynamic Type support
- Bundle size monitoring
- Performance monitoring
- Analytics service
- Comprehensive documentation

### 🔄 In Progress
- Test coverage increase to 80%+ (see [TEST_COVERAGE_PLAN.md](./TEST_COVERAGE_PLAN.md))

### 📋 Planned
- CI/CD pipeline
- Error tracking (Sentry)
- Dark mode support
- Internationalization

## 🐛 Known Issues

- Some screens don't use ViewModels yet (see [PROJECT_AUDIT_REPORT.md](./PROJECT_AUDIT_REPORT.md))
- EAS Environment Variables need to be created manually
- Bundle size not measured yet

## 🤝 Contributing

1. Follow the architecture patterns (Clean Architecture + MVVM)
2. Write tests for new features
3. Update documentation
4. Follow TypeScript best practices
5. Never commit API keys or secrets

## 📄 License

[Add your license here]

## 📞 Support

For issues and questions, please open an issue in the repository.

---

**Last Updated:** 2025-01-27

