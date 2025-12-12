# iOS Build Hatası Çözümü

## Sorun
`CallInvoker` API uyumsuzluğu: `no member named 'CallInvoker' in namespace 'facebook::react'`

## Çözüm Adımları

### 1. Xcode DerivedData'yı Temizle
```bash
rm -rf ~/Library/Developer/Xcode/DerivedData/*
```

### 2. Native Klasörleri Temizle ve Yeniden Oluştur
```bash
# Native klasörleri sil
rm -rf ios android

# Expo run:ios otomatik olarak prebuild yapacak
npx expo run:ios
```

### 3. Alternatif: Manuel Prebuild
Eğer yukarıdaki adım çalışmazsa:
```bash
# Prebuild yap
npx expo prebuild --platform ios

# Pods yükle
cd ios
pod install
cd ..

# Build et
npx expo run:ios
```

### 4. CocoaPods Cache Temizle (Gerekirse)
```bash
cd ios
pod deintegrate
rm -rf Pods Podfile.lock
pod cache clean --all
pod install --repo-update
cd ..
```

### 5. Node Modules ve Cache Temizle (Son Çare)
```bash
rm -rf node_modules package-lock.json
npm install
npx expo run:ios
```

## Not
Bu hata genellikle Expo SDK 54 ile React Native 0.82.1 arasındaki uyumsuzluktan kaynaklanır. 
`expo-modules-core@3.0.28` versiyonu React Native'in yeni `CallInvoker` API'sini desteklemiyor olabilir.

## Geçici Çözüm
Eğer sorun devam ederse, Expo SDK'yı güncellemeyi deneyin:
```bash
npx expo upgrade
```

