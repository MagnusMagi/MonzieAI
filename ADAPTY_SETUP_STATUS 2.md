# 📊 Adapty Webhook Setup - Durum Raporu

## ✅ Tamamlanan Adımlar

### 1. ✅ Edge Function Deploy
- **Durum:** ✅ TAMAMLANDI
- **Function:** `adapty-webhook`
- **Status:** `ACTIVE`
- **URL:** `https://groguatbjerebweinuef.supabase.co/functions/v1/adapty-webhook`

---

## ⏳ Bekleyen Adımlar (Manuel)

### 1. ⏳ Secret Key Ayarlama
- **Durum:** ⏳ YAPILMADI
- **Nerede:** Supabase Dashboard
- **Key:** `ADAPTY_SECRET_KEY`
- **Value:** `secret_live_22WeLqdy.LKpnaa054WDpkaY8kKH2bPSE1qQzfxrC`
- **Nasıl:**
  1. https://supabase.com/dashboard → Projenizi seçin
  2. Project Settings → Edge Functions → Secrets
  3. "Add Secret" butonuna tıklayın
  4. **Key:** `ADAPTY_SECRET_KEY`
  5. **Value:** `secret_live_22WeLqdy.LKpnaa054WDpkaY8kKH2bPSE1qQzfxrC`
  6. "Save" butonuna tıklayın

**Alternatif (CLI):**
```bash
supabase secrets set ADAPTY_SECRET_KEY=secret_live_22WeLqdy.LKpnaa054WDpkaY8kKH2bPSE1qQzfxrC
```

**Kontrol:** Supabase Dashboard → Edge Functions → Secrets → `ADAPTY_SECRET_KEY` görünüyor mu?

---

### 2. ⏳ Adapty Dashboard'da Webhook Ayarlama
- **Durum:** ⏳ YAPILMADI
- **Nerede:** Adapty Dashboard
- **Webhook URL:** `https://groguatbjerebweinuef.supabase.co/functions/v1/adapty-webhook`
- **Nasıl:**
  1. https://app.adapty.io → Giriş yapın
  2. Settings → Webhooks
  3. "Add Webhook" butonuna tıklayın
  4. **Webhook URL:** `https://groguatbjerebweinuef.supabase.co/functions/v1/adapty-webhook`
  5. **Events seçin:**
     - ✅ `PROFILE_UPDATED` (önerilen - tüm değişiklikleri kapsar)
     - ✅ `SUBSCRIPTION_RENEWED`
     - ✅ `SUBSCRIPTION_CANCELLED`
     - ✅ `SUBSCRIPTION_EXPIRED`
  6. "Save" butonuna tıklayın

**Kontrol:** Adapty Dashboard → Settings → Webhooks → Webhook URL'iniz görünüyor mu?

---

### 3. ⏳ Test Webhook
- **Durum:** ⏳ YAPILMADI
- **Webhook URL:** `https://groguatbjerebweinuef.supabase.co/functions/v1/adapty-webhook`
- **Nasıl Test Edilir:**

#### Seçenek 1: Adapty Dashboard'dan Test
1. Adapty Dashboard → Settings → Webhooks
2. Webhook'unuzun yanındaki "Test" butonuna tıklayın
3. Test event'i gönderilir

#### Seçenek 2: cURL ile Test
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

#### Seçenek 3: Gerçek Subscription Test
1. Uygulamada subscription satın alın
2. Adapty otomatik webhook gönderir
3. Supabase `subscriptions` tablosunda subscription oluşur

**Kontrol:** Supabase Dashboard → Edge Functions → adapty-webhook → Logs → Webhook log'ları görünüyor mu?

---

## 🔍 Durum Kontrolü

### Secret Key Kontrolü
- [ ] Supabase Dashboard'da `ADAPTY_SECRET_KEY` secret'ı var mı?
- [ ] Secret value doğru mu?

### Webhook Kontrolü
- [ ] Adapty Dashboard'da webhook URL'i eklenmiş mi?
- [ ] Webhook events seçilmiş mi?
- [ ] Webhook aktif mi?

### Test Kontrolü
- [ ] Test webhook gönderildi mi?
- [ ] Supabase log'larında webhook görünüyor mu?
- [ ] Subscription oluşturuldu/güncellendi mi?

---

## 📝 Sonraki Adımlar

1. **Secret Key Ayarla** (5 dakika)
   - Supabase Dashboard → Edge Functions → Secrets
   - `ADAPTY_SECRET_KEY` ekle

2. **Webhook Ayarla** (5 dakika)
   - Adapty Dashboard → Settings → Webhooks
   - Webhook URL'i ekle

3. **Test Et** (2 dakika)
   - Adapty Dashboard'dan test webhook gönder
   - Supabase log'larını kontrol et

---

## ⚠️ Önemli Notlar

- Secret key olmadan webhook çalışır ama signature verification yapılamaz
- Webhook URL'i olmadan Adapty event'leri Supabase'e gelmez
- Test etmeden gerçek subscription'lar sync olmayabilir

---

**Son Güncelleme:** Şimdi
**Toplam Süre:** ~12 dakika (tüm adımlar için)

