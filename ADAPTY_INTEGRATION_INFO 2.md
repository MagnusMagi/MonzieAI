# 📱 Adapty Entegrasyonu - Bilgi

## 🔍 Mevcut Durum

### Adapty Kullanımı
- ❌ Projede Adapty kullanılmıyor
- ✅ Subscription management Supabase üzerinden yapılıyor
- ✅ `SubscriptionRepository` ile subscription işlemleri yönetiliyor

### MCP Server Durumu
- ❌ Adapty için MCP server mevcut değil
- ✅ Mevcut MCP server'lar:
  - Supabase (database, storage, functions)
  - Neon (database)
  - Apple Docs (SwiftUI, UIKit, HIG)
  - Magnus AI (AI chat, code generation)

---

## 💡 Adapty Nedir?

Adapty, mobile app subscription management platformu:
- iOS ve Android için in-app purchase yönetimi
- Subscription analytics
- A/B testing
- Revenue optimization
- Cross-platform subscription sync

---

## 🚀 Adapty Entegrasyonu (Opsiyonel)

### Adapty CLI
Adapty'nin resmi CLI'si yok, ancak:
- **REST API** mevcut
- **React Native SDK** mevcut: `react-native-adapty`
- **Webhook** desteği var

### Adapty SDK Kurulumu

```bash
# React Native için
npm install react-native-adapty

# iOS için (CocoaPods)
cd ios && pod install
```

### Adapty REST API
- **Base URL:** `https://api.adapty.io/api/v1`
- **Authentication:** API Key ile
- **Documentation:** https://docs.adapty.io/

---

## 🔄 Mevcut Subscription Sistemi

### Şu Anki Yapı:
- ✅ Supabase `subscriptions` tablosu
- ✅ `SubscriptionRepository` ile CRUD işlemleri
- ✅ Manual subscription management
- ✅ PaywallScreen, SubscriptionScreen mevcut

### Adapty ile Entegrasyon Avantajları:
1. **Otomatik Subscription Sync**
   - App Store ve Google Play ile otomatik senkronizasyon
   - Subscription durumu otomatik güncellenir

2. **Analytics**
   - Revenue tracking
   - Churn analysis
   - Conversion rates

3. **A/B Testing**
   - Paywall varyasyonları test edilebilir
   - Optimize edilmiş conversion rates

4. **Cross-platform**
   - iOS ve Android tek bir API
   - Unified subscription management

---

## 📋 Adapty Entegrasyonu İçin Yapılacaklar

### 1. Adapty SDK Kurulumu
```bash
npm install react-native-adapty
```

### 2. Adapty Service Oluşturma
- `src/services/adaptyService.ts` oluştur
- Adapty SDK wrapper
- Subscription purchase, restore, status check

### 3. Supabase Webhook Entegrasyonu
- Adapty webhook'larını Supabase'e yönlendir
- Subscription durumu otomatik güncellenir

### 4. PaywallScreen Güncelleme
- Adapty paywall entegrasyonu
- Product fetching
- Purchase flow

### 5. SubscriptionRepository Güncelleme
- Adapty ile senkronizasyon
- Webhook handler

---

## 🎯 Adapty vs Mevcut Sistem

### Mevcut Sistem (Supabase):
- ✅ Basit ve kontrol edilebilir
- ✅ Manuel subscription management
- ✅ Custom logic kolay
- ❌ App Store/Play Store ile otomatik sync yok
- ❌ Analytics eksik

### Adapty:
- ✅ App Store/Play Store otomatik sync
- ✅ Güçlü analytics
- ✅ A/B testing
- ✅ Revenue optimization
- ❌ Ek dependency
- ❌ Ücretli servis (ücretsiz tier var)

---

## 💰 Adapty Pricing

- **Free Tier:** 10K MAU (Monthly Active Users)
- **Pro:** $99/ay (100K MAU)
- **Enterprise:** Custom pricing

---

## 🔗 Kaynaklar

- **Adapty Docs:** https://docs.adapty.io/
- **React Native SDK:** https://github.com/adaptyteam/React-Native-Adapty
- **REST API:** https://docs.adapty.io/api-reference
- **Webhooks:** https://docs.adapty.io/webhooks

---

## ❓ Adapty Entegrasyonu Yapalım mı?

Eğer Adapty entegrasyonu yapmak isterseniz:
1. Adapty SDK kurulumu
2. Adapty Service oluşturma
3. PaywallScreen entegrasyonu
4. Webhook handler
5. Supabase senkronizasyonu

**Not:** Adapty için MCP server yok, ancak REST API ile entegrasyon yapılabilir.

---

**Durum:** Adapty kullanılmıyor, Supabase subscription management aktif

