# RevenueCat Hataları ve Çözümleri

## 🔍 Tespit Edilen Hatalar

### 1. API Key Hatası
**Hata Mesajı:**
```
[RevenueCat] 😿!! The specified API Key is not recognized. 
Ensure that you are using the public app-specific API key, 
which should look like 'appl_1a2b3c4d5e6f7h'.
```

**Neden:**
- Test Store için `test_...` formatında API key kullanılıyor
- iOS SDK `appl_` formatı bekliyor
- Ancak Test Store için test key'ler geçerli ve çalışmalı

**Çözüm:**
- ✅ Kod güncellendi: Test key'ler için uyarı yerine bilgi mesajı gösteriliyor
- ✅ SDK'nın test key'leri handle etmesine izin veriliyor
- ⚠️ SDK hala uyarı gösterebilir, ancak bu Test Store için normal

### 2. Offerings Hatası
**Hata Mesajı:**
```
[RevenueCat] 🍎!! Error fetching offerings - 
None of the products registered in the RevenueCat dashboard 
could be fetched from App Store Connect
```

**Neden:**
- Test Store kullanılıyor
- Test Store products'ları App Store Connect'ten çekilmez
- StoreKit Configuration File kullanılmalı

**Çözüm:**
1. **StoreKit Configuration File Oluştur:**
   - Xcode'da: File → New → File → StoreKit Configuration File
   - Products ekle: `monthly`, `yearly`, `lifetime`
   - Dosyayı projeye ekle

2. **Xcode Scheme'de StoreKit Configuration'ı Aktif Et:**
   - Product → Scheme → Edit Scheme
   - Run → Options → StoreKit Configuration
   - Oluşturduğun StoreKit Configuration File'ı seç

3. **Alternatif: Gerçek Cihazda Test:**
   - iOS Simülatör'de StoreKit Configuration File çalışmayabilir
   - Gerçek cihazda test et

### 3. iOS 18.4+ Simülatör Sorunu
**Bilinen Sorun:**
- iOS 18.4 ve 18.5 simülatörlerinde StoreKit products yüklenemiyor
- iOS 26+ sürümlerde çözülmüş

**Çözüm:**
- ✅ iOS simülatör sürümünü güncelle
- ✅ Ya da gerçek cihazda test et
- ✅ Ya da Xcode'un StoreKit Configuration File desteğini kullan

## ✅ Yapılan Düzeltmeler

### 1. API Key Validation Güncellendi
- Test key'ler için hata yerine bilgi mesajı
- SDK'nın test key'leri handle etmesine izin veriliyor
- Production key'ler için uyarı mesajları

### 2. Error Handling İyileştirildi
- Test Store için beklenen hatalar daha iyi handle ediliyor
- Kullanıcıya daha açıklayıcı mesajlar

## 📋 Test Adımları

### Test Store ile Test Etme

1. **StoreKit Configuration File Oluştur:**
   ```bash
   # Xcode'da manuel olarak oluşturulmalı
   # File → New → File → StoreKit Configuration File
   ```

2. **Products Ekle:**
   - `monthly` - Monthly subscription
   - `yearly` - Yearly subscription  
   - `lifetime` - One-time purchase

3. **Xcode Scheme'de Aktif Et:**
   - Product → Scheme → Edit Scheme
   - Run → Options → StoreKit Configuration
   - StoreKit Configuration File'ı seç

4. **Uygulamayı Çalıştır:**
   ```bash
   npx expo run:ios
   ```

5. **Test Et:**
   - RevenueCat Test Screen'de offerings yüklenmeli
   - Purchase işlemleri çalışmalı

### Gerçek Cihazda Test

1. **TestFlight Build:**
   ```bash
   eas build --platform ios --profile production
   ```

2. **TestFlight'a Yükle:**
   - App Store Connect → TestFlight
   - Build'i yükle ve test et

## 🔧 Gelecek İyileştirmeler

1. **StoreKit Configuration File Otomasyonu:**
   - Expo config plugin ile otomatik ekleme
   - Build sırasında otomatik yapılandırma

2. **Error Handling:**
   - Daha detaylı hata mesajları
   - Kullanıcı dostu uyarılar

3. **Production Hazırlığı:**
   - App Store Connect'te products oluştur
   - Gerçek iOS API Key (`appl_...`) ekle
   - Sandbox test kullanıcıları oluştur

## 📚 Kaynaklar

- [RevenueCat Test Store Docs](https://www.revenuecat.com/docs/test-and-launch/sandbox)
- [StoreKit Configuration File](https://developer.apple.com/documentation/storekit/in-app_purchase/testing_in-app_purchases_with_sandbox)
- [iOS 18.4 Simulator Issue](https://www-docs.revenuecat.com/docs/known-store-issues/storekit/ios-18-4-simulator-fails-to-load-products)

