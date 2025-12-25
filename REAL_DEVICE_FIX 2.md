# Gerçek Cihazda "No Script URL Provided" Hatası Çözümü

## Sorun
Gerçek iOS cihazında uygulama açıldığında Metro bundler'a bağlanamıyor.

## Çözüm 1: Metro Bundler'ı LAN Modunda Başlat (Önerilen)

```bash
# Terminal 1: Metro bundler'ı LAN modunda başlat
npx expo start --lan

# Veya tunnel modu (farklı ağlarda)
npx expo start --tunnel
```

**Önemli:** Cihazınız ve bilgisayarınız **aynı WiFi ağında** olmalı.

## Çözüm 2: Manuel IP Adresi Ayarla

1. **Bilgisayarınızın IP adresini bulun:**
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```
   Örnek: `192.168.1.100`

2. **Metro bundler'ı başlatın:**
   ```bash
   EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0 npx expo start --lan
   ```

3. **Cihazda Expo Go uygulamasını açın ve IP adresini manuel girin:**
   - Expo Go → "Enter URL manually"
   - `exp://192.168.1.100:8081` (IP adresinizi kullanın)

## Çözüm 3: Development Build Kullan

Eğer Expo Go kullanmıyorsanız, development build yapın:

```bash
# Development build oluştur
npx expo run:ios --device

# Metro bundler'ı başlat
npx expo start --dev-client
```

## Çözüm 4: Production Build (Embedded Bundle)

Production build yaparak Metro bundler'a ihtiyaç duymadan çalıştırın:

```bash
# Production build
npx expo run:ios --configuration Release

# Veya EAS Build
eas build --platform ios --profile production
```

## Çözüm 5: Info.plist'te ATS Ayarları

`ios/monzieai/Info.plist` dosyasına ekleyin:

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsLocalNetworking</key>
    <true/>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>
```

## Hızlı Kontrol Listesi

- [ ] Metro bundler çalışıyor mu? (`npx expo start`)
- [ ] Cihaz ve bilgisayar aynı WiFi ağında mı?
- [ ] Firewall Metro bundler'ı engelliyor mu?
- [ ] `--lan` veya `--tunnel` flag'i kullanıldı mı?
- [ ] Development build mi yoksa Expo Go mu kullanılıyor?

## Debug Adımları

1. **Metro bundler loglarını kontrol edin:**
   ```bash
   npx expo start --lan --verbose
   ```

2. **Cihazın IP adresini kontrol edin:**
   - iOS: Settings → WiFi → (Ağ adına tıklayın) → IP Address

3. **Ping testi:**
   ```bash
   ping [CIHAZ_IP_ADRESI]
   ```

## Not
- Expo Go kullanıyorsanız, `--lan` modu şarttır
- Development build kullanıyorsanız, `--dev-client` flag'i gerekir
- Production build'de Metro bundler gerekmez (bundle embedded)

