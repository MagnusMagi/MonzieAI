# iOS Build Hatası - CallInvoker Çözümü

## Sorun
```
no member named 'CallInvoker' in namespace 'facebook::react'
```

Bu, `expo-modules-core@3.0.28` ile React Native 0.82.1 arasındaki uyumsuzluktan kaynaklanıyor.

## Çözüm 1: Xcode'da Manuel Build (Önerilen)

1. **Native klasörleri oluştur:**
   ```bash
   npx expo prebuild --platform ios
   ```

2. **Xcode'da projeyi aç:**
   ```bash
   open ios/monzieai.xcworkspace
   ```

3. **Xcode'da:**
   - Product → Clean Build Folder (⇧⌘K)
   - Product → Build (⌘B)
   - Hata devam ederse: File → Workspace Settings → Build System → "Legacy Build System" seç

## Çözüm 2: Podfile'da React Native Versiyonunu Düzelt

`ios/Podfile` dosyasını aç ve React Native versiyonunu kontrol et:

```ruby
# Podfile içinde
pod 'React-Core', :path => '../node_modules/react-native'
```

Sonra:
```bash
cd ios
pod install
cd ..
npx expo run:ios
```

## Çözüm 3: Expo SDK'yı Güncelle

```bash
npx expo upgrade
npx expo install --fix
npx expo run:ios
```

## Çözüm 4: DerivedData Temizle

```bash
rm -rf ~/Library/Developer/Xcode/DerivedData/*
npx expo run:ios
```

## Not
Bu hata Expo SDK 54'ün React Native 0.82.1 ile tam uyumlu olmamasından kaynaklanıyor. 
Expo ekibi bu sorunu çözmek için çalışıyor.

