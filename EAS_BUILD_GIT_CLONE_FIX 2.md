# 🔧 EAS Build Git Clone Sorunu Çözümü

## ⚠️ Sorun

EAS build git clone hatası veriyor:

```
git clone --no-checkout --no-hardlinks --depth 1 file:///path/to/repo
exited with non-zero code: 128
```

## 🔍 Olası Nedenler

1. **Git repository bozuk olabilir**
2. **Git objects dizini sorunlu olabilir**
3. **Git config sorunları**
4. **Büyük dosyalar veya binary dosyalar**

## ✅ Çözümler

### Çözüm 1: Git Repository'yi Optimize Et (Yapıldı)

```bash
git repack -a -d
git gc --aggressive
```

### Çözüm 2: Local Build Kullan

EAS build git repository kullanmak yerine direkt dosya yükleme yapabilir:

```bash
eas build --platform ios --local
```

**Not:** `--local` flag'i build'i yerel makinede yapar, EAS sunucularında değil.

### Çözüm 3: Git Repository'yi Yeniden Initialize Et

Eğer sorun devam ederse:

```bash
# Yedek al
cp -r .git .git.backup

# Git repository'yi temizle ve yeniden oluştur
rm -rf .git
git init
git add .
git commit -m "Reinitialize repository"
```

### Çözüm 4: EAS Build Cache'i Temizle

```bash
eas build --platform ios --clear-cache
```

## 🚀 Önerilen Çözüm

**Local build kullanın** (en hızlı çözüm):

```bash
eas build --platform ios --local
```

Bu komut:
- Git repository kullanmaz
- Dosyaları direkt yükler
- Daha hızlı olabilir
- Yerel makinede build yapar

## 📝 Notlar

- **Local build:** Yerel makinede build yapar, Xcode ve Android SDK gerektirir
- **Cloud build:** EAS sunucularında build yapar, git repository gerektirir
- **Git sorunu:** Genellikle repository bozukluğundan kaynaklanır

## ✅ Durum

- ✅ Git repository optimize edildi
- ✅ Git gc çalıştırıldı
- ⚠️ Eğer sorun devam ederse `--local` flag kullanın

