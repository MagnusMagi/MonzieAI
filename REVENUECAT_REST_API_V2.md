# RevenueCat REST API v2 - Proje Yapılandırması

## 📊 Proje Bilgileri

**Project ID:** `proj2a5583c9`  
**Project Name:** MonzeiAI  
**Created At:** 2025-01-27

## 🔑 API Keys

### Public API Keys (REST API v2)

**Test Store App (`app6ee59d340a`):**
- **Key ID:** `apikey38626115ed`
- **Key:** `test_mThpDHMSBLoSdnuciYnPBgXXbpV`
- **Environment:** `production`
- **Created At:** 2025-01-27

**Not:** Bu bir test key'dir (`test_...` formatında). Test Store için geçerlidir.

### Secret API Key

**Secret Key:** `sk_ttLDinvdWUQOxzTGfnVZcZrXSVUvM`  
**Kullanım:** Server-side işlemler, webhook doğrulama, MCP server

## 📱 Apps

### Test Store App
- **App ID:** `app6ee59d340a`
- **App Name:** Test Store
- **App Type:** `test_store`
- **Public API Key:** `test_mThpDHMSBLoSdnuciYnPBgXXbpV`

## 🎯 Entitlements

1. **Premium** (`premium`)
   - **ID:** `entlc7e7691a1e`
   - **Display Name:** Premium Membership
   - **Products:** Monthly, Yearly

2. **MonzeiAI Pro** (`MonzeiAI Pro`)
   - **Products:** Lifetime

## 📦 Products

1. **Monthly** (`monthly`)
   - **Product ID:** `prod45897b15f4`
   - **Type:** Subscription (P1M)
   - **Entitlement:** Premium

2. **Yearly** (`yearly`)
   - **Product ID:** `prod39bbb78aff`
   - **Type:** Subscription (P1Y)
   - **Entitlement:** Premium

3. **Lifetime** (`lifetime`)
   - **Product ID:** `prod7350c00ac6`
   - **Type:** One-time purchase
   - **Entitlement:** MonzeiAI Pro

## 📋 Offerings

### Default Offering
- **Offering ID:** `ofrngb8c2b5f8c7`
- **Lookup Key:** `default`
- **Is Current:** `true`
- **Display Name:** The standard set of packages

**Packages:**
1. **Monthly** (`$rc_monthly`)
   - **Package ID:** `pkge81818907f9`
   - **Position:** 0

2. **Yearly** (`$rc_annual`)
   - **Package ID:** `pkge9b338b3376`
   - **Position:** 1

3. **Lifetime** (`$rc_lifetime`)
   - **Package ID:** `pkge1b7034b6ea`
   - **Position:** 2

## 🔧 REST API v2 Endpoints

### Base URL
```
https://api.revenuecat.com/v2
```

### Authentication
```bash
Authorization: Bearer sk_ttLDinvdWUQOxzTGfnVZcZrXSVUvM
```

### Önemli Endpoints

#### 1. Get Project
```bash
GET /projects/proj2a5583c9
```

#### 2. List Apps
```bash
GET /projects/proj2a5583c9/apps
```

#### 3. List Products
```bash
GET /projects/proj2a5583c9/products?app_id=app6ee59d340a
```

#### 4. List Offerings
```bash
GET /projects/proj2a5583c9/offerings
```

#### 5. List Packages
```bash
GET /projects/proj2a5583c9/offerings/ofrngb8c2b5f8c7/packages
```

#### 6. List Entitlements
```bash
GET /projects/proj2a5583c9/entitlements
```

#### 7. List Public API Keys
```bash
GET /projects/proj2a5583c9/apps/app6ee59d340a/public_api_keys
```

## 📝 Mevcut Yapılandırma (app.json)

```json
{
  "extra": {
    "revenueCatApiKey": "test_mThpDHMSBLoSdnuciYnPBgXXbpV",
    "revenueCatApiKeyIOS": "test_mThpDHMSBLoSdnuciYnPBgXXbpV",
    "revenueCatApiKeyAndroid": "",
    "revenueCatSecretKey": "sk_ttLDinvdWUQOxzTGfnVZcZrXSVUvM"
  }
}
```

## ⚠️ Önemli Notlar

### Test Store vs Production

1. **Test Store:**
   - ✅ Test key (`test_...`) kullanılabilir
   - ✅ StoreKit Configuration File gerekli
   - ✅ App Store Connect products gerekmez
   - ⚠️ iOS SDK uyarı gösterebilir (normal)

2. **Production:**
   - ✅ Gerçek iOS API Key (`appl_...`) gerekli
   - ✅ App Store Connect'te products oluşturulmalı
   - ✅ Sandbox test kullanıcıları gerekli

### API Key Formatları

- **iOS Production:** `appl_...`
- **Android Production:** `goog_...`
- **Test Store:** `test_...` (her iki platform için)

## 🚀 Sonraki Adımlar

1. **Test Store için:**
   - ✅ StoreKit Configuration File oluştur
   - ✅ Xcode Scheme'de aktif et
   - ✅ Test et

2. **Production için:**
   - ⏳ App Store Connect'te products oluştur
   - ⏳ Gerçek iOS API Key (`appl_...`) oluştur
   - ⏳ `app.json`'da production key'i kullan

## 📚 Kaynaklar

- [RevenueCat REST API v2 Docs](https://www.revenuecat.com/reference/api-v2)
- [RevenueCat MCP Server](https://github.com/RevenueCat/mcp-server)
- [Test Store Setup](https://www.revenuecat.com/docs/test-and-launch/sandbox)

