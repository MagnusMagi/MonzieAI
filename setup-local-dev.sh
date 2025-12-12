#!/bin/bash
# Local Development Setup Script
# This script helps you set up local development environment

echo "🔐 MonzieAI Local Development Setup"
echo "===================================="
echo ""

# Check if app.json.local exists
if [ ! -f "app.json.local" ]; then
    echo "📝 Creating app.json.local from template..."
    cp app.json.local.example app.json.local
    echo "✅ Created app.json.local"
    echo ""
    echo "⚠️  IMPORTANT: Edit app.json.local with your actual API keys!"
    echo "   Then run this script again to merge values to app.json"
    exit 0
fi

# Check if app.json.local has placeholder values
if grep -q "YOUR_.*_HERE" app.json.local; then
    echo "⚠️  app.json.local still contains placeholder values!"
    echo "   Please edit app.json.local with your actual API keys first."
    exit 1
fi

echo "🔄 Merging app.json.local values to app.json..."
echo ""

# Use Node.js to merge JSON files (safer than sed/awk)
node -e "
const fs = require('fs');
const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));
const localJson = JSON.parse(fs.readFileSync('app.json.local', 'utf8'));

// Merge extra config
appJson.expo.extra = {
    ...appJson.expo.extra,
    ...localJson.expo.extra
};

fs.writeFileSync('app.json', JSON.stringify(appJson, null, 2));
console.log('✅ Merged app.json.local to app.json');
console.log('⚠️  Remember: app.json with real values should NOT be committed!');
"

echo ""
echo "✅ Setup complete! You can now run: npx expo start"
echo "⚠️  Remember to restore app.json placeholders before committing!"
