# SpendWise Capacitor Setup Script (Windows PowerShell)
# Run this script from the project root after npm install.
# Requires: Node.js, Android Studio (for Android), Xcode (for iOS)

Write-Host "=== SpendWise Capacitor Setup ===" -ForegroundColor Cyan

Write-Host "[1/3] Initializing Capacitor..." -ForegroundColor Yellow
npx cap init

Write-Host "[2/3] Adding Android platform..." -ForegroundColor Yellow
npx cap add android

Write-Host "[3/3] Adding iOS platform..." -ForegroundColor Yellow
npx cap add ios

Write-Host "=== Setup Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "  npm run build          - Build the web app"
Write-Host "  npx cap sync           - Sync web build to native projects"
Write-Host "  npx cap open android   - Open Android project in Android Studio"
Write-Host "  npx cap open ios       - Open iOS project in Xcode"
Write-Host "  npx cap run android    - Run on connected Android device"
Write-Host "  npx cap run ios        - Run on connected iOS device"
