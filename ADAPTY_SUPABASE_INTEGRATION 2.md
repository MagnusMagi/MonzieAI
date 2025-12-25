# 🔗 Adapty - Supabase Entegrasyonu Tamamlandı

## ✅ Tamamlanan İşlemler

### 1. ✅ Adapty Webhook Handler
- **Dosya:** `supabase/functions/adapty-webhook/index.ts`
- **Amaç:** Adapty webhook'larını alıp Supabase subscriptions tablosuna otomatik sync eder

### 2. ✅ AdaptyService Güncellemesi
- `identify()` fonksiyonu webhook senkronizasyonu için not eklendi
- Customer User ID mapping açıklandı

## 🔄 Entegrasyon Akışı

### Subscription Purchase Flow:
1. **Kullanıcı Purchase Yapar:**
   - PaywallScreen'de Adapty üzerinden purchase
   - Adapty SDK purchase işlemini tamamlar

2. **Adapty Webhook Gönderir:**
   - Adapty, Supabase Edge Function'a webhook gönderir
   - Event: `PROFILE_UPDATED` veya `SUBSCRIPTION_RENEWED`
   - Payload içinde subscription bilgileri var

3. **Edge Function İşler:**
   - Kullanıcıyı Supabase'de bulur (`customer_user_id` → `users.id`)
   - Subscription durumunu kontrol eder
   - Supabase `subscriptions` tablosunu günceller

4. **Senkronizasyon Tamamlanır:**
   - Subscription hem Adapty hem Supabase'de tutarlı
   - Uygulama her iki kaynaktan da subscription durumunu okuyabilir

### Subscription Status Check Flow:
1. **SubscriptionScreen Açılır:**
   - Önce Adapty'den subscription durumu kontrol edilir
   - Eğer Adapty'de aktif subscription varsa:
     - Supabase'e sync edilir
     - SubscriptionScreen'de gösterilir
   - Eğer Adapty'de yoksa:
     - Supabase'den subscription okunur

## 📋 Deployment Checklist

### 1. Edge Function Deploy
```bash
supabase functions deploy adapty-webhook
```

### 2. Environment Variables
```bash
supabase secrets set ADAPTY_SECRET_KEY=secret_live_22WeLqdy.LKpnaa054WDpkaY8kKH2bPSE1qQzfxrC
```

### 3. Adapty Dashboard Webhook URL
```
https://groguatbjerebweinuef.supabase.co/functions/v1/adapty-webhook
```

### 4. Webhook Events
- ✅ PROFILE_UPDATED
- ✅ SUBSCRIPTION_RENEWED
- ✅ SUBSCRIPTION_CANCELLED
- ✅ SUBSCRIPTION_EXPIRED

## 🔍 Nasıl Çalışır?

### Customer User ID Mapping:
- Adapty'de `customer_user_id` = Supabase'de `users.id`
- `adaptyService.identify(userId)` çağrıldığında bu mapping oluşur
- Webhook geldiğinde `customer_user_id` ile kullanıcı bulunur

### Subscription Sync:
- Webhook geldiğinde:
  1. Kullanıcı bulunur
  2. Aktif subscription kontrol edilir
  3. Plan type tespit edilir (monthly/yearly)
  4. Supabase subscriptions tablosu güncellenir

### Fallback Mechanism:
- Adapty başarısız olursa → Supabase'den okunur
- Webhook gelmezse → SubscriptionScreen'de manuel sync yapılır
- Her iki kaynak da tutarlı tutulur

## 🧪 Test Senaryoları

### 1. Purchase Test
1. Uygulamada subscription satın al
2. Adapty webhook gönderilir
3. Supabase'de subscription oluşturulur
4. SubscriptionScreen'de görünür

### 2. Renewal Test
1. Subscription yenilenir
2. Adapty webhook gönderilir
3. Supabase'de subscription güncellenir
4. Expires date güncellenir

### 3. Cancellation Test
1. Subscription iptal edilir
2. Adapty webhook gönderilir
3. Supabase'de status → 'cancelled'
4. Expires date korunur

## 📝 Önemli Notlar

1. **User ID Mapping:**
   - `adaptyService.identify(userId)` mutlaka çağrılmalı
   - SplashScreen'de ve sign-in sonrası çağrılıyor ✅

2. **Webhook Reliability:**
   - Webhook gelmezse SubscriptionScreen'de manuel sync yapılır
   - Her iki kaynak da kontrol edilir

3. **Price Information:**
   - Webhook'ta price yoksa 0 olarak kaydedilir
   - İsterseniz Adapty API'den price çekilebilir

4. **Error Handling:**
   - Webhook başarısız olursa log'lanır
   - Kullanıcı deneyimi etkilenmez
   - SubscriptionScreen'de fallback var

## 🔗 İlgili Dosyalar

- `supabase/functions/adapty-webhook/index.ts` - Webhook handler
- `src/services/adaptyService.ts` - Adapty SDK wrapper
- `src/screens/PaywallScreen.tsx` - Purchase flow
- `src/screens/SubscriptionScreen.tsx` - Subscription display & sync
- `src/screens/SplashScreen.tsx` - Adapty initialization
- `src/contexts/AuthContext.tsx` - Adapty logout

## 📚 Dokümantasyon

- [Adapty Webhook Docs](https://docs.adapty.io/webhooks)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [ADAPTY_WEBHOOK_SETUP.md](./ADAPTY_WEBHOOK_SETUP.md) - Detaylı setup rehberi

---

**Durum:** ✅ Adapty-Supabase entegrasyonu tamamlandı, deployment bekleniyor!

