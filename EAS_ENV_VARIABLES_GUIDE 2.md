# 🔐 EAS Environment Variables - Hızlı Kılavuz

## 📋 Oluşturulacak Variables

Aşağıdaki 5 environment variable'ı oluşturmanız gerekiyor:

---

## 🚀 Adım Adım Komutlar

### 1. Supabase URL
```bash
eas env:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://groguatbjerebweinuef.supabase.co" --type string --visibility secret --non-interactive
```

**Değer:** `https://groguatbjerebweinuef.supabase.co`

---

### 2. Supabase Anon Key
```bash
eas env:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdyb2d1YXRiamVyZWJ3ZWludWVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxMDA2NjUsImV4cCI6MjA4MDY3NjY2NX0.igvLFUIQbftA6lc_uabs74HB9xx8cpWie-_UEk3rKzw" --type string --visibility secret --non-interactive
```

**Değer:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdyb2d1YXRiamVyZWJ3ZWludWVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxMDA2NjUsImV4cCI6MjA4MDY3NjY2NX0.igvLFUIQbftA6lc_uabs74HB9xx8cpWie-_UEk3rKzw`

---

### 3. Fal AI API Key
```bash
eas env:create --scope project --name EXPO_PUBLIC_FAL_API_KEY --value "81fbe3b1-9c8f-40f6-a2f1-21f613bb7452:d908e8ab5ba1b178a55d162e326335e6" --type string --visibility secret --non-interactive
```

**Değer:** `81fbe3b1-9c8f-40f6-a2f1-21f613bb7452:d908e8ab5ba1b178a55d162e326335e6`

---

### 4. Google Web Client ID
```bash
eas env:create --scope project --name EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID --value "409036489179-loe8ukspgngajrn2ouk8q508epo9tae6.apps.googleusercontent.com" --type string --visibility secret --non-interactive
```

**Değer:** `409036489179-loe8ukspgngajrn2ouk8q508epo9tae6.apps.googleusercontent.com`

---

### 5. Google iOS Client ID
```bash
eas env:create --scope project --name EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID --value "409036489179-loe8ukspgngajrn2ouk8q508epo9tae6.apps.googleusercontent.com" --type string --visibility secret --non-interactive
```

**Değer:** `409036489179-loe8ukspgngajrn2ouk8q508epo9tae6.apps.googleusercontent.com`

---

## ⚠️ ÖNEMLİ NOTLAR

### Visibility Seçimi

**Visibility seçenekleri:**
- **`secret`** - Hassas bilgiler için (API keys, tokens) ✅ **ÖNERİLEN**
- **`sensitive`** - Hassas ama gizli olmayan bilgiler
- **`plaintext`** - Genel bilgiler (URL'ler gibi)

### Komut Formatı

Eğer komut interaktif prompt isterse, şu şekilde kullanın:

```bash
# Önce komutu çalıştırın
eas env:create --scope project --name EXPO_PUBLIC_SUPABASE_URL

# Sonra prompt'ta:
# 1. Value: Değeri yapıştırın
# 2. Type: "string" seçin
# 3. Visibility: "project" seçin
```

---

## ✅ Doğrulama

Tüm variables oluşturulduktan sonra kontrol edin:

```bash
eas env:list
```

Bu komut tüm environment variables'ları listeler.

---

## 🔄 Güncelleme

Bir variable'ı güncellemek için:

```bash
eas env:update --name EXPO_PUBLIC_SUPABASE_URL --value "yeni-değer"
```

---

## 🗑️ Silme

Bir variable'ı silmek için:

```bash
eas env:delete --name EXPO_PUBLIC_SUPABASE_URL
```

---

## 📝 app.json Mapping

EAS environment variables otomatik olarak `app.json`'daki `extra` field'ına map edilir:

```json
{
  "expo": {
    "extra": {
      "supabaseUrl": "", // EXPO_PUBLIC_SUPABASE_URL buraya gelir
      "supabaseAnonKey": "", // EXPO_PUBLIC_SUPABASE_ANON_KEY buraya gelir
      // ...
    }
  }
}
```

**Not:** EAS build sırasında otomatik olarak doldurulur.

---

## 🚀 Build Sonrası

EAS variables oluşturulduktan sonra:

```bash
# Production build
eas build --platform ios --profile production

# Preview build
eas build --platform ios --profile preview
```

Build sırasında variables otomatik olarak inject edilir.

---

**Son Güncelleme:** 2025-01-27

