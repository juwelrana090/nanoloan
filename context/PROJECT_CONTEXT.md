# NanoLoan React Native Project - Context Documentation

## Project Overview
NanoLoan is a financial services mobile application built with React Native and Expo, featuring KYC (Know Your Customer) verification, loan management, and user authentication.

## Technology Stack

### Core Technologies
- **React Native** with TypeScript (strict mode)
- **Expo SDK** with managed workflow
- **Expo Router** for file-based navigation
- **Redux Toolkit** with Redux Persist for state management
- **NativeWind** (Tailwind CSS) for styling
- **ML Kit Text Recognition** for ID card text extraction

### Key Dependencies
```json
{
  "expo-camera": "^4.1.3",
  "@react-native-ml-kit/text-recognition": "^0.4.1",
  "@react-navigation/native": "^6.1.18",
  "@reduxjs/toolkit": "^1.9.7",
  "react-redux": "^8.1.3",
  "expo-router": "^1.5.21",
  "nativewind": "^2.0.11"
}
```

## Project Structure

### App Directory Structure (`app/`)
```
app/
├── _layout.tsx                    # Root layout with providers
├── welcome.tsx                    # Welcome screen
├── auth/                          # Authentication flow
│   ├── login.tsx
│   ├── register.tsx
│   ├── basic-information.tsx
│   └── email-otp-verification.tsx
├── kyc/                           # KYC verification flow
│   ├── select-id-type.tsx        # Document type selection
│   ├── id-capture.tsx            # Camera capture for ID
│   ├── id-capture-preview.tsx    # Preview and text extraction
│   ├── id-preview-roles.tsx      # Role-based preview
│   ├── address-capture.tsx       # Address capture
│   ├── address-capture-preview.tsx
│   ├── facial-recognition.tsx    # Facial recognition
│   └── verified.tsx              # Completion screen
└── (tabs)/                        # Main application tabs
    ├── _layout.tsx
    ├── home.tsx
    ├── analysis.tsx
    ├── transactions.tsx
    ├── category.tsx
    └── profile.tsx
```

### Shared Directory Structure (`shared/`)
```
shared/
├── components/
│   ├── kyc/                      # KYC-specific components
│   └── UI/
│       └── icons/
│           └── svg-icons.tsx     # Reusable SVG icons
├── contexts/
│   └── AuthContext.tsx           # Authentication context
├── libs/
│   ├── redux/                    # Redux store and slices
│   │   ├── store.ts
│   │   ├── authSlice.ts
│   │   └── apiSlice.ts
│   └── types/                    # TypeScript definitions
├── utils/                        # Utility functions
├── constants/                    # App constants
└── hooks/                        # Custom React hooks
```

## State Management Architecture

### Global State (Redux)
- **authSlice**: User authentication, tokens, session management
- **apiSlice**: RTK Query for API calls with automatic auth injection
- **Redux Persist**: Automatic state persistence with AsyncStorage

### Local State Management
- **AuthContext**: Additional authentication state wrapper
- **Component State**: useState for temporary data (forms, captures)

## Navigation Architecture

### Navigation Flow
1. **Welcome Screen** → Authentication Flow
2. **Auth Flow** → Login/Register → Basic Info → OTP Verification
3. **Main App** → Tab-based navigation (Home, Analysis, Transactions, Category, Profile)
4. **KYC Flow** → Select ID Type → Capture Front → Capture Back → Preview → Facial Recognition → Verified

### Route Protection
- `ProtectedRoute` component for authenticated routes
- Automatic redirect for unauthenticated users
- Auth state persistence across app restarts

## KYC Process Data Flow

### ID Capture Process
1. **Document Selection** → User selects NID or Passport
2. **Front Capture** → Camera captures front side with overlay guide
3. **Front Preview** → Text extraction and validation
4. **Back Capture** → Camera captures back side
5. **Back Preview** → Additional data extraction
6. **Final Validation** → Combined data validation
7. **Facial Recognition** → User photo capture
8. **Submission** → Data sent to backend API

### Image Handling
- **Storage**: Local URI storage in component state
- **Processing**: ML Kit text recognition on device
- **Validation**: Real-time validation with user feedback
- **Persistence**: Temporary storage until final submission

## API Integration

### Backend Configuration
- **Base URL**: `https://backend-nanoloan.giize.com/v1`
- **Authentication**: JWT Bearer tokens
- **Headers**: Auto-injected auth headers via RTK Query

### Key Endpoints
```
POST   /auth/login
POST   /auth/register
POST   /auth/verify-email
GET    /users/me
PUT    /users/me
POST   /users/me/addresses
```

### Error Handling
- **401 Errors**: Automatic logout and redirect to login
- **Network Errors**: Toast notifications with debugging info
- **Validation Errors**: Real-time form feedback

## Camera Integration

### ID Capture Features
- **Custom Camera Interface**: Full-screen camera with ID overlay frame
- **Flash Control**: Toggle flash on/off
- **Camera Flip**: Switch between front/back cameras
- **Quality Control**: High-quality photo capture (0.9 quality)
- **Frame Guide**: Visual guide for proper ID placement

### Camera Permissions
- Runtime permission requests
- Permission denial handling
- User-friendly permission UI

## Text Recognition Integration

### ML Kit Text Recognition
- **On-device Processing**: No server calls for text extraction
- **Multi-language Support**: English and Bengali text recognition
- **Pattern Matching**: Regex patterns for ID card fields
- **Validation**: Real-time data validation

### Supported Document Types
1. **Bangladeshi NID** (Old and New formats)
   - Front: Name, ID number, DOB
   - Back: Father's name, Mother's name, Address, Blood group

2. **Passport**
   - Front: Personal details, photo page
   - Back: Emergency contact, observations

## Styling Approach

### NativeWind + Tailwind CSS
- **Utility-first**: Tailwind CSS classes
- **Responsive Design**: Mobile-first approach
- **Custom Theme**: Green color scheme (#00C897)
- **Typography**: Inter, Roboto, and Lilita One fonts

### Design System
```javascript
// Primary Colors
primary: '#00C897'
secondary: '#093030'
accent: '#25d17f'

// UI Components
KycCard, KycHeader, KycInput
```

## Current Issues and Bugs

### Known Issues
1. **ID Capture State Management**: Capturing one image removes the other
   - **Location**: `app/kyc/id-capture-preview.tsx`
   - **Problem**: useEffect dependency causes state loss
   - **Impact**: Users cannot capture both front and back images

2. **Image Persistence**: No global state for KYC images
   - **Problem**: Images stored only in component state
   - **Impact**: Data loss on navigation or component unmount

## Development Guidelines

### Code Patterns
- **TypeScript Strict Mode**: All code must be type-safe
- **Component Organization**: Separate presentation from business logic
- **Error Handling**: Comprehensive error catching and user feedback
- **State Management**: Use Redux for global state, useState for local state

### Testing Priorities
1. KYC flow end-to-end testing
2. Camera functionality across devices
3. Text recognition accuracy
4. API integration reliability
5. State persistence across navigation

## Performance Optimizations

### Image Optimization
- **Compression**: JPEG compression (0.9 quality)
- **Caching**: React Native image caching
- **Memory Management**: Proper cleanup of camera resources

### State Optimization
- **Memoization**: React.memo for expensive components
- **Lazy Loading**: Code splitting for large screens
- **Debouncing**: Input validation and API calls

## Security Considerations

### Data Protection
- **Local Storage**: AsyncStorage for sensitive data (encrypted)
- **API Security**: HTTPS only, token-based authentication
- **Camera Security**: Runtime permissions, secure image handling
- **Session Management**: Auto-logout on token expiration

## Future Enhancements

### Planned Features
1. **Offline Mode**: Local data persistence
2. **Biometric Auth**: Fingerprint/Face ID
3. **Cloud Storage**: Direct cloud upload of images
4. **Progressive Web App**: Web version of the app
5. **Multi-language Support**: Bengali and English UI

---

**Last Updated**: 2025-04-20
**Project Status**: Active Development
**Maintainer**: NanoLoan Development Team
