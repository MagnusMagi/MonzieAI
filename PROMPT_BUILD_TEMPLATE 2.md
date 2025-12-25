# Prompt Build Template

Bu dokümantasyon, MonzieAI projesinde AI görsel üretimi için prompt'ların nasıl oluşturulduğunu ve build edildiğini açıklar.

## 📋 İçindekiler

1. [Prompt Build Süreci](#prompt-build-süreci)
2. [Prompt Bileşenleri](#prompt-bileşenleri)
3. [Template Yapısı](#template-yapısı)
4. [Örnekler](#örnekler)
5. [Best Practices](#best-practices)

---

## 🔄 Prompt Build Süreci

Prompt build süreci `src/services/imageGenerationService.ts` dosyasında gerçekleşir ve şu adımları içerir:

### Adım 1: Base Prompt Oluşturma

```typescript
// Scene prompt'u varsa kullan, yoksa default prompt oluştur
if (params.scenePrompt) {
  // {gender} placeholder'ını gerçek gender ile değiştir
  prompt = params.scenePrompt.replace(/{gender}/gi, params.gender);
} else {
  prompt = `A professional ${params.gender} portrait`;
}
```

**Örnek:**
- Scene Prompt: `"A professional {gender} portrait with studio lighting"`
- Gender: `"male"`
- Sonuç: `"A professional male portrait with studio lighting"`

### Adım 2: Gender Kontrolü

Prompt'ta gender'ın açıkça belirtildiğinden emin olunur:

```typescript
if (!prompt.toLowerCase().includes(params.gender.toLowerCase())) {
  prompt = `${params.gender} ${prompt}`;
}
```

---

## 🧩 Prompt Bileşenleri

### 1. Scene Prompt (Base Content)

**Kaynak:** Scene entity'den gelen `prompt_template` field'ı

**Placeholder'lar:**
- `{gender}` → Gerçek gender değeri ile değiştirilir (male/female)

**Örnek Scene Prompt:**
```
A young man with a slight smile (see the uploaded picture as reference for the face), wearing outfit: oversized white sweatshirt, lemon green oversized combat jean, styled with footwear: lemon green neutral Nike sneakers and white ribbed socks. Environment: futuristic lemon green-tone studio background. Lighting: soft cinematic glow highlighting skin and fabric textures. Style: fashion editorial x futuristic. Model seats on lemon green bench elegantly with a relaxed posture.
```

---

## 📐 Template Yapısı

### Tam Prompt Yapısı

```
[Scene Prompt (gender replaced)]
```

### Detaylı Yapı

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Scene Prompt                                             │
│    - {gender} placeholder'ı değiştirilmiş                  │
│    - Scene'den gelen prompt_template                        │
│    - Sadece scene prompt kullanılır, ek enhancement yok     │
└─────────────────────────────────────────────────────────────┘
```

---

## 💡 Örnekler

### Örnek 1: Fashion Scene (Greenary)

**Input:**
- Scene Prompt: `"A young man with a slight smile (see the uploaded picture as reference for the face), wearing outfit: oversized white sweatshirt..."`
- Gender: `"male"`
- Image-to-Image: `true`

**Output:**
```
A young man with a slight smile (see the uploaded picture as reference for the face), wearing outfit: oversized white sweatshirt, lemon green oversized combat jean, styled with footwear: lemon green neutral Nike sneakers and white ribbed socks. Environment: futuristic lemon green-tone studio background. Lighting: soft cinematic glow highlighting skin and fabric textures. Style: fashion editorial x futuristic. Model seats on lemon green bench elegantly with a relaxed posture
```

### Örnek 2: Gaming Scene (Nintendo Cinema)

**Input:**
- Scene Prompt: `"A hyperrealistic cinematic shot inside a dark movie theater..."`
- Gender: `"male"`
- Image-to-Image: `true`

**Output:**
```
A hyperrealistic cinematic shot inside a dark movie theater with visible blue seats in the background, filled with various video game characters having fun. The main character, a man (from the provided photo), looks embarrassed, wearing a simple black Nintendo t-shirt, holding a large red and white striped popcorn bucket in one hand...
```

### Örnek 3: Custom Scene (Scene Prompt Yok)

**Input:**
- Scene Prompt: `null`
- Gender: `"female"`
- Image-to-Image: `true`

**Output:**
```
female A professional female portrait
```

---

## ✅ Best Practices

### 1. Scene Prompt Yazarken

✅ **Yapılması Gerekenler:**
- `{gender}` placeholder'ını kullanın
- Yüz referansı için açık talimatlar verin: `"(see the uploaded picture as reference for the face)"`
- Detaylı açıklamalar yapın (kıyafet, ortam, ışık, stil)
- Teknik detaylar ekleyin (camera settings, lens, aperture)

❌ **Yapılmaması Gerekenler:**
- Çok kısa prompt'lar (yeterli detay yok)
- Belirsiz ifadeler ("nice photo", "good quality")
- Gender'ı hardcode etmek (her zaman `{gender}` kullanın)

### 2. Gender Handling

✅ **Doğru Yaklaşım:**
- Scene prompt'ta `{gender}` placeholder kullanın
- Sistem otomatik olarak değiştirir
- Gender kontrolü otomatik yapılır

❌ **Yanlış Yaklaşım:**
- Scene prompt'ta "male" veya "female" hardcode etmek
- Gender'ı prompt'ta belirtmemek

---

## 🔧 Kod Referansları

### Ana Dosya
- `src/services/imageGenerationService.ts` (Satır 116-144)

### İlgili Dosyalar
- `src/services/falAIService.ts` - Fal AI API çağrıları
- `src/domain/entities/Scene.ts` - Scene entity ve prompt formatting
- `src/domain/usecases/GenerateImageUseCase.ts` - Use case layer

### Önemli Fonksiyonlar

```typescript
// Prompt build (imageGenerationService.ts)
async generateImage(params: GenerateImageParams): Promise<GenerateImageResponse> {
  // 1. Base prompt with gender replacement
  let prompt = params.scenePrompt?.replace(/{gender}/gi, params.gender) 
    || `A professional ${params.gender} portrait`;
  
  // 2. Gender check - ensure gender is mentioned
  if (!prompt.toLowerCase().includes(params.gender.toLowerCase())) {
    prompt = `${params.gender} ${prompt}`;
  }
  
  // No quality enhancement or face preservation - using clean scene prompt only
}
```

---

## 📊 Prompt Akış Diyagramı

```
┌─────────────────┐
│ Scene Prompt    │
│ (from DB)       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Replace {gender}│
│ placeholder     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Check Gender    │
│ in Prompt       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Final Prompt    │
│ (to Fal AI)     │
└─────────────────┘
```

---

## 🎯 Model Bilgileri

**Kullanılan Model:** `fal-ai/nano-banana/edit`

**Model Özellikleri:**
- Image-to-image generation
- Image editing
- Face preservation desteği
- Yüksek kalite çıktı

**API Endpoint:** `https://queue.fal.run/fal-ai/nano-banana/edit`

**Parametreler:**
- `prompt`: Final prompt string
- `image_urls`: Array of image URLs (base64 data URI format)
- `num_images`: 1 (default)
- `aspect_ratio`: "auto" veya belirtilen format
- `output_format`: "png" (default)

---

## 📝 Notlar

1. **Gender Placeholder:** Scene prompt'larında her zaman `{gender}` kullanılmalı, hardcode edilmemelidir.

2. **Prompt Length:** Fal AI için maksimum prompt uzunluğu kontrol edilmelidir (şu anda limit yok).

3. **Scene Updates:** Scene prompt'ları güncellendiğinde, mevcut prompt'lar otomatik olarak yeni versiyonu kullanır.

4. **Clean Prompts:** Artık otomatik quality enhancement veya face preservation eklenmez - sadece scene prompt kullanılır.

---

## 🔄 Güncelleme Geçmişi

- **2025-01-27:** Face preservation ve quality enhancement prompt'ları kaldırıldı (kalite sorunları nedeniyle)
- **2025-12-12:** Nano Banana model entegrasyonu

---

## 📚 İlgili Dokümantasyon

- [Fal AI Nano Banana Documentation](https://fal.ai/models/fal-ai/nano-banana/edit)
- [Scene Entity Documentation](./src/domain/entities/Scene.ts)
- [Image Generation Service](./src/services/imageGenerationService.ts)

