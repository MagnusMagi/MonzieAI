# RevenueCat - App Store Connect App Bilgileri

## 📱 App Store Connect App Detayları

**Bundle ID:** `com.someplanets.monzieaiv2`  
**SKU:** `EX1765266088662`  
**Apple ID:** `6756293363`

## 🎯 RevenueCat Production App

**App ID:** `appb582ff4d9d`  
**App Name:** MonzeiAI iOS  
**App Type:** `app_store` (iOS App Store)  
**Bundle ID:** `com.someplanets.monzieaiv2` ✅ (Eşleşiyor)

## 📋 Products Mapping

### App Store Connect Products

1. **Monthly Subscription**
   - Product ID: `com.someplanets.monzieaiv2.monthly.subscription`
   - Reference Name: Monthly Plan
   - Level: 1

2. **Yearly Subscription**
   - Product ID: `com.someplanets.monzieaiv2.yearly.subscription`
   - Reference Name: Yearly Subs
   - Level: 2

3. **Lifetime Purchase**
   - Product ID: `com.someplanets.monzieaiv2.lifetime`
   - Reference Name: Lifetime Plans
   - Level: 3

### RevenueCat Products

1. **Monthly Subscription**
   - Product ID: `prodc03cb3f2d8`
   - Store Identifier: `com.someplanets.monzieaiv2.monthly.subscription` ✅
   - Entitlement: Premium

2. **Yearly Subscription**
   - Product ID: `prod87797c5c3f`
   - Store Identifier: `com.someplanets.monzieaiv2.yearly.subscription` ✅
   - Entitlement: Premium

3. **Lifetime Purchase**
   - Product ID: `prod8ca2afdef5`
   - Store Identifier: `com.someplanets.monzieaiv2.lifetime` ✅

## ✅ Doğrulama

- ✅ Bundle ID eşleşiyor: `com.someplanets.monzieaiv2`
- ✅ Products eşleşiyor: Tüm product ID'ler doğru
- ✅ RevenueCat app oluşturuldu ve yapılandırıldı

## 🔧 Sonraki Adımlar

1. **App Store Connect'te:**
   - Products metadata'sını tamamla
   - Subscription Group oluştur (Monthly ve Yearly için)
   - Pricing ayarla
   - Localization ekle

2. **RevenueCat'te:**
   - P8 Key ekle (App Settings → In-app purchase key configuration)
   - Key ID: (App Store Connect'ten alınacak)
   - Issuer ID: (App Store Connect'ten alınacak)

3. **Test:**
   - Sandbox test kullanıcısı oluştur
   - Test purchase yap
   - RevenueCat Dashboard'da transaction'ları kontrol et

## 📚 Kaynaklar

- [App Store Connect App Info](https://appstoreconnect.apple.com)
- [RevenueCat App Store Setup](https://www.revenuecat.com/docs/app-store-setup)

