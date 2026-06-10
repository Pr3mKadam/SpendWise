#!/usr/bin/env bash
# SpendWise Capacitor Setup Script (macOS / Linux)
# Run this script from the project root after npm install.
# Requires: Node.js, Android Studio (for Android), Xcode (for iOS)

set -euo pipefail

echo "=== SpendWise Capacitor Setup ==="

echo "[1/3] Initializing Capacitor..."
npx cap init

echo "[2/3] Adding Android platform..."
npx cap add android

echo "[3/3] Adding iOS platform..."
npx cap add ios

echo "=== Setup Complete ==="
echo ""
echo "Next steps:"
echo "  npm run build          - Build the web app"
echo "  npx cap sync           - Sync web build to native projects"
echo "  npx cap open android   - Open Android project in Android Studio"
echo "  npx cap open ios       - Open iOS project in Xcode"
echo "  npx cap run android    - Run on connected Android device"
echo "  npx cap run ios        - Run on connected iOS device"
