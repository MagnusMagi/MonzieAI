# 🍎 App Store Submission Rehberi - MCP Entegrasyonu

## 📋 İçindekiler
1. [App Store Submission Gereksinimleri](#app-store-submission-gereksinimleri)
2. [MCP ile Yapılabilecekler](#mcp-ile-yapılabilecekler)
3. [Adım Adım Submission Süreci](#adım-adım-submission-süreci)
4. [MCP Entegrasyon Örnekleri](#mcp-entegrasyon-örnekleri)
5. [Kontrol Listesi](#kontrol-listesi)

---

## 🎯 App Store Submission Gereksinimleri

### 1. **Teknik Gereksinimler**

#### ✅ Mevcut Durumunuz
- **Bundle ID:** `com.someplanets.monzieaiv2` ✅
- **App Store Connect ID:** `6756293363` ✅ (eas.json'da tanımlı)
- **Apple Team ID:** `56FF2L729K` ✅
- **Build Number:** `12` ✅
- **Version:** `1.0.0` ✅
- **EAS Project ID:** `d60253e3-4797-4d9f-8a4a-a36fbdb87a94` ✅

#### ⚠️ Eksik/Kontrol Edilmesi Gerekenler

**A. Privacy Manifest (PrivacyInfo.xcprivacy)**
```xml
<!-- iOS 17+ için ZORUNLU -->
<!-- Eksik olabilir, kontrol edilmeli -->
```

**B. Usage Descriptions (Info.plist)**
```json
✅ NSPhotoLibraryUsageDescription - Mevcut
✅ NSPhotoLibraryAddUsageDescription - Mevcut
✅ NSCameraUsageDescription - Mevcut
❌ NSUserTrackingUsageDescription - EKSİK (ATT Framework için)
```

**C. App Transport Security (ATS)**
```json
✅ usesNonExemptEncryption: false - Mevcut
```

**D. Sign in with Apple**
```json
✅ expo-apple-authentication plugin - Mevcut
⚠️ App Store Connect'te capability aktif mi? Kontrol edilmeli
```

---

### 2. **Metadata Gereksinimleri**

#### App Store Connect'te Doldurulması Gerekenler:

**A. App Information**
- [ ] **App Name:** `MonzieAI` (30 karakter limit)
- [ ] **Subtitle:** (30 karakter limit) - **EKSİK**
- [ ] **Primary Category:** (örn: Photo & Video, Entertainment)
- [ ] **Secondary Category:** (opsiyonel)
- [ ] **Age Rating:** (4+ / 9+ / 12+ / 17+)

**B. Pricing & Availability**
- [ ] **Price:** Free / Paid
- [ ] **Availability:** Tüm ülkeler / Seçili ülkeler

**C. App Privacy**
- [ ] **Privacy Policy URL:** (zorunlu)
- [ ] **Data Collection Types:**
  - [ ] Photos/Media
  - [ ] User Content (Generated Images)
  - [ ] Analytics (Sentry?)
  - [ ] Advertising (RevenueCat?)

**D. App Review Information**
- [ ] **Demo Account:** (Email/Password)
- [ ] **Review Notes:** (App özelliklerini açıklayan notlar)
- [ ] **Contact Information:**
  - [ ] First Name
  - [ ] Last Name
  - [ ] Phone Number
  - [ ] Email

**E. Screenshots & Preview**
- [ ] **iPhone Screenshots:** (6.7", 6.5", 5.5" - minimum 1 set)
- [ ] **iPad Screenshots:** (12.9", 11" - tablet destekliyorsa)
- [ ] **App Preview Video:** (opsiyonel ama önerilir)

**F. App Description**
- [ ] **Description:** (4000 karakter limit)
- [ ] **Keywords:** (100 karakter, virgülle ayrılmış)
- [ ] **Support URL:** (zorunlu)
- [ ] **Marketing URL:** (opsiyonel)
- [ ] **Promotional Text:** (170 karakter, güncellenebilir)

---

### 3. **Compliance Gereksinimleri**

#### ✅ Mevcut Özellikler
- ✅ **Account Deletion:** `PrivacySettingsScreen.tsx` içinde mevcut
- ✅ **Privacy Policy Screen:** Mevcut
- ✅ **Terms of Service:** (Kontrol edilmeli)

#### ⚠️ Eksikler
- ❌ **NSUserTrackingUsageDescription:** ATT Framework için gerekli
- ❌ **Privacy Manifest:** iOS 17+ için zorunlu olabilir
- ⚠️ **Demo Account:** Review Notes'da belirtilmeli

---

## 🔧 MCP ile Yapılabilecekler

### 1. **RevenueCat MCP** ✅

#### Yapılabilecekler:
```typescript
// ✅ Subscription Products Yönetimi
- List products (mcp_revenuecat_mcp_RC_list_products)
- Create products (mcp_revenuecat_mcp_RC_create_product)
- Create entitlements (mcp_revenuecat_mcp_RC_create_entitlement)
- Create offerings (mcp_revenuecat_mcp_RC_create_offering)
- Create packages (mcp_revenuecat_mcp_RC_create_package)

// ✅ App Store Connect Entegrasyonu
- Products'ı App Store'a push etme (mcp_revenuecat_mcp_RC_create_product_in_store)
- StoreKit configuration yönetimi

// ✅ Webhook Yönetimi
- Webhook integrations oluşturma
- Subscription event tracking
```

#### Örnek Kullanım:
```bash
# 1. Mevcut products'ı listele
MCP: mcp_revenuecat_mcp_RC_list_products
  project_id: "your-project-id"

# 2. Yeni product oluştur
MCP: mcp_revenuecat_mcp_RC_create_product
  project_id: "your-project-id"
  store_identifier: "com.someplanets.monzieai.premium.monthly"
  type: "subscription"
  app_id: "your-app-id"
  display_name: "Premium Monthly"

# 3. Product'ı App Store'a push et
MCP: mcp_revenuecat_mcp_RC_create_product_in_store
  project_id: "your-project-id"
  product_id: "product-id"
  store_information: {
    duration: "ONE_MONTH",
    subscription_group_name: "Premium Subscriptions"
  }
```

#### ⚠️ Limitasyonlar:
- ❌ App Store metadata yönetimi (başlık, açıklama, screenshots)
- ❌ Build upload (EAS CLI ile yapılmalı)
- ❌ TestFlight yönetimi
- ❌ Review submission

---

### 2. **Supabase MCP** ✅

#### Yapılabilecekler:
```typescript
// ✅ Database Schema Kontrolü
- List tables (mcp_supabase_list_tables)
- Execute SQL (mcp_supabase_execute_sql)
- Apply migrations (mcp_supabase_apply_migration)

// ✅ Privacy Policy & Terms Storage
- Privacy policy content'i database'de saklama
- Terms of service content'i database'de saklama
```

#### Örnek Kullanım:
```bash
# Privacy Policy content'ini database'e kaydet
MCP: mcp_supabase_execute_sql
  query: "INSERT INTO app_content (type, content, updated_at) VALUES ('privacy_policy', '...', NOW())"
```

---

### 3. **Swift MCP** ✅

#### Yapılabilecekler:
```typescript
// ✅ Kod Validasyonu
- Swift code validation (mcp_magnusswiftmcp_validate_swift_code)
- API reference lookup (mcp_magnusswiftmcp_get_api_reference)
- Code examples (mcp_magnusswiftmcp_get_code_examples)
- HIG guidelines (mcp_magnusswiftmcp_get_hig_guidelines)
```

#### Örnek Kullanım:
```bash
# Privacy Manifest kodunu validate et
MCP: mcp_magnusswiftmcp_validate_swift_code
  code: "PrivacyInfo.xcprivacy content"
  swift_version: "6.0"
```

---

### 4. **Neon MCP** ✅

#### Yapılabilecekler:
```typescript
// ✅ Database Schema Yönetimi
- List tables
- Run SQL queries
- Schema migrations
```

---

## 🚀 Adım Adım Submission Süreci

### **Aşama 1: Pre-Submission Hazırlık**

#### 1.1 Privacy Manifest Oluştur
```bash
# iOS 17+ için PrivacyInfo.xcprivacy dosyası oluştur
# app.json'a ekle veya native iOS klasörüne ekle
```

#### 1.2 NSUserTrackingUsageDescription Ekle
```json
// app.json içinde
"infoPlist": {
  "NSUserTrackingUsageDescription": "We use tracking to provide personalized content and improve your experience with AI-generated images."
}
```

#### 1.3 Demo Account Hazırla
```bash
# App Store Connect → App Review Information
# Email: demo@monzieai.com
# Password: Demo123!
# Not: Review Notes'da belirt
```

---

### **Aşama 2: Build & Upload**

#### 2.1 Production Build Oluştur
```bash
# EAS Build ile production build
eas build --platform ios --profile production
```

#### 2.2 Build'i App Store Connect'e Upload Et
```bash
# EAS Submit ile otomatik upload
eas submit --platform ios --profile production

# VEYA manuel olarak:
# 1. Build tamamlandıktan sonra IPA indir
# 2. App Store Connect → TestFlight → Builds
# 3. Transporter app ile upload et
```

---

### **Aşama 3: App Store Connect Metadata**

#### 3.1 App Information
```
App Name: MonzieAI
Subtitle: AI-Powered Image Generation
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
Privacy Policy URL: https://monzieai.com/privacy
Data Collection:
  ✅ Photos/Media (User Content)
  ✅ Analytics (Sentry - optional)
  ❌ Advertising (RevenueCat - if used for ads)
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

### **Aşama 4: Review Submission**

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

## 📝 MCP Entegrasyon Örnekleri

### **Örnek 1: RevenueCat Products Setup**

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

### **Örnek 2: Privacy Manifest Validation**

```typescript
// PrivacyInfo.xcprivacy içeriğini validate et
const privacyManifest = `
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
</dict>
</plist>
`;

// Swift MCP ile validate et (XML format olduğu için direkt validate edilemez)
// Ancak structure kontrolü yapılabilir
```

---

### **Örnek 3: Database Schema Kontrolü**

```typescript
// Supabase MCP ile privacy policy content'ini kontrol et
const tables = await mcp_supabase_list_tables({
  schemas: ["public"]
});

// Privacy policy table'ı var mı kontrol et
const hasPrivacyTable = tables.some(t => t.name === "privacy_policy");

if (!hasPrivacyTable) {
  // Migration oluştur
  await mcp_supabase_apply_migration({
    name: "create_privacy_policy_table",
    query: `
      CREATE TABLE privacy_policy (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        content TEXT NOT NULL,
        version TEXT NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  });
}
```

---

## ✅ Kontrol Listesi

### **Pre-Submission Checklist**

#### Teknik
- [ ] Bundle ID doğru (`com.someplanets.monzieaiv2`)
- [ ] Build number artırıldı (şu an: 12)
- [ ] Version number doğru (1.0.0)
- [ ] Privacy Manifest (PrivacyInfo.xcprivacy) eklendi
- [ ] NSUserTrackingUsageDescription eklendi
- [ ] Tüm Usage Descriptions mevcut ve açıklayıcı
- [ ] App Transport Security yapılandırıldı
- [ ] Sign in with Apple capability aktif
- [ ] Production build başarılı
- [ ] Build App Store Connect'e upload edildi

#### Metadata
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
- [ ] Account Deletion özelliği test edildi
- [ ] Privacy Policy Screen erişilebilir
- [ ] Terms of Service (varsa) erişilebilir
- [ ] Data Collection types doğru işaretlendi

#### RevenueCat (Eğer kullanılıyorsa)
- [ ] Products App Store Connect'te oluşturuldu
- [ ] Products RevenueCat'te map edildi
- [ ] Entitlements tanımlandı
- [ ] Offerings yapılandırıldı
- [ ] Webhook integrations kuruldu

#### Final
- [ ] Export Compliance: "No" seçildi
- [ ] Content Rights: "Yes" seçildi
- [ ] Advertising Identifier: "No" (veya "Yes" + ATT)
- [ ] Submit for Review butonuna tıklandı

---

## 🎯 MCP ile Otomasyon Senaryoları

### **Senaryo 1: Automated Product Setup**
```bash
# RevenueCat MCP ile tüm subscription products'ı otomatik oluştur
1. List existing products
2. Check which products are missing
3. Create missing products
4. Create entitlements
5. Create offerings
6. Map products to entitlements
```

### **Senaryo 2: Privacy Compliance Check**
```bash
# Supabase + Swift MCP ile privacy compliance kontrolü
1. Check Privacy Policy content in database
2. Validate Privacy Manifest structure
3. Check all Usage Descriptions are present
4. Generate compliance report
```

### **Senaryo 3: Pre-Submission Validation**
```bash
# Tüm MCP'leri kullanarak comprehensive check
1. RevenueCat: Products configured?
2. Supabase: Privacy Policy exists?
3. Swift MCP: Code validation
4. Generate submission readiness report
```

---

## 📊 Submission Readiness Score

### **Mevcut Durumunuz:**
```
Teknik Hazırlık:    85/100 ⚠️
  ✅ Bundle ID, Build Number, Version
  ⚠️ Privacy Manifest eksik olabilir
  ⚠️ NSUserTrackingUsageDescription eksik

Metadata:           40/100 🔴
  ❌ Subtitle eksik
  ❌ Screenshots yüklenmemiş
  ❌ App Description yazılmamış
  ❌ Keywords belirlenmemiş

Compliance:         70/100 ⚠️
  ✅ Account Deletion mevcut
  ✅ Privacy Policy Screen mevcut
  ⚠️ Demo Account hazırlanmalı
  ⚠️ Review Notes yazılmalı

RevenueCat:        60/100 ⚠️
  ✅ RevenueCat entegrasyonu mevcut
  ⚠️ Products App Store Connect'te oluşturulmalı
  ⚠️ Webhook integrations kontrol edilmeli

─────────────────────────────
GENEL SKOR:         63/100 ⚠️
```

---

## 🚨 Kritik Eksikler (Submit Öncesi)

1. **Privacy Manifest (PrivacyInfo.xcprivacy)** - iOS 17+ için zorunlu
2. **NSUserTrackingUsageDescription** - ATT Framework için gerekli
3. **App Store Connect Metadata** - Tüm alanlar doldurulmalı
4. **Screenshots** - Minimum 1 set yüklenmeli
5. **Demo Account** - Review Notes'da belirtilmeli

---

## 📚 Kaynaklar

- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [RevenueCat App Store Connect Setup](https://docs.revenuecat.com/docs/app-store-connect)
- [Apple Privacy Manifest](https://developer.apple.com/documentation/bundleresources/privacy_manifest_files)

---

**Son Güncelleme:** 2025-01-27
**Proje:** MonzieAI
**Bundle ID:** com.someplanets.monzieaiv2
**App Store Connect ID:** 6756293363
