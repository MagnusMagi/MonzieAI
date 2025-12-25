# 🔧 EAS Build Dependency Conflict Çözümü

## ⚠️ Sorun

EAS build sırasında dependency conflict hatası:

```
npm error ERESOLVE could not resolve
npm error While resolving: react-test-renderer@19.2.1
npm error Found: react@19.1.0
npm error Could not resolve dependency:
npm error peer react@"^19.2.1" from react-test-renderer@19.2.1
```

## 🔍 Kök Neden

- `react-test-renderer@19.2.1` `react@^19.2.1` gerektiriyor
- Projede `react@19.1.0` var
- EAS build `npm ci` kullanıyor (strict dependency resolution)

## ✅ Çözümler

### Çözüm 1: .npmrc Dosyası Oluştur (Yapıldı)

`.npmrc` dosyası oluşturuldu:

```
legacy-peer-deps=true
```

Bu dosya EAS build tarafından otomatik olarak okunur ve `npm ci` komutuna `--legacy-peer-deps` flag'ini ekler.

### Çözüm 2: react-test-renderer Versiyonunu Güncelle (Yapıldı)

`package.json`'da `react-test-renderer` versiyonu `react@19.1.0` ile uyumlu hale getirildi:

```json
{
  "devDependencies": {
    "react-test-renderer": "19.1.0"  // 19.2.1 yerine
  }
}
```

## 📝 Yapılan Değişiklikler

1. **`.npmrc` dosyası oluşturuldu:**
   ```
   legacy-peer-deps=true
   ```

2. **`package.json` güncellendi:**
   - `react-test-renderer`: `19.2.1` → `19.1.0`

3. **Değişiklikler commit edildi**

## 🚀 Build Tekrar Deneme

Artık build yapabilirsiniz:

```bash
eas build --platform ios --profile production
```

## 🔍 Alternatif Çözümler

### Çözüm 3: React Versiyonunu Güncelle

Eğer sorun devam ederse, React'i güncelleyebilirsiniz:

```bash
npm install react@19.2.1 react-native@0.81.5
```

**Not:** Bu diğer bağımlılıkları etkileyebilir.

### Çözüm 4: react-test-renderer'ı Kaldır (Test için)

Eğer test'ler kritik değilse:

```bash
npm uninstall react-test-renderer
```

## ✅ Durum

- ✅ `.npmrc` dosyası oluşturuldu
- ✅ `react-test-renderer` versiyonu güncellendi
- ✅ Değişiklikler commit edildi
- ✅ EAS build hazır

## 📝 Notlar

- `.npmrc` dosyası git'e commit edilmeli (EAS build için gerekli)
- `legacy-peer-deps=true` tüm npm komutlarını etkiler
- Bu ayar dependency conflict'leri atlar

## 🔍 Kontrol

Build öncesi kontrol edin:

```bash
# .npmrc dosyası var mı?
cat .npmrc

# react-test-renderer versiyonu doğru mu?
grep react-test-renderer package.json
```

