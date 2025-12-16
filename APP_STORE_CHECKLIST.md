# App Store Submission Checklist

## 🚨 Critical Security & Configuration
- [x] **REMOVE SECRET KEYS**: `revenueCatSecretKey` has been removed from `app.json`.
- [ ] **Production Keys**: `revenueCatApiKey` is currently `test_...`. **ACTION REQUIRED**: Replace with `appl_...` (Production Key) in `app.json` before building.
- [ ] **Sentry DSN**: `sentryDsn` is empty in `app.json`. If you use Sentry, add the DSN. If not, remove the config or plugin.
- [x] **Bundle ID**: Verified `bundleIdentifier` in `app.json` is `com.someplanets.monzieaiv2`.
- [x] **Version & Build**: 
  - Version: `1.0.0`
  - Build Number: `14`

## 📱 Privacy & Compliance
- [x] **Privacy Manifest**: `PrivacyInfo.xcprivacy` exists in `ios/`. (Ensure it is included in the build resources).
- [x] **Tracking Usage Description**: `NSUserTrackingUsageDescription` is present in `Info.plist`.
- [x] **Privacy Policy sayfası oluşturulması**: Content ready in `PRIVACY_POLICY.md`. (Upload to website).
- [x] **Web sitesi oluştur**: Content ready in `PROJECT_WEBSITE.md` (for content) and legal docs.
- [ ] **App Store Connect'e giriş ve metadata doldurulması**: Action item for user.
- [ ] **App Store Connect Privacy**: Go to App Privacy section in App Store Connect and match the data types:
  - User Content (Photos)
  - Usage Data (if Sentry/Analytics used)
  - Purchases (RevenueCat)
  - Tracking (if using IDFA/AdSupport)

## 🎨 Assets & Metadata (App Store Connect)
- [ ] **Screenshots**: Upload screenshots for:
  - iPhone 6.7" Display (1290 x 2796 pixels)
  - iPhone 6.5" Display (1242 x 2688 pixels)
  - iPhone 5.5" Display (1242 x 2208 pixels)
  - iPad Pro (12.9" & 11") if supporting tablet.
- [x] **App Icon**: `assets/icon.png` (1024x1024) is configured.
- [x] **Promotional Text**: `AI-Powered Image Creator` (derived from Subtitle, check metadata for full text).
- [x] **Description**: Prepared in `APP_STORE_METADATA.md` (~950 chars).
- [x] **Keywords**: `ai,image,generation,art,creator,photo,design,creative,digital,artwork,ai art,visual,imagine,create,generate,artistic`
- [x] **Support URL**: `https://monzieai.com/support`
- [x] **Privacy Policy URL**: `https://monzieai.com/privacy-policy`

## 🧪 Testing & Review
- [x] **Demo Account**: 
  - Email: `demo@monzieai.com`
  - Password: `Demo123!`
- [x] **Review Notes**: See `APP_STORE_METADATA.md` for full review notes (includes Features & Testing Instructions).
- [ ] **In-App Purchases**: Ensure all RevenueCat products are:
  - Created in App Store Connect.
  - "Cleared for Sale".
  - Status is "Ready to Submit" (you must select them together with the app build for the first submission).

## 🚀 Build & Submit
- [ ] **Build**: Run `eas build --platform ios --profile production`.
- [ ] **Submit**: Run `eas submit --platform ios` (or upload via Transporter app).
- [ ] **TestFlight**: Verify the build in TestFlight before submitting for Review.
