# 🧪 Fal AI API Curl Test Rehberi

**Amaç:** Gender seçimi akışını curl ile test etmek

---

## 📋 Test Senaryosu

### Senaryo: Male Gender + Professional Portrait Scene

**Parametreler:**
- Gender: `male`
- Scene: `Professional Portrait`
- Strength: `0.8` (Yüz koruması için)
- Guidance Scale: `7.5`
- Image: Base64 encoded reference image

---

## 🚀 Kullanım

### 1. API Key Ayarlama

```bash
# Environment variable olarak
export FAL_API_KEY='your-fal-api-key'

# Veya script çalıştırırken soracak
./test_fal_ai_curl.sh
```

### 2. Script Çalıştırma

```bash
cd /Users/magnusmagi/Desktop/expo-1/monzieai
./test_fal_ai_curl.sh
```

---

## 📝 Manuel Curl Komutları

### Adım 1: Submit Request

```bash
curl -X POST "https://queue.fal.run/fal-ai/flux/dev" \
  -H "Authorization: Key YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "[CRITICAL: Use the reference image as the EXACT face template. Maintain identical facial features: same face shape, same eyes (color, shape, size), same nose, same mouth, same eyebrows, same hairline, same skin tone, same facial structure. The person in the reference image MUST be the person in the generated image. Do not change the face identity. Only adapt the scene/background/clothing while keeping the face 100% identical.] A professional male portrait, high quality, professional photography, 8k resolution, ultra realistic, detailed, sharp focus",
    "image_size": "portrait_4_3",
    "num_images": 1,
    "image_url": "data:image/jpeg;base64,YOUR_BASE64_IMAGE",
    "strength": 0.8,
    "guidance_scale": 7.5
  }'
```

**Response:**
```json
{
  "request_id": "abc123...",
  "status_url": "https://queue.fal.run/fal-ai/flux/requests/abc123.../status",
  "response_url": "https://queue.fal.run/fal-ai/flux/requests/abc123..."
}
```

### Adım 2: Status Kontrolü

```bash
curl -H "Authorization: Key YOUR_API_KEY" \
  "https://queue.fal.run/fal-ai/flux/requests/REQUEST_ID/status"
```

**Response:**
```json
{
  "status": "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED" | "FAILED"
}
```

### Adım 3: Sonucu Alma

```bash
curl -H "Authorization: Key YOUR_API_KEY" \
  "https://queue.fal.run/fal-ai/flux/requests/REQUEST_ID"
```

**Response:**
```json
{
  "images": [
    {
      "url": "https://fal.ai/files/..."
    }
  ],
  "seed": 12345
}
```

---

## 🔍 Test Edilecek Parametreler

### 1. Gender: Male
```json
{
  "prompt": "... A professional male portrait ..."
}
```

### 2. Gender: Female
```json
{
  "prompt": "... A professional female portrait ..."
}
```

### 3. Strength Değerleri
- `0.5` - Orta yüz koruması
- `0.8` - Güçlü yüz koruması (önerilen) ✅
- `0.9` - Çok güçlü yüz koruması

### 4. Guidance Scale Değerleri
- `5.0` - Esnek prompt uyumu
- `7.5` - Sıkı prompt uyumu (önerilen) ✅
- `10.0` - Çok sıkı prompt uyumu

---

## 📊 Beklenen Sonuçlar

### ✅ Başarılı Test:
- Request ID alınır
- Status: COMPLETED
- Image URL döner
- Yüz referansı korunur

### ❌ Başarısız Test:
- HTTP 401: API key hatalı
- HTTP 400: Geçersiz parametreler
- HTTP 500: Server hatası
- Status: FAILED

---

## 🐛 Debug İpuçları

### 1. API Key Kontrolü
```bash
echo $FAL_API_KEY
```

### 2. Request Body Kontrolü
```bash
# JSON formatını kontrol et
echo "$REQUEST_BODY" | jq '.'
```

### 3. Response Detayları
```bash
# Verbose mode
curl -v -X POST "https://queue.fal.run/fal-ai/flux/dev" ...
```

### 4. Timeout Ayarlama
```bash
# Daha uzun timeout
curl --max-time 120 ...
```

---

## 📝 Test Senaryoları

### Senaryo 1: Male + Professional Portrait
```bash
GENDER="male"
SCENE="Professional Portrait"
STRENGTH=0.8
```

### Senaryo 2: Female + Fantasy Scene
```bash
GENDER="female"
SCENE="Fantasy"
STRENGTH=0.7
```

### Senaryo 3: Male + Realistic Scene
```bash
GENDER="male"
SCENE="Realistic"
STRENGTH=0.8
```

---

## ⚠️ Önemli Notlar

1. **Base64 Image:** Gerçek test için bir görsel dosyasını base64'e çevirmelisiniz
2. **API Key:** Güvenli tutun, commit etmeyin
3. **Rate Limits:** Fal AI'nin rate limit'leri olabilir
4. **Image Size:** Base64 image çok büyükse request başarısız olabilir

---

## 🔧 Base64 Image Oluşturma

```bash
# macOS/Linux
base64 -i image.jpg | tr -d '\n' > image_base64.txt

# Veya Python ile
python3 -c "
import base64
with open('image.jpg', 'rb') as f:
    encoded = base64.b64encode(f.read()).decode('utf-8')
    print(f'data:image/jpeg;base64,{encoded}')
"
```

---

**Test Script:** `test_fal_ai_curl.sh`  
**Durum:** ✅ Hazır

