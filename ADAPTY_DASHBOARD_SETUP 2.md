# 🎯 Adapty Dashboard Setup - Paywall Oluşturma

## ✅ Mevcut Durum

Adapty SDK başarıyla çalışıyor:
- ✅ Initialize: Başarılı
- ✅ Identify: Başarılı (User ID: `6c9f1fc8-1054-4891-a2b4-8ec1d04c277e`)
- ✅ Premium Status: Başarılı (`isPremium: false`)
- ⚠️ Paywalls: 0 (Henüz oluşturulmamış)
- ⚠️ Products: 0 (Paywall olmadığı için)

---

## 🚀 Adapty Dashboard'da Paywall Oluşturma

### 1. Adapty Dashboard'a Giriş

1. [Adapty Dashboard](https://app.adapty.io/)'a giriş yapın
2. Projenizi seçin

### 2. Paywall Oluşturma

#### Adım 1: Paywall Oluştur
1. Dashboard'da **"Paywalls"** sekmesine gidin
2. **"Create Paywall"** butonuna tıklayın
3. Paywall bilgilerini doldurun:
   - **Paywall ID**: `main_paywall` (veya istediğiniz ID)
   - **Name**: "Main Paywall" (veya istediğiniz isim)
   - **Description**: (Opsiyonel)

#### Adım 2: Products Ekle
1. Paywall oluşturduktan sonra, **"Products"** sekmesine gidin
2. **"Add Product"** butonuna tıklayın
3. App Store Connect'ten product ID'lerinizi ekleyin:
   - **Monthly Subscription**: `com.someplanets.monzieaiv2.monthly` (örnek)
   - **Yearly Subscription**: `com.someplanets.monzieaiv2.yearly` (örnek)

#### Adım 3: Paywall'a Products Ekle
1. Paywall düzenleme sayfasına dönün
2. **"Add Product"** butonuna tıklayın
3. Oluşturduğunuz product'ları seçin ve ekleyin

### 3. Access Levels Oluşturma

1. **"Access Levels"** sekmesine gidin
2. **"Create Access Level"** butonuna tıklayın
3. Access Level bilgilerini doldurun:
   - **ID**: `premium` (veya istediğiniz ID)
   - **Name**: "Premium" (veya istediğiniz isim)

### 4. Products ile Access Levels'i Bağlama

1. **"Products"** sekmesine gidin
2. Her product'ı düzenleyin
3. **"Access Level"** dropdown'ından oluşturduğunuz access level'ı seçin (örn: `premium`)

---

## 📱 Uygulamada Test Etme

### Paywall'ları Yükleme

```typescript
// AdaptyTestScreen'de veya PaywallScreen'de
const paywalls = await adaptyService.getPaywalls();
console.log('Paywalls:', paywalls);

// Paywall ID ile paywall getirme
const paywall = await adaptyService.getPaywall('main_paywall');
console.log('Paywall:', paywall);

// Paywall products'ları getirme
const products = await adaptyService.getPaywallProducts('main_paywall');
console.log('Products:', products);
```

### Subscription Satın Alma

```typescript
// Product satın alma
const product = products[0]; // İlk product'ı seç
const profile = await adaptyService.purchaseProduct(product);
console.log('Purchase successful:', profile);

// Premium status kontrolü
const isPremium = await adaptyService.isPremium();
console.log('Is Premium:', isPremium);
```

---

## 🔍 Test Senaryoları

### Senaryo 1: Paywall'ları Listeleme
```typescript
const paywalls = await adaptyService.getPaywalls();
// Beklenen: Paywall listesi (en az 1 paywall)
```

### Senaryo 2: Paywall Products'ları Getirme
```typescript
const products = await adaptyService.getPaywallProducts('main_paywall');
// Beklenen: Product listesi (en az 1 product)
```

### Senaryo 3: Profile Getirme
```typescript
const profile = await adaptyService.getProfile();
// Beklenen: Profile objesi (subscription olmasa bile)
```

### Senaryo 4: Premium Status Kontrolü
```typescript
const isPremium = await adaptyService.isPremium();
// Beklenen: true/false (subscription durumuna göre)
```

---

## ⚠️ Önemli Notlar

1. **Product ID'ler**: App Store Connect'te oluşturduğunuz product ID'lerini Adapty'ye eklemeniz gerekir.

2. **Sandbox Test**: Test için sandbox kullanıcısı oluşturun:
   - App Store Connect → Users and Access → Sandbox Testers

3. **Webhook**: Supabase Edge Function webhook'unuz zaten deploy edildi. Adapty Dashboard'da webhook URL'ini eklemeniz yeterli:
   - URL: `https://groguatbjerebweinuef.supabase.co/functions/v1/adapty-webhook`

4. **Access Levels**: Product'ları access level'larla bağlamazsanız, `isPremium()` her zaman `false` döner.

---

## 📋 Checklist

- [ ] Adapty Dashboard'a giriş yapıldı
- [ ] Paywall oluşturuldu (`main_paywall`)
- [ ] Products App Store Connect'ten eklendi
- [ ] Products paywall'a eklendi
- [ ] Access Level oluşturuldu (`premium`)
- [ ] Products access level'larla bağlandı
- [ ] Webhook URL Adapty Dashboard'a eklendi
- [ ] Test satın alma yapıldı (sandbox)
- [ ] Premium status kontrol edildi

---

## 🎉 Sonuç

Paywall'ları oluşturduktan sonra:
- `getPaywalls()` en az 1 paywall döndürecek
- `getPaywallProducts()` en az 1 product döndürecek
- `getProfile()` subscription bilgilerini içerecek
- `isPremium()` subscription durumuna göre `true/false` dönecek

**Durum:** Adapty SDK çalışıyor ✅, sadece paywall'ları oluşturmanız gerekiyor.

