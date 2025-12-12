# 🔧 EAS Build Plugin Sorunu Çözümü

## ⚠️ Sorun

EAS build plugin'leri bulamıyor:

```
Failed to resolve plugin for module "expo-font" relative to "/path/to/project"
npx expo config --json exited with non-zero code: 1
```

## 🔍 Kök Neden

- `node_modules` eksik veya bozuk
- Dependency conflict (React versiyonları uyumsuz)
- npm install başarısız olmuş

## ✅ Çözüm

### 1. node_modules'ı Temizle ve Yeniden Yükle

```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

**Not:** `--legacy-peer-deps` flag'i dependency conflict'leri atlar.

### 2. Expo Config'i Test Et

```bash
npx expo config --json
```

Bu komut başarılı olmalı (hata vermemeli).

### 3. EAS Build Tekrar Dene

```bash
eas build --platform ios --profile production
```

## 📝 Alternatif Çözümler

### Çözüm 1: npm cache temizle

```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Çözüm 2: Yarn kullan (npm yerine)

```bash
rm -rf node_modules package-lock.json
yarn install
```

### Çözüm 3: Expo CLI güncelle

```bash
npm install -g expo-cli@latest
npx expo install --fix
```

## 🔍 Kontrol Listesi

Build öncesi kontrol edin:

- [ ] `node_modules` mevcut ve tam
- [ ] `npx expo config --json` başarılı
- [ ] Tüm Expo plugin'leri yüklü
- [ ] `package.json` güncel

## ✅ Durum

- ✅ `npm install --legacy-peer-deps` çalıştırıldı
- ⚠️ `npx expo config --json` test edilmeli
- ⚠️ EAS build tekrar denenmeli

## 🚀 Sonraki Adımlar

1. **Expo config'i test et:**
   ```bash
   npx expo config --json
   ```

2. **Eğer başarılıysa, build yap:**
   ```bash
   eas build --platform ios --profile production
   ```

3. **Eğer hala hata varsa:**
   - npm cache temizle
   - `npx expo install --fix` çalıştır
   - Tekrar build dene

