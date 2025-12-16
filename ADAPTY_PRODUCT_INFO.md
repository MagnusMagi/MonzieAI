# 📦 Adapty Product Bilgileri

## ✅ Eklenen Product

### Product Detayları
- **Product ID**: `com.someplanets.monzieaiv2.monthly`
- **Reference Name**: Aylık Abonelik Test
- **Apple ID**: `6756520742`
- **Platform**: iOS (App Store Connect)

### Durum
- ✅ App Store Connect'te oluşturuldu
- ✅ Adapty Dashboard'da eklendi
- ✅ Paywall'a bağlandı

---

## 🧪 Test Senaryoları

### 1. Paywall'ları Listeleme
```typescript
const paywalls = await adaptyService.getPaywalls();
// Beklenen: En az 1 paywall (oluşturduğunuz paywall)
```

### 2. Paywall Products'ları Getirme
```typescript
const paywalls = await adaptyService.getPaywalls();
if (paywalls.length > 0) {
  const products = await adaptyService.getPaywallProducts(paywalls[0].id);
  // Beklenen: En az 1 product (com.someplanets.monzieaiv2.monthly)
}
```

### 3. Product Satın Alma
```typescript
const products = await adaptyService.getPaywallProducts('main_paywall');
const monthlyProduct = products.find(p => p.vendorProductId === 'com.someplanets.monzieaiv2.monthly');
if (monthlyProduct) {
  const profile = await adaptyService.purchaseProduct(monthlyProduct);
  // Beklenen: Subscription başarılı
}
```

---

## 📱 Uygulamada Test

### AdaptyTestScreen'de Test
1. **Get Paywalls** butonuna tıklayın
   - Beklenen: En az 1 paywall listelenmeli

2. **Get Paywall Products** butonuna tıklayın
   - Beklenen: En az 1 product listelenmeli (`com.someplanets.monzieaiv2.monthly`)

3. **Get Products** butonuna tıklayın
   - Beklenen: Tüm products listelenmeli

### PaywallScreen'de Test
1. PaywallScreen'e gidin
2. Adapty products otomatik yüklenecek
3. Monthly plan görünmeli
4. "Continue" butonuna tıklayarak satın alma yapabilirsiniz

---

## ⚠️ Önemli Notlar

### Sandbox Test
- Test satın alma için **Sandbox Test User** kullanmanız gerekir
- App Store Connect → Users and Access → Sandbox Testers
- Sandbox kullanıcısı ile giriş yapın

### Access Level
- Product'ı `premium` access level ile bağladığınızdan emin olun
- Aksi halde `isPremium()` her zaman `false` döner

### Webhook
- Supabase Edge Function webhook'unuz deploy edildi
- Adapty Dashboard'da webhook URL'ini ekleyin:
  - URL: `https://groguatbjerebweinuef.supabase.co/functions/v1/adapty-webhook`

---

## 🔍 Kontrol Listesi

- [x] Product App Store Connect'te oluşturuldu
- [x] Product Adapty Dashboard'a eklendi
- [x] Paywall oluşturuldu
- [x] Product paywall'a eklendi
- [ ] Access Level oluşturuldu (`premium`)
- [ ] Product Access Level ile bağlandı
- [ ] Webhook URL Adapty Dashboard'a eklendi
- [ ] Sandbox Test User oluşturuldu
- [ ] Test satın alma yapıldı

---

## 🎯 Sonraki Adımlar

1. **Access Level Oluşturma:**
   - Adapty Dashboard → Access Levels → Create Access Level
   - ID: `premium`
   - Name: "Premium"

2. **Product'ı Access Level ile Bağlama:**
   - Products → Product'ı düzenle
   - Access Level: `premium` seç

3. **Webhook Ekleme:**
   - Adapty Dashboard → Integrations → Webhooks
   - URL: `https://groguatbjerebweinuef.supabase.co/functions/v1/adapty-webhook`
   - Events: `PROFILE_UPDATED` seç

4. **Test Satın Alma:**
   - Sandbox Test User ile giriş yap
   - PaywallScreen'de "Continue" butonuna tıkla
   - Test satın alma yap

---

**Durum:** Product ve Paywall eklendi ✅, Access Level ve Webhook ayarları yapılmalı.

