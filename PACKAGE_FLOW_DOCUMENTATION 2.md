# 📦 Paket Akışı Dokümantasyonu

## 🔄 Genel Akış Şeması

```
1. Paket Gösterimi (PaywallScreen)
   ↓
2. Paket Satın Alma (RevenueCat)
   ↓
3. Entitlement Kontrolü
   ↓
4. Limit Belirleme (Supabase Packages)
   ↓
5. Kullanım Takibi (user_usage table)
   ↓
6. Görüntü Üretimi Kontrolü
```

---

## 📋 Detaylı Akış

### 1️⃣ **Paket Gösterimi (PaywallScreen)**

**Kaynak:** `src/screens/PaywallScreen.tsx`

**Akış:**
1. **Supabase'den Paketler Çekilir**
   ```typescript
   packageService.getPackages() 
   → subscription_packages tablosundan aktif paketler
   → Weekly, Monthly, 3-Month, 6-Month, Yearly
   ```

2. **RevenueCat Paketleri ile Eşleştirme**
   ```typescript
   RevenueCat offerings → Supabase packages mapping
   → revenuecat_product_id ve revenuecat_package_id ile bağlantı
   ```

3. **UI'da Gösterim**
   - Paket fiyatları: Supabase'den (`price_usd`)
   - Paket kredileri: Supabase'den (`credits`)
   - RevenueCat fiyatları: RevenueCat SDK'dan (gerçek zamanlı)

---

### 2️⃣ **Paket Satın Alma**

**Kaynak:** `src/screens/PaywallScreen.tsx` → `handleContinue()`

**Akış:**
```typescript
1. Kullanıcı paket seçer (örn: "3-Month")
   ↓
2. RevenueCat paketi bulunur
   revenueCatPackages.find(pkg => pkg.identifier === selectedPlan)
   ↓
3. RevenueCat üzerinden satın alma
   revenueCatService.purchasePackage(revenueCatPackage)
   ↓
4. Satın alma başarılı → CustomerInfo döner
   ↓
5. Supabase'e subscription kaydı
   subscriptionRepository.createSubscription({
     userId, planType, price, expiresAt
   })
   ↓
6. PremiumSuccess ekranına yönlendirme
```

**Önemli Noktalar:**
- RevenueCat satın alma işlemini yönetir
- Supabase'de subscription kaydı oluşturulur
- `user_usage` tablosu henüz oluşturulmaz (ilk kullanımda oluşur)

---

### 3️⃣ **Entitlement Kontrolü**

**Kaynak:** `src/services/revenueCatService.ts` → `getActiveEntitlement()`

**Akış:**
```typescript
1. RevenueCat'ten customer info çekilir
   Purchases.getCustomerInfo()
   ↓
2. Active entitlements kontrol edilir
   customerInfo.entitlements.active
   ↓
3. İlk aktif entitlement döner
   → productIdentifier: "monthly", "yearly", vb.
   → expirationDate: Abonelik bitiş tarihi
   → isActive: true/false
```

**Kullanım Yerleri:**
- `usageService.getUserUsage()` - Limit belirleme için
- `usageService.canGenerateImage()` - İzin kontrolü için
- `usageService.incrementUsage()` - Plan ID kaydetme için

---

### 4️⃣ **Limit Belirleme**

**Kaynak:** `src/services/usageService.ts` → `getLimitForPlan()`

**Akış:**
```typescript
1. RevenueCat'ten plan identifier alınır
   entitlement.productIdentifier 
   → Örn: "com.someplanets.monzieaiv2.monthly.subscription"
   ↓
2. Plan identifier → Package key mapping
   PACKAGE_TO_PLAN_MAP kullanılarak
   → "monthly" → "monthly"
   → "yearly" → "yearly"
   → Heuristic fallback: "week" → "weekly"
   ↓
3. Supabase'den paket bilgisi çekilir
   packageService.getCreditsForPackage("monthly")
   → subscription_packages tablosundan credits değeri
   → Örn: 180 kredi
   ↓
4. Limit döner
   → Period limit: 180 (paket limiti)
   → Daily limit: 180 (şu an period limit ile aynı)
```

**Limit Değerleri (Supabase'den):**
- Weekly: 40 kredi
- Monthly: 180 kredi
- 3-Month: 500 kredi
- 6-Month: 1000 kredi
- Yearly: 2500 kredi

**Fallback:**
- Supabase erişilemezse → Hardcoded `PLAN_LIMITS` kullanılır

---

### 5️⃣ **Kullanım Takibi**

**Kaynak:** `src/services/usageService.ts` → `getUserUsage()`

**Akış:**
```typescript
1. RevenueCat'ten aktif entitlement alınır
   → Plan ID ve expiration date
   ↓
2. Limit belirlenir (yukarıdaki akış)
   ↓
3. Supabase'den kullanım verisi çekilir
   user_usage tablosundan:
   - count: Period toplam kullanım
   - daily_count: Günlük kullanım
   - last_reset_date: Son reset tarihi
   - period_end: Period bitiş tarihi
   ↓
4. Günlük reset kontrolü
   if (last_reset_date !== today) {
     daily_count = 0
     last_reset_date = today
   }
   ↓
5. Period reset kontrolü
   if (now > period_end) {
     count = 0
   }
   ↓
6. Kullanım bilgisi döner
   {
     count: 50,           // Period toplam
     limit: 180,          // Period limit
     dailyCount: 5,       // Günlük kullanım
     dailyLimit: 180,     // Günlük limit
     periodEnd: "2025-01-22"
   }
```

---

### 6️⃣ **Görüntü Üretimi Kontrolü**

**Kaynak:** `src/services/imageGenerationService.ts` → `generateImage()`

**Akış:**
```typescript
1. Kullanıcı görüntü üretmek ister
   ↓
2. Usage kontrolü yapılır
   usageService.canGenerateImage(userId)
   ↓
3. Günlük limit kontrolü (PRIMARY)
   if (dailyCount >= dailyLimit) {
     return { allowed: false, reason: "Daily limit reached" }
   }
   ↓
4. Period limit kontrolü (SECONDARY)
   if (count >= limit) {
     return { allowed: false, reason: "Period limit reached" }
   }
   ↓
5. İzin verilirse görüntü üretilir
   ↓
6. Başarılı üretim sonrası kullanım artırılır
   usageService.incrementUsage(userId)
   → daily_count += 1
   → count += 1
   → last_reset_date güncellenir
```

---

## 🔑 Önemli Servisler

### **PackageService** (`src/services/packageService.ts`)
- Supabase'den paket bilgilerini çeker
- `getPackages()` - Tüm aktif paketler
- `getPackageByKey()` - Belirli paket
- `getCreditsForPackage()` - Paket kredisi

### **UsageService** (`src/services/usageService.ts`)
- Kullanım takibi ve limit kontrolü
- `getUserUsage()` - Kullanım bilgisi
- `canGenerateImage()` - İzin kontrolü
- `incrementUsage()` - Kullanım artırma
- `getLimitForPlan()` - Limit belirleme

### **RevenueCatService** (`src/services/revenueCatService.ts`)
- RevenueCat SDK entegrasyonu
- `getActiveEntitlement()` - Aktif abonelik
- `purchasePackage()` - Paket satın alma
- `getCurrentOffering()` - Mevcut paketler

---

## 📊 Veri Akışı

### **Supabase Tabloları:**

1. **subscription_packages**
   ```sql
   - package_key: "weekly", "monthly", vb.
   - credits: 40, 180, 500, vb.
   - price_usd: 6.99, 19.99, vb.
   - revenuecat_product_id: RevenueCat product ID
   - revenuecat_package_id: RevenueCat package ID
   ```

2. **user_usage**
   ```sql
   - user_id: UUID
   - count: Period toplam kullanım
   - daily_count: Günlük kullanım
   - last_reset_date: Son reset tarihi
   - period_end: Period bitiş tarihi
   - plan_id: RevenueCat product identifier
   ```

3. **subscriptions**
   ```sql
   - user_id: UUID
   - plan_type: "monthly" | "yearly"
   - status: "active" | "expired"
   - expires_at: Bitiş tarihi
   ```

---

## 🔄 Günlük Reset Mekanizması

**Trigger:** `reset_daily_usage_trigger` (Supabase)

**Akış:**
```sql
1. UPDATE user_usage tetiklendiğinde
   ↓
2. reset_daily_usage_if_needed() fonksiyonu çalışır
   ↓
3. Eğer last_reset_date < CURRENT_DATE ise
   → daily_count = 0
   → last_reset_date = CURRENT_DATE
```

**App Tarafında:**
- `getUserUsage()` çağrıldığında kontrol edilir
- Eğer tarih farklıysa, app tarafında reset yapılır
- Supabase trigger yedek olarak çalışır

---

## ⚠️ Önemli Notlar

1. **Paket Mapping:**
   - RevenueCat product identifier → Supabase package_key
   - Heuristic fallback kullanılır (örn: "week" → "weekly")

2. **Limit Önceliği:**
   - Günlük limit PRIMARY kontrol
   - Period limit SECONDARY kontrol
   - İkisi de aşılırsa erişim reddedilir

3. **Fallback Mekanizması:**
   - Supabase erişilemezse → Hardcoded limits
   - RevenueCat erişilemezse → Free tier (0 limit)

4. **Kullanım Artırma:**
   - Her başarılı görüntü üretiminde
   - Hem daily_count hem count artırılır
   - Otomatik reset kontrolü yapılır

---

## 🎯 Örnek Senaryo

**Kullanıcı Monthly Paketi Satın Aldı:**

1. PaywallScreen'de "Monthly" seçilir
2. RevenueCat üzerinden satın alma yapılır ($19.99)
3. Supabase'de subscription kaydı oluşturulur
4. İlk görüntü üretiminde:
   - `getUserUsage()` çağrılır
   - RevenueCat'ten "monthly" plan ID alınır
   - Supabase'den 180 kredi limiti alınır
   - `user_usage` tablosu oluşturulur (ilk kullanım)
   - Günlük limit: 180, Period limit: 180
5. Her görüntü üretiminde:
   - `canGenerateImage()` kontrol eder
   - Günlük limit aşılmadıysa izin verilir
   - Başarılı üretim sonrası `incrementUsage()` çağrılır
   - daily_count ve count artırılır
6. Ertesi gün:
   - `getUserUsage()` çağrıldığında
   - last_reset_date kontrol edilir
   - daily_count otomatik sıfırlanır
   - Period limit hala geçerli (30 gün)

---

## 🔧 Sorun Giderme

**Problem:** Limit yanlış gösteriliyor
- **Çözüm:** RevenueCat product identifier'ın Supabase package_key ile eşleştiğinden emin olun

**Problem:** Günlük reset çalışmıyor
- **Çözüm:** `last_reset_date` alanının DATE tipinde olduğundan emin olun

**Problem:** Paket bilgileri gösterilmiyor
- **Çözüm:** `subscription_packages` tablosunda `is_active = true` olduğundan emin olun


