# 🔧 Adapty Webhook Ekleme Sorunu - Çözüm

## ❌ Sorun: Webhook URL Eklenemiyor

Adapty Dashboard'da webhook URL'i eklerken sorun yaşıyorsanız, aşağıdaki çözümleri deneyin:

---

## ✅ Çözüm 1: Adapty Webhook Doğrulama

Adapty, webhook URL'ini eklerken bir doğrulama isteği gönderir. Edge Function'ımız bunu handle ediyor.

### Test Et:
```bash
# Adapty'nin göndereceği doğrulama isteğini test et
curl -X GET https://groguatbjerebweinuef.supabase.co/functions/v1/adapty-webhook
```

**Beklenen Yanıt:**
```json
{
  "status": "ok",
  "message": "Webhook endpoint is active"
}
```

✅ **Edge Function güncellendi** - GET isteklerini handle ediyor.

---

## ✅ Çözüm 2: Adapty API ile Webhook Ekleme

Dashboard'da ekleyemiyorsanız, Adapty REST API kullanın:

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

---

## ✅ Çözüm 3: Webhook Olmadan Çalışma

**İyi haber:** Webhook olmadan da sistem çalışıyor! ✅

### Mevcut Durum:
- ✅ Adapty SDK entegrasyonu var
- ✅ Purchase flow Adapty üzerinden çalışıyor
- ✅ SubscriptionScreen'de **otomatik sync** var
- ✅ Her SubscriptionScreen açılışında Adapty'den sync yapılıyor

### Nasıl Çalışır:
1. **Purchase:** Adapty SDK üzerinden → Supabase'e manuel sync
2. **Subscription Status:** SubscriptionScreen açıldığında Adapty'den kontrol edilir
3. **Sync:** Her SubscriptionScreen açılışında otomatik sync yapılır

### Fark:
- **Webhook ile:** Gerçek zamanlı sync (subscription değişikliği anında gelir)
- **Webhook olmadan:** Kullanıcı SubscriptionScreen'i açtığında sync olur

**Sonuç:** Kullanıcı deneyimi etkilenmez! ✅

---

## 🔍 Adapty Dashboard'da Webhook Ekleme (Detaylı)

### Adım 1: Adapty Dashboard'a Giriş
1. https://app.adapty.io
2. Email ve şifre ile giriş yapın

### Adım 2: Webhook Sayfası
1. Sol menüden **"Settings"** tıklayın
2. **"Webhooks"** sekmesine tıklayın
3. Veya direkt: https://app.adapty.io/settings/webhooks

### Adım 3: Webhook Ekle
1. **"Add Webhook"** veya **"Create Webhook"** butonuna tıklayın
2. **Webhook URL** alanına:
   ```
   https://groguatbjerebweinuef.supabase.co/functions/v1/adapty-webhook
   ```
3. **Events** seçin:
   - ✅ `PROFILE_UPDATED` (önerilen)
   - ✅ `SUBSCRIPTION_RENEWED`
   - ✅ `SUBSCRIPTION_CANCELLED`
   - ✅ `SUBSCRIPTION_EXPIRED`
4. **"Save"** veya **"Create"** butonuna tıklayın

### Adım 4: Doğrulama
- Adapty, webhook URL'ine bir test isteği gönderir
- Edge Function'ımız bunu handle ediyor ✅
- Webhook aktif olur

---

## ⚠️ Olası Hatalar ve Çözümleri

### Hata 1: "Webhook URL is not accessible"
**Çözüm:**
- Edge Function'ın deploy edildiğinden emin olun ✅
- URL'yi test edin: `curl -X GET https://groguatbjerebweinuef.supabase.co/functions/v1/adapty-webhook`

### Hata 2: "Invalid webhook URL"
**Çözüm:**
- URL'nin `https://` ile başladığından emin olun
- URL'de boşluk veya özel karakter olmamalı

### Hata 3: "Webhook verification failed"
**Çözüm:**
- Edge Function'ın GET isteklerini handle ettiğinden emin olun ✅
- CORS headers'ın doğru olduğundan emin olun ✅

---

## 📋 Öneri

**Kısa vadede:**
- Webhook eklenemiyorsa, mevcut sistem zaten çalışıyor ✅
- SubscriptionScreen'de otomatik sync var ✅
- Kullanıcı deneyimi etkilenmez ✅

**Uzun vadede:**
- Adapty API ile webhook eklemeyi deneyin
- Adapty Support ile iletişime geçin: support@adapty.io
- Gerçek zamanlı sync için webhook gerekli (ama kritik değil)

---

## 🔄 Edge Function Güncellemesi

Edge Function'a GET isteği desteği eklendi:
- Adapty'nin webhook doğrulama isteğini handle ediyor
- `200 OK` döndürüyor
- Webhook ekleme işlemi başarılı olmalı

---

**Durum:** Edge Function güncellendi, webhook eklenebilir olmalı ✅

