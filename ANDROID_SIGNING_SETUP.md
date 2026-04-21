# Android Signing Setup - NanoLoan

## ✅ Configuration Complete

Your keystore is now properly configured for Expo prebuild workflow!

## 📁 File Locations

**Project Root (Safe from `expo prebuild --clean`):**
- ✅ `android-release.keystore` - Your signing keystore
- ✅ `android-signing.properties` - Password configuration

**Android Folder (Regenerated on prebuild):**
- ⚠️ `android/app/android-release.keystore` - **Backup only, will be deleted**

## 🔒 Security Status

Both files are protected by `.gitignore`:
- ✅ `*.keystore` - Prevents keystore commits
- ✅ `android-signing.properties` - Explicitly ignored

## 🚀 Next Steps

### 1. Set Your Keystore Password

Run this PowerShell script and enter your keystore password:

```powershell
.\update-signing-password.ps1
```

This will:
- Test your password against the keystore
- Update `android-signing.properties` with the correct password
- Ensure the keystore alias is correct (`nanoloan-key`)

### 2. Build Your Release

```powershell
.\build-release.ps1
```

Choose option 1 for a clean build (recommended for first time after this setup).

## 📋 How It Works

1. **Expo Prebuild Safe**: Your keystore is in the project root, so `expo prebuild --clean` won't delete it
2. **Gradle Configuration**: The `android/app/build.gradle` reads signing config from `../android-signing.properties`
3. **Build Script**: `build-release.ps1` checks for both files before building

## 🔧 Technical Details

**Gradle Setup (lines 85-122 in `android/app/build.gradle`):**
```gradle
def signingPropsFile = rootProject.file('../android-signing.properties')
def signingProps = new Properties()
if (signingPropsFile.exists()) {
    signingProps.load(new FileInputStream(signingPropsFile))
}

signingConfigs {
    release {
        if (signingPropsFile.exists()) {
            storeFile file(signingProps['RELEASE_STORE_FILE'])
            storePassword signingProps['RELEASE_STORE_PASSWORD']
            keyAlias signingProps['RELEASE_KEY_ALIAS']
            keyPassword signingProps['RELEASE_KEY_PASSWORD']
        }
    }
}
```

**File Paths:**
- Keystore: `../android-release.keystore` (relative to android folder)
- Signing Props: `../android-signing.properties` (relative to android folder)

## ⚠️ Important Reminders

1. **Backup Your Keystore**: Keep a secure backup of `android-release.keystore`
   - If lost, you cannot update your app on Google Play
   - Store in a secure location (password manager, encrypted drive, etc.)

2. **Never Commit Keystore**: Always keep `android-release.keystore` and `android-signing.properties` out of Git
   - Both files are already in `.gitignore`
   - Verify with: `git status` (should not show these files)

3. **Document Your Password**: Store your keystore password securely
   - Use a password manager
   - If lost, you cannot sign releases

## 🧪 Verification

After setting your password, verify the setup:

```powershell
# Test signing configuration
.\build-release.ps1
# Choose option 2 (APK only) for a quick test

# Verify APK is signed
keytool -printcert -jarfile android/app/build/outputs/apk/release/app-release.apk
```

## 📱 Output Locations

After successful build:
- **APK**: `android/app/build/outputs/apk/release/app-release.apk`
- **AAB**: `android/app/build/outputs/bundle/release/app-release.aab`

## 🔍 Troubleshooting

**"Keystore password was incorrect"**
- Run `.\update-signing-password.ps1` again with correct password

**"android-release.keystore not found"**
- Ensure keystore is in project root, not in android folder
- Run: `ls android-release.keystore`

**"Cannot sign release builds"**
- Check that `android-signing.properties` has correct passwords
- Verify keystore alias is `nanoloan-key`

## 📚 Additional Resources

- [Android App Signing](https://developer.android.com/studio/publish/app-signing)
- [Expo Prebuild](https://docs.expo.dev/eas/working-with-your-local-build-setup/)
- [Google Play App Signing](https://support.google.com/googleplay/android-developer/answer/7384423)

---

**Status**: ✅ Ready to build!
**Last Updated**: 2025-04-21
