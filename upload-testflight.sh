#!/bin/bash

# Upload IPA to TestFlight using Transporter or altool
# This script provides multiple options for uploading

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
IPA_PATH="${PROJECT_DIR}/ios/build/ipa/monzieai.ipa"

if [ ! -f "${IPA_PATH}" ]; then
    echo "❌ IPA file not found at ${IPA_PATH}"
    echo "Please run ./build-ipa.sh first"
    exit 1
fi

echo "📤 Uploading IPA to TestFlight..."
echo "📦 IPA: ${IPA_PATH}"
echo ""

# Method 1: Using Transporter (Recommended - GUI)
echo "✅ Method 1: Using Transporter App (Recommended)"
echo "1. Open Transporter app (from App Store)"
echo "2. Drag and drop: ${IPA_PATH}"
echo "3. Sign in with your Apple ID"
echo "4. Click 'Deliver'"
echo ""

# Method 2: Using altool (requires API key)
echo "📋 Method 2: Using altool (requires App Store Connect API key)"
echo "Run:"
echo "xcrun altool --upload-app --type ios --file \"${IPA_PATH}\" \\"
echo "  --apiKey YOUR_API_KEY --apiIssuer YOUR_ISSUER_ID"
echo ""

# Method 3: Using Xcode Organizer
echo "📋 Method 3: Using Xcode Organizer"
echo "1. Open Xcode"
echo "2. Window > Organizer"
echo "3. Select your archive"
echo "4. Click 'Distribute App'"
echo "5. Choose 'App Store Connect'"
echo "6. Follow the wizard"
echo ""

echo "💡 Tip: Transporter app is the easiest method for manual uploads"


