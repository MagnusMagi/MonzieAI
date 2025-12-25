# 🔍 EAS Build Hata Ayıklama Kılavuzu

## ⚠️ Build Başarısız Oldu

EAS build başarısız oldu. Olası nedenler ve çözümler:

## 🔍 Hata Ayıklama Adımları

### 1. Build Loglarını Kontrol Et

```bash
# Son build'i görüntüle
eas build:list --platform ios --limit 1

# Belirli bir build'in loglarını görüntüle
eas build:view <build-id>
```

### 2. Yerel Konfigürasyonu Test Et

```bash
# Expo config'i test et
npx expo config --json

# Hata varsa gösterir
```

### 3. Dependency Kontrolü

```bash
# node_modules tam mı?
ls -la node_modules/expo-font

# package.json güncel mi?
npm list --depth=0
```

## 🚨 Olası Nedenler ve Çözümler

### Neden 1: Dependency Conflict

**Belirtiler:**
- `npm ci` hatası
- `ERESOLVE` hatası

**Çözüm:**
- ✅ `.npmrc` dosyası oluşturuldu (`legacy-peer-deps=true`)
- ✅ `react-test-renderer` versiyonu güncellendi

### Neden 2: Apple Developer App ID Eksik

**Belirtiler:**
- `bundle identifier is not available`
- `App ID not found`

**Çözüm:**
1. Apple Developer Console'da App ID oluştur
2. Bundle ID: `com.someplanets.monzieaiv2`
3. Detaylar: `QUICK_APP_ID_SETUP.md`

### Neden 3: Plugin Bulunamıyor

**Belirtiler:**
- `Failed to resolve plugin for module "expo-font"`
- `npx expo config` hatası

**Çözüm:**
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Neden 4: Git Repository Sorunu

**Belirtiler:**
- `git clone exited with non-zero code: 128`
- `Failed to upload project tarball`

**Çözüm:**
- ✅ Değişiklikler commit edildi
- Git repository optimize edildi

### Neden 5: Fingerprint Hesaplama Hatası

**Belirtiler:**
- `Failed to compute project fingerprint`
- `ENOENT: no such file or directory`

**Çözüm:**
- ✅ `eas.json`'da `EAS_SKIP_AUTO_FINGERPRINT=1` eklendi

## 🔧 Hızlı Düzeltmeler

### Tüm Sorunları Tek Seferde Düzelt

```bash
# 1. node_modules'ı temizle
rm -rf node_modules package-lock.json

# 2. Yeniden yükle
npm install --legacy-peer-deps

# 3. Expo config'i test et
npx expo config --json

# 4. Git commit et
git add .
git commit -m "Fix build configuration"

# 5. Build yap
eas build --platform ios --profile production
```

## 📋 Kontrol Listesi

Build öncesi kontrol edin:

- [ ] `.npmrc` dosyası var ve `legacy-peer-deps=true` içeriyor
- [ ] `package.json` güncel (react-test-renderer: 19.1.0)
- [ ] `npx expo config --json` başarılı
- [ ] Tüm değişiklikler commit edildi
- [ ] Apple Developer App ID oluşturuldu (`com.someplanets.monzieaiv2`)
- [ ] `eas.json` güncel (fingerprint atlandı)

## 🚀 Build Komutları

### Normal Build

```bash
eas build --platform ios --profile production
```

### Cache Temizleyerek Build

```bash
eas build --platform ios --profile production --clear-cache
```

### Local Build (Git Sorunlarını Atlar)

```bash
eas build --platform ios --profile production --local
```

## 🔍 Detaylı Log İnceleme

### Build Loglarını Görüntüle

```bash
# Son build ID'yi al
BUILD_ID=$(eas build:list --platform ios --limit 1 --json | jq -r '.[0].id')

# Logları görüntüle
eas build:view $BUILD_ID
```

### Belirli Bir Aşamadaki Hatayı Bul

Build loglarında şunları arayın:
- `npm ci` hataları
- `xcodebuild` hataları
- `pod install` hataları
- `expo config` hataları

## 📝 Mevcut Durum

- ✅ `.npmrc` dosyası oluşturuldu
- ✅ `react-test-renderer` versiyonu güncellendi
- ✅ `eas.json` fingerprint atlandı
- ✅ Git repository optimize edildi
- ⚠️ Apple Developer App ID kontrol edilmeli
- ⚠️ Build logları incelenmeli

## 🆘 Hala Başarısız Olursa

1. **Build loglarını paylaşın:**
   ```bash
   eas build:view <build-id>
   ```

2. **Local build deneyin:**
   ```bash
   eas build --platform ios --profile production --local
   ```

3. **EAS Support'a başvurun:**
   - Build ID ile birlikte
   - Hata mesajları ile birlikte

