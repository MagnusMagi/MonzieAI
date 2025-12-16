# 📋 Supabase Implementation - Todo List

## 🔴 Kritik (Uygulama Çalışması İçin Gerekli)

### 1. Edge Functions Deployment
- [ ] **edge-functions-deploy**: Supabase CLI ile `generate-image` ve `enhance-image` deploy et
  - Komut: `supabase functions deploy generate-image`
  - Komut: `supabase functions deploy enhance-image`
  - Önkoşul: Supabase CLI kurulu ve login olunmuş olmalı
  - Önkoşul: Project link edilmiş olmalı (`supabase link --project-ref groguatbjerebweinuef`)

- [ ] **edge-functions-secrets**: FAL_API_KEY'i Supabase secrets'a ekle
  - Komut: `supabase secrets set FAL_API_KEY=81fbe3b1-9c8f-40f6-a2f1-21f613bb7452:d908e8ab5ba1b178a55d162e326335e6`
  - Alternatif: Supabase Dashboard > Edge Functions > Secrets

- [ ] **edge-functions-test**: Edge Functions'ları test et
  - Supabase Dashboard > Edge Functions > Logs kontrol et
  - Test request gönder ve response kontrol et
  - Error handling test et

---

## 🟡 Önemli (Kullanıcı Deneyimi)

### 2. UI Entegrasyonları

- [ ] **ui-profile-statistics**: ProfileScreen'e user_statistics view ekle
  - Dosya: `src/screens/ProfileScreen.tsx`
  - Gösterilecekler:
    - Total images
    - Total favorites
    - Total views
    - Total likes
  - Tasarım: Statistics card veya section

- [ ] **ui-home-trending**: HomeScreen'e trending_images view ekle
  - Dosya: `src/screens/HomeScreen.tsx`
  - Gösterilecekler:
    - Son 7 günün trending görselleri
    - Trending score'a göre sıralı
  - Tasarım: "Trending" section (horizontal scroll)

- [ ] **ui-scene-recommendations**: SceneSelectionScreen'e get_user_recommendations RPC ekle
  - Dosya: `src/screens/SceneSelectionScreen.tsx`
  - Gösterilecekler:
    - Kullanıcıya önerilen sahneler
    - Match reason ve score
  - Tasarım: "Recommended for you" section

- [ ] **ui-profile-activity**: ProfileScreen'e get_user_activity_summary RPC ekle
  - Dosya: `src/screens/ProfileScreen.tsx`
  - Gösterilecekler:
    - Total images (son 30 gün)
    - Total likes
    - Total views
    - Favorite categories
    - Most used scene
  - Tasarım: Activity summary card

- [ ] **ui-category-statistics**: Analytics/Stats screen'e category_statistics view ekle (opsiyonel)
  - Yeni dosya: `src/screens/AnalyticsScreen.tsx` (opsiyonel)
  - Gösterilecekler:
    - Category bazlı istatistikler
    - Scene count, total images, avg likes, avg views
  - Tasarım: Statistics table veya cards

---

## 🟢 İyileştirmeler

### 3. Materialized View Refresh

- [ ] **materialized-view-refresh**: Scheduled refresh mekanizması ekle
  - Seçenek 1: Supabase Cron Jobs (pg_cron extension)
  - Seçenek 2: Edge Function + Supabase Scheduled Functions
  - Seçenek 3: External cron job (Supabase API call)
  - Frequency: Günlük (gece yarısı)
  - Function: `refresh_daily_image_stats()`

---

## 🧪 Testing

### 4. Database Özellikleri Test

- [ ] **test-database-views**: Database Views test et
  - SQL Editor'da query çalıştır:
    ```sql
    SELECT * FROM user_statistics LIMIT 5;
    SELECT * FROM trending_images LIMIT 10;
    SELECT * FROM category_statistics;
    ```
  - Sonuçları kontrol et
  - Performance test et

- [ ] **test-database-functions**: Database Functions (RPC) test et
  - SQL Editor'da RPC calls test:
    ```sql
    SELECT * FROM get_user_recommendations('user-uuid');
    SELECT * FROM get_trending_scenes(7);
    SELECT * FROM get_user_activity_summary('user-uuid', 30);
    ```
  - Sonuçları kontrol et
  - Error handling test et

- [ ] **test-database-triggers**: Database Triggers test et
  - Test: Yeni image INSERT et → scene updated_at güncellendi mi?
  - Test: Image DELETE et → scene updated_at güncellendi mi?
  - Test: Yeni image INSERT et → user updated_at güncellendi mi?
  - Logs kontrol et

- [ ] **test-materialized-view**: Materialized View test et
  - Query test: `SELECT * FROM daily_image_stats LIMIT 10;`
  - Refresh test: `SELECT refresh_daily_image_stats();`
  - Performance test et

### 5. Client-side Integration Test

- [ ] **test-client-integration**: falAIService.ts Edge Functions entegrasyonu test et
  - Test: `generateImage()` çağrısı → Edge Function'a istek gidiyor mu?
  - Test: `enhanceImage()` çağrısı → Edge Function'a istek gidiyor mu?
  - Test: Error handling → Edge Function hata verdiğinde doğru handle ediliyor mu?
  - Test: Progress callbacks → Çalışıyor mu?
  - Test: Session token → Doğru gönderiliyor mu?

---

## 📊 İlerleme Durumu

### Tamamlanan: 6/14
- ✅ Edge Functions client-side entegrasyonu
- ✅ Database Views (3 adet)
- ✅ Database Functions (3 adet)
- ✅ Database Triggers (2 adet)
- ✅ Materialized Views (1 adet)
- ✅ Edge Functions dosyaları (2 adet)

### Kalan: 14/14
- 🔴 Edge Functions deployment (3 todo)
- 🟡 UI entegrasyonları (5 todo)
- 🟢 Materialized View refresh (1 todo)
- 🧪 Testing (5 todo)

---

## 🎯 Öncelik Sırası

### Faz 1: Kritik (Hemen)
1. Edge Functions deployment
2. Edge Functions secrets
3. Edge Functions test

### Faz 2: Önemli (Bu Hafta)
4. UI entegrasyonları (ProfileScreen, HomeScreen, SceneSelectionScreen)
5. Materialized View refresh

### Faz 3: Testing (Sonra)
6. Tüm test senaryoları

---

## 📝 Notlar

- **Edge Functions deployment** olmadan uygulama çalışmayacak
- **UI entegrasyonları** kullanıcı deneyimi için önemli
- **Testing** production'a geçmeden önce mutlaka yapılmalı
- Tüm todo'lar tamamlandığında Supabase özellikleri %100 kullanılabilir olacak

---

## 🔗 Kaynaklar

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Supabase CLI](https://supabase.com/docs/reference/cli)
- [Supabase Database Functions](https://supabase.com/docs/guides/database/functions)

