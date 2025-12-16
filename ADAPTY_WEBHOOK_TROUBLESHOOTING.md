# 🔧 Adapty Webhook Ekleme - Sorun Giderme

## ❌ Webhook URL Eklenemiyor

Eğer Adapty Dashboard'da webhook URL'i ekleyemiyorsanız, aşağıdaki çözümleri deneyin:

---

## 🔍 Sorun Tespiti

### 1. Adapty Dashboard Erişimi
- [ ] Adapty Dashboard'a giriş yaptınız mı? (https://app.adapty.io)
- [ ] Hesabınızda webhook ekleme yetkisi var mı?
- [ ] Adapty planınız webhook'ları destekliyor mu?

### 2. Webhook Sayfası
- [ ] Settings → Webhooks sayfasına erişebiliyor musunuz?
- [ ] "Add Webhook" butonu görünüyor mu?
- [ ] Sayfa yükleniyor mu?

### 3. Hata Mesajları
- [ ] Herhangi bir hata mesajı görüyor musunuz?
- [ ] Hata mesajı ne diyor?

---

## ✅ Çözümler

### Çözüm 1: Adapty Dashboard'da Webhook Ekleme (Detaylı)

1. **Adapty Dashboard'a Giriş:**
   - https://app.adapty.io
   - Email ve şifre ile giriş yapın

2. **Webhook Sayfasına Git:**
   - Sol menüden **"Settings"** tıklayın
   - **"Webhooks"** sekmesine tıklayın
   - Veya direkt: https://app.adapty.io/settings/webhooks

3. **Webhook Ekle:**
   - **"Add Webhook"** veya **"Create Webhook"** butonuna tıklayın
   - **Webhook URL** alanına şunu yapıştırın:
     ```
     https://groguatbjerebweinuef.supabase.co/functions/v1/adapty-webhook
     ```
   - **Events** seçin (en azından `PROFILE_UPDATED`)
   - **"Save"** veya **"Create"** butonuna tıklayın

### Çözüm 2: Adapty API ile Webhook Ekleme

Eğer Dashboard'da ekleyemiyorsanız, Adapty REST API kullanabilirsiniz:

```bash
curl -X POST https://api.adapty.io/api/v1/webhooks/ \
  -H "Authorization: Api-Key secret_live_22WeLqdy.LKpnaa054WDpkaY8kKH2bPSE1qQzfxrC" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://groguatbjerebweinuef.supabase.co/functions/v1/adapty-webhook",
    "events": [
      "PROFILE_UPDATED",
      "SUBSCRIPTION_RENEWED",
      "SUBSCRIPTION_CANCELLED",
      "SUBSCRIPTION_EXPIRED"
    ]
  }'
```

**Not:** API key'inizi kullanın: `secret_live_22WeLqdy.LKpnaa054WDpkaY8kKH2bPSE1qQzfxrC`

### Çözüm 3: Adapty Support ile İletişim

Eğer yukarıdaki çözümler işe yaramazsa:
1. Adapty Support'a ulaşın: support@adapty.io
2. Webhook ekleme sorunu olduğunu belirtin
3. Hesap bilgilerinizi paylaşın (güvenli bir şekilde)

---

## 🔄 Alternatif: Manuel Senkronizasyon

Eğer webhook eklenemiyorsa, subscription'ları manuel olarak senkronize edebilirsiniz:

### SubscriptionScreen'de Otomatik Sync

`SubscriptionScreen` zaten Adapty'den subscription durumunu kontrol ediyor ve Supabase'e sync ediyor. Bu yüzden:

1. **Webhook olmadan da çalışır:**
   - Kullanıcı SubscriptionScreen'i açtığında
   - Adapty'den subscription durumu kontrol edilir
   - Supabase'e otomatik sync edilir

2. **Sadece gerçek zamanlı değil:**
   - Webhook olmadan subscription değişiklikleri anında gelmez
   - Kullanıcı SubscriptionScreen'i açtığında sync olur

### Manuel Sync Fonksiyonu

İsterseniz bir "Sync" butonu ekleyebiliriz:

```typescript
// SubscriptionScreen'de
const handleSync = async () => {
  try {
    const isPremium = await adaptyService.isPremium();
    const activeSubscription = await adaptyService.getActiveSubscription();
    
    if (isPremium && activeSubscription) {
      // Supabase'e sync et
      await subscriptionRepository.createSubscription({
        userId: user.id,
        planType: activeSubscription.vendorProductId.includes('year') ? 'yearly' : 'monthly',
        price: 0,
        currency: 'USD',
        expiresAt: activeSubscription.expiresAt || new Date(),
      });
    }
  } catch (error) {
    // Handle error
  }
};
```

---

## 📋 Webhook Olmadan Çalışma Senaryosu

### Mevcut Durum:
- ✅ Adapty SDK entegrasyonu var
- ✅ SubscriptionScreen'de Adapty sync var
- ✅ Purchase flow Adapty üzerinden çalışıyor
- ⏳ Webhook eklenemedi (ama kritik değil)

### Nasıl Çalışır:
1. **Purchase:** Adapty SDK üzerinden yapılır → Supabase'e manuel sync
2. **Subscription Status:** SubscriptionScreen açıldığında Adapty'den kontrol edilir
3. **Sync:** Her SubscriptionScreen açılışında otomatik sync yapılır

### Dezavantajlar:
- ❌ Gerçek zamanlı değil (kullanıcı ekranı açana kadar sync olmaz)
- ❌ Background'da otomatik sync yok

### Avantajlar:
- ✅ Webhook olmadan da çalışır
- ✅ Kullanıcı deneyimi etkilenmez
- ✅ SubscriptionScreen her açıldığında sync olur

---

## 🎯 Öneri

**Kısa vadede:**
- Webhook eklenemiyorsa, mevcut sistem zaten çalışıyor
- SubscriptionScreen'de otomatik sync var
- Kullanıcı deneyimi etkilenmez

**Uzun vadede:**
- Adapty Support ile iletişime geçin
- Webhook ekleme sorununu çözün
- Gerçek zamanlı sync için webhook gerekli

---

## 📞 Destek

- **Adapty Support:** support@adapty.io
- **Adapty Docs:** https://docs.adapty.io/webhooks
- **Adapty API:** https://docs.adapty.io/api-reference

---

**Durum:** Webhook eklenemiyor, ancak mevcut sistem çalışıyor ✅

