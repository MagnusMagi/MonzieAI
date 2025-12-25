#!/bin/bash

# RevenueCat Native SDK Setup Script
# This script installs dependencies and configures native modules for RevenueCat

set -e  # Exit on error

echo "🚀 Setting up RevenueCat Native SDK..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Step 1: Install npm dependencies
echo "📦 Step 1: Installing npm dependencies..."
npm install
echo "✅ npm dependencies installed"
echo ""

# Step 2: Install iOS Pods
if [ -d "ios" ]; then
    echo "🍎 Step 2: Installing iOS Pods..."
    cd ios

    # Clean pods if they exist
    if [ -d "Pods" ]; then
        echo "  🧹 Cleaning existing Pods..."
        pod deintegrate
        rm -rf Pods
        rm -rf Podfile.lock
    fi

    # Install pods
    echo "  📥 Installing Pods..."
    pod install --repo-update

    cd ..
    echo "✅ iOS Pods installed"
    echo ""
else
    echo "⚠️  iOS directory not found, skipping pod install"
    echo ""
fi

# Step 3: Clean build caches
echo "🧹 Step 3: Cleaning build caches..."

# Clean Metro bundler cache
if command -v npx &> /dev/null; then
    npx expo start --clear
fi

# Clean iOS build if directory exists
if [ -d "ios" ]; then
    cd ios
    if [ -d "build" ]; then
        rm -rf build
        echo "  ✅ iOS build cache cleared"
    fi
    cd ..
fi

echo "✅ Build caches cleaned"
echo ""

# Step 4: Verify installation
echo "🔍 Step 4: Verifying installation..."

# Check if react-native-purchases is in node_modules
if [ -d "node_modules/react-native-purchases" ]; then
    echo "  ✅ react-native-purchases found in node_modules"
else
    echo "  ❌ react-native-purchases NOT found in node_modules"
fi

# Check if react-native-purchases-ui is in node_modules
if [ -d "node_modules/react-native-purchases-ui" ]; then
    echo "  ✅ react-native-purchases-ui found in node_modules"
else
    echo "  ❌ react-native-purchases-ui NOT found in node_modules"
fi

# Check if Pods are installed (iOS)
if [ -d "ios/Pods" ]; then
    echo "  ✅ iOS Pods installed"
else
    echo "  ⚠️  iOS Pods NOT found"
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Verify your RevenueCat API keys in app.json (extra.revenueCatApiKeyIOS)"
echo "  2. Test in development: npm run ios"
echo "  3. Check logs for 'RevenueCat native module detected and loaded'"
echo "  4. If you see native crashes, check Xcode Console for detailed backtrace"
echo ""
echo "🐛 Troubleshooting:"
echo "  - If native crash persists, check: monzieai/REVENUECAT_IMPLEMENTASYON.md"
echo "  - View crash logs: ~/Library/Logs/DiagnosticReports/"
echo "  - Enable native breakpoints in Xcode: NSException, objc_exception_throw"
echo ""
echo "📚 Documentation: See REVENUECAT_IMPLEMENTASYON.md for full guide"
echo ""
