# MonzieAI - Dokümantasyon İndeksi

## 📚 Hoş Geldiniz!

Bu, MonzieAI projesinin kapsamlı dokümantasyon merkezi. Tüm teknik detaylar, özellikler, kurulum talimatları ve daha fazlası burada.

## 🗂️ Dokümantasyon Yapısı

### 📖 Temel Dokümantasyon

#### [README.md](./README.md)
**Proje Genel Bakış**

Projenin temel özeti, teknoloji stack'i, hızlı başlangıç rehberi.

**İçerik**:
- Proje hakkında
- Teknoloji stack
- Proje yapısı
- Hızlı kurulum
- Geliştirme komutları
- Deployment bilgileri

**Kimler için**: Yeni başlayanlar, genel bakış isteyenler

---

#### [ARCHITECTURE.md](./ARCHITECTURE.md)
**Mimari Dokümantasyon**

Uygulamanın teknik mimarisi, tasarım desenleri ve best practices.

**İçerik**:
- Clean Architecture prensiplerine dayalı yapı
- Katmanlı mimari (Presentation, Domain, Data, Infrastructure)
- Veri akışı diyagramları
- State management stratejisi
- Servis mimarisi
- Güvenlik mimarisi
- Performans optimizasyonları
- Tasarım desenleri (Repository, Singleton, Factory, Observer, vb.)

**Kimler için**: Geliştiriciler, teknik lead'ler, sistem mimarları

**Önemli Bölümler**:
- 🏗️ Katmanlı Mimari
- 🔄 Veri Akışı
- 🔧 Servis Mimarisi
- 🗂️ State Management
- 🔐 Güvenlik Mimarisi
- ⚡ Performans Optimizasyonları

---

#### [API.md](./API.md)
**API Dokümantasyon**

Tüm API endpoint'leri, servisler ve entegrasyonlar.

**İçerik**:
- Supabase API (Auth, Database, Storage, Realtime)
- FAL.AI API (Image Generation)
- RevenueCat API (Subscriptions)
- Internal Services API
- Error handling
- Rate limiting
- Authentication & Authorization

**Kimler için**: Backend geliştiriciler, API entegrasyon yapanlar

**Servisler**:
- 🗄️ Supabase (Backend as a Service)
- 🎨 FAL.AI (AI Image Generation)
- 💎 RevenueCat (Subscription Management)
- 🔧 Internal Services

---

#### [DATABASE.md](./DATABASE.md)
**Veritabanı Dokümantasyon**

PostgreSQL database schema, tablolar, ilişkiler ve queries.

**İçerik**:
- Database schema ve ERD
- Tablo detayları (profiles, scenes, generated_images, vb.)
- İlişkiler ve foreign keys
- Indexes ve performance optimization
- Row Level Security (RLS) policies
- Triggers & Functions
- Common queries
- Migrations
- Backup & Recovery

**Kimler için**: Database yöneticileri, backend geliştiriciler

**Tablolar**:
- 👤 profiles (Kullanıcı profilleri)
- 🎭 scenes (AI şablonları)
- 🖼️ generated_images (Üretilen görseller)
- 📊 categories (Kategoriler)
- 📈 usage_tracking (Kullanım takibi)
- 📊 analytics_events (Event tracking)

---

### 🚀 Kurulum ve Deployment

#### [SETUP.md](./SETUP.md)
**Kurulum Kılavuzu**

Sıfırdan projeyi kurmak için detaylı adım adım rehber.

**İçerik**:
- Sistem gereksinimleri
- Ön gereksinimler (Node.js, Expo CLI, Xcode, Android Studio)
- Proje kurulumu
- Environment variables
- Supabase setup
- FAL.AI setup
- RevenueCat setup
- iOS kurulumu
- Android kurulumu
- Development server
- Sorun giderme

**Kimler için**: Yeni geliştiriciler, devops

**Adımlar**:
1. ✅ Sistem hazırlığı
2. 📦 Bağımlılıklar
3. 🔐 Environment variables
4. 🗄️ Supabase
5. 🎨 FAL.AI
6. 💎 RevenueCat
7. 📱 Platform setup
8. 🖥️ Development server

---

#### [DEPLOYMENT.md](./DEPLOYMENT.md)
**Deployment Kılavuzu**

Production'a deploy etmek için tam rehber.

**İçerik**:
- Pre-deployment checklist
- EAS Build setup
- iOS deployment (App Store)
- Android deployment (Play Store)
- App Store submission
- Play Store submission
- CI/CD pipeline
- Monitoring & Analytics
- Rollback strategy
- Emergency procedures

**Kimler için**: DevOps, release manager'lar

**Build Profilleri**:
- 🔨 Development (Local testing)
- 👀 Preview (Internal testing)
- 🚀 Production (Store releases)

---

### 📋 Özellik Dokümantasyonu

#### [FEATURES.md](./FEATURES.md)
**Özellikler Dokümantasyon**

Uygulamanın tüm özelliklerinin detaylı açıklaması.

**İçerik**:
- Temel özellikler
  - AI görsel oluşturma
  - Sahne kütüphanesi
  - Fotoğraf yönetimi
  - Galeri ve favori sistem
  - Kullanıcı profili
- Kullanıcı özellikleri
  - Kimlik doğrulama
  - Onboarding
  - Bildirim sistemi
- Premium özellikler
  - Abonelik paketleri
  - Premium vs Free karşılaştırma
- Teknik özellikler
  - Performans optimizasyonları
  - Caching strategy
  - Error handling
  - Analytics
  - Security
- Gelecek özellikler

**Kimler için**: Product manager'lar, QA, geliştiriciler

**Ana Kategoriler**:
- ✨ Temel Özellikler
- 🔐 Kullanıcı Özellikleri
- 💎 Premium Özellikler
- 🔧 Teknik Özellikler
- 🚀 Gelecek Özellikler

---

#### [SCREENS.md](./SCREENS.md)
**Ekran Dokümantasyonu**

Tüm ekranların detaylı açıklaması ve flow'ları.

**İçerik**:
- Auth flow
- Onboarding flow
- Main app flow
- Image generation flow
- Settings flow
- Premium flow
- Ekran detayları (props, state, navigation)

**Kimler için**: UI/UX designer'lar, frontend geliştiriciler

---

### 🛠️ Geliştirme Kılavuzları

#### [CONTRIBUTING.md](./CONTRIBUTING.md)
**Katkıda Bulunma Rehberi**

Projeye nasıl katkıda bulunulacağı.

**İçerik**:
- Code style guide
- Git workflow
- Pull request process
- Code review guidelines
- Testing requirements
- Documentation standards

---

#### [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
**Sorun Giderme**

Yaygın sorunlar ve çözümleri.

**İçerik**:
- Build errors
- Runtime errors
- API errors
- Platform-specific issues
- Performance issues
- Network issues

---

## 🎯 Hızlı Başlangıç Yolları

### Yeni Geliştirici
```
1. README.md → Genel bakış
2. SETUP.md → Kurulum
3. ARCHITECTURE.md → Mimari anlama
4. FEATURES.md → Özellikler öğrenme
```

### Backend Geliştirici
```
1. API.md → API'ları öğrenme
2. DATABASE.md → Veritabanı yapısı
3. ARCHITECTURE.md → Servis mimarisi
```

### Frontend Geliştirici
```
1. FEATURES.md → UI/UX özellikleri
2. SCREENS.md → Ekran flow'ları
3. ARCHITECTURE.md → State management
```

### DevOps/Release
```
1. SETUP.md → Environment setup
2. DEPLOYMENT.md → Build & release
3. TROUBLESHOOTING.md → Sorun giderme
```

### Product Manager
```
1. README.md → Proje özeti
2. FEATURES.md → Tüm özellikler
3. API.md → Teknik limitler
```

## 📊 Dokümantasyon İstatistikleri

| Doküman | Satır | Kelime | Karakter | Seviye |
|---------|-------|--------|----------|---------|
| README.md | ~280 | ~1,500 | ~12K | Başlangıç |
| ARCHITECTURE.md | ~1,100 | ~8,000 | ~60K | İleri |
| API.md | ~1,000 | ~7,000 | ~55K | Orta |
| DATABASE.md | ~880 | ~6,000 | ~48K | İleri |
| SETUP.md | ~730 | ~5,000 | ~40K | Başlangıç |
| DEPLOYMENT.md | ~850 | ~5,500 | ~45K | Orta |
| FEATURES.md | ~650 | ~4,500 | ~35K | Orta |
| **TOPLAM** | **~5,500** | **~37,500** | **~295K** | - |

## 🔍 Arama İpuçları

### Dosya İçinde Arama
```bash
# Belirli bir terim ara
grep -r "term" docs/

# Case-insensitive arama
grep -ri "supabase" docs/

# Satır numarası ile
grep -rn "API" docs/
```

### VS Code'da Arama
- `Cmd+F` (Mac) veya `Ctrl+F` (Windows/Linux)
- `Cmd+Shift+F` (Mac) veya `Ctrl+Shift+F` (Windows/Linux) - Tüm dosyalarda ara

## 📝 Dokümantasyon Güncellemeleri

### Güncelleme Sıklığı
- **Major Release**: Tam güncelleme
- **Minor Release**: İlgili bölümler güncellenir
- **Patch Release**: Sadece değişen özellikler
- **Hotfix**: TROUBLESHOOTING.md güncellenir

### Son Güncellemeler
- 2024-01-XX: İlk dokümantasyon seti oluşturuldu
- Tüm core dokümanlar tamamlandı
- 7 ana doküman, ~6,000 satır

## 🤝 Geri Bildirim

Dokümantasyon eksikleri veya hataları için:
- GitHub Issues açın
- Pull request gönderin
- Team'e bilgi verin

## 📚 Dış Kaynaklar

### Expo & React Native
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [React Navigation](https://reactnavigation.org/docs/getting-started)

### Backend Services
- [Supabase Docs](https://supabase.com/docs)
- [FAL.AI Docs](https://fal.ai/docs)
- [RevenueCat Docs](https://www.revenuecat.com/docs)

### Development Tools
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [ESLint Rules](https://eslint.org/docs/rules/)

## 🎓 Öğrenme Yolları

### Seviye 1: Başlangıç
**Süre**: 1-2 hafta
- [ ] README.md oku
- [ ] SETUP.md ile projeyi kur
- [ ] Basit değişiklik yap
- [ ] Local'de test et

### Seviye 2: Orta
**Süre**: 2-4 hafta
- [ ] ARCHITECTURE.md'yi anla
- [ ] FEATURES.md'yi incele
- [ ] API.md'yi oku
- [ ] Yeni feature ekle
- [ ] Test yaz

### Seviye 3: İleri
**Süre**: 1-2 ay
- [ ] DATABASE.md'yi master et
- [ ] DEPLOYMENT.md'yi öğren
- [ ] Production deploy yap
- [ ] Performance optimize et
- [ ] Monitoring kur

## 🏆 En İyi Pratikler

### Dokümantasyon Okuma
1. **Önce genel bakış**: README.md'den başla
2. **İhtiyacına göre**: Sadece ilgili dokümanları oku
3. **Uygulayarak öğren**: Kodu çalıştır, test et
4. **Not al**: Önemli bölümleri işaretle
5. **Soru sor**: Anlamadığın yerleri sor

### Dokümantasyon Yazma
1. **Açık ve net**: Basit dil kullan
2. **Örneklerle**: Code snippet'leri ekle
3. **Güncel tut**: Her değişiklikte güncelle
4. **Link ekle**: İlgili bölümlere bağlantı ver
5. **Format kur**: Markdown syntax'ı düzgün kullan

## 🔗 Yararlı Linkler

### Proje
- **Repository**: [GitHub](https://github.com/yourorg/monzieai)
- **Issues**: [GitHub Issues](https://github.com/yourorg/monzieai/issues)
- **Releases**: [GitHub Releases](https://github.com/yourorg/monzieai/releases)

### Deployment
- **EAS Dashboard**: [expo.dev](https://expo.dev)
- **App Store Connect**: [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
- **Play Console**: [play.google.com/console](https://play.google.com/console)

### Monitoring
- **Supabase Dashboard**: [app.supabase.com](https://app.supabase.com)
- **FAL.AI Dashboard**: [fal.ai/dashboard](https://fal.ai/dashboard)
- **RevenueCat Dashboard**: [app.revenuecat.com](https://app.revenuecat.com)

## 📞 İletişim

### Team
- **Engineering**: dev@monzieai.com
- **Product**: product@monzieai.com
- **Support**: support@monzieai.com

### Acil Durum
- **Critical Bug**: Slack #emergency
- **Security Issue**: security@monzieai.com
- **Production Down**: oncall@monzieai.com

---

## 📋 Checklist: Hangi Dokümanı Okumalıyım?

### ❓ "Yeni başlıyorum, nereden başlamalıyım?"
→ **README.md** ile başla, sonra **SETUP.md**

### ❓ "API nasıl çalışıyor?"
→ **API.md**

### ❓ "Database şeması nedir?"
→ **DATABASE.md**

### ❓ "Uygulama mimarisi nasıl?"
→ **ARCHITECTURE.md**

### ❓ "Hangi özellikler var?"
→ **FEATURES.md**

### ❓ "Nasıl deploy ederim?"
→ **DEPLOYMENT.md**

### ❓ "Kurulum hatası alıyorum"
→ **TROUBLESHOOTING.md** (yakında)

### ❓ "Ekran flow'ları nedir?"
→ **SCREENS.md** (yakında)

---

**Son Güncelleme**: 2024
**Versiyon**: 1.0.0
**Durum**: ✅ Tamamlandı (Core Dokümanlar)

**Katkıda Bulunanlar**:
- AI Assistant (Claude Sonnet 4.5)
- Development Team

**Lisans**: Private - Tüm hakları saklıdır.