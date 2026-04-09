# Android Release Build Script
# Run this to build signed release APK and AAB

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  NanoLoan Android Release Builder" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if keystore exists
if (!(Test-Path "android-release.keystore")) {
    Write-Host "[ERROR] android-release.keystore not found!" -ForegroundColor Red
    Write-Host "Please make sure the keystore file is in the project root." -ForegroundColor Yellow
    exit 1
}

# Check if signing properties exist
if (!(Test-Path "android-signing.properties")) {
    Write-Host "[ERROR] android-signing.properties not found!" -ForegroundColor Red
    Write-Host "Please make sure the signing properties file exists." -ForegroundColor Yellow
    exit 1
}

Write-Host "[OK] Keystore found" -ForegroundColor Green
Write-Host "[OK] Signing properties found" -ForegroundColor Green
Write-Host ""

# Ask user what to build
Write-Host "What would you like to build?" -ForegroundColor Yellow
Write-Host "1. Clean prebuild + Build APK + Build AAB (Recommended for first build)"
Write-Host "2. Build APK only"
Write-Host "3. Build AAB only"
Write-Host "4. Build both APK and AAB"
Write-Host "5. Clean everything and prebuild only"
Write-Host ""

$choice = Read-Host "Enter your choice (1-5)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "[CLEAN] Cleaning android folder..." -ForegroundColor Yellow
        Remove-Item -Path android -Recurse -Force -ErrorAction SilentlyContinue
        
        Write-Host "[BUILD] Running expo prebuild..." -ForegroundColor Yellow
        npx expo prebuild --platform android --clean
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[ERROR] Prebuild failed!" -ForegroundColor Red
            exit 1
        }
        
        Write-Host "[BUILD] Building Release APK..." -ForegroundColor Yellow
        Set-Location android
        .\gradlew clean
        .\gradlew assembleRelease
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[SUCCESS] APK built successfully!" -ForegroundColor Green
            
            Write-Host "[BUILD] Building Release AAB..." -ForegroundColor Yellow
            .\gradlew bundleRelease
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "[SUCCESS] AAB built successfully!" -ForegroundColor Green
            } else {
                Write-Host "[ERROR] AAB build failed!" -ForegroundColor Red
            }
        } else {
            Write-Host "[ERROR] APK build failed!" -ForegroundColor Red
        }
        
        Set-Location ..
    }
    "2" {
        if (!(Test-Path "android")) {
            Write-Host "[ERROR] android folder not found. Run prebuild first (option 1 or 5)" -ForegroundColor Red
            exit 1
        }
        
        Write-Host "[BUILD] Building Release APK..." -ForegroundColor Yellow
        Set-Location android
        .\gradlew assembleRelease
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[SUCCESS] APK built successfully!" -ForegroundColor Green
        } else {
            Write-Host "[ERROR] APK build failed!" -ForegroundColor Red
        }
        
        Set-Location ..
    }
    "3" {
        if (!(Test-Path "android")) {
            Write-Host "[ERROR] android folder not found. Run prebuild first (option 1 or 5)" -ForegroundColor Red
            exit 1
        }
        
        Write-Host "[BUILD] Building Release AAB..." -ForegroundColor Yellow
        Set-Location android
        .\gradlew bundleRelease
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[SUCCESS] AAB built successfully!" -ForegroundColor Green
        } else {
            Write-Host "[ERROR] AAB build failed!" -ForegroundColor Red
        }
        
        Set-Location ..
    }
    "4" {
        if (!(Test-Path "android")) {
            Write-Host "[ERROR] android folder not found. Run prebuild first (option 1 or 5)" -ForegroundColor Red
            exit 1
        }
        
        Write-Host "[BUILD] Building Release APK..." -ForegroundColor Yellow
        Set-Location android
        .\gradlew assembleRelease
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[SUCCESS] APK built successfully!" -ForegroundColor Green
            
            Write-Host "[BUILD] Building Release AAB..." -ForegroundColor Yellow
            .\gradlew bundleRelease
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "[SUCCESS] AAB built successfully!" -ForegroundColor Green
            } else {
                Write-Host "[ERROR] AAB build failed!" -ForegroundColor Red
            }
        } else {
            Write-Host "[ERROR] APK build failed!" -ForegroundColor Red
        }
        
        Set-Location ..
    }
    "5" {
        Write-Host "[CLEAN] Cleaning android folder..." -ForegroundColor Yellow
        Remove-Item -Path android -Recurse -Force -ErrorAction SilentlyContinue
        
        Write-Host "[BUILD] Running expo prebuild..." -ForegroundColor Yellow
        npx expo prebuild --platform android --clean
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[SUCCESS] Prebuild completed successfully!" -ForegroundColor Green
        } else {
            Write-Host "[ERROR] Prebuild failed!" -ForegroundColor Red
        }
    }
    default {
        Write-Host "[ERROR] Invalid choice!" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Output Files:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if (Test-Path "android/app/build/outputs/apk/release/app-release.apk") {
    $apkSize = (Get-Item "android/app/build/outputs/apk/release/app-release.apk").Length / 1MB
    Write-Host "[OK] APK: android/app/build/outputs/apk/release/app-release.apk" -ForegroundColor Green
    Write-Host "     Size: $([math]::Round($apkSize, 2)) MB" -ForegroundColor Gray
}

if (Test-Path "android/app/build/outputs/bundle/release/app-release.aab") {
    $aabSize = (Get-Item "android/app/build/outputs/bundle/release/app-release.aab").Length / 1MB
    Write-Host "[OK] AAB: android/app/build/outputs/bundle/release/app-release.aab" -ForegroundColor Green
    Write-Host "     Size: $([math]::Round($aabSize, 2)) MB" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Test APK: adb install android/app/build/outputs/apk/release/app-release.apk"
Write-Host "2. Upload AAB to Google Play Console"
Write-Host "3. Verify signing: Read PERFECT_ANDROID_SIGNING.md"
Write-Host "========================================" -ForegroundColor Cyan
