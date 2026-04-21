# Expo Prebuild Configuration - Complete Setup

## ✅ All Configuration in app.json

Since this project uses `expo prebuild --clean`, all Android configurations are managed through `app.json` and plugins.

## 📁 Configuration Files

### Project Root (Safe from prebuild)
- ✅ `android-release.keystore` - Your signing keystore
- ✅ `android-signing.properties` - Password configuration (create this)
- ✅ `app.json` - All Android configuration
- ✅ `plugins/` - Expo config plugins

### Android Folder (Regenerated on prebuild)
- ⚠️ Everything gets deleted and recreated

## 📋 Plugins Configuration

Your `app.json` plugins include:
1. ✅ `./plugins/android-release-signing.js` - Keystore signing
2. ✅ `./plugins/android-disable-lint.js` - Disable lint (fixes Windows file lock)
3. ✅ `./plugins/android-hide-title.js` - Hide app title
4. ✅ `./plugins/android-manifest-fix.js` - Manifest fixes
5. ✅ `./plugins/android-play-console-fixes.js` - Play Store fixes
6. ✅ `./plugins/android-proguard-rules.js` - ProGuard rules

## 🚀 How to Rebuild Android

### Option 1: Using PowerShell Script
```powershell
.\build-release.ps1
# Choose option 1 (Clean + Build APK + AAB)
```

This automatically:
- Deletes `android` folder
- Runs `npx expo prebuild --platform android --clean`
- Builds APK and AAB

### Option 2: Manual Commands
```bash
# 1. Clean old android folder
rm -rf android

# 2. Run prebuild with new app.json config
npx expo prebuild --platform android --clean

# 3. Build APK
cd android
./gradlew assembleRelease

# 4. Build AAB (for Play Store)
./gradlew bundleRelease
```

## 🔑 Initial Keystore Setup

If you haven't set up your keystore password yet:

```powershell
.\update-signing-password.ps1
```

This creates `android-signing.properties` with your password.

## ⚙️ What Gets Configured Automatically

### From app.json + Plugins:

1. **Signing Configuration** (`android-release-signing.js`)
   - Loads keystore from `../android-release.keystore`
   - Reads passwords from `../android-signing.properties`
   - Applies to release builds only

2. **Lint Disabled** (`android-disable-lint.js`)
   - Fixes Windows file locking issues
   - Adds to `build.gradle`:
   ```gradle
   lintOptions {
       checkReleaseBuilds false
       abortOnError false
   }
   ```

3. **Gradle Properties** (in `app.json`)
   - `android.lint.ignoreSupportLibraryWarnings = true`
   - Packaging options
   - SDK versions

## 📝 Making Configuration Changes

### To Update Android Configuration:

1. **Edit `app.json`**
   ```json
   {
     "expo": {
       "android": {
         "compileSdkVersion": 36,
         "gradleProperties": {
           "your.new.property": "value"
         }
       }
     }
   }
   ```

2. **Edit or Create Plugin** (in `plugins/`)
   ```javascript
   // plugins/android-your-feature.js
   const { withAppBuildGradle } = require('@expo/config-plugins');

   module.exports = function withYourFeature(config) {
     config = withAppBuildGradle(config, (config) => {
       // Modify build.gradle
       return config;
     });
     return config;
   };
   ```

3. **Add Plugin to app.json**
   ```json
   {
     "expo": {
       "plugins": [
         "./plugins/android-your-feature.js"
       ]
     }
   }
   ```

4. **Rebuild Android**
   ```bash
   npx expo prebuild --platform android --clean
   ```

## ⚠️ Important Rules

1. **NEVER edit `android/` folder directly**
   - All changes will be lost on next `expo prebuild --clean`
   - Use `app.json` and plugins instead

2. **ALWAYS keep keystore in project root**
   - `android-release.keystore` stays in project root
   - NOT in `android/app/` folder

3. **COMMIT plugins and app.json**
   - These define your Android configuration
   - Don't commit `android-signing.properties` (has password)

4. **Test after prebuild**
   - Run a test build after making configuration changes
   - Verify keystore signing is working

## 🔧 Troubleshooting

**"Keystore not found" after prebuild**
- Ensure `android-release.keystore` is in project root
- Not in the `android/` folder

**"Lint errors" after prebuild**
- The `android-disable-lint.js` plugin should handle this
- Verify plugin is in `app.json` plugins array

**"Signing configuration not applied"**
- Check that `android-release-signing.js` is in plugins
- Verify `android-signing.properties` exists
- Test password: `.\update-signing-password.ps1`

## 📱 Build Output Locations

After successful build:
- **APK**: `android/app/build/outputs/apk/release/app-release.apk`
- **AAB**: `android/app/build/outputs/bundle/release/app-release.aab`

## 🎯 Workflow Summary

```
1. Edit app.json or create plugin
   ↓
2. Run: npx expo prebuild --platform android --clean
   ↓
3. Android folder regenerated with new config
   ↓
4. Run: .\build-release.ps1
   ↓
5. Get signed APK and AAB
```

## 📚 Additional Resources

- [Expo Prebuild](https://docs.expo.dev/eas/working-with-your-local-build-setup/)
- [Expo Config Plugins](https://docs.expo.dev/guides/config-plugins/)
- [Android App Signing](https://developer.android.com/studio/publish/app-signing)

---

**Status**: ✅ Configured for Expo Prebuild workflow
**Last Updated**: 2025-04-21
