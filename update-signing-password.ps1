# Update Android Signing Password
# Run this script to update the keystore password in android-signing.properties

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Update Signing Password" -ForegroundColor Cyan  
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$password = Read-Host "Enter the password you used when creating android-release.keystore" -AsSecureString
$passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

# Test the password
Write-Host ""
Write-Host "Testing password..." -ForegroundColor Yellow

$testResult = & "C:\Program Files\Java\jdk-17\bin\keytool.exe" -list -keystore android-release.keystore -storepass $passwordPlain -alias nanoloan-key 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "[SUCCESS] Password is correct!" -ForegroundColor Green
    
    # Update the properties file
    $content = @"
# Android Release Signing Configuration
# This file contains the keystore information for signing release builds
# KEEP THIS FILE SECURE - DO NOT COMMIT TO GIT

RELEASE_STORE_FILE=../android-release.keystore
RELEASE_KEY_ALIAS=nanoloan-key
RELEASE_STORE_PASSWORD=$passwordPlain
RELEASE_KEY_PASSWORD=$passwordPlain
"@

    Set-Content -Path "android-signing.properties" -Value $content
    
    Write-Host "[SUCCESS] Updated android-signing.properties" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now run: .\build-release.ps1" -ForegroundColor Cyan
} else {
    Write-Host "[ERROR] Password is incorrect!" -ForegroundColor Red
    Write-Host "Please try again with the correct password." -ForegroundColor Yellow
}
