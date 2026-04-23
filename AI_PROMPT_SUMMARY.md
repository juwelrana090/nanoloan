# NanoLoan - AI Search Summary (Concise)

## Quick Project Summary
**NanoLoan** is a React Native/Expo micro-lending fintech app with comprehensive KYC verification (facial recognition, OCR document scanning), built by Miguns Technology Ltd in Dhaka, Bangladesh.

---

## Tech Stack (One-Liner)
React Native 0.81.5 + Expo 54 + TypeScript + Redux Toolkit + Firebase + NativeWind (Tailwind) + Expo Router

---

## Project Structure (Abbreviated)
```
nanoloan/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # 5 tab screens: Home, Analysis, Category, Transactions, Profile
│   ├── auth/              # Login, Register, Email OTP, Basic Info, Address Update
│   └── kyc/               # Facial recognition, NID capture, Address verification
├── modules/               # Feature modules (Redux + hooks + services)
│   ├── login/             # Login feature
│   ├── register/          # Registration feature
│   ├── home/              # Home feature
│   ├── forgot-password/   # Password recovery
│   └── verify-email/      # Email verification
├── shared/
│   ├── components/        # Reusable UI components (KYC, UI, Welcome)
│   ├── config/            # Configuration
│   ├── constants/         # API endpoints, constants
│   ├── hooks/             # Custom React hooks
│   └── utils/             # Utility functions
├── assets/                # Images, icons, sounds, fonts
├── android/               # Android native code (generated)
└── plugins/               # Expo config plugins (6 custom plugins)
```

---

## Key Features (Bullet Points)
- 🔐 **Authentication:** Email/phone login, registration, OTP verification
- 📱 **KYC Verification:** Facial recognition, NID OCR, address verification, document scanning
- 💰 **Loan Management:** Apply for loans, track status, view analytics
- 📊 **Dashboard:** Transaction history, loan analysis, statistics
- 👤 **Profile Management:** Basic info, address updates, settings
- 🔔 **Push Notifications:** Firebase Cloud Messaging
- 📷 **Camera Integration:** Document capture, face detection, image processing
- 🔒 **Security:** Keystore signing, ProGuard, Firebase Auth

---

## Important Files
- `app.json` - Expo configuration (Android SDK 36, permissions, plugins)
- `package.json` - Dependencies (~50 prod, ~8 dev)
- `build-release.ps1` - PowerShell build script (APK + AAB)
- `android-signing.properties` - Signing config (not in git)
- `android-release.keystore` - Keystore file (not in git)

---

## Build Commands
```bash
# Development
npm start
npm run android:device

# Release Build
.\build-release.ps1          # Interactive script
cd android && ./gradlew assembleRelease  # APK
cd android && ./gradlew bundleRelease    # AAB
```

---

## Dependencies (Most Important)
**Core:** react, react-native, expo, expo-router, typescript
**State:** @reduxjs/toolkit, react-redux, redux-persist
**Navigation:** @react-navigation/native, @react-navigation/bottom-tabs
**UI:** nativewind, tailwindcss, @expo/vector-icons, react-native-vector-icons
**Firebase:** @react-native-firebase/app, firestore, messaging
**Native:** expo-camera, expo-face-detector, @react-native-ml-kit/text-recognition
**Utils:** @react-native-async-storage/async-storage, react-native-permissions

---

## Configuration Highlights
- **Package:** com.nano.loan.app
- **Min SDK:** 24 (Android 7.0+)
- **Target SDK:** 36 (Android 14)
- **API:** https://backend-nanoloan.giize.com
- **Firebase:** Firestore, Messaging, Analytics
- **Build:** ProGuard enabled, 4GB JVM memory, no-daemon mode

---

## Known Build Issues & Fixes
1. **`:app:packageRelease FAILED`**
   - Remove `gradlew clean` before `assembleRelease`
   - Use `--no-daemon` flag
   - Set JVM memory to 4GB: `-Dorg.gradle.jvmargs="-Xmx4096m"`
   - Stop Gradle daemons before building

---

## Quick Reference for AI Prompts
When working with this project, mention:
- "Expo Router file-based routing"
- "Redux Toolkit for state management"
- "NativeWind v4 (Tailwind CSS)"
- "Firebase backend"
- "KYC with facial recognition and OCR"
- "Android release build with custom signing"
- "Gradle 8.14.3, Android SDK 36"

---

**Full Documentation:** See [PROJECT_STRUCTURE_AND_SUMMARY.md](PROJECT_STRUCTURE_AND_SUMMARY.md)
**Build Fixes:** See [BUILD_FIX_SUMMARY.md](BUILD_FIX_SUMMARY.md)
