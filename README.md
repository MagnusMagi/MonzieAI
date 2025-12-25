# MonzieAI - AI-Powered Photo Transformation App

<div align="center">

![MonzieAI Logo](./assets/icon.png)

**Transform Your Photos with AI Magic ✨**

[![Platform](https://img.shields.io/badge/Platform-iOS-blue.svg)](https://apps.apple.com)
[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-54.0.30-black.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-Private-red.svg)]()

[Features](#-features) •
[Tech Stack](#-tech-stack) •
[Getting Started](#-getting-started) •
[Documentation](#-documentation) •
[Contributing](#-contributing) •
[📚 Docs Site](https://magnusmagi.github.io/monzieai/)

</div>

---

## 📱 About

MonzieAI is a powerful mobile application that transforms your ordinary photos into extraordinary AI-generated images. With 100+ professional scenes and styles, create stunning portraits, creative art, and professional photos in seconds.

### 🎯 Key Highlights

- 🎨 **100+ AI Scenes** - Professional portraits, outdoor, business, creative styles
- ⚡ **Fast Generation** - 30-60 seconds per image
- 🎭 **High Quality** - 1024x1024 resolution, photorealistic results
- 💎 **Premium Features** - Unlimited generations, exclusive scenes
- 🔐 **Secure & Private** - Your data is safe and encrypted
- 📱 **Cross-Platform** - iOS (live), Android (coming soon)

## ✨ Features

### For Everyone (Free)
- 10 image generations per day
- Access to 50+ basic scenes
- Gallery and favorites
- Social media sharing
- Cloud storage (30 days)

### Premium Subscription
- ♾️ Unlimited generations
- 🎭 100+ premium scenes
- 🚫 No ads

---

## 📚 Documentation

**🌐 Full Documentation Site**: [https://magnusmagi.github.io/monzieai/](https://magnusmagi.github.io/monzieai/)

Our comprehensive documentation is now available as a beautiful, searchable website powered by Docusaurus!

### Quick Links
- 🚀 [Setup Guide](https://magnusmagi.github.io/monzieai/docs/setup) - Get started in minutes
- 🏗️ [Architecture](https://magnusmagi.github.io/monzieai/docs/architecture) - System design & patterns
- 🔌 [API Reference](https://magnusmagi.github.io/monzieai/docs/api) - Complete API docs
- 🧪 [Testing](https://magnusmagi.github.io/monzieai/docs/testing) - Testing strategies
- 🐛 [Troubleshooting](https://magnusmagi.github.io/monzieai/docs/troubleshooting) - Common issues

### Local Documentation
You can also browse documentation locally in the [`docs/`](./docs) folder or run the docs website locally:

```bash
cd website
npm install
npm start
```
- ⚡ Priority processing
- 💾 Unlimited cloud backup
- 🎨 HD downloads
- 🆕 Early access to new features

## 🛠 Tech Stack

### Frontend & Mobile
- **React Native** 0.81.5 - Cross-platform mobile framework
- **Expo** 54.0.30 - Development and build platform
- **TypeScript** 5.9.2 - Type-safe development
- **React Navigation** 7.x - Navigation library
- **React Query** - Server state management
- **Lottie** - Smooth animations

### Backend & Services
- **Supabase** - Backend as a Service
  - PostgreSQL Database
  - Authentication (Google, Apple, Email)
  - Storage
  - Realtime subscriptions
- **FAL.AI** - AI image generation (Flux Pro model)
- **RevenueCat** - Subscription management
- **Sentry** - Error tracking (optional)

### DevOps & Tools
- **EAS Build** - Cloud build service
- **Jest** - Unit testing
- **Maestro** - E2E testing
- **ESLint + Prettier** - Code quality
- **TypeScript** - Type safety

## 🚀 Getting Started

### Prerequisites

- Node.js 20.18.0 (LTS)
- npm or yarn
- Xcode 15+ (for iOS)
- Android Studio (for Android)
- Expo CLI
- EAS CLI

### Quick Start

```bash
# Clone the repository
git clone https://github.com/yourorg/monzieai.git
cd monzieai

# Install dependencies
npm install

# Install iOS pods (macOS only)
cd ios && pod install && cd ..

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

### Environment Variables

Create a `.env` file in the root directory:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
FAL_API_KEY=your_fal_api_key
GOOGLE_WEB_CLIENT_ID=your_google_client_id
REVENUECAT_API_KEY_IOS=your_revenuecat_key
```

## 📁 Project Structure

```
monzieai/
├── src/
│   ├── components/       # Reusable UI components
│   ├── screens/          # Screen components
│   ├── navigation/       # Navigation configuration
│   ├── services/         # API and business logic
│   ├── contexts/         # React Context providers
│   ├── hooks/            # Custom React hooks
│   ├── types/            # TypeScript type definitions
│   ├── theme/            # Colors, typography, styles
│   └── utils/            # Utility functions
├── assets/               # Images, fonts, icons
├── docs/                 # Documentation
├── ios/                  # iOS native code
├── android/              # Android native code
├── App.tsx               # Root component
└── index.ts              # Entry point
```

## 📚 Documentation

Comprehensive documentation is available in the `/docs` directory:

- **[📖 Documentation Index](./docs/INDEX.md)** - Start here!
- **[🏗️ Architecture](./docs/ARCHITECTURE.md)** - System design and patterns
- **[🔌 API Reference](./docs/API.md)** - All API endpoints and services
- **[🗄️ Database](./docs/DATABASE.md)** - Database schema and queries
- **[⚙️ Setup Guide](./docs/SETUP.md)** - Detailed installation instructions
- **[🚀 Deployment](./docs/DEPLOYMENT.md)** - Build and release process
- **[✨ Features](./docs/FEATURES.md)** - Complete feature documentation

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 📦 Building

### Development Build

```bash
# iOS
eas build --profile development --platform ios

# Android
eas build --profile development --platform android
```

### Production Build

```bash
# iOS (App Store)
eas build --profile production --platform ios

# Android (Play Store)
eas build --profile production --platform android
```

## 🚢 Deployment

### iOS (App Store)

```bash
# Build and submit
eas build --profile production --platform ios --auto-submit

# Or submit manually
eas submit --platform ios --latest
```

### Android (Play Store)

```bash
# Build and submit
eas build --profile production --platform android --auto-submit

# Or submit manually
eas submit --platform android --latest
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow the ESLint configuration
- Use Prettier for formatting
- Write meaningful commit messages
- Add tests for new features
- Update documentation

## 📝 Scripts

```bash
# Development
npm start                 # Start Expo dev server
npm run ios              # Run on iOS simulator
npm run android          # Run on Android emulator

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run format           # Format code with Prettier
npm run format:check     # Check formatting

# Testing
npm test                 # Run tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
npm run test:e2e         # E2E tests

# Build
npm run build:android    # Build Android APK
npm run build:ios        # Build iOS archive
```

## 🔐 Security

- All API keys are stored in environment variables
- Sensitive data is encrypted
- HTTPS only communication
- Row Level Security on database
- Regular security audits

## 📊 Performance

- 60 FPS animations
- Optimized image loading
- Efficient caching strategy
- Lazy loading components
- Bundle size optimization

## 🌍 Internationalization

Currently supported languages:
- English (default)
- Turkish

More languages coming soon!

## 📱 Platform Support

| Platform | Status | Version |
|----------|--------|---------|
| iOS | ✅ Live | 1.0.0 |
| Android | 🚧 Coming Soon | - |
| Web | ❌ Not Planned | - |

## 📈 Roadmap

### Q1 2025
- [ ] Android release
- [ ] Batch generation
- [ ] Advanced editing tools
- [ ] Social features

### Q2 2025
- [ ] Video generation
- [ ] Custom AI models
- [ ] API access
- [ ] Enterprise features

### Future
- [ ] AR integration
- [ ] Voice control
- [ ] Marketplace

## 📄 License

This project is private and proprietary. All rights reserved.

## 👥 Team

**Organization**: Some Planets
**Owner**: magnus.magi
**Contact**: support@monzieai.com

## 🙏 Acknowledgments

- [Expo](https://expo.dev) - Amazing development platform
- [Supabase](https://supabase.com) - Excellent backend service
- [FAL.AI](https://fal.ai) - Powerful AI models
- [RevenueCat](https://revenuecat.com) - Subscription management
- React Native community

## 📞 Support

- 📧 Email: support@monzieai.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourorg/monzieai/issues)
- 📖 Docs: [Documentation](./docs/INDEX.md)

## 🌟 Star History

If you like this project, please give it a star! ⭐

---

<div align="center">

**Made with ❤️ by Some Planets**

[Website](https://monzieai.com) • [Privacy Policy](https://monzieai.com/privacy) • [Terms of Service](https://monzieai.com/terms)

</div>