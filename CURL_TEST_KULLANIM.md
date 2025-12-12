# 🧪 Fal AI Curl Test - Hızlı Başlangıç

## 🚀 Hızlı Test

### 1. API Key Ayarlama
```bash
export FAL_API_KEY='your-fal-api-key'
```

### 2. Basit Test Script Çalıştırma
```bash
./test_fal_simple.sh
```

---

## 📝 Manuel Curl Komutları

### Adım 1: Submit Request (Gender: Male)

```bash
curl -X POST "https://queue.fal.run/fal-ai/flux/dev" \
  -H "Authorization: Key $FAL_API_KEY" \
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

**Response Örneği:**
```json
{
  "request_id": "abc123...",
  "status_url": "https://queue.fal.run/fal-ai/flux/requests/abc123.../status",
  "response_url": "https://queue.fal.run/fal-ai/flux/requests/abc123..."
}
```

### Adım 2: Status Kontrolü

```bash
# REQUEST_ID'yi yukarıdaki response'dan alın
curl -H "Authorization: Key $FAL_API_KEY" \
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
curl -H "Authorization: Key $FAL_API_KEY" \
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

## 🔄 Tam Test Akışı (Script ile)

```bash
# 1. API Key ayarla
export FAL_API_KEY='your-key'

# 2. Script çalıştır
./test_fal_ai_curl.sh

# Script otomatik olarak:
# - Request gönderir
# - Status kontrol eder (polling)
# - Sonucu alır
# - Image URL'i gösterir
```

---

## 📊 Test Senaryoları

### Senaryo 1: Male + Professional Portrait
```bash
GENDER="male"
STRENGTH=0.8
GUIDANCE_SCALE=7.5
```

### Senaryo 2: Female + Fantasy Scene
```bash
GENDER="female"
STRENGTH=0.7
GUIDANCE_SCALE=7.5
```

---

## ⚠️ Önemli Notlar

1. **Base64 Image:** Gerçek test için bir görsel dosyasını base64'e çevirin:
   ```bash
   base64 -i image.jpg | tr -d '\n' > image_base64.txt
   ```

2. **API Key:** Güvenli tutun, commit etmeyin

3. **Rate Limits:** Fal AI'nin rate limit'leri olabilir

---

## 🐛 Debug

### Verbose Mode
```bash
curl -v -X POST "https://queue.fal.run/fal-ai/flux/dev" ...
```

### Response Formatting
```bash
curl ... | jq '.'
```

---

**Dosyalar:**
- `test_fal_simple.sh` - Basit test script
- `test_fal_ai_curl.sh` - Tam özellikli test script
- `CURL_TEST_REHBERI.md` - Detaylı rehber

