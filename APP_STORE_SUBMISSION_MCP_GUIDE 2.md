# 🍎 App Store Submission - MCP Entegrasyonu Rehberi

**Proje:** MonzieAI  
**Bundle ID:** `com.someplanets.monzieaiv2`  
**Platform:** iOS (Expo/React Native)  
**Son Güncelleme:** 2025-01-27

---

## 📊 Hızlı Durum Özeti

### ✅ Tamamlananlar
- ✅ Bundle ID ve Apple Team ID yapılandırılmış
- ✅ Privacy Usage Descriptions (Camera, Photo Library)
- ✅ Account Deletion özelliği mevcut
- ✅ Sign in with Apple entegrasyonu
- ✅ RevenueCat subscription yönetimi
- ✅ NSUserTrackingUsageDescription eklendi

### ⚠️ Eksikler (Submit Öncesi)
- ❌ Privacy Manifest (PrivacyInfo.xcprivacy) - iOS 17+ için zorunlu
- ❌ App Store Connect Metadata (Title, Description, Screenshots)
- ❌ Demo Account hazırlanmalı
- ❌ Review Notes yazılmalı

---

## 🎯 App Store Submission Gereksinimleri

### 1. **Teknik Gereksinimler** (Kod Tarafı)

#### ✅ Mevcut Durum
```json
{
  "bundleIdentifier": "com.someplanets.monzieaiv2",
  "buildNumber": "12",
  "version": "1.0.0",
  "appleTeamId": "56FF2L729K",
  "usesNonExemptEncryption": false
}
```

#### ⚠️ Eksikler
1. **Privacy Manifest (PrivacyInfo.xcprivacy)**
   - iOS 17+ için zorunlu
   - Third-party SDK'lar için gerekli
   - Dosya: `ios/MonzieAI/PrivacyInfo.xcprivacy`

2. **Usage Descriptions** ✅ (Yeni eklendi)
   - ✅ NSPhotoLibraryUsageDescription
   - ✅ NSPhotoLibraryAddUsageDescription
   - ✅ NSCameraUsageDescription
   - ✅ NSUserTrackingUsageDescription (YENİ)

---

### 2. **App Store Connect Metadata** (Manuel)

#### ❌ MCP ile YAPILAMAZ - Manuel Yapılmalı

**A. App Information**
- App Name (30 karakter)
- Subtitle (30 karakter)
- Primary/Secondary Category
- Age Rating

**B. Pricing & Availability**
- Price (Free/Paid)
- Availability (Countries)

**C. App Privacy**
- Privacy Policy URL (zorunlu)
- Data Collection Types
  - Photos/Media ✅
  - User Content ✅
  - Analytics (Sentry) ⚠️
  - Advertising (RevenueCat) ⚠️

**D. Screenshots & Preview**
- iPhone Screenshots (6.7", 6.5", 5.5")
- iPad Screenshots (12.9", 11")
- App Preview Video (opsiyonel)

**E. App Description**
- Description (4000 karakter)
- Keywords (100 karakter, virgülle ayrılmış)
- Support URL (zorunlu)
- Marketing URL (opsiyonel)

**F. App Review Information**
- Demo Account (Email/Password)
- Review Notes
- Contact Information

---

## 🔧 MCP ile YAPILABİLECEKLER

### 1. **RevenueCat MCP** ✅

#### Yapılabilecekler:

**A. Products Yönetimi**
```typescript
// ✅ Mevcut products'ı listele
mcp_revenuecat_mcp_RC_list_products({
  project_id: "your-project-id"
})

// ✅ Yeni product oluştur
mcp_revenuecat_mcp_RC_create_product({
  project_id: "your-project-id",
  store_identifier: "com.someplanets.monzieai.premium.monthly",
  type: "subscription",
  app_id: "your-app-id",
  display_name: "Premium Monthly"
})

// ✅ Product'ı App Store'a push et
mcp_revenuecat_mcp_RC_create_product_in_store({
  project_id: "your-project-id",
  product_id: "product-id",
  store_information: {
    duration: "ONE_MONTH",
    subscription_group_name: "Premium Subscriptions"
  }
})
```

**B. Entitlements & Offerings**
```typescript
// ✅ Entitlement oluştur
mcp_revenuecat_mcp_RC_create_entitlement({
  project_id: "your-project-id",
  lookup_key: "premium",
  display_name: "Premium Access"
})

// ✅ Offering oluştur
mcp_revenuecat_mcp_RC_create_offering({
  project_id: "your-project-id",
  lookup_key: "default",
  display_name: "Default Offering"
})

// ✅ Package oluştur
mcp_revenuecat_mcp_RC_create_package({
  project_id: "your-project-id",
  offering_id: "offering-id",
  lookup_key: "$rc_monthly",
  display_name: "Monthly Premium",
  position: 1
})
```

**C. Webhook Yönetimi**
```typescript
// ✅ Webhook integration oluştur
mcp_revenuecat_mcp_RC_create_webhook_integration({
  project_id: "your-project-id",
  name: "Production Webhook",
  url: "https://your-api.com/webhooks/revenuecat",
  environment: "production",
  event_types: ["INITIAL_PURCHASE", "RENEWAL", "CANCELLATION"]
})
```

#### ⚠️ Limitasyonlar:
- ❌ App Store Connect metadata yönetimi (Title, Description, Screenshots)
- ❌ Build upload (EAS CLI gerekli)
- ❌ TestFlight yönetimi
- ❌ Review submission

---

### 2. **Supabase MCP** ✅

#### Yapılabilecekler:

**A. Privacy Policy & Terms Storage**
```typescript
// ✅ Privacy Policy content'ini database'e kaydet
mcp_supabase_execute_sql({
  query: `
    INSERT INTO app_content (type, content, version, updated_at)
    VALUES ('privacy_policy', '...', '1.0', NOW())
    ON CONFLICT (type) DO UPDATE SET content = EXCLUDED.content
  `
})

// ✅ Privacy Policy'i oku
mcp_supabase_execute_sql({
  query: "SELECT content FROM app_content WHERE type = 'privacy_policy'"
})
```

**B. Database Schema Kontrolü**
```typescript
// ✅ Tables listele
mcp_supabase_list_tables({
  schemas: ["public"]
})

// ✅ Migration uygula
mcp_supabase_apply_migration({
  name: "create_privacy_policy_table",
  query: `
    CREATE TABLE IF NOT EXISTS app_content (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      type TEXT UNIQUE NOT NULL,
      content TEXT NOT NULL,
      version TEXT NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `
})
```

#### ⚠️ Limitasyonlar:
- ❌ App Store Connect entegrasyonu yok
- ❌ Screenshot yönetimi yok

---

### 3. **Neon MCP** ✅

#### Yapılabilecekler:

**A. Database Operations**
```typescript
// ✅ Tables listele
mcp_Neon_get_database_tables({
  projectId: "frosty-bird-12815011"
})

// ✅ SQL çalıştır
mcp_Neon_run_sql({
  projectId: "frosty-bird-12815011",
  sql: "SELECT * FROM users LIMIT 10"
})
```

#### ⚠️ Limitasyonlar:
- ❌ App Store Connect entegrasyonu yok

---

### 4. **Swift MCP** ⚠️ (Sınırlı)

#### Yapılabilecekler:

**A. Kod Validasyonu**
```typescript
// ✅ Privacy Manifest XML yapısını kontrol et (manuel)
// Not: PrivacyInfo.xcprivacy XML formatında olduğu için
// direkt Swift validation çalışmaz, ancak structure kontrol edilebilir
```

**B. API Reference & Examples**
```typescript
// ✅ Apple API referansları
mcp_magnusswiftmcp_get_api_reference({
  symbol_name: "NSUserTrackingUsageDescription",
  framework: "Foundation"
})

// ✅ HIG Guidelines
mcp_magnusswiftmcp_get_hig_guidelines({
  topic: "privacy"
})
```

#### ⚠️ Limitasyonlar:
- ❌ Expo projesi olduğu için native Swift kod yok
- ❌ Privacy Manifest XML validation sınırlı

---

## 🚀 Adım Adım Submission Süreci

### **Aşama 1: Pre-Submission Hazırlık** (MCP ile Yapılabilir)

#### 1.1 Privacy Manifest Oluştur
```bash
# Manuel olarak oluşturulmalı
# Dosya: ios/MonzieAI/PrivacyInfo.xcprivacy
```

**Örnek Privacy Manifest:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>NSPrivacyAccessedAPITypes</key>
  <array>
    <dict>
      <key>NSPrivacyAccessedAPIType</key>
      <string>NSPrivacyAccessedAPICategoryFileTimestamp</string>
      <key>NSPrivacyAccessedAPITypeReasons</key>
      <array>
        <string>C617.1</string>
      </array>
    </dict>
  </array>
  <key>NSPrivacyCollectedDataTypes</key>
  <array>
    <dict>
      <key>NSPrivacyCollectedDataType</key>
      <string>NSPrivacyCollectedDataTypePhotosorVideos</string>
      <key>NSPrivacyCollectedDataTypeLinked</key>
      <false/>
      <key>NSPrivacyCollectedDataTypeTracking</key>
      <false/>
      <key>NSPrivacyCollectedDataTypePurposes</key>
      <array>
        <string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string>
      </array>
    </dict>
  </array>
</dict>
</plist>
```

#### 1.2 RevenueCat Products Setup (MCP ile Yapılabilir)

**Adım 1: Mevcut Products'ı Kontrol Et**
```bash
# RevenueCat MCP ile products listele
# Project ID: app.json'dan alınabilir (RevenueCat dashboard'dan)
```

**Adım 2: Eksik Products'ı Oluştur**
```bash
# Eğer App Store Connect'te products yoksa:
# 1. App Store Connect'te manuel oluştur
# 2. RevenueCat MCP ile map et
```

**Adım 3: Entitlements & Offerings**
```bash
# RevenueCat MCP ile oluştur
```

#### 1.3 Privacy Policy Content (MCP ile Yapılabilir)

**Supabase MCP ile Privacy Policy'i Database'e Kaydet:**
```typescript
// Privacy Policy content'ini Supabase'e kaydet
// App içinde gösterilecek privacy policy buradan çekilebilir
```

---

### **Aşama 2: Build & Upload** (EAS CLI - MCP ile YAPILAMAZ)

#### 2.1 Production Build
```bash
# EAS Build ile production build
eas build --platform ios --profile production
```

#### 2.2 Build Upload
```bash
# EAS Submit ile otomatik upload
eas submit --platform ios --profile production

# VEYA manuel:
# 1. Build tamamlandıktan sonra IPA indir
# 2. App Store Connect → TestFlight → Builds
# 3. Transporter app ile upload et
```

---

### **Aşama 3: App Store Connect Metadata** (Manuel - MCP ile YAPILAMAZ)

#### 3.1 App Information
```
App Name: MonzieAI (30 karakter)
Subtitle: AI-Powered Image Generation (30 karakter)
Primary Category: Photo & Video
Secondary Category: Entertainment
Age Rating: 4+ (veya uygun rating)
```

#### 3.2 Pricing & Availability
```
Price: Free (veya Paid)
Availability: All Countries (veya seçili)
```

#### 3.3 App Privacy
```
Privacy Policy URL: https://monzieai.com/privacy (zorunlu)
Data Collection:
  ✅ Photos/Media (User Content)
  ✅ Analytics (Sentry - optional)
  ⚠️ Advertising (RevenueCat - if used for ads)
```

#### 3.4 Screenshots
```
Minimum Requirements:
- iPhone 6.7" (iPhone 14 Pro Max): 1290 x 2796 px
- iPhone 6.5" (iPhone 11 Pro Max): 1242 x 2688 px
- iPhone 5.5" (iPhone 8 Plus): 1242 x 2208 px

iPad (if supportsTablet: true):
- iPad Pro 12.9": 2048 x 2732 px
- iPad Pro 11": 1668 x 2388 px
```

#### 3.5 App Description
```
MonzieAI transforms your ideas into stunning AI-generated images. 
Create unique artwork, avatars, and visual content with the power 
of artificial intelligence.

Key Features:
• AI-Powered Image Generation
• Multiple Style Options
• High-Quality Output
• Easy Sharing
• Privacy-Focused

[4000 karakter limit]
```

#### 3.6 Keywords
```
ai,image,generation,art,avatar,photo,creative,design,artwork
(100 karakter, virgülle ayrılmış, boşluk yok)
```

---

### **Aşama 4: Review Submission** (Manuel - MCP ile YAPILAMAZ)

#### 4.1 Review Notes Hazırla
```
Demo Account:
Email: demo@monzieai.com
Password: Demo123!

App Features:
1. User can sign in with Google or Apple
2. User can generate AI images from text prompts
3. User can select images from photo library
4. User can save generated images
5. User can manage privacy settings
6. User can delete account

Testing Instructions:
1. Sign in with demo account
2. Navigate to "Generate" screen
3. Enter a prompt (e.g., "a sunset over mountains")
4. Wait for image generation
5. Save image to photo library

Notes:
- App requires internet connection for AI generation
- Image generation may take 10-30 seconds
- User can cancel generation at any time
```

#### 4.2 Submit for Review
```
1. App Store Connect → App Store → [Your App]
2. "Submit for Review" butonuna tıkla
3. Export Compliance: "No" (usesNonExemptEncryption: false)
4. Content Rights: "Yes" (if you own all content)
5. Advertising Identifier: "No" (if not using IDFA)
6. Submit
```

---

## 📝 MCP Entegrasyon Senaryoları

### **Senaryo 1: Automated RevenueCat Setup**

```typescript
// 1. Mevcut products'ı kontrol et
const products = await mcp_revenuecat_mcp_RC_list_products({
  project_id: "your-revenuecat-project-id"
});

// 2. Eğer product yoksa oluştur
if (products.items.length === 0) {
  await mcp_revenuecat_mcp_RC_create_product({
    project_id: "your-revenuecat-project-id",
    store_identifier: "com.someplanets.monzieai.premium.monthly",
    type: "subscription",
    app_id: "your-app-id",
    display_name: "Premium Monthly Subscription"
  });
}

// 3. Entitlement oluştur
await mcp_revenuecat_mcp_RC_create_entitlement({
  project_id: "your-revenuecat-project-id",
  lookup_key: "premium",
  display_name: "Premium Access"
});

// 4. Offering oluştur
await mcp_revenuecat_mcp_RC_create_offering({
  project_id: "your-revenuecat-project-id",
  lookup_key: "default",
  display_name: "Default Offering"
});
```

---

### **Senaryo 2: Privacy Policy Management**

```typescript
// Supabase MCP ile privacy policy content'ini yönet
const privacyPolicyContent = `
# Privacy Policy

[Your privacy policy content here]
`;

// Database'e kaydet
await mcp_supabase_execute_sql({
  query: `
    INSERT INTO app_content (type, content, version, updated_at)
    VALUES ('privacy_policy', $1, '1.0', NOW())
    ON CONFLICT (type) DO UPDATE SET 
      content = EXCLUDED.content,
      version = EXCLUDED.version,
      updated_at = NOW()
  `,
  // Note: Supabase MCP execute_sql parametre binding'i desteklemiyor
  // Bu yüzden content'i direkt SQL string'e eklemek gerekebilir
});
```

---

### **Senaryo 3: Pre-Submission Validation**

```typescript
// Tüm MCP'leri kullanarak comprehensive check

// 1. RevenueCat: Products configured?
const products = await mcp_revenuecat_mcp_RC_list_products({
  project_id: "your-project-id"
});

// 2. Supabase: Privacy Policy exists?
const privacyPolicy = await mcp_supabase_execute_sql({
  query: "SELECT content FROM app_content WHERE type = 'privacy_policy'"
});

// 3. Generate submission readiness report
console.log("Submission Readiness:");
console.log(`- RevenueCat Products: ${products.items.length > 0 ? '✅' : '❌'}`);
console.log(`- Privacy Policy: ${privacyPolicy.length > 0 ? '✅' : '❌'}`);
```

---

## ✅ Kontrol Listesi

### **Pre-Submission Checklist**

#### Teknik (Kod)
- [x] Bundle ID doğru (`com.someplanets.monzieaiv2`)
- [x] Build number artırıldı (şu an: 12)
- [x] Version number doğru (1.0.0)
- [ ] Privacy Manifest (PrivacyInfo.xcprivacy) eklendi
- [x] NSUserTrackingUsageDescription eklendi
- [x] Tüm Usage Descriptions mevcut ve açıklayıcı
- [x] App Transport Security yapılandırıldı
- [x] Sign in with Apple capability aktif
- [ ] Production build başarılı
- [ ] Build App Store Connect'e upload edildi

#### Metadata (App Store Connect - Manuel)
- [ ] App Name (30 karakter)
- [ ] Subtitle (30 karakter)
- [ ] Primary Category seçildi
- [ ] Age Rating belirlendi
- [ ] Pricing ayarlandı
- [ ] Privacy Policy URL eklendi
- [ ] Support URL eklendi
- [ ] App Description yazıldı (4000 karakter)
- [ ] Keywords eklendi (100 karakter)
- [ ] Screenshots yüklendi (minimum 1 set)
- [ ] App Preview Video (opsiyonel)

#### Compliance
- [ ] Demo Account hazırlandı
- [ ] Review Notes yazıldı
- [x] Account Deletion özelliği test edildi
- [ ] Privacy Policy Screen erişilebilir
- [ ] Terms of Service (varsa) erişilebilir
- [ ] Data Collection types doğru işaretlendi

#### RevenueCat (MCP ile Yapılabilir)
- [ ] Products App Store Connect'te oluşturuldu
- [ ] Products RevenueCat'te map edildi (MCP ile)
- [ ] Entitlements tanımlandı (MCP ile)
- [ ] Offerings yapılandırıldı (MCP ile)
- [ ] Webhook integrations kuruldu (MCP ile)

#### Final
- [ ] Export Compliance: "No" seçildi
- [ ] Content Rights: "Yes" seçildi
- [ ] Advertising Identifier: "No" (veya "Yes" + ATT)
- [ ] Submit for Review butonuna tıklandı

---

## 📊 Submission Readiness Score

### **Mevcut Durumunuz:**
```
Teknik Hazırlık:    90/100 ✅
  ✅ Bundle ID, Build Number, Version
  ✅ NSUserTrackingUsageDescription eklendi
  ⚠️ Privacy Manifest eksik olabilir

Metadata:           0/100 🔴
  ❌ App Store Connect metadata hiç doldurulmamış
  ❌ Screenshots yüklenmemiş
  ❌ App Description yazılmamış

Compliance:         80/100 ✅
  ✅ Account Deletion mevcut
  ✅ Privacy Policy Screen mevcut
  ⚠️ Demo Account hazırlanmalı
  ⚠️ Review Notes yazılmalı

RevenueCat:        60/100 ⚠️
  ✅ RevenueCat entegrasyonu mevcut
  ⚠️ Products App Store Connect'te oluşturulmalı
  ⚠️ Webhook integrations kontrol edilmeli

─────────────────────────────
GENEL SKOR:         57/100 ⚠️
```

---

## 🚨 Kritik Eksikler (Submit Öncesi)

### **1. Privacy Manifest (PrivacyInfo.xcprivacy)**
- iOS 17+ için zorunlu
- Third-party SDK'lar için gerekli
- Dosya: `ios/MonzieAI/PrivacyInfo.xcprivacy`

### **2. App Store Connect Metadata**
- Tüm alanlar doldurulmalı
- Screenshots minimum 1 set yüklenmeli
- Privacy Policy URL zorunlu

### **3. Demo Account**
- Review Notes'da belirtilmeli
- Test edilebilir olmalı

---

## 🎯 MCP ile Otomasyon Önerileri

### **Önerilen Workflow:**

1. **RevenueCat Setup (MCP ile)**
   ```bash
   # Products, Entitlements, Offerings otomatik oluştur
   ```

2. **Privacy Policy Management (MCP ile)**
   ```bash
   # Supabase'e privacy policy content'ini kaydet
   # App içinde gösterilecek privacy policy buradan çekilebilir
   ```

3. **Pre-Submission Validation (MCP ile)**
   ```bash
   # Tüm MCP'leri kullanarak comprehensive check
   # Submission readiness report oluştur
   ```

4. **Build & Upload (EAS CLI - Manuel)**
   ```bash
   # MCP ile yapılamaz, EAS CLI gerekli
   eas build --platform ios --profile production
   eas submit --platform ios --profile production
   ```

5. **Metadata & Review (Manuel)**
   ```bash
   # App Store Connect'te manuel doldurulmalı
   # MCP ile yapılamaz
   ```

---

## 📚 Kaynaklar

- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [RevenueCat App Store Connect Setup](https://docs.revenuecat.com/docs/app-store-connect)
- [Apple Privacy Manifest](https://developer.apple.com/documentation/bundleresources/privacy_manifest_files)

---

## 🔑 Önemli Notlar

1. **MCP Limitasyonları:**
   - App Store Connect metadata yönetimi yok
   - Build upload yok (EAS CLI gerekli)
   - Screenshot yönetimi yok
   - Review submission yok

2. **MCP ile Yapılabilecekler:**
   - RevenueCat products, entitlements, offerings yönetimi
   - Privacy Policy content yönetimi (Supabase)
   - Database schema kontrolleri
   - Pre-submission validation

3. **Manuel Yapılması Gerekenler:**
   - App Store Connect metadata doldurma
   - Screenshot hazırlama ve yükleme
   - Build upload (EAS CLI ile)
   - Review submission

---

**Son Güncelleme:** 2025-01-27  
**Hazırlayan:** AI Assistant  
**Proje:** MonzieAI
