# 📦 Supabase Storage Buckets Setup

## 🚀 Hızlı Kurulum

Supabase Storage bucket'larını oluşturmak için:

### Adım 1: Supabase Dashboard'a Giriş
1. https://supabase.com/dashboard adresine gidin
2. Projenizi seçin: `groguatbjerebweinuef`

### Adım 2: Storage Bölümüne Gidin
1. Sol menüden **Storage**'ı seçin
2. **New bucket** butonuna tıklayın

### Adım 3: Bucket'ları Oluşturun

#### 1. `generated-images` Bucket
- **Name:** `generated-images`
- **Public bucket:** ✅ **Evet** (herkes okuyabilir)
- **File size limit:** 10 MB (veya ihtiyacınıza göre)
- **Allowed MIME types:** `image/jpeg, image/png, image/webp`

**RLS Policies:**
```sql
-- Allow public read access
CREATE POLICY "Public read access for generated-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'generated-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload to generated-images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'generated-images' 
  AND auth.role() = 'authenticated'
);

-- Allow users to update their own files
CREATE POLICY "Users can update their own files in generated-images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'generated-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

#### 2. `enhanced-images` Bucket
- **Name:** `enhanced-images`
- **Public bucket:** ✅ **Evet**
- **File size limit:** 20 MB (enhanced images daha büyük olabilir)
- **Allowed MIME types:** `image/jpeg, image/png, image/webp`

**RLS Policies:**
```sql
-- Allow public read access
CREATE POLICY "Public read access for enhanced-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'enhanced-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload to enhanced-images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'enhanced-images' 
  AND auth.role() = 'authenticated'
);
```

#### 3. `user-uploads` Bucket (Opsiyonel)
- **Name:** `user-uploads`
- **Public bucket:** ❌ **Hayır** (private)
- **File size limit:** 10 MB

**RLS Policies:**
```sql
-- Users can only read their own files
CREATE POLICY "Users can read their own uploads"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'user-uploads' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can upload their own files
CREATE POLICY "Users can upload to user-uploads"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-uploads' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### Adım 4: RLS Policies'i Uygulayın

1. Supabase Dashboard > **Storage** > **Policies**
2. Her bucket için yukarıdaki policy'leri ekleyin
3. Veya SQL Editor'dan direkt çalıştırın

### ✅ Kontrol

Bucket'ların oluşturulduğunu kontrol etmek için:

```typescript
// Test upload
import { storageService } from './src/services/storageService';

const result = await storageService.uploadImage({
  imageUri: 'file://path/to/image.jpg',
  bucket: 'generated-images',
  fileName: 'test.jpg',
  userId: 'user-id',
});

console.log('Upload result:', result);
```

## 📝 Notlar

- **Public buckets:** CDN üzerinden hızlı erişim sağlar
- **Private buckets:** Kullanıcı bazlı erişim kontrolü için
- **File naming:** `{userId}_{timestamp}_{random}.jpg` formatı önerilir
- **CDN:** Supabase otomatik olarak CDN sağlar (public buckets için)

## 🔒 Güvenlik

- Public bucket'larda hassas veri saklamayın
- File size limitlerini ayarlayın
- MIME type kontrolü yapın
- RLS policies'i mutlaka uygulayın

