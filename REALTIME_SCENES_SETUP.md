# 🔄 Real-time Scenes Subscription - Kurulum

## ✅ Tamamlanan İşlemler

### 1. Real-time Hook Oluşturuldu
- ✅ `src/hooks/useRealtimeScenes.ts` oluşturuldu
- ✅ INSERT, UPDATE, DELETE event'lerini dinliyor
- ✅ Category ve isActive filtreleme desteği

### 2. HomeViewModel Entegrasyonu
- ✅ `useHomeViewModel` hook'una real-time subscription eklendi
- ✅ ViewModel'e `updateScenes()` metodu eklendi
- ✅ Real-time scenes otomatik olarak ViewModel'e senkronize ediliyor

## ⚠️ Önemli: Supabase Real-time Ayarları

Real-time subscription'ın çalışması için Supabase'de real-time publication'ın aktif olması gerekiyor.

### Supabase Dashboard'da Kontrol:

1. **Supabase Dashboard** → **Database** → **Replication**
2. `scenes` tablosunun real-time için aktif olduğundan emin olun
3. Eğer aktif değilse, `scenes` tablosunu real-time publication'a ekleyin

### SQL ile Kontrol ve Aktifleştirme:

```sql
-- Real-time publication'ı kontrol et
SELECT * FROM pg_publication WHERE pubname = 'supabase_realtime';

-- Scenes tablosunu real-time'a ekle (eğer yoksa)
ALTER PUBLICATION supabase_realtime ADD TABLE scenes;
```

## 🎯 Nasıl Çalışıyor?

1. **Uygulama Açıldığında:**
   - Initial load yapılır (normal query)
   - Real-time subscription başlatılır

2. **Supabase'de Yeni Sahne Eklendiğinde:**
   - Real-time subscription INSERT event'ini yakalar
   - Yeni sahne otomatik olarak listeye eklenir
   - UI otomatik güncellenir

3. **Sahne Güncellendiğinde:**
   - UPDATE event yakalanır
   - Sahne bilgileri otomatik güncellenir

4. **Sahne Silindiğinde:**
   - DELETE event yakalanır
   - Sahne listeden otomatik kaldırılır

## 📊 Avantajlar

- ✅ **Otomatik Güncelleme:** Build gerekmez
- ✅ **Anında Senkronizasyon:** Supabase'de değişiklik anında uygulamada görünür
- ✅ **Kullanıcı Deneyimi:** Pull-to-refresh'e gerek yok
- ✅ **Çoklu Cihaz:** Tüm cihazlarda aynı anda güncellenir

## 🔍 Test Etme

1. Supabase Dashboard'da `scenes` tablosuna yeni bir sahne ekleyin
2. Uygulamada otomatik olarak görünmesi gerekir
3. Sahneyi güncelleyin veya silin
4. Uygulamada otomatik güncellenmesi gerekir

## 📝 Notlar

- Real-time subscription sadece aktif sahneler (`is_active = true`) için çalışır
- Category filtreleme desteklenir
- Subscription cleanup otomatik yapılır (component unmount'ta)

---

**Durum:** ✅ Kod hazır, Supabase real-time ayarları kontrol edilmeli

