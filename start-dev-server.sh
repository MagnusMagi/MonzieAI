#!/bin/bash

# Metro Development Server Starter
# This script ensures Metro starts with proper network configuration

echo "🚀 Starting Metro bundler with LAN configuration..."
echo "📍 Project: monzieai"
echo ""

# Get local IP address
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)

if [ -z "$LOCAL_IP" ]; then
    echo "❌ Could not find local IP address"
    echo "   Make sure you are connected to WiFi"
    exit 1
fi

echo "🌐 Local IP Address: $LOCAL_IP"
echo "🔌 Metro will be accessible at: http://$LOCAL_IP:8081"
echo ""
echo "📱 To connect from your iPhone:"
echo "   1. Make sure iPhone is on the same WiFi network"
echo "   2. Shake your device to open dev menu"
echo "   3. Configure bundler to: $LOCAL_IP:8081"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Kill any existing Metro instances
echo "🧹 Cleaning up existing Metro processes..."
pkill -f "expo start" 2>/dev/null || true
pkill -f "metro" 2>/dev/null || true
sleep 2

# Clear Metro cache
echo "🗑️  Clearing Metro cache..."
npx expo start --clear --lan &

METRO_PID=$!

# Wait a bit for Metro to start
sleep 5

# Check if Metro is running
if ps -p $METRO_PID > /dev/null; then
    echo ""
    echo "✅ Metro bundler is running!"
    echo "🔗 Server: http://$LOCAL_IP:8081"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""

    # Wait for the process
    wait $METRO_PID
else
    echo ""
    echo "❌ Failed to start Metro bundler"
    exit 1
fi
