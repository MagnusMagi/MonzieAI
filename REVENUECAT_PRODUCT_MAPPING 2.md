# RevenueCat - App Store Connect Product Mapping

## 📋 App Store Connect Products (Drafts)

1. **Aylık Abonelik Test**
   - Product ID: `com.someplanets.monzieaiv2.monthly`
   - Type: Subscription (Monthly)

2. **Monthly**
   - Product ID: `monthly`
   - Type: Subscription (Monthly)

3. **Yearly**
   - Product ID: `yearly`
   - Type: Subscription (Yearly)

4. **Lifetime**
   - Product ID: `lifetime`
   - Type: One-time purchase

## 🎯 RevenueCat Products (Mevcut)

1. **Monthly**
   - Product ID: `prod45897b15f4`
   - Store Identifier: `monthly`
   - Type: Subscription (P1M)

2. **Yearly**
   - Product ID: `prod39bbb78aff`
   - Store Identifier: `yearly`
   - Type: Subscription (P1Y)

3. **Lifetime**
   - Product ID: `prod7350c00ac6`
   - Store Identifier: `lifetime`
   - Type: One-time purchase

## ⚠️ Uyumsuzluk

**Sorun:**
- App Store Connect'te `com.someplanets.monzieaiv2.monthly` formatında bir product var
- RevenueCat'te `monthly` olarak tanımlı
- Bu uyumsuzluk production'da sorun yaratabilir

## ✅ Çözüm Seçenekleri

### Seçenek 1: Production App Store App Oluştur (Önerilen)

1. **RevenueCat Dashboard'da:**
   - Apps → Create New App
   - App Type: `app_store` (iOS App Store)
   - Bundle ID: `com.someplanets.monzieaiv2`
   - App Name: "MonzeiAI" (veya istediğiniz isim)

2. **Products Oluştur:**
   - Store Identifier: `com.someplanets.monzieaiv2.monthly`
   - Store Identifier: `com.someplanets.monzieaiv2.yearly` (App Store Connect'te oluşturmanız gerekir)
   - Store Identifier: `com.someplanets.monzieaiv2.lifetime` (App Store Connect'te oluşturmanız gerekir)

3. **Test Store'u Test İçin Kullan:**
   - Test Store (`app6ee59d340a`) → `monthly`, `yearly`, `lifetime`
   - Production App Store App → `com.someplanets.monzieaiv2.monthly`, vb.

### Seçenek 2: App Store Connect'teki Products'ı Güncelle

1. **App Store Connect'te:**
   - `com.someplanets.monzieaiv2.monthly` product'ını silin
   - Sadece `monthly`, `yearly`, `lifetime` kullanın

2. **RevenueCat'te:**
   - Mevcut products zaten doğru (`monthly`, `yearly`, `lifetime`)
   - Değişiklik gerekmez

### Seçenek 3: RevenueCat Products'ı Güncelle (MCP ile mümkün değil)

⚠️ **Not:** MCP ile product update yapılamıyor. Sadece create edilebiliyor.

**Manuel olarak RevenueCat Dashboard'dan:**
1. Products → Monthly → Edit
2. Store Identifier'ı `com.someplanets.monzieaiv2.monthly` olarak güncelle
3. Yearly ve Lifetime için de aynısını yap

## 📝 Önerilen Yapılandırma

### Test Store (Şu anki)
- **App ID:** `app6ee59d340a`
- **Products:** `monthly`, `yearly`, `lifetime`
- **Kullanım:** Development ve test için

### Production App Store App (Oluşturulmalı)
- **Bundle ID:** `com.someplanets.monzieaiv2`
- **Products:** 
  - `com.someplanets.monzieaiv2.monthly`
  - `com.someplanets.monzieaiv2.yearly` (App Store Connect'te oluştur)
  - `com.someplanets.monzieaiv2.lifetime` (App Store Connect'te oluştur)
- **Kullanım:** Production için

## 🚀 Sonraki Adımlar

1. **App Store Connect'te eksik products'ları oluştur:**
   - `com.someplanets.monzieaiv2.yearly` (Yearly subscription)
   - `com.someplanets.monzieaiv2.lifetime` (One-time purchase)

2. **RevenueCat'te Production App Store App oluştur:**
   - Apps → Create New App
   - Type: `app_store`
   - Bundle ID: `com.someplanets.monzieaiv2`

3. **Products'ları ekle:**
   - `com.someplanets.monzieaiv2.monthly`
   - `com.someplanets.monzieaiv2.yearly`
   - `com.someplanets.monzieaiv2.lifetime`

4. **Packages ve Offering yapılandır:**
   - Default offering'e packages ekle
   - Entitlements'a bağla

## 📚 Kaynaklar

- [RevenueCat App Store Setup](https://www.revenuecat.com/docs/app-store-setup)
- [Product Identifier Best Practices](https://www.revenuecat.com/docs/products)

