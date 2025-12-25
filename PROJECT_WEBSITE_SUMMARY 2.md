# 🎨 MonzieAI - AI-Powered Image Generation Platform

<div align="center">

**Transform your photos into stunning AI-generated portraits**

[![React Native](https://img.shields.io/badge/React%20Native-0.83.0-61DAFB?logo=react)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Expo](https://img.shields.io/badge/Expo-54.0-000020?logo=expo)](https://expo.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase)](https://supabase.com/)

</div>

---

## 📱 Overview

**MonzieAI** is a production-ready mobile application that transforms user photos into professional-quality portraits using artificial intelligence. Built with React Native and Expo, the app features real-time synchronization, intelligent search, and subscription-based monetization.

### Key Highlights

- ✨ **AI-Powered Generation** - Transform photos using advanced AI models
- 🎨 **Scene Library** - Choose from curated AI scenes and styles
- ⚡ **Real-Time Updates** - Live synchronization across devices
- 🔍 **Smart Search** - Full-text search with typo tolerance
- 💎 **Premium Features** - Subscription-based monetization
- 🏗️ **Clean Architecture** - Maintainable, scalable codebase

---

## ✨ Features

### Core Functionality

- **AI Image Generation** - Scene-based and custom prompt generation
- **Image Enhancement** - Upscale and optimize generated images
- **Gallery & Favorites** - Browse and organize generated images
- **Real-Time Sync** - Live updates across all devices
- **Full-Text Search** - Intelligent search with PostgreSQL
- **User Profiles** - Manage profile and generation history

### Authentication & Security

- Multi-provider authentication (Email, Google, Apple)
- Secure API key management via EAS Secrets
- Row-Level Security (RLS) policies
- Privacy-compliant permission handling

### Monetization

- RevenueCat integration for subscriptions
- Premium monthly and yearly plans
- Native paywall UI
- Restore purchases functionality

---

## 🏗️ Architecture

Built with **Clean Architecture** and **MVVM (Model-View-ViewModel)** pattern:

```
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

**Key Patterns:**
- Clean Architecture separation
- MVVM for business logic
- Repository pattern for data access
- Dependency Injection
- Use Cases for single responsibility

---

## 🛠️ Tech Stack

### Frontend
- **React Native** 0.83.0
- **Expo** ~54.0.27
- **TypeScript** 5.9
- **React Navigation** 7.x
- **React Query** 5.x

### Backend & Services
- **Supabase** - Backend (Auth, Database, Storage)
- **RevenueCat** - Subscription management
- **PostgreSQL** - Database with full-text search

### Development
- **Jest 30** - Unit testing
- **Maestro** - E2E testing
- **ESLint 9** - Code linting
- **EAS Build** - Cloud builds

---

## 📊 Technical Metrics

- **Test Coverage:** ~70% (targeting 80%+)
- **Health Score:** 82/100
- **Image Optimization:** 40-60% file size reduction
- **CDN Delivery:** 30-50% faster loading
- **Real-Time Latency:** <100ms UI updates
- **Search Performance:** <200ms query time

---

## 📱 Platform Support

- ✅ **iOS** - Native app, App Store ready, TestFlight
- ✅ **Android** - Native app, Google Play ready
- 🔄 **Web** - Planned for future release

---

## 🔒 Security

- API keys managed via EAS Secrets
- Secure multi-provider authentication
- Row-Level Security (RLS) policies
- HTTPS for all communications
- Privacy-compliant permission handling

---

## 📈 Project Status

### ✅ Completed

- Clean Architecture + MVVM implementation
- AI image generation
- Scene library and selection
- Image enhancement and optimization
- User authentication (Email, Google, Apple)
- Gallery, favorites, and real-time subscriptions
- Full-text search
- Subscription management (RevenueCat)
- Supabase Storage integration
- Test coverage (~70%)
- E2E tests (Maestro)
- Performance monitoring
- Comprehensive documentation

### 🔄 In Progress

- Test coverage increase to 80%+
- CI/CD pipeline setup
- Error tracking integration

### 📋 Planned

- Dark mode support
- Internationalization (i18n)
- Web version
- Advanced analytics dashboard

---

## 🎯 Use Cases

**For Users:**
- Professional portrait generation
- Creative AI image projects
- Social media content creation
- Personal branding

**For Developers:**
- Clean Architecture + MVVM reference
- Production-ready React Native example
- Supabase + RevenueCat integration guide
- TypeScript best practices

---

## 📚 Documentation

- [Architecture Guide](./ARCHITECTURE.md)
- [Performance Audit](./PERFORMANCE_AUDIT.md)
- [Test Coverage Report](./TEST_COVERAGE_REPORT.md)
- [Security Setup](./README_SECURITY.md)
- [EAS Build Guide](./EAS_BUILD_GUIDE.md)

---

## 🤝 Contributing

1. Follow Clean Architecture + MVVM patterns
2. Write tests for new features
3. Update documentation
4. Follow TypeScript best practices
5. Never commit API keys or secrets

---

<div align="center">

**Made with ❤️ using React Native and Expo**

</div>

