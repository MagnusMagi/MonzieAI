# 🔄 Sandbox Tester Alternatif Çözümler

## ❌ Sorun: "The page you're looking for can't be found"

Bu hata genellikle şu nedenlerle oluşur:
1. Hesap yetkisi yeterli değil
2. Sandbox Tester özelliği hesap tipinizde aktif değil
3. App Store Connect'in yeni arayüzünde farklı konumda

---

## ✅ Çözüm 1: Sandbox Tester Olmadan Test (Önerilen)

Adapty entegrasyonunu **gerçek satın alma yapmadan** test edebilirsiniz:

### Test Edilebilir Özellikler
- ✅ Paywall'ları listeleme
- ✅ Products'ları listeleme
- ✅ Profile bilgilerini görüntüleme
- ✅ Premium status kontrolü
- ✅ Adapty SDK fonksiyonları

### Test Edilemeyen Özellikler
- ❌ Gerçek satın alma akışı
- ❌ Subscription aktivasyonu

**Not:** Bu testler Adapty entegrasyonunun çalıştığını doğrulamak için yeterlidir.

---

## ✅ Çözüm 2: TestFlight ile Test

TestFlight kullanarak uygulamanızı test edebilirsiniz:

### Adımlar
1. **App Store Connect** → **TestFlight** sekmesine gidin
2. Build'inizi TestFlight'a yükleyin
3. Test kullanıcılarınızı ekleyin (zaten 2 test kullanıcınız var)
4. TestFlight üzerinden uygulamayı test edin

### Avantajlar
- Gerçek cihazlarda test
- Test kullanıcıları zaten mevcut
- Adapty entegrasyonunu test edebilirsiniz

---

## ✅ Çözüm 3: Hesap Yetkisi Kontrolü

### Gerekli Roller
- **Account Holder** (Hesap Sahibi)
- **Admin**
- **App Manager**

### Kontrol
1. **Users and Access** → **Users** sekmesine gidin
2. Kendi hesabınızı bulun
3. Rolünüzü kontrol edin
4. Gerekirse hesap sahibinden yetki isteyin

---

## ✅ Çözüm 4: Farklı URL'ler Deneyin

### URL 1: Sandbox Testers
```
https://appstoreconnect.apple.com/access/testers
```

### URL 2: Users and Access
```
https://appstoreconnect.apple.com/access/users
```

### URL 3: App Store Connect Ana Sayfa
```
https://appstoreconnect.apple.com/
```
Sonra: Sol üst kilit simgesi → Sandbox → Testers

---

## 🎯 Önerilen Yaklaşım

### 1. AdaptyTestScreen'de Test (Şimdi Yapılabilir)

Uygulamanızda zaten AdaptyTestScreen var. Bu ekranda test edebilirsiniz:

```typescript
// Test edilebilir özellikler:
- Initialize Adapty ✅
- Identify User ✅
- Check Premium Status ✅
- Get Profile ✅
- Get Paywalls ✅
- Get Paywall Products ✅
- Get Products ✅
```

### 2. PaywallScreen'de Test

PaywallScreen'de products otomatik yüklenir:
- Paywall'lar listelenir
- Products görüntülenir
- UI test edilebilir

### 3. Production'da Test

Production'a çıktığınızda:
- Gerçek kullanıcılar test edebilir
- Sandbox Tester gerekmez
- Gerçek satın almalar yapılabilir

---

## 📋 Test Senaryoları (Sandbox Tester Olmadan)

### Senaryo 1: Paywall'ları Listeleme
```typescript
const paywalls = await adaptyService.getPaywalls();
// Beklenen: En az 1 paywall
```

### Senaryo 2: Products'ları Listeleme
```typescript
const paywalls = await adaptyService.getPaywalls();
const products = await adaptyService.getPaywallProducts(paywalls[0].id);
// Beklenen: com.someplanets.monzieaiv2.monthly product'ı
```

### Senaryo 3: Profile Bilgileri
```typescript
const profile = await adaptyService.getProfile();
// Beklenen: Profile objesi (subscription olmasa bile)
```

### Senaryo 4: Premium Status
```typescript
const isPremium = await adaptyService.isPremium();
// Beklenen: false (subscription yok)
```

---

## ⚠️ Önemli Notlar

### Sandbox Tester Gerekli mi?
- **Test için**: Hayır, Adapty entegrasyonunu test etmek için gerekli değil
- **Satın alma testi için**: Evet, gerçek satın alma testi yapmak için gerekli

### Production'da
- Sandbox Tester gerekmez
- Gerçek kullanıcılar satın alma yapabilir
- Adapty otomatik olarak production satın almaları handle eder

---

## 🎉 Sonuç

**Sandbox Tester bulamıyorsanız:**
1. ✅ Adapty entegrasyonunu test edebilirsiniz (AdaptyTestScreen)
2. ✅ Paywall'ları ve products'ları test edebilirsiniz
3. ✅ UI'ı test edebilirsiniz
4. ✅ Production'da gerçek test yapabilirsiniz

**Sandbox Tester sadece gerekiyorsa:**
- Gerçek satın alma akışını test etmek için
- Production'a çıkmadan önce satın alma testi yapmak için

---

**Durum:** Sandbox Tester sayfasına erişemiyorsanız, Adapty entegrasyonunu zaten test edebilirsiniz. Gerçek satın alma testi için production'a çıktığınızda test edebilirsiniz.

