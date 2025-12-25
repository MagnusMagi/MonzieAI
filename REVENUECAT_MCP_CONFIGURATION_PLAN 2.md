# RevenueCat MCP Configuration Plan

Bu doküman, RevenueCat MCP kullanarak projeniz için gerekli yapılandırmaları yapma planını içerir.

## Mevcut Durum

- **Bundle ID:** `com.someplanets.monzieaiv2`
- **App Name:** MonzieAI
- **Platform:** iOS (Android için de yapılandırılabilir)
- **Beklenen Planlar:**
  - Monthly: $9.99/ay
  - Yearly: $79.99/yıl (33% indirim)

## Yapılacaklar (MCP ile)

### 1. Entitlement Oluşturma

**Premium Entitlement** oluşturulmalı:
- Identifier: `premium`
- Display Name: "Premium Membership"
- Description: "Unlimited AI image generation and premium features"

**MCP Komutu:**
```
Create a premium entitlement with identifier "premium" for my RevenueCat project
```

### 2. Products Oluşturma

**Monthly Product:**
- Product ID: `com.someplanets.monzieaiv2.monthly`
- Type: Subscription (Monthly)
- Price: $9.99

**Yearly Product:**
- Product ID: `com.someplanets.monzieaiv2.yearly`
- Type: Subscription (Annual)
- Price: $79.99

**MCP Komutları:**
```
Create a monthly subscription product with ID "com.someplanets.monzieaiv2.monthly" priced at $9.99
Create a yearly subscription product with ID "com.someplanets.monzieaiv2.yearly" priced at $79.99
```

### 3. Packages Oluşturma

**Monthly Package:**
- Identifier: `$rc_monthly`
- Product: `com.someplanets.monzieaiv2.monthly`
- Entitlement: `premium`

**Yearly Package:**
- Identifier: `$rc_annual`
- Product: `com.someplanets.monzieaiv2.yearly`
- Entitlement: `premium`

**MCP Komutları:**
```
Create a monthly package "$rc_monthly" linking product "com.someplanets.monzieaiv2.monthly" to entitlement "premium"
Create an annual package "$rc_annual" linking product "com.someplanets.monzieaiv2.yearly" to entitlement "premium"
```

### 4. Offering Oluşturma

**Default Offering:**
- Identifier: `default`
- Display Name: "Premium Plans"
- Description: "Choose your premium subscription plan"
- Packages: `$rc_monthly`, `$rc_annual`

**MCP Komutu:**
```
Create a default offering "default" with display name "Premium Plans" including packages "$rc_monthly" and "$rc_annual"
```

## Adım Adım MCP Komutları

Cursor'ı yeniden başlattıktan sonra, aşağıdaki komutları sırayla çalıştırın:

### Adım 1: Proje Bilgilerini Kontrol Et
```
Show me my RevenueCat project details
```

### Adım 2: Entitlement Oluştur
```
Create an entitlement with identifier "premium", display name "Premium Membership", and description "Unlimited AI image generation and premium features"
```

### Adım 3: Products Oluştur
```
Create a monthly subscription product with identifier "com.someplanets.monzieaiv2.monthly" for iOS platform
Create an annual subscription product with identifier "com.someplanets.monzieaiv2.yearly" for iOS platform
```

### Adım 4: Packages Oluştur
```
Create a package with identifier "$rc_monthly" that includes product "com.someplanets.monzieaiv2.monthly" and grants entitlement "premium"
Create a package with identifier "$rc_annual" that includes product "com.someplanets.monzieaiv2.yearly" and grants entitlement "premium"
```

### Adım 5: Offering Oluştur
```
Create an offering with identifier "default", display name "Premium Plans", and include packages "$rc_monthly" and "$rc_annual"
```

### Adım 6: Yapılandırmayı Doğrula
```
List all my products
List all my entitlements
List all my offerings
Show me the default offering details
```

## Önemli Notlar

1. **App Store Connect Entegrasyonu:**
   - Products'ları oluşturmadan önce, App Store Connect'te aynı Product ID'lerle in-app purchase'ları oluşturmanız gerekir
   - RevenueCat, App Store Connect'ten product bilgilerini çeker

2. **Test Ortamı:**
   - Sandbox test kullanıcıları ile test edin
   - StoreKit Configuration File kullanarak local test yapabilirsiniz

3. **Pricing:**
   - Pricing bilgileri App Store Connect'ten gelir
   - RevenueCat'te sadece Product ID'leri tanımlarsınız

4. **iOS API Key:**
   - `app.json`'da `revenueCatApiKeyIOS` alanı boş
   - RevenueCat Dashboard'dan iOS Public API Key'i alıp ekleyin (format: `appl_...`)

## Sorun Giderme

### MCP Bağlantı Sorunu
- Cursor'ı tamamen kapatıp yeniden başlatın
- `mcp.json` dosyasının doğru konumda olduğundan emin olun
- API key'in doğru olduğunu kontrol edin

### Product Bulunamıyor
- App Store Connect'te product'ların oluşturulduğundan emin olun
- Product ID'lerin tam olarak eşleştiğinden emin olun
- RevenueCat'in App Store Connect'e bağlı olduğunu kontrol edin

### Offering Bulunamıyor
- Offering'in "default" olarak işaretlendiğinden emin olun
- Packages'ların offering'e eklendiğinden emin olun

## Sonraki Adımlar

1. ✅ MCP yapılandırması tamamlandı
2. ⏳ Cursor'ı yeniden başlatın
3. ⏳ MCP komutlarını çalıştırın
4. ⏳ iOS API Key'i ekleyin
5. ⏳ App Store Connect'te products oluşturun
6. ⏳ Test edin

