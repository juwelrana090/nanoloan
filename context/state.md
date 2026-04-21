# State Management - NanoLoan

## State Management Library

**Redux Toolkit** + **Redux Persist**

- **Redux Toolkit**: 2.11.2
- **Redux Persist**: 6.0.0
- **AsyncStorage**: Storage backend for persistence

## Store Locations

**Main Store**: `shared/libs/redux/store.ts`

```typescript
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: { /* config for Redux Persist */ },
      immutableCheck: false,
    }).concat(apiSlice.middleware),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

## Redux Persist Configuration

**Whitelisted Slices** (persisted to AsyncStorage):
- `auth` - Authentication state
- `kyc` - KYC verification state

```typescript
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'kyc'],
};
```

## Global State Structure

```typescript
interface RootState {
  auth: AuthState;
  kyc: KYCState;
  api: ApiState; // RTK Query cache
}
```

## Auth State Shape

**Location**: `shared/libs/redux/features/auth/authSlice.ts`

```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  deviceToken: DeviceToken | null;
}
```

### Auth State Fields

| Field | Type | Description |
|-------|------|-------------|
| `user` | `User \| null` | User profile object |
| `token` | `string \| null` | JWT access token |
| `isAuthenticated` | `boolean` | Auth status flag |
| `isLoading` | `boolean` | Loading state for auth operations |
| `error` | `string \| null` | Last error message |
| `deviceToken` | `DeviceToken \| null` | FCM push notification token |

### Auth Actions

```typescript
import { setUser, setToken, setIsAuthenticated, setIsLoading, setError, setLogout, setDeviceToken } from '@/shared/libs/redux/features/auth/authSlice';

// Set user profile
dispatch(setUser(userData));

// Set access token
dispatch(setToken(accessToken));

// Set auth status
dispatch(setIsAuthenticated(true));

// Set loading state
dispatch(setIsLoading(true));

// Set error message
dispatch(setError('Login failed'));

// Clear all auth state (logout)
dispatch(setLogout());

// Set device token
dispatch(setDeviceToken({ fcmToken: '...' }));
```

### Auth Selectors

```typescript
import { useAppSelector } from '@/shared/hooks/useAppSelector';

// Read individual fields
const user = useAppSelector((state) => state.auth.user);
const token = useAppSelector((state) => state.auth.token);
const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
const isLoading = useAppSelector((state) => state.auth.isLoading);

// Read all auth state
const authState = useAppSelector((state) => state.auth);
```

## KYC State Shape

**Location**: `shared/libs/redux/features/kyc/kycSlice.ts`

```typescript
export interface KYCState {
  documentType: DocumentType | null;
  frontImageUri: string | null;
  backImageUri: string | null;
  addressImageUri: string | null;
  frontData: ExtractedData | null;
  backData: ExtractedData | null;
  currentStep: string;
  isLoading: boolean;
  error: string | null;
}
```

### KYC State Fields

| Field | Type | Description |
|-------|------|-------------|
| `documentType` | `DocumentType \| null` | 'NID' | 'PASSPORT' | 'UNKNOWN' |
| `frontImageUri` | `string \| null` | URI of front ID card image |
| `backImageUri` | `string \| null` | URI of back ID card image |
| `addressImageUri` | `string \| null` | URI of address proof document |
| `frontData` | `ExtractedData \| null` | OCR-extracted data from front |
| `backData` | `ExtractedData \| null` | OCR-extracted data from back |
| `currentStep` | `string` | Current KYC step identifier |
| `isLoading` | `boolean` | Loading state for operations |
| `error` | `string \| null` | Last error message |

### Extracted Data Structure

**Location**: `types/kyc.ts`

```typescript
interface ExtractedData {
  documentType?: DocumentType;
  name?: string;
  idNumber?: string;
  nidNo?: string;
  passportNumber?: string;
  dob?: string;
  placeOfBirth?: string;
  dateOfIssue?: string;
  expiryDate?: string;
  nationality?: string;
  sex?: string;
  fatherName?: string;
  motherName?: string;
  spouseName?: string;
  presentAddress?: string;
  permanentAddress?: string;
  bloodGroup?: string;
  district?: string;
  emergencyContact?: string;
  address?: string;
  observations?: string;
  fileNumber?: string;
  rawText: string;
  validationErrors?: ValidationError[];
}
```

### KYC Actions

```typescript
import {
  setDocumentType,
  setFrontImage,
  setBackImage,
  setAddressImage,
  setFrontData,
  setBackData,
  clearFrontImage,
  clearBackImage,
  clearAddressImage,
  setCurrentStep,
  setLoading,
  setError,
  resetKYC,
} from '@/shared/libs/redux/features/kyc/kycSlice';

// Set document type
dispatch(setDocumentType('NID'));

// Set image URIs
dispatch(setFrontImage('file://...'));
dispatch(setBackImage('file://...'));
dispatch(setAddressImage('file://...'));

// Set extracted OCR data
dispatch(setFrontData(extractedData));
dispatch(setBackData(extractedData));

// Clear images
dispatch(clearFrontImage());
dispatch(clearBackImage());
dispatch(clearAddressImage());

// Set current step
dispatch(setCurrentStep('id-capture'));

// Set loading/error
dispatch(setLoading(true));
dispatch(setError('OCR failed'));

// Reset all KYC state
dispatch(resetKYC());
```

### KYC Selectors

```typescript
import { useAppSelector } from '@/shared/hooks/useAppSelector';

// Read individual fields
const documentType = useAppSelector((state) => state.kyc.documentType);
const frontImageUri = useAppSelector((state) => state.kyc.frontImageUri);
const backImageUri = useAppSelector((state) => state.kyc.backImageUri);
const addressImageUri = useAppSelector((state) => state.kyc.addressImageUri);
const frontData = useAppSelector((state) => state.kyc.frontData);
const backData = useAppSelector((state) => state.kyc.backData);
const isLoading = useAppSelector((state) => state.kyc.isLoading);
const error = useAppSelector((state) => state.kyc.error);

// Read all KYC state
const kycState = useAppSelector((state) => state.kyc);
```

## How to Read State

### In Functional Components

```typescript
import { useAppSelector } from '@/shared/hooks/useAppSelector';

function MyComponent() {
  const { user, token, isAuthenticated } = useAppSelector((state) => state.auth);
  const { frontImageUri, backImageUri, isLoading } = useAppSelector((state) => state.kyc);
  
  // Use state
  if (isAuthenticated) {
    console.log('User:', user?.fullName);
  }
}
```

### In Thunks/Services

```typescript
import { RootState, AppDispatch } from '@/shared/libs/redux/store';

export const someThunk = () => async (dispatch: AppDispatch, getState: () => RootState) => {
  const state = getState();
  const token = state.auth.token;
  const kycData = state.kyc.frontData;
  
  // Use state
};
```

### Using Typed Hooks

```typescript
import { useAppDispatch, useAppSelector } from '@/shared/hooks/useAppSelector';

function MyComponent() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  
  // Dispatch actions
  dispatch(setLoading(true));
  
  // Read state
  console.log('Token:', token);
}
```

## State Persistence

### What Gets Persisted

**Auth State** (AsyncStorage key: `@root`):
- `user` object
- `token` string
- `isAuthenticated` boolean
- `deviceToken` object

**KYC State** (AsyncStorage key: `@root`):
- All KYC fields (images, OCR data, step)
- Survives app restarts

### What Does NOT Get Persisted

- `isLoading` (reset on app restart)
- `error` (reset on app restart)
- RTK Query cache (re-fetched on mount)

### Clearing Persisted State

```typescript
// Clear specific slice
dispatch(setLogout()); // Clears auth + AsyncStorage

// Clear all persisted state
import { persistor } from '@/shared/libs/redux/store';
await persistor.purge(); // Clears all AsyncStorage
await persistor.flush(); // Flushes state to disk
```

## User Profile State

**Location**: Inline in auth state

```typescript
interface User {
  id: string;
  fullName: string;
  email: string;
  username: string;
  phoneNumber: string;
  dateOfBirth: string;
  age?: number;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  role: string;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  profile?: {
    maritalStatus?: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
    educationLevel?: 'PRIMARY' | 'SECONDARY' | 'DIPLOMA' | 'BACHELOR' | 'MASTER' | 'PHD' | 'OTHER';
    nationalId?: string;
    tin?: string;
    passportNo?: string;
  };
  addresses?: Address[];
}
```

## RTK Query Cache State

**Location**: `state.api` (managed by RTK Query)

```typescript
interface ApiState {
  queries: {
    [requestKey: string]: {
      status: 'pending' | 'fulfilled' | 'rejected';
      data?: any;
      error?: any;
      requestId: string;
      startedTimeStamp: number;
      fulfilledTimeStamp: number;
    };
  };
  mutations: {
    [requestKey: string]: {
      status: 'pending' | 'fulfilled' | 'rejected';
      data?: any;
      error?: any;
    };
  };
  provided: {
    [tag: string]: string[];
  };
  subscriptions: {
    [endpointName: string]: {
      [requestKey: string]: {
        cacheKey: string;
      };
    };
  };
}
```

## State Updates Required for Task 03

After implementing the 5 screen API integrations, update the KYC state to include:

```typescript
interface KYCState {
  // ... existing fields ...

  // NEW: Biometric session
  biometricSessionId: string | null; // From POST /v1/biometric/start

  // NEW: Cropped images (after capture/crop)
  croppedFrontImageUri: string | null;
  croppedBackImageUri: string | null;
  croppedAddressImageUri: string | null;

  // NEW: Selected ID type
  selectedIdType: 'NID' | 'PASSPORT' | null;

  // NEW: API submission status
  idSubmitted: boolean;
  addressSubmitted: boolean;
}
```

This will be added in Task 03.
