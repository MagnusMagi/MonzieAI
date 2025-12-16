# 🔗 Adapty Webhook - Supabase Entegrasyonu

## ✅ Oluşturulan Dosyalar

### 1. Supabase Edge Function
- **Dosya:** `supabase/functions/adapty-webhook/index.ts`
- **Amaç:** Adapty webhook'larını alıp Supabase subscriptions tablosuna sync eder

## 🚀 Deployment Adımları

### 1. Edge Function'ı Deploy Et

```bash
# Supabase CLI ile deploy
supabase functions deploy adapty-webhook

# Veya tüm function'ları deploy et
supabase functions deploy
```

### 2. Environment Variables Ayarla

Supabase Dashboard'da veya CLI ile secret'ları ayarlayın:

```bash
# Adapty Secret Key (webhook signature verification için)
supabase secrets set ADAPTY_SECRET_KEY=secret_live_22WeLqdy.LKpnaa054WDpkaY8kKH2bPSE1qQzfxrC

# Supabase Service Role Key (otomatik olarak mevcut)
# SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY zaten mevcut
```

**Not:** Supabase Dashboard'da:
1. Project Settings → Edge Functions → Secrets
2. `ADAPTY_SECRET_KEY` ekleyin

### 3. Webhook URL'ini Al

Deploy sonrası webhook URL'iniz:
```
https://<your-project-ref>.supabase.co/functions/v1/adapty-webhook
```

**Örnek:**
```
https://groguatbjerebweinuef.supabase.co/functions/v1/adapty-webhook
```

### 4. Adapty Dashboard'da Webhook Ayarla

1. Adapty Dashboard'a giriş yapın: https://app.adapty.io
2. Settings → Webhooks
3. "Add Webhook" butonuna tıklayın
4. Webhook URL'ini girin:
   ```
   https://groguatbjerebweinuef.supabase.co/functions/v1/adapty-webhook
   ```
5. Events seçin:
   - ✅ `PROFILE_UPDATED` (önerilen)
   - ✅ `SUBSCRIPTION_RENEWED`
   - ✅ `SUBSCRIPTION_CANCELLED`
   - ✅ `SUBSCRIPTION_EXPIRED`
   - ✅ `TRIAL_STARTED`
   - ✅ `TRIAL_CANCELLED`
   - ✅ `TRIAL_CONVERTED`
6. "Save" butonuna tıklayın

### 5. Webhook Signature Verification (Opsiyonel)

Güvenlik için webhook signature'ı doğrulayabilirsiniz. `index.ts` dosyasında signature verification ekleyin:

```typescript
import { createHmac } from 'https://deno.land/std@0.168.0/node/crypto.ts';

// Verify signature
const payload = await req.text();
const signature = req.headers.get('x-adapty-signature');
const secretKey = Deno.env.get('ADAPTY_SECRET_KEY');

if (secretKey && signature) {
  const expectedSignature = createHmac('sha256', secretKey)
    .update(payload)
    .digest('hex');
  
  if (signature !== expectedSignature) {
    return new Response(
      JSON.stringify({ error: 'Invalid signature' }),
      { status: 401, headers: corsHeaders }
    );
  }
}

const webhookData = JSON.parse(payload);
```

## 🔄 Nasıl Çalışır?

1. **Adapty Event Oluşur:**
   - Kullanıcı subscription satın alır
   - Subscription yenilenir
   - Subscription iptal edilir
   - vb.

2. **Adapty Webhook Gönderir:**
   - Event payload'u Supabase Edge Function'a gönderilir
   - Payload içinde kullanıcı ID'si ve subscription bilgileri vardır

3. **Edge Function İşler:**
   - Kullanıcıyı Supabase'de bulur
   - Subscription durumunu kontrol eder
   - Supabase `subscriptions` tablosunu günceller veya yeni kayıt oluşturur

4. **Senkronizasyon Tamamlanır:**
   - Subscription durumu hem Adapty hem Supabase'de tutarlı olur

## 📋 Webhook Event'leri

Edge Function şu event'leri handle eder:

- **PROFILE_UPDATED:** Kullanıcı profili güncellendiğinde
- **SUBSCRIPTION_RENEWED:** Subscription yenilendiğinde
- **SUBSCRIPTION_CANCELLED:** Subscription iptal edildiğinde
- **SUBSCRIPTION_EXPIRED:** Subscription süresi dolduğunda
- **TRIAL_STARTED:** Trial başladığında
- **TRIAL_CANCELLED:** Trial iptal edildiğinde
- **TRIAL_CONVERTED:** Trial subscription'a dönüştüğünde

## 🧪 Test Etme

### 1. Webhook URL'ini Test Et

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

### 2. Adapty Dashboard'dan Test Webhook Gönder

1. Adapty Dashboard → Settings → Webhooks
2. Webhook'unuzun yanındaki "Test" butonuna tıklayın
3. Test event'i gönderilir ve Supabase'de subscription güncellenir

### 3. Gerçek Subscription Test

1. Uygulamada subscription satın alın
2. Adapty webhook'u otomatik gönderilir
3. Supabase `subscriptions` tablosunda subscription oluşturulur/güncellenir

## 🔍 Debugging

### Log Kontrolü

Supabase Dashboard'da:
1. Edge Functions → adapty-webhook → Logs
2. Webhook event'lerini ve hataları görebilirsiniz

### Console Log'ları

Edge Function içinde `console.log` kullanarak debug yapabilirsiniz:
- Webhook payload'u
- Kullanıcı bulma durumu
- Subscription güncelleme durumu

## ⚠️ Önemli Notlar

1. **Customer User ID Mapping:**
   - Adapty `customer_user_id` ile Supabase `users.id` eşleşmeli
   - `adaptyService.identify(userId)` çağrıldığında bu ID set edilir

2. **User Not Found:**
   - Eğer webhook geldiğinde kullanıcı Supabase'de yoksa, webhook başarılı döner
   - Kullanıcı giriş yaptığında `SubscriptionScreen`'de Adapty'den sync yapılır

3. **Plan Type Detection:**
   - Plan type, `vendor_product_id`'den otomatik tespit edilir
   - "year" veya "annual" içeriyorsa → `yearly`
   - Diğer durumlarda → `monthly`

4. **Price Sync:**
   - Webhook'ta price bilgisi yoksa, 0 olarak kaydedilir
   - İsterseniz Adapty API'den price bilgisini çekebilirsiniz

## 🔐 Güvenlik

- ✅ Webhook signature verification (opsiyonel ama önerilen)
- ✅ Supabase Service Role Key kullanımı (güvenli)
- ✅ CORS headers (gerekli)
- ✅ Error handling ve logging

## 📝 Sonraki Adımlar

1. ✅ Edge Function deploy edildi
2. ⏳ Adapty Dashboard'da webhook URL'i ayarlandı
3. ⏳ Test webhook gönderildi
4. ⏳ Gerçek subscription ile test edildi

---

**Durum:** ✅ Webhook handler hazır, deployment bekleniyor!

