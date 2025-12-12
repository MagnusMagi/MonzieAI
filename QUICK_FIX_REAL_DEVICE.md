# Gerçek Cihazda Hızlı Çözüm

## Sorun
"No script URL provided" hatası - Cihaz Metro bundler'a bağlanamıyor.

## Hızlı Çözüm (3 Adım)

### 1. Mevcut Metro Bundler'ı Durdur
Terminal'de `Ctrl+C` ile durdurun veya:
```bash
pkill -f "expo start"
```

### 2. LAN Modunda Yeniden Başlat
```bash
npx expo start --lan
```

**Önemli:** Cihazınız ve bilgisayarınız **aynı WiFi ağında** olmalı!

### 3. Cihazda Uygulamayı Aç
- Development build kullanıyorsanız: Uygulamayı açın, otomatik bağlanacak
- Expo Go kullanıyorsanız: QR kodu tarayın veya manuel IP girin

## Alternatif: Tunnel Modu (Farklı Ağlarda)

Eğer cihaz ve bilgisayar farklı ağlardaysa:
```bash
npx expo start --tunnel
```

## Development Build İçin

Eğer `npx expo run:ios --device` ile build yaptıysanız:
```bash
npx expo start --dev-client --lan
```

## IP Adresi Kontrolü

Bilgisayarınızın IP adresi: **192.168.1.201**

Cihazınızda manuel bağlantı için:
- Expo Go: `exp://192.168.1.201:8081`
- Development Build: Otomatik bağlanır

## Sorun Devam Ederse

1. **Firewall kontrolü:** macOS Firewall Metro bundler'ı engelliyor olabilir
2. **WiFi kontrolü:** Her iki cihaz da aynı ağda mı?
3. **Port kontrolü:** 8081 portu açık mı?

```bash
# Port kontrolü
lsof -i :8081
```

