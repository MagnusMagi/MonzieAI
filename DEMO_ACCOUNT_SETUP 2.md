# 🎭 Demo Account Setup - App Store Review

## 📋 Demo Account Bilgileri

### Ana Demo Account
```
Email: demo@monzieai.com
Password: Demo123!
```

### Alternatif Demo Accounts (Gerektiğinde)
```
Email: reviewer@monzieai.com
Password: Review123!

Email: test@monzieai.com
Password: Test123!
```

---

## 🔧 Demo Account Oluşturma

### Supabase Auth Üzerinden Oluşturma

Demo account'ları Supabase Dashboard'dan manuel olarak oluşturabilirsiniz:

1. **Supabase Dashboard** → **Authentication** → **Users**
2. **Add user** butonuna tıklayın
3. Aşağıdaki bilgileri girin:
   ```
   Email: demo@monzieai.com
   Password: Demo123!
   Auto confirm user: ✅ (İşaretleyin)
   ```
4. **Add user** butonuna tıklayın

### Veya SQL ile Oluşturma

```sql
-- Supabase SQL Editor'da çalıştırın
INSERT INTO auth.users (
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data
) VALUES (
  'demo@monzieai.com',
  crypt('Demo123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Demo User", "is_demo": true}'
);
```

---

## 📊 Demo Account İçin Hazırlık

### 1. Profil Bilgileri
Demo account için aşağıdaki profil bilgilerini hazırlayın:
- **Ad Soyad:** Demo User
- **Email:** demo@monzieai.com
- **Rol:** Demo Account

### 2. Örnek İçerik Hazırlığı
Demo account'ta aşağıdaki içerikler hazır olsun:

#### Örnek Görseller
- 3-5 adet favorilenmiş görsel
- Farklı kategorilerden (Nature, Portrait, Abstract, etc.)
- Hem kendi oluşturduğu hem başkalarının görselleri

#### Örnek Favoriler
- 5-10 adet favori görsel
- Çeşitli kategorilerden

#### Örnek Kullanım Geçmişi
- Son 7 gün içinde 10-15 adet görsel oluşturma
- Farklı prompt'lar kullanın

### 3. Premium Özellik Testi
Demo account'ta premium özellikler aktif olsun:
- Unlimited generations
- High-quality outputs
- Priority processing

---

## 🧪 Demo Account Test Senaryosu

### Temel Test Akışı
1. **Giriş Yap**
   - Email: demo@monzieai.com
   - Password: Demo123!

2. **Ana Ekran Kontrolü**
   - "Welcome to MonzieAI" mesajı
   - "Generate" butonu görünür
   - "Trending" section görünür

3. **Görsel Oluşturma**
   - "Generate" tab'ına git
   - Prompt gir: "a beautiful sunset over mountains"
   - Generate butonuna bas
   - 10-30 saniye bekle
   - Görsel oluşsun

4. **Görsel Kaydetme**
   - Oluşturulan görseli kaydet
   - Photo library'e kaydedildiğini kontrol et

5. **Galeri İnceleme**
   - Gallery tab'ına git
   - Kayıtlı görselleri gör
   - Favori ekle/çıkar

6. **Profil İnceleme**
   - Profile tab'ına git
   - Statistics görünür
   - Settings erişilebilir

7. **Privacy Settings**
   - Privacy Settings'e git
   - Account deletion seçeneği var
   - Privacy policy görünür

---

## 📝 App Store Review Notes Template

### App Store Connect'e Eklenecek Notlar

```
DEMO ACCOUNT CREDENTIALS:
Email: demo@monzieai.com
Password: Demo123!

APP FEATURES OVERVIEW:
1. AI-Powered Image Generation: Users can create unique images using text prompts
2. Photo Library Integration: Users can select existing photos for enhancement
3. Gallery Management: Users can save, favorite, and organize generated images
4. Personalization: App learns user preferences for better recommendations
5. Premium Features: Unlimited generations and high-quality outputs

TESTING INSTRUCTIONS:
1. Launch the app and sign in with the demo account credentials
2. Navigate to the "Generate" tab
3. Enter a descriptive prompt (e.g., "a beautiful sunset over mountains")
4. Tap the "Generate" button and wait 10-30 seconds for the AI to create the image
5. Save the generated image to the photo library
6. Explore the gallery to view saved images and trending content
7. Check profile statistics and privacy settings
8. Test account deletion functionality

IMPORTANT NOTES:
- The app requires internet connection for AI image generation
- Image generation may take 10-30 seconds depending on complexity
- Users can cancel generation at any time
- All features work in both online and offline modes (except generation)
- Premium features are available through in-app subscriptions

CONTACT INFORMATION:
For any issues during review, please contact: support@monzieai.com
```

---

## 🔍 Demo Account Verification

### Supabase Dashboard'dan Kontrol
1. **Authentication** → **Users**
2. Demo user'ın aktif olduğunu kontrol edin
3. Email confirmed olduğunu kontrol edin

### App İçinde Test
1. Demo account ile giriş yapın
2. Tüm temel özellikler çalışır durumda mı kontrol edin
3. Premium özellikler aktif mi kontrol edin

---

## 🚨 Önemli Notlar

### Demo Account Güvenliği
- **Production ortamında** demo account'u kullanın
- Review sonrası demo account'u **silin** veya devre dışı bırakın
- Demo account'ta **gerçek kullanıcı verisi** bulunmasın

### Review Süreci
- Demo account bilgileri **App Store Connect**'te "Review Notes" bölümüne ekleyin
- Review team'i bu bilgileri kullanarak app'i test eder
- Demo account olmadan review süreci **reddedilebilir**

### Alternatif Demo Accounts
- Ana demo account çalışmazsa, alternatif account'ları kullanın
- Tüm account'lar aynı özelliklere sahip olmalı

---

## 📞 Destek

**App Store Review Sorunları İçin:**
- Email: support@monzieai.com
- Konu: "App Store Review - Demo Account Issue"

**Teknik Destek:**
- Email: developer@monzieai.com
- Konu: "Demo Account Technical Support"

---

*Bu dokümantasyon App Store Review Guidelines'a uygun olarak hazırlanmıştır.*
