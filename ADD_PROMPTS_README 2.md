# Yeni Prompt'ları Eklemek

Bu dosyalar, 10 yeni scene prompt'unu Supabase veritabanına eklemek için kullanılır.

## 📋 Eklenen Prompt'lar

1. **Urban Reflection in Dramatic Light** - Dramatik siyah-beyaz portre
2. **Retrato editorial masculino premium** - Stüdyo portre
3. **Submerged** - Su altı portre
4. **Gini** - 8K fotorealistik portre
5. **A cinematic urban portrait** - Sinematik şehir portresi
6. **Foto black tie** - Siyah-beyaz resmi portre
7. **Propt moto esportiva** - Motosiklet portresi
8. **Studio Photography** - Stüdyo fotoğrafçılığı
9. **Instinct and Spirit** - Aslan ile duygusal sahne
10. **Untamed Spirit** - At ile sinematik portre

Her prompt için:
- ✅ Başlık (name)
- ✅ Açıklama (description)
- ✅ Prompt metni (prompt_template)
- ✅ Önizleme görseli URL'i (preview_url)
- ✅ Kategori (category: "portrait")
- ✅ Aktif durum (is_active: true)

## 🚀 Kullanım Yöntemleri

### Yöntem 1: SQL Dosyası ile (Önerilen)

1. Supabase Dashboard'a giriş yapın
2. SQL Editor'ü açın
3. `add_prompts_to_scenes.sql` dosyasının içeriğini kopyalayın
4. SQL Editor'e yapıştırın ve çalıştırın

```sql
-- Dosyayı açın ve içeriği Supabase SQL Editor'e yapıştırın
```

### Yöntem 2: Node.js Script ile

1. Terminal'de proje dizinine gidin
2. Script'i çalıştırın:

```bash
node add_prompts_to_scenes.js
```

**Not:** Script, mevcut scene'leri kontrol eder ve sadece yeni olanları ekler (duplicate kontrolü yapar).

## 🔍 Doğrulama

Eklenen scene'leri kontrol etmek için:

```sql
SELECT name, category, preview_url IS NOT NULL as has_preview, is_active 
FROM public.scenes 
WHERE name IN (
  'Urban Reflection in Dramatic Light',
  'Retrato editorial masculino premium',
  'Submerged',
  'Gini',
  'A cinematic urban portrait',
  'Foto black tie',
  'Propt moto esportiva',
  'Studio Photography',
  'Instinct and Spirit',
  'Untamed Spirit'
)
ORDER BY created_at DESC;
```

## 📝 Önemli Notlar

- Tüm prompt'lar `portrait` kategorisinde
- Tüm prompt'lar aktif durumda (`is_active = true`)
- Her prompt'un bir önizleme görseli URL'i var
- SQL script'inde `ON CONFLICT DO NOTHING` kullanıldı, bu yüzden tekrar çalıştırıldığında duplicate oluşmaz
- Node.js script'i de duplicate kontrolü yapar

## 🎨 Preview Görselleri

Tüm preview görselleri `cdn.bananaprompts.xyz` üzerinden servis ediliyor ve yüksek çözünürlükte (3840px genişlik).

## ✅ Başarı Kontrolü

Prompt'lar başarıyla eklendikten sonra:

1. Uygulamada Scene Selection ekranında görünmeli
2. Her scene'in preview görseli yüklenmeli
3. Scene seçildiğinde prompt metni kullanılabilir olmalı

## 🔧 Sorun Giderme

### Scene'ler görünmüyor

1. Supabase'de `scenes` tablosunu kontrol edin
2. `is_active = true` olduğundan emin olun
3. RLS (Row Level Security) policy'lerini kontrol edin
4. Uygulamayı yeniden başlatın

### Preview görselleri yüklenmiyor

1. URL'lerin erişilebilir olduğunu kontrol edin
2. CORS ayarlarını kontrol edin
3. Network loglarını inceleyin

### Duplicate hatası

- SQL script'i `ON CONFLICT DO NOTHING` kullanır, bu yüzden duplicate oluşmaz
- Node.js script'i duplicate kontrolü yapar ve atlar

