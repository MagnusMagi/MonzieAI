# 🔗 Adapty Webhook - Tam URL ve Ekleme Rehberi

## 📋 Webhook URL (Kopyala-Yapıştır)

```
https://groguatbjerebweinuef.supabase.co/functions/v1/adapty-webhook
```

---

## 🎯 Adapty Dashboard'dan Ekleme (DOĞRU YOL)

Web search sonuçlarına göre, webhook'lar **"Integrations"** sekmesinde!

### Adım Adım:

1. **Adapty Dashboard'a giriş yapın:**
   - URL: https://app.adapty.io
   - Email ve şifre ile giriş yapın

2. **Integrations sayfasına gidin:**
   - Sol menüden **"Integrations"** tıklayın
   - **"Webhook"** seçeneğini bulun ve tıklayın
   - Veya direkt: https://app.adapty.io/integrations/webhook

3. **Webhook entegrasyonunu etkinleştirin:**
   - Entegrasyonu etkinleştirmek için toggle'ı **AÇIN**

4. **Webhook URL'ini girin:**
   - **Production endpoint URL:** alanına şunu yapıştırın:
     ```
     https://groguatbjerebweinuef.supabase.co/functions/v1/adapty-webhook
     ```
   - **Authorization header value for production endpoint:** (boş bırakabilirsiniz - function public olacak)

5. **Olayları seçin:**
   - Almak istediğiniz olayları seçin:
     - ✅ `PROFILE_UPDATED`
     - ✅ `SUBSCRIPTION_RENEWED`
     - ✅ `SUBSCRIPTION_CANCELLED`
     - ✅ `SUBSCRIPTION_EXPIRED`

6. **Kaydedin:**
   - **"Save"** butonuna tıklayın

---

## ⚠️ ÖNEMLİ: Function'ı Public Yapın!

Webhook çalışması için Supabase Edge Function'ı public yapmanız gerekiyor:

### Supabase Dashboard'dan:

1. **Supabase Dashboard:** https://supabase.com/dashboard
2. **Edge Functions** → **adapty-webhook**
3. **Settings** veya function detay sayfasında
4. **"Verify JWT"** seçeneğini **KAPATIN** (false)
5. **Save**

**Alternatif:** Function'ın **"Public"** olarak işaretlendiğinden emin olun.

---

## 🔄 Adapty API (Denenen Endpoint'ler - Hepsi 404)

Adapty API'de webhook endpoint'i bulunamadı. Tüm denenen endpoint'ler 404 verdi:

- ❌ `POST /api/v1/webhooks/` → 404
- ❌ `POST /api/v1/webhooks` → 404
- ❌ `POST /v1/webhooks` → 404
- ❌ `POST /api/v2/webhooks` → 404

**Sonuç:** Webhook'lar sadece Dashboard üzerinden eklenebilir (API desteği yok).

---

## 📝 Özet

### Webhook URL:
```
https://groguatbjerebweinuef.supabase.co/functions/v1/adapty-webhook
```

### Dashboard Yolu:
- **Settings → Webhooks** (eski yol - çalışmıyor olabilir)
- **Integrations → Webhook** (yeni yol - burayı deneyin!)

### Events:
- `PROFILE_UPDATED`
- `SUBSCRIPTION_RENEWED`
- `SUBSCRIPTION_CANCELLED`
- `SUBSCRIPTION_EXPIRED`

---

## ✅ Checklist

- [ ] Supabase Dashboard'dan function public yapıldı (verify_jwt: false)
- [ ] Adapty Dashboard → Integrations → Webhook'a gidildi
- [ ] Webhook URL eklendi
- [ ] Events seçildi
- [ ] Save butonuna tıklandı
- [ ] Test webhook gönderildi

---

**Durum:** URL hazır, Integrations → Webhook yolunu deneyin! ✅

