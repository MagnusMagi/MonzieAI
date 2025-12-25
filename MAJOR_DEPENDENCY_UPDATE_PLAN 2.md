# 📦 Major Dependency Update Plan

**Tarih:** 2025-01-27  
**Durum:** Planlama Aşaması

---

## 🎯 Güncellenecek Paketler

### 1. React Native: 0.81.5 → 0.83.0
**Öncelik:** 🔴 YÜKSEK  
**Breaking Changes:** Evet  
**Risk:** Yüksek

#### Breaking Changes:
- New Architecture (Fabric/TurboModules) zorunlu olabilir
- Native module API değişiklikleri
- Metro bundler değişiklikleri
- Android/iOS minimum version gereksinimleri artabilir

#### Yapılacaklar:
1. [ ] Expo SDK uyumluluğunu kontrol et (Expo 54 → 55+ gerekebilir)
2. [ ] Native module'leri test et (@react-native-google-signin, expo modules)
3. [ ] Android/iOS build testleri
4. [ ] Metro config güncellemeleri
5. [ ] Performance testleri

#### Tahmini Süre: 2-3 gün

---

### 2. ESLint: 8.57.1 → 9.39.1
**Öncelik:** 🟡 ORTA  
**Breaking Changes:** Evet  
**Risk:** Orta

#### Breaking Changes:
- Flat config format (eslint.config.js)
- Plugin API değişiklikleri
- Rule format değişiklikleri

#### Yapılacaklar:
1. [ ] Mevcut `.eslintrc` → `eslint.config.js` migration
2. [ ] Plugin'leri güncelle (@typescript-eslint, eslint-config-expo)
3. [ ] Rule'ları test et
4. [ ] CI/CD pipeline'da lint testleri

#### Tahmini Süre: 4-6 saat

---

### 3. Jest: 29.7.0 → 30.2.0
**Öncelik:** 🟡 ORTA  
**Breaking Changes:** Evet  
**Risk:** Orta

#### Breaking Changes:
- ESM support değişiklikleri
- Config format değişiklikleri
- Snapshot format değişiklikleri

#### Yapılacaklar:
1. [ ] Jest config güncellemeleri
2. [ ] Test dosyalarını güncelle
3. [ ] Snapshot'ları yeniden oluştur
4. [ ] Test coverage kontrolü

#### Tahmini Süre: 3-4 saat

---

## 📋 Migration Stratejisi

### Aşama 1: Hazırlık (1 gün)
- [ ] Tüm testleri çalıştır ve geçtiğinden emin ol
- [ ] Backup oluştur (git branch)
- [ ] Dependency tree analizi
- [ ] Breaking changes dokümantasyonunu oku

### Aşama 2: ESLint Güncelleme (1 gün)
- [ ] ESLint 9'a geç
- [ ] Config migration
- [ ] Test ve düzeltmeler

### Aşama 3: Jest Güncelleme (1 gün)
- [ ] Jest 30'a geç
- [ ] Test güncellemeleri
- [ ] Coverage kontrolü

### Aşama 4: React Native Güncelleme (2-3 gün)
- [ ] Expo SDK uyumluluğu kontrolü
- [ ] React Native 0.83'e geç
- [ ] Native module testleri
- [ ] Build testleri (iOS/Android)
- [ ] Performance testleri

### Aşama 5: Test ve Doğrulama (1 gün)
- [ ] Tüm testleri çalıştır
- [ ] Manual test (iOS/Android)
- [ ] Performance benchmark
- [ ] Memory leak kontrolü

---

## ⚠️ Risk Analizi

### Yüksek Risk:
- **React Native 0.83:** Native module uyumsuzlukları, build hataları
- **Expo SDK:** Expo 54 → 55+ migration gerekebilir

### Orta Risk:
- **ESLint 9:** Config migration, rule değişiklikleri
- **Jest 30:** Test format değişiklikleri

### Düşük Risk:
- **Diğer minor güncellemeler**

---

## 🚀 Önerilen Yaklaşım

### Seçenek 1: Aşamalı Güncelleme (Önerilen)
1. ESLint → Jest → React Native sırasıyla
2. Her aşamada test ve doğrulama
3. Risk azaltma

### Seçenek 2: Tek Seferde Güncelleme
1. Tüm paketleri aynı anda güncelle
2. Daha hızlı ama riskli
3. Debug zorluğu

---

## 📝 Notlar

- React Native 0.83 için Expo SDK 55+ gerekebilir
- Native module'ler (@react-native-google-signin) test edilmeli
- Performance impact değerlendirilmeli
- Production'a geçmeden önce kapsamlı test

---

**Son Güncelleme:** 2025-01-27  
**Durum:** Planlama tamamlandı, uygulama bekliyor

