# 🔓 Adapty Webhook - Public Function Ayarlama

## ⚠️ Sorun: Authorization Header Gerekli

Supabase Edge Functions varsayılan olarak JWT doğrulaması yapıyor. Adapty webhook'ları authorization header göndermediği için, function'ı **public** yapmamız gerekiyor.

---

## ✅ Çözüm: Supabase Dashboard'dan Public Yapma

### Adım 1: Supabase Dashboard'a Giriş
1. https://supabase.com/dashboard
2. Projenizi seçin

### Adım 2: Edge Functions Sayfası
1. Sol menüden **"Edge Functions"** tıklayın
2. **"adapty-webhook"** function'ını bulun
3. Function'a tıklayın

### Adım 3: Function Ayarları
1. **"Settings"** veya **"Configuration"** sekmesine gidin
2. **"Verify JWT"** veya **"Require Authorization"** seçeneğini **KAPATIN** (false)
3. **"Save"** butonuna tıklayın

**Alternatif:** Function'ın **"Public"** olarak işaretlendiğinden emin olun.

---

## 🧪 Test

Function public yapıldıktan sonra:

```bash
# GET test (Adapty doğrulama)
curl -X GET https://groguatbjerebweinuef.supabase.co/functions/v1/adapty-webhook

# POST test (Webhook event)
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

**Beklenen Yanıt:**
- GET: `{"status":"ok","message":"Webhook endpoint is active"}`
- POST: `{"success":true,"message":"Webhook processed successfully",...}`

---

## 📋 Alternatif: Function'ı Public Yapma (CLI)

Eğer Supabase CLI kullanıyorsanız:

```bash
# Function'ı public yap (JWT doğrulamasını kapat)
supabase functions update adapty-webhook --no-verify-jwt
```

---

## ⚠️ Güvenlik Notu

Function public yapıldığında:
- ✅ Adapty webhook'ları çalışır
- ⚠️ Herkes function'a erişebilir
- ✅ Webhook signature verification ile güvenlik sağlanır (kod içinde)

**Öneri:** Webhook signature verification'ı aktif tutun (kod içinde zaten var).

---

## 🔍 Kontrol

Function public yapıldıktan sonra:

1. **GET test:** `200 OK` döndürmeli
2. **POST test:** `200 OK` döndürmeli (user not found olsa bile)
3. **Adapty Dashboard:** Webhook eklenebilmeli

---

**Durum:** Function deploy edildi, public yapılması gerekiyor ⏳

