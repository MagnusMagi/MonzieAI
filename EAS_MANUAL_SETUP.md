# 🔐 EAS Environment Variables - Manuel Kurulum

## ⚠️ Durum

EAS CLI komutları otomatik olarak çalışmadı (authentication veya project bağlantı sorunu). 

**Manuel olarak oluşturmanız gerekiyor.**

---

## 🚀 Adım Adım Manuel Kurulum

### 1. EAS CLI'ye Login Olun

```bash
eas login
```

### 2. EAS Projesini Bağlayın (Gerekirse)

```bash
eas project:init
```

### 3. Her Variable'ı Tek Tek Oluşturun

Terminal'de her komutu çalıştırın ve prompt'lara cevap verin:

#### Variable 1: Supabase URL
```bash
eas env:create --scope project --name EXPO_PUBLIC_SUPABASE_URL
```
**Prompt'larda:**
- **Value:** `https://groguatbjerebweinuef.supabase.co`
- **Type:** `string`
- **Visibility:** `secret` (veya `sensitive`)
- **Environment:** `production` (veya `all`)

#### Variable 2: Supabase Anon Key
```bash
eas env:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY
```
**Prompt'larda:**
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdyb2d1YXRiamVyZWJ3ZWludWVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxMDA2NjUsImV4cCI6MjA4MDY3NjY2NX0.igvLFUIQbftA6lc_uabs74HB9xx8cpWie-_UEk3rKzw`
- **Type:** `string`
- **Visibility:** `secret`
- **Environment:** `production`

#### Variable 3: Fal AI API Key
```bash
eas env:create --scope project --name EXPO_PUBLIC_FAL_API_KEY
```
**Prompt'larda:**
- **Value:** `81fbe3b1-9c8f-40f6-a2f1-21f613bb7452:d908e8ab5ba1b178a55d162e326335e6`
- **Type:** `string`
- **Visibility:** `secret`
- **Environment:** `production`

#### Variable 4: Google Web Client ID
```bash
eas env:create --scope project --name EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
```
**Prompt'larda:**
- **Value:** `409036489179-loe8ukspgngajrn2ouk8q508epo9tae6.apps.googleusercontent.com`
- **Type:** `string`
- **Visibility:** `secret`
- **Environment:** `production`

#### Variable 5: Google iOS Client ID
```bash
eas env:create --scope project --name EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
```
**Prompt'larda:**
- **Value:** `409036489179-loe8ukspgngajrn2ouk8q508epo9tae6.apps.googleusercontent.com`
- **Type:** `string`
- **Visibility:** `secret`
- **Environment:** `production`

---

## ✅ Doğrulama

Tüm variables oluşturulduktan sonra:

```bash
eas env:list
```

Bu komut tüm environment variables'ları listeler.

---

## 🔄 Alternatif: EAS Web Dashboard

Eğer CLI ile sorun yaşıyorsanız, EAS Web Dashboard'u kullanabilirsiniz:

1. [https://expo.dev](https://expo.dev) adresine gidin
2. Projenizi seçin
3. **Settings** → **Environment Variables** bölümüne gidin
4. Her variable'ı manuel olarak ekleyin

---

## 📝 Değerler Özeti

| Variable Name | Değer |
|---------------|-------|
| `EXPO_PUBLIC_SUPABASE_URL` | `https://groguatbjerebweinuef.supabase.co` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdyb2d1YXRiamVyZWJ3ZWludWVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxMDA2NjUsImV4cCI6MjA4MDY3NjY2NX0.igvLFUIQbftA6lc_uabs74HB9xx8cpWie-_UEk3rKzw` |
| `EXPO_PUBLIC_FAL_API_KEY` | `81fbe3b1-9c8f-40f6-a2f1-21f613bb7452:d908e8ab5ba1b178a55d162e326335e6` |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | `409036489179-loe8ukspgngajrn2ouk8q508epo9tae6.apps.googleusercontent.com` |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | `409036489179-loe8ukspgngajrn2ouk8q508epo9tae6.apps.googleusercontent.com` |

---

## 🚀 Sonraki Adımlar

Variables oluşturulduktan sonra:

```bash
# Production build
eas build --platform ios --profile production
```

Build sırasında variables otomatik olarak inject edilir!

---

**Not:** Bu değerler `app.json`'da geçici olarak mevcut (local development için). Production build'de EAS variables kullanılacak.

---

**Son Güncelleme:** 2025-01-27

