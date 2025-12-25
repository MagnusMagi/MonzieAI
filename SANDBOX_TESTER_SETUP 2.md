# 🧪 Sandbox Tester Setup - App Store Connect

## 📍 Sandbox Tester'ları Bulma

### Yöntem 1: App Store Connect Dashboard (Yeni Arayüz)

1. **App Store Connect**'e giriş yapın: https://appstoreconnect.apple.com/
2. Sol menüden **"Users and Access"** seçin
3. Üst menüden **"Sandbox Testers"** sekmesine tıklayın
   - Eğer göremiyorsanız, **"Testers"** veya **"Sandbox"** sekmesine bakın

### Yöntem 2: App Store Connect (Eski Arayüz)

1. **App Store Connect**'e giriş yapın
2. Sol menüden **"Users and Roles"** seçin
3. **"Sandbox Testers"** sekmesine tıklayın

### Yöntem 3: Doğrudan Link

Eğer yukarıdaki yöntemler işe yaramazsa, doğrudan şu linki deneyin:
- https://appstoreconnect.apple.com/access/testers

---

## ➕ Sandbox Tester Oluşturma

### Adım 1: Tester Ekle
1. **"Sandbox Testers"** sayfasında **"+"** veya **"Create Sandbox Tester"** butonuna tıklayın

### Adım 2: Bilgileri Doldur
- **First Name**: Test kullanıcısının adı
- **Last Name**: Test kullanıcısının soyadı
- **Email**: **Gerçek bir email adresi** (test için kullanılacak)
- **Password**: Güçlü bir şifre
- **Country/Region**: Test yapacağınız ülke

### Adım 3: Kaydet
- **"Create"** veya **"Save"** butonuna tıklayın

---

## ⚠️ Önemli Notlar

### Email Gereksinimleri
- Sandbox tester email'i **gerçek bir email adresi** olmalı
- Bu email **App Store Connect hesabınızla aynı olamaz**
- Email doğrulaması gerekebilir

### Şifre Gereksinimleri
- En az 8 karakter
- Büyük harf, küçük harf, rakam içermeli
- Özel karakter içerebilir

### Test Satın Alma
- Sandbox tester ile giriş yaptığınızda, **ücretsiz test satın alma** yapabilirsiniz
- Gerçek para çekilmez
- Test satın almalar 1 saat sonra otomatik iptal olur

---

## 📱 iOS Simulator'da Test

### Adım 1: Simulator'ı Başlat
```bash
npx expo run:ios
```

### Adım 2: Settings → App Store
1. Simulator'da **Settings** uygulamasını açın
2. **App Store** bölümüne gidin
3. **Sign Out** yapın (eğer başka bir hesap varsa)

### Adım 3: Sandbox Tester ile Giriş
1. Uygulamanızda subscription satın alma akışını başlatın
2. App Store login ekranı çıktığında:
   - **Sandbox tester email**'inizi girin
   - **Sandbox tester şifre**'nizi girin
3. Giriş yapın

### Adım 4: Test Satın Alma
- Subscription satın alma ekranında **"Test Purchase"** veya benzer bir buton görünecek
- Tıklayarak test satın alma yapabilirsiniz

---

## 🔄 Alternatif: TestFlight Kullanma

Eğer Sandbox Tester bulamıyorsanız, **TestFlight** kullanabilirsiniz:

### TestFlight ile Test
1. App Store Connect → **TestFlight** sekmesine gidin
2. **Internal Testing** veya **External Testing** ekleyin
3. Test kullanıcılarını ekleyin
4. Build'i TestFlight'a yükleyin
5. Test kullanıcıları TestFlight üzerinden uygulamayı indirip test edebilir

**Not:** TestFlight'ta da Sandbox Tester gerekir, ancak daha kolay yönetilebilir.

---

## 🎯 Hızlı Test (Sandbox Tester Olmadan)

Eğer sadece Adapty entegrasyonunu test etmek istiyorsanız:

### 1. AdaptyTestScreen'de Test
- Paywall'ları listeleme
- Products'ları listeleme
- Profile bilgilerini görüntüleme

### 2. Gerçek Satın Alma Olmadan Test
- `getPaywalls()` - Paywall'ları listeler
- `getPaywallProducts()` - Products'ları listeler
- `getProfile()` - Profile bilgilerini gösterir
- `isPremium()` - Premium status kontrolü

**Not:** Gerçek satın alma yapmadan da Adapty entegrasyonunu test edebilirsiniz.

---

## 📋 Checklist

- [ ] App Store Connect'e giriş yapıldı
- [ ] Sandbox Testers sayfası bulundu
- [ ] Sandbox Tester oluşturuldu
- [ ] Email doğrulandı (gerekirse)
- [ ] Simulator'da Settings → App Store → Sign Out yapıldı
- [ ] Test satın alma yapıldı

---

## 🔍 Sorun Giderme

### Sandbox Testers Bulunamıyor
1. **Account Type Kontrolü:**
   - Admin veya App Manager rolüne sahip olmanız gerekir
   - Developer rolü yeterli olmayabilir

2. **Farklı Menü Konumları:**
   - **Users and Access** → **Sandbox Testers**
   - **Users and Roles** → **Sandbox Testers**
   - **App Store** → **Sandbox Testers**

3. **Doğrudan URL:**
   - https://appstoreconnect.apple.com/access/testers

### Test Satın Alma Çalışmıyor
1. Simulator'da **Settings → App Store → Sign Out** yapın
2. Uygulamayı yeniden başlatın
3. Subscription akışını tekrar deneyin

---

**Durum:** Sandbox Tester oluşturma adımları hazır. Eğer hala bulamıyorsanız, TestFlight kullanabilir veya gerçek satın alma olmadan Adapty entegrasyonunu test edebilirsiniz.

