# 💰 RevenueCat + App Store Connect Setup Guide

## 📋 Mevcut RevenueCat Products Durumu

### ✅ RevenueCat'te Tanımlı Products

| Product ID | Display Name | Store Identifier | Type | Status |
|------------|--------------|------------------|------|--------|
| `prod39bbb78aff` | Yearly | yearly | subscription | ✅ Test Store |
| `prod45897b15f4` | Monthly | monthly | subscription | ✅ Test Store |
| `prod7350c00ac6` | Lifetime | lifetime | one_time | ✅ Test Store |
| `prod87797c5c3f` | Yearly Subscription | com.someplanets.monzieaiv2.yearly.subscription | subscription | ✅ Production |
| `prod8ca2afdef5` | Lifetime Purchase | com.someplanets.monzieaiv2.lifetime | non_renewing_subscription | ✅ Production |
| `prodc03cb3f2d8` | Monthly Subscription | com.someplanets.monzieaiv2.monthly.subscription | subscription | ✅ Production |

**Durum:** ✅ Tüm gerekli products RevenueCat'te mevcut

---

## 🎯 App Store Connect'te Oluşturulması Gerekenler

### 1. Subscription Groups Oluşturma

App Store Connect'te önce **Subscription Group** oluşturmalısınız:

#### Adım 1: App Store Connect → Features → Subscriptions
1. **+** butonuna tıklayın
2. **Create Subscription Group** seçin
3. **Reference Name:** `Premium Features`
4. **Product ID:** `premium_group_001` (benzersiz olmalı)
5. **Create** butonuna tıklayın

### 2. Subscription Products Oluşturma

#### A. Monthly Subscription
```
Reference Name: Monthly Premium
Product ID: com.someplanets.monzieaiv2.monthly.subscription
Subscription Group: Premium Features
Pricing: $4.99/month
Duration: 1 Month
```

#### B. Yearly Subscription
```
Reference Name: Yearly Premium
Product ID: com.someplanets.monzieaiv2.yearly.subscription
Subscription Group: Premium Features
Pricing: $39.99/year
Duration: 1 Year
```

#### C. Lifetime Purchase (Non-Renewing Subscription)
```
Reference Name: Lifetime Premium
Product ID: com.someplanets.monzieaiv2.lifetime
Type: Non-Renewing Subscription
Pricing: $99.99 (one-time)
```

---

## 🔧 Detaylı App Store Connect Setup Adımları

### Adım 1: App Store Connect'e Giriş
1. [App Store Connect](https://appstoreconnect.apple.com/) adresine gidin
2. Apple Developer hesabınızla giriş yapın
3. **MonzieAI** uygulamasını seçin

### Adım 2: Subscription Group Oluşturma
```
1. Sol menü → Features → Subscriptions
2. + butonuna tıklayın
3. "Create Subscription Group" seçin
4. Aşağıdaki bilgileri girin:
   - Reference Name: Premium Features
   - Product ID: premium_features_group_001
   - App: MonzieAI
5. Create butonuna tıklayın
```

### Adım 3: Monthly Subscription Oluşturma
```
1. Oluşturduğunuz Subscription Group'a tıklayın
2. + butonuna tıklayın
3. "Create Subscription" seçin
4. Subscription bilgileri:
   - Reference Name: Monthly Premium Access
   - Product ID: com.someplanets.monzieaiv2.monthly.subscription
   - Duration: 1 Month
   - Price: $4.99
   - Display Name: Monthly Premium
   - Description: Unlimited AI image generations, high-quality outputs, priority processing
5. Create butonuna tıklayın
```

### Adım 4: Yearly Subscription Oluşturma
```
1. Aynı Subscription Group içinde
2. + butonuna tıklayın
3. Subscription bilgileri:
   - Reference Name: Yearly Premium Access
   - Product ID: com.someplanets.monzieaiv2.yearly.subscription
   - Duration: 1 Year
   - Price: $39.99 (8.3% savings)
   - Display Name: Yearly Premium
   - Description: Unlimited AI image generations, high-quality outputs, priority processing - Save 8.3% annually
5. Create butonuna tıklayın
```

### Adım 5: Lifetime Purchase Oluşturma
```
1. Sol menü → Features → In-App Purchases
2. + butonuna tıklayın
3. "Non-Renewing Subscription" seçin
4. Product bilgileri:
   - Reference Name: Lifetime Premium Access
   - Product ID: com.someplanets.monzieaiv2.lifetime
   - Price: $99.99
   - Display Name: Lifetime Premium
   - Description: One-time purchase for unlimited AI image generations forever
5. Create butonuna tıklayın
```

### Adım 6: Products'ları Review'e Gönderme
```
1. Her product için "Submit for Review" butonuna tıklayın
2. Review Notes ekleyin (gerektiğinde)
3. Submit butonuna tıklayın
```

---

## 🔗 RevenueCat ↔ App Store Connect Mapping

### Mapping Doğrulama

App Store Connect'te products oluşturulduktan sonra RevenueCat'te otomatik map edilecektir. Ancak manuel kontrol:

#### RevenueCat Dashboard'da Kontrol:
1. **Products** → **App Store** tab
2. Product'lar otomatik görünmelidir
3. Eğer görünmüyorsa: **Refresh Products** butonuna tıklayın

#### Product ID'lerin Eşleşmesi:
```
RevenueCat Product ID → App Store Connect Product ID
com.someplanets.monzieaiv2.monthly.subscription ✅
com.someplanets.monzieaiv2.yearly.subscription ✅
com.someplanets.monzieaiv2.lifetime ✅
```

---

## 💰 Pricing Strategy

### Önerilen Fiyatlandırma
```
Monthly: $4.99 (Standard)
Yearly: $39.99 (Save ~17% annually)
Lifetime: $99.99 (One-time payment)
```

### Alternatif Fiyatlandırma (İsteğe bağlı)
```
Monthly: $2.99 (Budget)
Yearly: $19.99 (Save ~33% annually)
Lifetime: $49.99 (Lower one-time cost)
```

---

## 🧪 Testing Products

### Sandbox Testing
```
1. TestFlight'ta app'i indirin
2. Sandbox Apple ID ile giriş yapın
3. Subscription satın almayı test edin
4. Restore purchase'u test edin
```

### Sandbox Apple ID Oluşturma
```
1. App Store Connect → Users and Access → Sandbox → Testers
2. + butonuna tıklayın
3. Test Apple ID oluşturun (örn: test@monzieai.com)
```

---

## 📊 Subscription Analytics Setup

### RevenueCat Dashboard'da
```
1. Dashboard → Analytics
2. Revenue, Subscribers, Churn Rate grafiklerini kontrol edin
3. Cohort analysis ayarlayın
4. Webhook events'leri monitor edin
```

---

## 🚨 Önemli Notlar

### Zaman Çizelgesi
- **Subscription Group**: 5-10 dakika
- **Products Oluşturma**: 10-15 dakika per product
- **Review Süresi**: 24-48 saat
- **Sandbox Testing**: Products approve edildikten sonra

### Review Reddetme Riskleri
```
❌ Product ID yanlış format
❌ Fiyat çok yüksek/düşük
❌ Description eksik veya yanıltıcı
❌ Subscription group yanlış yapılandırılmış
```

### Troubleshooting
```
❌ Products görünmüyor: App Store Connect'te status kontrolü
❌ Mapping hatası: Product ID'lerin tam eşleşmesi gerekir
❌ Pricing issues: App Store pricing tiers'ına uygun olmalı
```

---

## 📋 Checklist

### ✅ App Store Connect Setup
- [ ] Subscription Group oluşturuldu
- [ ] Monthly subscription product oluşturuldu
- [ ] Yearly subscription product oluşturuldu
- [ ] Lifetime purchase product oluşturuldu
- [ ] Tüm products review'e gönderildi

### ✅ RevenueCat Integration
- [ ] Products otomatik map edildi
- [ ] Pricing doğru ayarlandı
- [ ] Entitlements bağlı
- [ ] Webhook'lar aktif

### ✅ Testing
- [ ] Sandbox testing yapıldı
- [ ] Purchase flow çalışıyor
- [ ] Restore purchase çalışıyor
- [ ] Error handling test edildi

---

## 📞 Destek

**App Store Connect Sorunları:**
- [App Store Connect Help](https://help.apple.com/app-store-connect/)

**RevenueCat Sorunları:**
- [RevenueCat Documentation](https://docs.revenuecat.com/docs)
- Support: support@revenuecat.com

**MonzieAI Teknik Destek:**
- Email: developer@monzieai.com

---

## 🎯 Sonraki Adımlar

1. ✅ App Store Connect'e giriş yapın
2. ✅ Subscription products'ları oluşturun
3. ✅ RevenueCat mapping'ini kontrol edin
4. ✅ Sandbox testing yapın
5. ✅ Production build hazırlayın

---

*Bu rehber App Store Review Guidelines ve RevenueCat best practices'e göre hazırlanmıştır.*