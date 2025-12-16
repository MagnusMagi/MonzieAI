# 🚀 Adapty Webhook - Hızlı Setup Rehberi

## 📋 Kopyala-Yapıştır Bilgileri

### 1. Secret Key (Supabase Dashboard)

**Key:**
```
ADAPTY_SECRET_KEY
```

**Value:**
```
secret_live_22WeLqdy.LKpnaa054WDpkaY8kKH2bPSE1qQzfxrC
```

**Nerede:** Supabase Dashboard → Project Settings → Edge Functions → Secrets

---

### 2. Webhook URL (Adapty Dashboard)

**Webhook URL:**
```
https://groguatbjerebweinuef.supabase.co/functions/v1/adapty-webhook
```

**Nerede:** Adapty Dashboard → Settings → Webhooks

---

## ✅ Adım Adım

### Adım 1: Secret Key Ekle (2 dakika)

1. https://supabase.com/dashboard → Projenizi seçin
2. **Project Settings** → **Edge Functions** → **Secrets**
3. **"Add Secret"** butonuna tıklayın
4. **Key:** `ADAPTY_SECRET_KEY`
5. **Value:** `secret_live_22WeLqdy.LKpnaa054WDpkaY8kKH2bPSE1qQzfxrC`
6. **"Save"** butonuna tıklayın

✅ **Kontrol:** Secret listesinde `ADAPTY_SECRET_KEY` görünüyor mu?

---

### Adım 2: Webhook URL Ekle (3 dakika)

1. https://app.adapty.io → Giriş yapın
2. **Settings** → **Webhooks**
3. **"Add Webhook"** butonuna tıklayın
4. **Webhook URL:** `https://groguatbjerebweinuef.supabase.co/functions/v1/adapty-webhook`
5. **Events seçin:**
   - ✅ `PROFILE_UPDATED` (önerilen)
   - ✅ `SUBSCRIPTION_RENEWED`
   - ✅ `SUBSCRIPTION_CANCELLED`
   - ✅ `SUBSCRIPTION_EXPIRED`
6. **"Save"** butonuna tıklayın

✅ **Kontrol:** Webhook listesinde URL'iniz görünüyor mu?

---

### Adım 3: Test Et (2 dakika)

#### Seçenek 1: Adapty Dashboard'dan
1. Adapty Dashboard → Settings → Webhooks
2. Webhook'unuzun yanındaki **"Test"** butonuna tıklayın
3. Test event'i gönderilir

#### Seçenek 2: cURL ile
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

✅ **Kontrol:** Supabase Dashboard → Edge Functions → adapty-webhook → Logs → Webhook log'ları görünüyor mu?

---

## 📝 Checklist

- [ ] Secret key eklendi (Supabase Dashboard)
- [ ] Webhook URL eklendi (Adapty Dashboard)
- [ ] Events seçildi (PROFILE_UPDATED, vb.)
- [ ] Test webhook gönderildi
- [ ] Log'lar kontrol edildi

---

## 🔗 Hızlı Linkler

- **Supabase Dashboard:** https://supabase.com/dashboard
- **Adapty Dashboard:** https://app.adapty.io
- **Webhook URL:** https://groguatbjerebweinuef.supabase.co/functions/v1/adapty-webhook

---

**Toplam Süre:** ~7 dakika

