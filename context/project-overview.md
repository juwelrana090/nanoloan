# Project Overview - NanoLoan

## Tech Stack

### Core Framework
- **React Native**: 0.81.5
- **Expo SDK**: 54.0.0
- **React**: 19.1.0
- **Expo Router**: 6.0.23 (file-based routing)
- **TypeScript**: 5.9.2 (strict mode enabled)

### Styling & UI
- **NativeWind**: Latest (Tailwind CSS for React Native)
- **Tailwind CSS**: 3.4.0
- **Expo Vector Icons**: 15.0.2
- **React Native Gesture Handler**: 2.28.0
- **React Native Reanimated**: 4.1.1
- **React Native SVG**: 15.12.1

### State Management
- **Redux Toolkit**: 2.11.2
- **Redux Persist**: 6.0.0
- **React Redux**: 9.2.0
- **RTK Query**: Built-in with Redux Toolkit

### Storage & Data
- **AsyncStorage**: 2.2.0 (token/user persistence)
- **Firebase**: 12.10.0 (Firestore, Messaging, Analytics)

### Features & Permissions
- **Expo Camera**: 17.0.10 (KYC document capture)
- **Expo Image Picker**: 17.0.10
- **Expo Image Manipulator**: 14.0.8 (image cropping)
- **React Native ML Kit**: 2.0.0 (OCR for ID cards)
- **React Native Permissions**: 5.5.1

### UI Components
- **React Native Toast Message**: 2.3.3 (notifications)
- **Expo Status Bar**: 3.0.9

## Path Aliases (tsconfig.json)

```typescript
{
  "@/*": ["./*"],
  "@/components/*": ["shared/components/*"],
  "@/shared/*": ["shared/*"],
  "@/app/*": ["app/*"]
}
```

## Folder Structure (2 levels)

```
D:\ReactNative\nanoloan\
├── app/                          # Expo Router pages
│   ├── (tabs)/                   # Bottom tab navigation (main app)
│   ├── auth/                     # Authentication & KYC form screens
│   │   ├── _layout.tsx           # Auth layout wrapper
│   │   ├── basic-information.tsx # Screen 01: Gender, marital, education, NID, TIN
│   │   └── addresses-update.tsx  # Screen 02: Address form
│   ├── kyc/                      # KYC verification flow
│   │   ├── _layout.tsx
│   │   ├── started.tsx           # Screen 03: Intro/agreement
│   │   ├── select-id-type.tsx    # Choose NID or Passport
│   │   ├── id-capture.tsx        # Camera capture for ID
│   │   ├── id-capture-preview.tsx # Screen 04: Preview & OCR
│   │   ├── address-roles.tsx     # Select document type for address proof
│   │   ├── address-capture.tsx   # Camera capture for address
│   │   ├── address-capture-preview.tsx # Screen 05: Preview address doc
│   │   └── facial-recognition.tsx # Facial verification
│   ├── index.tsx                 # Entry point (redirects)
│   └── _layout.tsx               # Root layout with providers
├── shared/                       # Shared code (not in app folder)
│   ├── components/               # Reusable UI components
│   │   ├── kyc/                  # KYC-specific components
│   │   ├── UI/                   # General UI components
│   │   └── index.tsx
│   ├── config/                   # Configuration files
│   │   ├── index.ts              # API URL config
│   │   └── toastConfig.tsx       # Toast configuration
│   ├── contexts/                 # React Context providers
│   │   └── AuthContext.tsx       # Authentication context
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAppSelector.ts     # Typed Redux hooks
│   │   └── useToast.ts           # Toast notification hook
│   ├── libs/                     # Core libraries
│   │   ├── redux/
│   │   │   ├── features/
│   │   │   │   ├── auth/         # Auth slice & API
│   │   │   │   │   ├── authSlice.ts
│   │   │   │   │   └── authApi.ts
│   │   │   │   └── kyc/          # KYC slice
│   │   │   │       └── kycSlice.ts
│   │   │   ├── apiSlice.ts       # RTK Query base API setup
│   │   │   └── store.ts          # Redux store configuration
│   │   └── types/                # TypeScript type definitions
│   │       ├── auth.types.ts     # Auth API types
│   │       └── user.types.ts     # User types
│   └── utils/                    # Utility functions
├── types/                        # Global type definitions
│   └── kyc.ts                    # KYC-related types
├── context/                      # AI Agent documentation (this folder)
├── assets/                       # Images, fonts, sounds
├── node_modules/
├── package.json
├── app.json                      # Expo app config
├── tsconfig.json                 # TypeScript config
├── tailwind.config.js            # Tailwind config
└── babel.config.js               # Babel config
```

## Environment Variables

- **`EXPO_PUBLIC_API_URL`**: Backend API URL (default: `https://backend-nanoloan.giize.com`)
  - Set in `shared/config/index.ts`
  - Override via `.env` file if needed

## How to Run

```bash
# Install dependencies
npm install

# Start development server
npm start
# or
expo start

# Run on specific platform
npm run android
npm run ios

# Build for production
npm run prebuild
```

## Build Configuration

- **Android**: 
  - `compileSdkVersion`: 36
  - `targetSdkVersion`: 36
  - `minSdkVersion`: 24
  - Package: `com.nano.loan.app`

- **iOS**: 
  - Supports tablets
  - No specific version constraints

## Key Features

1. **User Authentication**: Registration, email verification, login, logout
2. **KYC Verification**: 
   - Basic information collection
   - Address submission
   - ID document capture (NID/Passport) with OCR
   - Address proof capture
   - Facial recognition
3. **Loan Management**: (In development)
4. **Push Notifications**: Firebase Cloud Messaging
5. **Biometric Auth**: Fingerprint registration (device-level)

## Important Notes

- **No services/ folder exists yet** — API calls are via RTK Query in Redux slices
- **AsyncStorage** is used for token/user persistence
- **Toast notifications** use `react-native-toast-message`
- **Camera** and **gallery** permissions are configured
- **OCR** uses ML Kit for text extraction from ID cards
