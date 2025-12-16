# ✅ Adapty Webhook - Deployment Tamamlandı

## 🎉 Başarıyla Deploy Edildi!

Edge Function başarıyla Supabase'e deploy edildi:
- **Function Name:** `adapty-webhook`
- **Status:** `ACTIVE`
- **Version:** 1
- **Function ID:** `d13ac0f7-5630-480f-b004-82797298f08f`

## 🔗 Webhook URL

```
https://groguatbjerebweinuef.supabase.co/functions/v1/adapty-webhook
```

## ⚙️ Sonraki Adımlar

### 1. Secret Key Ayarlama (Önemli!)

Supabase Dashboard'da secret'ı ayarlayın:

**Key:** `ADAPTY_SECRET_KEY`  
**Value:** `secret_live_22WeLqdy.LKpnaa054WDpkaY8kKH2bPSE1qQzfxrC`

1. Supabase Dashboard'a gidin: https://supabase.com/dashboard
2. Project Settings → Edge Functions → Secrets
3. Yeni secret ekleyin:
   - **Key:** `ADAPTY_SECRET_KEY`
   - **Value:** `secret_live_22WeLqdy.LKpnaa054WDpkaY8kKH2bPSE1qQzfxrC`

**Alternatif (CLI ile):**
```bash
supabase secrets set ADAPTY_SECRET_KEY=secret_live_22WeLqdy.LKpnaa054WDpkaY8kKH2bPSE1qQzfxrC
```

### 2. Adapty Dashboard'da Webhook Ayarlama

**Webhook URL:** `https://groguatbjerebweinuef.supabase.co/functions/v1/adapty-webhook`

1. Adapty Dashboard'a gidin: https://app.adapty.io
2. Settings → Webhooks
3. "Add Webhook" butonuna tıklayın
4. Webhook URL'ini girin:
   ```
   https://groguatbjerebweinuef.supabase.co/functions/v1/adapty-webhook
   ```
5. Events seçin:
   - ✅ `PROFILE_UPDATED` (önerilen - tüm subscription değişikliklerini kapsar)
   - ✅ `SUBSCRIPTION_RENEWED`
   - ✅ `SUBSCRIPTION_CANCELLED`
   - ✅ `SUBSCRIPTION_EXPIRED`
   - ✅ `TRIAL_STARTED`
   - ✅ `TRIAL_CANCELLED`
   - ✅ `TRIAL_CONVERTED`
6. "Save" butonuna tıklayın

### 3. Test Etme

#### Test 1: Webhook URL Test
```bash
curl -X POST https://groguatbjerebweinuef.supabase.co/functions/v1/adapty-webhook \
  -H "Content-Type: application/json" \
  -H "x-adapty-signature: test" \
  -d '{
    "event": "PROFILE_UPDATED",
    "profile": {
      "profile_id": "test-profile-id",
      "customer_user_id": "test-user-id",
      "subscriptions": {
        "premium": {
          "is_active": true,
          "vendor_product_id": "monthly",
          "expires_at": "2024-12-31T23:59:59Z"
        }
      }
    }
  }'
```

#### Test 2: Adapty Dashboard'dan Test
1. Adapty Dashboard → Settings → Webhooks
2. Webhook'unuzun yanındaki "Test" butonuna tıklayın
3. Test event'i gönderilir ve Supabase'de subscription güncellenir

#### Test 3: Gerçek Subscription Test
1. Uygulamada subscription satın alın
2. Adapty webhook'u otomatik gönderilir
3. Supabase `subscriptions` tablosunda subscription oluşturulur/güncellenir

## 🔍 Log Kontrolü

Supabase Dashboard'da log'ları kontrol edin:
1. Edge Functions → adapty-webhook → Logs
2. Webhook event'lerini ve hataları görebilirsiniz

## 📋 Webhook Event'leri

Edge Function şu event'leri handle eder:

- **PROFILE_UPDATED:** Kullanıcı profili güncellendiğinde (önerilen - tüm değişiklikleri kapsar)
- **SUBSCRIPTION_RENEWED:** Subscription yenilendiğinde
- **SUBSCRIPTION_CANCELLED:** Subscription iptal edildiğinde
- **SUBSCRIPTION_EXPIRED:** Subscription süresi dolduğunda
- **TRIAL_STARTED:** Trial başladığında
- **TRIAL_CANCELLED:** Trial iptal edildiğinde
- **TRIAL_CONVERTED:** Trial subscription'a dönüştüğünde

## ⚠️ Önemli Notlar

1. **Customer User ID Mapping:**
   - Adapty `customer_user_id` ile Supabase `users.id` eşleşmeli
   - `adaptyService.identify(userId)` çağrıldığında bu ID set edilir
   - SplashScreen'de ve sign-in sonrası otomatik çağrılıyor ✅

2. **User Not Found:**
   - Eğer webhook geldiğinde kullanıcı Supabase'de yoksa, webhook başarılı döner (200)
   - Kullanıcı giriş yaptığında `SubscriptionScreen`'de Adapty'den sync yapılır

3. **Plan Type Detection:**
   - Plan type, `vendor_product_id`'den otomatik tespit edilir
   - "year" veya "annual" içeriyorsa → `yearly`
   - Diğer durumlarda → `monthly`

4. **Price Sync:**
   - Webhook'ta price bilgisi yoksa, 0 olarak kaydedilir
   - İsterseniz Adapty API'den price bilgisini çekebilirsiniz

## 🔐 Güvenlik

- ✅ Webhook signature verification (opsiyonel - şu an warning log'lanıyor)
- ✅ Supabase Service Role Key kullanımı (güvenli)
- ✅ CORS headers (gerekli)
- ✅ Error handling ve logging

## 📝 Deployment Özeti

- ✅ Edge Function deploy edildi
- ⏳ Secret key ayarlanmalı (Supabase Dashboard)
- ⏳ Adapty Dashboard'da webhook URL'i ayarlanmalı
- ⏳ Test webhook gönderilmeli

---

**Durum:** ✅ Edge Function deploy edildi, secret ve webhook ayarları bekleniyor!

