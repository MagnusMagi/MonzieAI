# 🔗 Adapty Webhook - Tam URL ve Bilgiler

## 📋 Kopyala-Yapıştır URL

### Webhook URL:
```
https://groguatbjerebweinuef.supabase.co/functions/v1/adapty-webhook
```

---

## 🔧 Adapty Dashboard'dan Ekleme

### Tam Adımlar:

1. **Adapty Dashboard'a giriş yapın:**
   - URL: https://app.adapty.io
   - Email ve şifre ile giriş yapın

2. **Webhook sayfasına gidin:**
   - Sol menüden **"Settings"** tıklayın
   - **"Webhooks"** sekmesine tıklayın
   - Veya direkt: https://app.adapty.io/settings/webhooks

3. **Webhook ekleyin:**
   - **"Add Webhook"** veya **"Create Webhook"** butonuna tıklayın
   - **Webhook URL** alanına şunu yapıştırın:
     ```
     https://groguatbjerebweinuef.supabase.co/functions/v1/adapty-webhook
     ```
   - **Events** seçin (en azından):
     - ✅ `PROFILE_UPDATED`
     - ✅ `SUBSCRIPTION_RENEWED`
     - ✅ `SUBSCRIPTION_CANCELLED`
     - ✅ `SUBSCRIPTION_EXPIRED`
   - **"Save"** veya **"Create"** butonuna tıklayın

---

## 🔄 Adapty API ile Ekleme (Alternatif Endpoint'ler)

### Denenecek Endpoint'ler:

#### 1. Standard API Endpoint:
```bash
curl -X POST https://api.adapty.io/api/v1/webhooks/ \
  -H "Authorization: Api-Key secret_live_22WeLqdy.LKpnaa054WDpkaY8kKH2bPSE1qQzfxrC" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://groguatbjerebweinuef.supabase.co/functions/v1/adapty-webhook",
    "is_active": true,
    "events": ["PROFILE_UPDATED", "SUBSCRIPTION_RENEWED", "SUBSCRIPTION_CANCELLED", "SUBSCRIPTION_EXPIRED"]
  }'
```

#### 2. Alternative Endpoint (v1):
```bash
curl -X POST https://api.adapty.io/v1/webhooks \
  -H "Authorization: Api-Key secret_live_22WeLqdy.LKpnaa054WDpkaY8kKH2bPSE1qQzfxrC" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://groguatbjerebweinuef.supabase.co/functions/v1/adapty-webhook",
    "is_active": true,
    "event_types": ["PROFILE_UPDATED", "SUBSCRIPTION_RENEWED", "SUBSCRIPTION_CANCELLED", "SUBSCRIPTION_EXPIRED"]
  }'
```

#### 3. GraphQL Endpoint (Eğer varsa):
```bash
curl -X POST https://api.adapty.io/graphql \
  -H "Authorization: Api-Key secret_live_22WeLqdy.LKpnaa054WDpkaY8kKH2bPSE1qQzfxrC" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { createWebhook(url: \"https://groguatbjerebweinuef.supabase.co/functions/v1/adapty-webhook\", events: [PROFILE_UPDATED, SUBSCRIPTION_RENEWED]) { id } }"
  }'
```

---

## 📝 Webhook Bilgileri

**URL:**
```
https://groguatbjerebweinuef.supabase.co/functions/v1/adapty-webhook
```

**Events:**
- `PROFILE_UPDATED`
- `SUBSCRIPTION_RENEWED`
- `SUBSCRIPTION_CANCELLED`
- `SUBSCRIPTION_EXPIRED`

**Method:** POST

**Content-Type:** application/json

---

## ⚠️ Önemli Not

Function şu anda `verify_jwt: true` (public değil). Önce Supabase Dashboard'dan public yapın:

1. Supabase Dashboard → Edge Functions → adapty-webhook
2. Settings → Verify JWT → KAPAT
3. Save

Sonra Adapty Dashboard'dan veya API'den webhook ekleyin.

---

**Durum:** URL hazır, function public yapılmalı ⏳

