# MonzieAI - Veritabanı Dokümantasyonu

## 📋 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Database Schema](#database-schema)
3. [Tablolar](#tablolar)
4. [İlişkiler](#ilişkiler)
5. [Indexes](#indexes)
6. [Row Level Security](#row-level-security)
7. [Triggers & Functions](#triggers--functions)
8. [Queries](#queries)
9. [Migrations](#migrations)
10. [Backup & Recovery](#backup--recovery)

## 🎯 Genel Bakış

MonzieAI, Supabase (PostgreSQL) veritabanını kullanır. Veritabanı aşağıdaki ana bileşenleri içerir:

- **Authentication**: Supabase Auth (auth schema)
- **Application Data**: Public schema
- **Storage**: Supabase Storage (storage schema)
- **Realtime**: Supabase Realtime subscriptions

### Database Info
- **Provider**: Supabase (PostgreSQL 15)
- **Location**: US East (N. Virginia)
- **Connection String**: `postgresql://postgres:[PASSWORD]@db.groguatbjerebweinuef.supabase.co:5432/postgres`
- **Schema**: `public`

## 📊 Database Schema

### Schema Diagram

```
┌─────────────────┐
│  auth.users     │
│  (Supabase)     │
└────────┬────────┘
         │
         │ 1:1
         ↓
┌─────────────────┐         ┌──────────────────┐
│   profiles      │────────→│ generated_images │
│  (user data)    │ 1:N     │  (user photos)   │
└─────────────────┘         └────────┬─────────┘
                                     │
                                     │ N:1
                                     ↓
                            ┌─────────────────┐
                            │     scenes      │
                            │  (AI templates) │
                            └─────────────────┘
                                     │
                                     │ 1:N
                                     ↓
                            ┌─────────────────┐
                            │   categories    │
                            │ (scene groups)  │
                            └─────────────────┘

┌─────────────────┐         ┌──────────────────┐
│ usage_tracking  │         │analytics_events  │
│  (user limits)  │         │  (app events)    │
└─────────────────┘         └──────────────────┘
```

## 📋 Tablolar

### 1. profiles

Kullanıcı profil bilgilerini saklar.

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  gender TEXT CHECK (gender IN ('male', 'female')),
  display_name TEXT,
  avatar_url TEXT,
  is_premium BOOLEAN DEFAULT false NOT NULL,
  generation_count INTEGER DEFAULT 0 NOT NULL,
  subscription_status TEXT,
  subscription_expires_at TIMESTAMPTZ,
  revenue_cat_user_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  last_seen_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_is_premium ON public.profiles(is_premium);
CREATE INDEX idx_profiles_revenue_cat_user_id ON public.profiles(revenue_cat_user_id);
```

**Kolonlar**:
- `id`: User UUID (auth.users'dan referans)
- `email`: Kullanıcı email adresi
- `gender`: Kullanıcı cinsiyeti (prompt generation için)
- `display_name`: Görünen ad
- `avatar_url`: Profil fotoğrafı URL
- `is_premium`: Premium üyelik durumu
- `generation_count`: Toplam görsel üretim sayısı
- `subscription_status`: Abonelik durumu (active, canceled, expired)
- `subscription_expires_at`: Abonelik bitiş tarihi
- `revenue_cat_user_id`: RevenueCat user ID

### 2. scenes

AI görsel üretimi için sahne şablonları.

```sql
CREATE TABLE public.scenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  preview_url TEXT,
  thumbnail_url TEXT,
  prompt_template TEXT NOT NULL,
  negative_prompt TEXT,
  style_keywords TEXT[],
  is_active BOOLEAN DEFAULT true NOT NULL,
  is_premium BOOLEAN DEFAULT false NOT NULL,
  order_index INTEGER DEFAULT 0,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT scenes_name_unique UNIQUE (name)
);

-- Indexes
CREATE INDEX idx_scenes_category ON public.scenes(category);
CREATE INDEX idx_scenes_subcategory ON public.scenes(subcategory);
CREATE INDEX idx_scenes_is_active ON public.scenes(is_active);
CREATE INDEX idx_scenes_is_premium ON public.scenes(is_premium);
CREATE INDEX idx_scenes_order ON public.scenes(order_index);
CREATE INDEX idx_scenes_usage ON public.scenes(usage_count DESC);
```

**Kolonlar**:
- `id`: Scene UUID
- `name`: Sahne adı
- `description`: Sahne açıklaması
- `category`: Ana kategori (portrait, outdoor, business, etc.)
- `subcategory`: Alt kategori
- `preview_url`: Önizleme görseli URL
- `thumbnail_url`: Küçük önizleme URL
- `prompt_template`: AI prompt şablonu ({gender}, {style} gibi placeholder'lar içerir)
- `negative_prompt`: Olumsuz prompt (istenmeyen özellikler)
- `style_keywords`: Stil anahtar kelimeleri (array)
- `is_active`: Aktif/pasif durumu
- `is_premium`: Premium sahne mi?
- `order_index`: Sıralama için index
- `usage_count`: Kullanım sayısı

**Örnek Data**:
```sql
INSERT INTO scenes (name, category, prompt_template) VALUES
  ('Professional Portrait', 'portrait', 
   'A professional {gender} portrait with studio lighting, highly detailed, 8k resolution'),
  ('Casual Outdoor', 'outdoor', 
   'A casual {gender} in an outdoor park setting, natural lighting, photorealistic'),
  ('Business Formal', 'business', 
   'A professional {gender} in business attire, office background, corporate style');
```

### 3. generated_images

Kullanıcılar tarafından üretilen görseller.

```sql
CREATE TABLE public.generated_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scene_id UUID NOT NULL REFERENCES public.scenes(id) ON DELETE SET NULL,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  original_photo_url TEXT,
  prompt TEXT NOT NULL,
  negative_prompt TEXT,
  is_favorite BOOLEAN DEFAULT false NOT NULL,
  generation_time REAL,
  model TEXT DEFAULT 'flux-pro-1.1',
  image_size TEXT,
  seed INTEGER,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT generated_images_image_url_unique UNIQUE (image_url)
);

-- Indexes
CREATE INDEX idx_generated_images_user_id ON public.generated_images(user_id);
CREATE INDEX idx_generated_images_scene_id ON public.generated_images(scene_id);
CREATE INDEX idx_generated_images_is_favorite ON public.generated_images(is_favorite);
CREATE INDEX idx_generated_images_created_at ON public.generated_images(created_at DESC);
CREATE INDEX idx_generated_images_user_created ON public.generated_images(user_id, created_at DESC);
CREATE INDEX idx_generated_images_metadata ON public.generated_images USING GIN (metadata);
```

**Kolonlar**:
- `id`: Image UUID
- `user_id`: Kullanıcı ID (profiles referansı)
- `scene_id`: Kullanılan sahne ID
- `image_url`: Üretilen görsel URL (Supabase Storage)
- `thumbnail_url`: Küçük görsel URL
- `original_photo_url`: Orijinal fotoğraf URL
- `prompt`: Kullanılan tam prompt
- `negative_prompt`: Kullanılan negative prompt
- `is_favorite`: Favori olarak işaretlenmiş mi?
- `generation_time`: Üretim süresi (saniye)
- `model`: Kullanılan AI model
- `image_size`: Görsel boyutu
- `seed`: Random seed (tekrar üretim için)
- `metadata`: Ek metadata (JSONB format)

### 4. categories

Sahne kategorileri.

```sql
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  order_index INTEGER DEFAULT 0,
  scene_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_categories_is_active ON public.categories(is_active);
CREATE INDEX idx_categories_order ON public.categories(order_index);
```

**Kolonlar**:
- `id`: Category UUID
- `name`: Kategori adı
- `slug`: URL-friendly slug
- `description`: Kategori açıklaması
- `icon`: Icon adı (Expo icons)
- `thumbnail_url`: Kategori görseli
- `is_active`: Aktif/pasif
- `order_index`: Sıralama
- `scene_count`: Bu kategorideki sahne sayısı

### 5. usage_tracking

Kullanıcı kullanım limitleri takibi.

```sql
CREATE TABLE public.usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE NOT NULL,
  generation_count INTEGER DEFAULT 0 NOT NULL,
  daily_limit INTEGER DEFAULT 10 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT usage_tracking_user_date_unique UNIQUE (user_id, date)
);

-- Indexes
CREATE INDEX idx_usage_tracking_user_id ON public.usage_tracking(user_id);
CREATE INDEX idx_usage_tracking_date ON public.usage_tracking(date);
CREATE INDEX idx_usage_tracking_user_date ON public.usage_tracking(user_id, date);
```

**Kolonlar**:
- `id`: Tracking UUID
- `user_id`: Kullanıcı ID
- `date`: Takip tarihi
- `generation_count`: O gün üretilen görsel sayısı
- `daily_limit`: Günlük limit (free: 10, premium: unlimited)

### 6. analytics_events

Uygulama içi event tracking.

```sql
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  event_name TEXT NOT NULL,
  event_properties JSONB,
  platform TEXT CHECK (platform IN ('ios', 'android', 'web')),
  app_version TEXT,
  device_info JSONB,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_events_event_name ON public.analytics_events(event_name);
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at DESC);
CREATE INDEX idx_analytics_events_properties ON public.analytics_events USING GIN (event_properties);
```

**Kolonlar**:
- `id`: Event UUID
- `user_id`: Kullanıcı ID (opsiyonel)
- `event_name`: Event adı (image_generated, scene_selected, etc.)
- `event_properties`: Event özellikleri (JSONB)
- `platform`: Platform (ios/android/web)
- `app_version`: Uygulama versiyonu
- `device_info`: Cihaz bilgisi
- `session_id`: Session ID

## 🔗 İlişkiler

### Entity Relationship Diagram (ERD)

```
auth.users (1) ──────── (1) profiles
                              │
                              │
                              ├── (1) ──────── (N) generated_images
                              │                      │
                              │                      │
                              │                      └── (N) ──────── (1) scenes
                              │                                              │
                              │                                              │
                              ├── (1) ──────── (N) usage_tracking           │
                              │                                              │
                              └── (1) ──────── (N) analytics_events         │
                                                                             │
                                                              categories (1) ──┘ (N)
```

### Foreign Key Constraints

```sql
-- Profiles → Auth Users
ALTER TABLE profiles 
  ADD CONSTRAINT profiles_id_fkey 
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Generated Images → Profiles
ALTER TABLE generated_images 
  ADD CONSTRAINT generated_images_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Generated Images → Scenes
ALTER TABLE generated_images 
  ADD CONSTRAINT generated_images_scene_id_fkey 
  FOREIGN KEY (scene_id) REFERENCES scenes(id) ON DELETE SET NULL;

-- Usage Tracking → Profiles
ALTER TABLE usage_tracking 
  ADD CONSTRAINT usage_tracking_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Analytics Events → Profiles
ALTER TABLE analytics_events 
  ADD CONSTRAINT analytics_events_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL;
```

## 📑 Indexes

### Performance Indexes

```sql
-- Profiles
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_is_premium ON profiles(is_premium);
CREATE INDEX idx_profiles_last_seen ON profiles(last_seen_at DESC);

-- Scenes
CREATE INDEX idx_scenes_category_active ON scenes(category, is_active);
CREATE INDEX idx_scenes_usage_count ON scenes(usage_count DESC);
CREATE INDEX idx_scenes_name_search ON scenes USING GIN (to_tsvector('english', name));

-- Generated Images
CREATE INDEX idx_generated_images_user_created ON generated_images(user_id, created_at DESC);
CREATE INDEX idx_generated_images_favorites ON generated_images(user_id, is_favorite) WHERE is_favorite = true;
CREATE INDEX idx_generated_images_scene ON generated_images(scene_id, created_at DESC);

-- Analytics
CREATE INDEX idx_analytics_user_event ON analytics_events(user_id, event_name, created_at DESC);
CREATE INDEX idx_analytics_date_range ON analytics_events(created_at) WHERE created_at >= (now() - interval '30 days');

-- Usage Tracking
CREATE INDEX idx_usage_current ON usage_tracking(user_id, date) WHERE date >= CURRENT_DATE - interval '30 days';
```

## 🔒 Row Level Security (RLS)

### Enable RLS on All Tables

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
```

### Profiles Policies

```sql
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Service role can do anything (for backend operations)
CREATE POLICY "Service role has full access to profiles"
  ON profiles FOR ALL
  USING (auth.role() = 'service_role');
```

### Scenes Policies

```sql
-- Everyone can view active scenes
CREATE POLICY "Anyone can view active scenes"
  ON scenes FOR SELECT
  USING (is_active = true);

-- Service role can manage scenes
CREATE POLICY "Service role can manage scenes"
  ON scenes FOR ALL
  USING (auth.role() = 'service_role');
```

### Generated Images Policies

```sql
-- Users can view their own images
CREATE POLICY "Users can view own images"
  ON generated_images FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own images
CREATE POLICY "Users can insert own images"
  ON generated_images FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own images
CREATE POLICY "Users can update own images"
  ON generated_images FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own images
CREATE POLICY "Users can delete own images"
  ON generated_images FOR DELETE
  USING (auth.uid() = user_id);
```

### Categories Policies

```sql
-- Everyone can view active categories
CREATE POLICY "Anyone can view active categories"
  ON categories FOR SELECT
  USING (is_active = true);
```

### Usage Tracking Policies

```sql
-- Users can view their own usage
CREATE POLICY "Users can view own usage"
  ON usage_tracking FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can manage usage tracking
CREATE POLICY "Service role can manage usage"
  ON usage_tracking FOR ALL
  USING (auth.role() = 'service_role');
```

### Analytics Events Policies

```sql
-- Users can insert their own events
CREATE POLICY "Users can insert own events"
  ON analytics_events FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Service role can view all events
CREATE POLICY "Service role can view all events"
  ON analytics_events FOR SELECT
  USING (auth.role() = 'service_role');
```

## ⚙️ Triggers & Functions

### 1. Auto Update Timestamp

```sql
-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scenes_updated_at
  BEFORE UPDATE ON scenes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 2. Auto Create Profile on Signup

```sql
-- Function to create profile when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, gender)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'gender', NULL)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

### 3. Increment Scene Usage Count

```sql
-- Function to increment scene usage
CREATE OR REPLACE FUNCTION increment_scene_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE scenes
  SET usage_count = usage_count + 1
  WHERE id = NEW.scene_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on generated_images insert
CREATE TRIGGER on_image_generated
  AFTER INSERT ON generated_images
  FOR EACH ROW
  EXECUTE FUNCTION increment_scene_usage();
```

### 4. Update Profile Generation Count

```sql
-- Function to update user's generation count
CREATE OR REPLACE FUNCTION update_generation_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET generation_count = generation_count + 1
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER on_generation_count_update
  AFTER INSERT ON generated_images
  FOR EACH ROW
  EXECUTE FUNCTION update_generation_count();
```

### 5. Track Daily Usage

```sql
-- Function to track daily usage
CREATE OR REPLACE FUNCTION track_daily_usage()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO usage_tracking (user_id, date, generation_count)
  VALUES (NEW.user_id, CURRENT_DATE, 1)
  ON CONFLICT (user_id, date)
  DO UPDATE SET generation_count = usage_tracking.generation_count + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER on_daily_usage_track
  AFTER INSERT ON generated_images
  FOR EACH ROW
  EXECUTE FUNCTION track_daily_usage();
```

### 6. Update Category Scene Count

```sql
-- Function to update category scene count
CREATE OR REPLACE FUNCTION update_category_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Increment new category
  IF NEW.category IS NOT NULL THEN
    UPDATE categories
    SET scene_count = (
      SELECT COUNT(*) FROM scenes WHERE category = NEW.category AND is_active = true
    )
    WHERE slug = NEW.category;
  END IF;
  
  -- Decrement old category
  IF OLD.category IS NOT NULL AND OLD.category != NEW.category THEN
    UPDATE categories
    SET scene_count = (
      SELECT COUNT(*) FROM scenes WHERE category = OLD.category AND is_active = true
    )
    WHERE slug = OLD.category;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER on_scene_category_change
  AFTER INSERT OR UPDATE OF category ON scenes
  FOR EACH ROW
  EXECUTE FUNCTION update_category_count();
```

## 🔍 Common Queries

### Get User Profile with Stats

```sql
SELECT 
  p.*,
  COUNT(gi.id) as total_images,
  COUNT(CASE WHEN gi.is_favorite THEN 1 END) as favorite_count,
  MAX(gi.created_at) as last_generation_at
FROM profiles p
LEFT JOIN generated_images gi ON p.id = gi.user_id
WHERE p.id = $1
GROUP BY p.id;
```

### Get User's Recent Images

```sql
SELECT 
  gi.*,
  s.name as scene_name,
  s.category as scene_category
FROM generated_images gi
JOIN scenes s ON gi.scene_id = s.id
WHERE gi.user_id = $1
ORDER BY gi.created_at DESC
LIMIT 20;
```

### Get Popular Scenes

```sql
SELECT 
  s.*,
  COUNT(gi.id) as generation_count
FROM scenes s
LEFT JOIN generated_images gi ON s.id = gi.scene_id
WHERE s.is_active = true
GROUP BY s.id
ORDER BY generation_count DESC, s.usage_count DESC
LIMIT 10;
```

### Check User Daily Limit

```sql
SELECT 
  COALESCE(ut.generation_count, 0) as used,
  CASE 
    WHEN p.is_premium THEN 999999
    ELSE 10
  END as limit,
  p.is_premium
FROM profiles p
LEFT JOIN usage_tracking ut ON p.id = ut.user_id AND ut.date = CURRENT_DATE
WHERE p.id = $1;
```

### Get Categories with Scene Count

```sql
SELECT 
  c.*,
  COUNT(s.id) as active_scene_count
FROM categories c
LEFT JOIN scenes s ON c.slug = s.category AND s.is_active = true
WHERE c.is_active = true
GROUP BY c.id
ORDER BY c.order_index;
```

### Analytics: Daily Generation Stats

```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_generations,
  COUNT(DISTINCT user_id) as unique_users,
  AVG(generation_time) as avg_generation_time
FROM generated_images
WHERE created_at >= CURRENT_DATE - interval '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

## 🔄 Migrations

### Migration Structure

```
migrations/
├── 001_initial_schema.sql
├── 002_add_categories.sql
├── 003_add_usage_tracking.sql
├── 004_add_analytics.sql
└── 005_add_indexes.sql
```

### Run Migrations

```bash
# Using Supabase CLI
supabase db push

# Or manually
psql $DATABASE_URL < migrations/001_initial_schema.sql
```

## 💾 Backup & Recovery

### Automated Backups

Supabase otomatik olarak günlük backup alır:
- **Retention**: 7 gün (Free plan), 30 gün (Pro plan)
- **Location**: AWS S3
- **Type**: Full database dump

### Manual Backup

```bash
# PostgreSQL dump
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Specific tables
pg_dump $DATABASE_URL \
  --table=profiles \
  --table=generated_images \
  --table=scenes \
  > backup_data_$(date +%Y%m%d).sql
```

### Restore

```bash
# Full restore
psql $DATABASE_URL < backup_20240101.sql

# Specific tables
psql $DATABASE_URL -c "TRUNCATE profiles CASCADE;"
psql $DATABASE_URL < backup_profiles.sql
```

## 📈 Database Maintenance

### Vacuum & Analyze

```sql
-- Vacuum all tables
VACUUM ANALYZE profiles;
VACUUM ANALYZE scenes;
VACUUM ANALYZE generated_images;
VACUUM ANALYZE analytics_events;

-- Auto vacuum settings (in postgresql.conf)
autovacuum = on
autovacuum_max_workers = 3
autovacuum_naptime = 1min
```

### Reindex

```sql
-- Reindex specific table
REINDEX TABLE generated_images;

-- Reindex all
REINDEX DATABASE postgres;
```

### Check Table Sizes

```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## 🔧 Performance Optimization

### Connection Pooling

Supabase uses PgBouncer:
- **Max connections**: 15 (Free), 60 (Pro)
- **Pooling mode**: Transaction
- **Connection string**: Use pooler endpoint for better performance

### Query Optimization

```sql
-- Use EXPLAIN ANALYZE
EXPLAIN ANALYZE
SELECT * FROM generated_images 
WHERE user_id = 'uuid' 
ORDER BY created_at DESC 
LIMIT 20;

-- Add covering indexes
CREATE INDEX idx_images_user_cover ON generated_images(user_id, created_at DESC, is_favorite);
```

### Partitioning (Future)

```sql
-- Partition analytics_events by month
CREATE TABLE analytics_events_2024_01 PARTITION OF analytics_events
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

---

**Son Güncelleme**: 2024
**Database Version**: PostgreSQL 15.x
**Provider**: Supabase