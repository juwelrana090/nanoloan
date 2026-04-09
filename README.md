Perfect! So `rn-new` is actually `create-expo-stack`. Your exact command would be:

```bash
npx rn-new@latest nanoloan --exporouter --nativewind
```

Or with extra options like tabs navigation and a specific package manager:

```bash
npx rn-new@latest nanoloan --exporouter --tabs --nativewind --bun
```

That will scaffold a fully configured Expo Router + NativeWind project in one shot — no manual setup needed.

## 2. Install All Dependencies

### Expo Core

```bash
npx expo install expo-audio expo-av expo-blur expo-build-properties expo-checkbox expo-constants expo-dev-client expo-font expo-haptics expo-image expo-image-manipulator expo-image-picker expo-keep-awake expo-linear-gradient expo-linking expo-modules-core expo-notifications expo-router expo-splash-screen expo-status-bar expo-symbols expo-system-ui expo-web-browser
```

### React Native Core

```bash

Remove-Item -Recurse -Force node_modules, package-lock.json
npm install --legacy-peer-deps
npx expo install react-native-gesture-handler react-native-reanimated react-native-safe-area-context react-native-screens react-native-svg react-native-webview
```

### Navigation

```bash
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/elements
```

### State Management

```bash
npm install  @reduxjs/toolkit  react-redux  redux-persist  @react-native-async-storage/async-storage
```

### Firebase & Auth

```bash
npm install  @react-native-firebase/app @react-native-firebase/firestore @react-native-firebase/messaging @react-native-google-signin/google-signin  firebase
```

### WebRTC & Calling

```bash
npm install  react-native-webrtc  @config-plugins/react-native-webrtc  react-native-incall-manager  simple-peer socket.io-client
```

### Permissions & Device

```bash
npm install react-native-permissions  react-native-device-info  react-native-bluetooth-state-manager @react-native-community/datetimepicker
```

### Icons & Fonts

```bash
npx expo install @expo-google-fonts/inter @expo-google-fonts/roboto @expo-google-fonts/lilita-one
npm install react-native-vector-icons @react-native-vector-icons/fontawesome @react-native-vector-icons/fontawesome6 @react-native-vector-icons/evil-icons
```

### NativeWind v4 (Tailwind CSS)

```bash
npm install nativewind tailwindcss
npm install -D prettier-plugin-tailwindcss
```

### Other Utilities

```bash
npm install react-native-toast-message react-native-nitro-modules react-native-worklets-core react-native-web react-dom
```

### Android Release keystore

#### Step 1: Verify Java Installation

**For Bash/Git Bash:**

```bash
# Check Java version
java -version

# Find keytool location
KEYTOOL_PATH=$(find "/c/Program Files/Java" -name "keytool.exe" 2>/dev/null | head -1)
if [ -n "$KEYTOOL_PATH" ]; then
    echo "Found keytool at: $KEYTOOL_PATH"
else
    echo "Keytool not found. Please install Java JDK."
fi
```

**For PowerShell:**

```powershell
# Check Java version
java -version

# Find keytool location
$possiblePaths = @(
    "C:\Program Files\Java",
    "C:\Program Files (x86)\Java",
    "C:\Program Files\Eclipse Adoptium",
    "C:\Program Files\OpenJDK"
)
$keytool = $possiblePaths | ForEach-Object {
    Get-ChildItem -Path $_ -Recurse -Filter "keytool.exe" -ErrorAction SilentlyContinue
} | Select-Object -First 1

if ($keytool) {
    Write-Host "Found keytool at: $($keytool.FullName)"
} else {
    Write-Host "Keytool not found. Please install Java JDK."
}
```

#### Step 2: Generate Keystore File

**For Bash/Git Bash:**

```bash
# Navigate to android directory
cd android

# Use keytool directly (adjust path if needed)
"/c/Program Files/Java/jdk-17/bin/keytool.exe" -genkeypair \ -v \ -storetype PKCS12 \ -keystore android-release.keystore \ -alias nanoloan-key \ -keyalg RSA \ -keysize 2048 \ -validity 10000
```

**For PowerShell:**

```powershell
# Navigate to android directory
cd android

# Use keytool directly (adjust path if needed)
& "C:\Program Files\Java\jdk-17\bin\keytool.exe" -genkeypair ` -v ` -storetype PKCS12 ` -keystore android-release.keystore ` -alias nanoloan-key ` -keyalg RSA ` -keysize 2048 ` -validity 10000
```

**When prompted, enter the following information:**

```text
Enter keystore password: [YOUR_PASSWORD]
Re-enter new password: [YOUR_PASSWORD]

What is your first and last name?
  [Unknown]:  Nano Loan

What is the name of your organizational unit?
  [Unknown]:  Miguns Technology Ltd

What is the name of your organization?
  [Unknown]:  Miguns Technology Ltd

What is the name of your City or Locality?
  [Unknown]:  Dhaka

What is the name of your State or Province?
  [Unknown]:  Dhaka

What is the two-letter country code for this unit?
  [Unknown]:  BD

Is CN=Nano Loan, OU=Miguns Technology Ltd, O=Miguns Technology Ltd, L=Dhaka, ST=Dhaka, C=BD correct?
  [no]:  yes
```

#### Step 3: Move Keystore to App Directory

```powershell
# Move keystore from android/ to android/app/
Move-Item android-release.keystore app\android-release.keystore
```

#### Step 4: Create Signing Properties File

Create `android-signing.properties` in your project root (same level as `android/` folder):

```properties
# Android Signing Configuration
# IMPORTANT: Keep this file secure and never commit to version control

RELEASE_STORE_FILE=../../android-release.keystore
RELEASE_STORE_PASSWORD=YOUR_PASSWORD
RELEASE_KEY_ALIAS=nanoloan-key
RELEASE_KEY_PASSWORD=YOUR_PASSWORD
```

#### Step 5: Verify Keystore (Optional)

```powershell
# List certificate fingerprints
& "C:\Program Files\Java\jdk-17\bin\keytool.exe" -list -v `
    -keystore app\android-release.keystore `
    -alias nanoloan-key `
    -storepass "YOUR_PASSWORD" | Select-String -Pattern "SHA1:|SHA256:|MD5:"
```

#### Step 6: Verify .gitignore

Ensure your `.gitignore` contains these entries:

```gitignore
# Signing & Credentials
*.jks
*.keystore
android-signing.properties
key.properties
credentials.json
android-service-account.json
```

```bash
npm cache clean --force
npm install
npx expo install --fix
npx expo start --clear
npx expo prebuild --clean
cd android
./gradlew clean
cd ..
npm run android:device



netstat -ano | findstr :8081
taskkill /PID <PID> /F

npx kill-port 8081

```
