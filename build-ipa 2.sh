#!/bin/bash

# IPA Build Script for TestFlight
# Build Number: 13

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
IOS_DIR="${PROJECT_DIR}/ios"
WORKSPACE="${IOS_DIR}/monzieai.xcworkspace"
SCHEME="monzieai"
BUILD_NUMBER="13"
VERSION="1.0.0"
BUNDLE_ID="com.someplanets.monzieaiv2"
TEAM_ID="56FF2L729K"

# Archive path
ARCHIVE_PATH="${IOS_DIR}/build/monzieai.xcarchive"
EXPORT_PATH="${IOS_DIR}/build/ipa"
EXPORT_OPTIONS_PLIST="${PROJECT_DIR}/ExportOptions.plist"

echo "🚀 Starting IPA build for TestFlight..."
echo "📱 Version: ${VERSION}"
echo ""
echo "📦 Bundle ID: ${BUNDLE_ID}"

# Check for GoogleService-Info.plist
if [ ! -f "${PROJECT_DIR}/GoogleService-Info.plist" ]; then
    echo "❌ Error: GoogleService-Info.plist not found in project root!"
    echo "Please download it from Firebase Console and place it in ${PROJECT_DIR}"
    exit 1
fi

echo "🔢 Build Number: ${BUILD_NUMBER}"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd "${IOS_DIR}"
rm -rf build/
rm -rf DerivedData/

# Install pods if needed
echo "📦 Installing CocoaPods dependencies..."
pod install --repo-update

# Create ExportOptions.plist for App Store distribution
cat > "${EXPORT_OPTIONS_PLIST}" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>teamID</key>
    <string>${TEAM_ID}</string>
    <key>uploadBitcode</key>
    <false/>
    <key>uploadSymbols</key>
    <true/>
    <key>compileBitcode</key>
    <false/>
    <key>signingStyle</key>
    <string>automatic</string>
    <key>provisioningProfiles</key>
    <dict>
        <key>${BUNDLE_ID}</key>
        <string>match AppStore ${BUNDLE_ID}</string>
    </dict>
</dict>
</plist>
EOF

# Build archive
echo "📦 Building archive..."
xcodebuild clean archive \
    -workspace "${WORKSPACE}" \
    -scheme "${SCHEME}" \
    -configuration Release \
    -archivePath "${ARCHIVE_PATH}" \
    -sdk iphoneos \
    -destination 'generic/platform=iOS' \
    CODE_SIGN_IDENTITY="Apple Distribution" \
    CODE_SIGN_STYLE="Automatic" \
    DEVELOPMENT_TEAM="${TEAM_ID}" \
    PROVISIONING_PROFILE_SPECIFIER="" \
    CURRENT_PROJECT_VERSION="${BUILD_NUMBER}" \
    MARKETING_VERSION="${VERSION}" \
    || exit 1

# Export IPA
echo "📤 Exporting IPA..."
xcodebuild -exportArchive \
    -archivePath "${ARCHIVE_PATH}" \
    -exportPath "${EXPORT_PATH}" \
    -exportOptionsPlist "${EXPORT_OPTIONS_PLIST}" \
    || exit 1

IPA_PATH="${EXPORT_PATH}/${SCHEME}.ipa"

if [ -f "${IPA_PATH}" ]; then
    echo ""
    echo "✅ IPA build successful!"
    echo "📦 IPA Location: ${IPA_PATH}"
    echo "📊 File size: $(du -h "${IPA_PATH}" | cut -f1)"
    echo ""
    echo "🚀 Next steps:"
    echo "1. Upload to TestFlight using:"
    echo "   xcrun altool --upload-app --type ios --file \"${IPA_PATH}\" --apiKey YOUR_API_KEY --apiIssuer YOUR_ISSUER_ID"
    echo ""
    echo "2. Or use Transporter app to upload the IPA to App Store Connect"
    echo ""
    echo "3. Or use Xcode Organizer (Window > Organizer) to upload"
else
    echo "❌ IPA file not found at ${IPA_PATH}"
    exit 1
fi

