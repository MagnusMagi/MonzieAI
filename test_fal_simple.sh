#!/bin/bash

# Basit Fal AI Test Script
# Gender seçimi akışını test eder

set -e

# API Key kontrolü
if [ -z "$FAL_API_KEY" ]; then
    echo "❌ FAL_API_KEY environment variable bulunamadı!"
    echo "💡 Kullanım: export FAL_API_KEY='your-api-key'"
    exit 1
fi

echo "✅ API Key bulundu"
echo ""

# Test parametreleri
GENDER="male"
SCENE="Professional Portrait"
PROMPT="[CRITICAL: Use the reference image as the EXACT face template. Maintain identical facial features: same face shape, same eyes (color, shape, size), same nose, same mouth, same eyebrows, same hairline, same skin tone, same facial structure. The person in the reference image MUST be the person in the generated image. Do not change the face identity. Only adapt the scene/background/clothing while keeping the face 100% identical.] A professional ${GENDER} portrait, high quality, professional photography, 8k resolution, ultra realistic, detailed, sharp focus"

# Küçük test görseli (1x1 pixel JPEG)
TEST_IMAGE="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="

echo "📤 Fal AI'ye istek gönderiliyor..."
echo "   Gender: $GENDER"
echo "   Scene: $SCENE"
echo "   Strength: 0.8"
echo "   Guidance Scale: 7.5"
echo ""

# Submit request
RESPONSE=$(curl -s -X POST "https://queue.fal.run/fal-ai/flux/dev" \
  -H "Authorization: Key $FAL_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"prompt\": \"$PROMPT\",
    \"image_size\": \"portrait_4_3\",
    \"num_images\": 1,
    \"image_url\": \"$TEST_IMAGE\",
    \"strength\": 0.8,
    \"guidance_scale\": 7.5
  }")

# Response kontrolü
if echo "$RESPONSE" | grep -q "request_id"; then
    REQUEST_ID=$(echo "$RESPONSE" | grep -o '"request_id":"[^"]*' | cut -d'"' -f4)
    STATUS_URL=$(echo "$RESPONSE" | grep -o '"status_url":"[^"]*' | cut -d'"' -f4)
    
    echo "✅ İstek başarıyla gönderildi!"
    echo "   Request ID: $REQUEST_ID"
    echo ""
    echo "⏳ Status kontrolü için:"
    echo "   curl -H \"Authorization: Key $FAL_API_KEY\" \"$STATUS_URL\""
else
    echo "❌ HATA:"
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
    exit 1
fi

