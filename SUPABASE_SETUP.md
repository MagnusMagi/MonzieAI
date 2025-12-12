# Supabase Tablo Oluşturma Rehberi

## 🚀 Hızlı Kurulum

Supabase'de `scenes` tablosunu oluşturmak için:

### Adım 1: Supabase Dashboard'a Giriş
1. https://supabase.com/dashboard adresine gidin
2. Projenizi seçin: `groguatbjerebweinuef`

### Adım 2: SQL Editor'ı Açın
1. Sol menüden **SQL Editor**'ı seçin
2. **New Query** butonuna tıklayın

### Adım 3: SQL'i Çalıştırın
Aşağıdaki SQL'i kopyalayıp SQL Editor'a yapıştırın ve **Run** butonuna tıklayın:

```sql
-- Create scenes table
CREATE TABLE IF NOT EXISTS public.scenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  preview_url TEXT,
  prompt_template TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_scenes_category ON public.scenes(category);
CREATE INDEX IF NOT EXISTS idx_scenes_is_active ON public.scenes(is_active);
CREATE INDEX IF NOT EXISTS idx_scenes_name ON public.scenes(name);

-- Enable Row Level Security (RLS)
ALTER TABLE public.scenes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous read access to active scenes
CREATE POLICY "Allow anonymous read access to active scenes"
  ON public.scenes
  FOR SELECT
  USING (is_active = true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_scenes_updated_at
  BEFORE UPDATE ON public.scenes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional)
INSERT INTO public.scenes (name, description, category, prompt_template, is_active) VALUES
  ('Professional Portrait', 'A professional portrait scene', 'portrait', 'A professional {gender} portrait with studio lighting', true),
  ('Casual Outdoor', 'A casual outdoor scene', 'outdoor', 'A casual {gender} in an outdoor setting', true),
  ('Business Formal', 'A formal business scene', 'business', 'A professional {gender} in business attire', true)
ON CONFLICT DO NOTHING;
```

### Adım 4: Doğrulama
SQL başarıyla çalıştıktan sonra, uygulamanızı yeniden başlatın. Hata düzelecektir!

## ✅ Kontrol
Tablonun oluşturulduğunu kontrol etmek için:

```sql
SELECT * FROM public.scenes;
```

Bu sorgu örnek verileri gösterecektir.


