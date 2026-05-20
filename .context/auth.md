# Authentication System - NanoLoan

## Auth Flow Overview

```
Registration → Email/OTP Verification → Login → Token Stored → Access App
         ↓                                           ↑
    [Create Account]                          [Refresh Token]
```

## Token Storage

### Storage Mechanism
- **Library**: `@react-native-async-storage/async-storage`
- **Storage Keys** (defined in multiple places):
  ```typescript
  STORAGE_KEYS = {
    USER: '@user',
    TOKEN: '@token',
    DEVICE_TOKEN: '@deviceToken',
  }
  ```

### Where Tokens Live
1. **AsyncStorage** (persistent):
   - `@token`: JWT access token
   - `@user`: User profile JSON
   - `@deviceToken`: FCM device token

2. **Redux State** (in-memory):
   - `state.auth.token`: Current access token
   - `state.auth.user`: User profile object
   - `state.auth.isAuthenticated`: Boolean flag
   - `state.auth.isLoading`: Loading state

## useAuth() Hook API

**Location**: `shared/contexts/AuthContext.tsx`

```typescript
interface AuthContextType {
  // State
  user: User | null;
  token: string | null;
  deviceToken: DeviceToken | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Local form state (for auth screens)
  step: number;
  email: string;
  username: string;
  password: string;
  loading: boolean;
  isRemember: boolean;
  showPassword: boolean;

  // Methods
  setStep: (step: number) => void;
  setEmail: (email: string) => void;
  setUsername: (username: string) => void;
  setPassword: (password: string) => void;
  setLoading: (loading: boolean) => void;
  setIsRemember: (isRemember: boolean) => void;
  setShowPassword: (showPassword: boolean) => void;

  // Auth operations
  checkEmail: (email: string) => Promise<boolean>;  // Returns true if available
  checkUsername: (username: string) => Promise<boolean>; // Returns true if available
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  sendOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  resetPassword: (email: string, newPassword: string, confirmPassword: string) => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

// Usage
import { useAuth } from '@/shared/contexts/AuthContext';

function MyComponent() {
  const { token, user, login, logout, isAuthenticated } = useAuth();
  // ...
}
```

## How to Get Access Token

### Option 1: From AuthContext (in components)
```typescript
const { token } = useAuth();
```

### Option 2: From Redux State (in components/services)
```typescript
import { useAppSelector } from '@/shared/hooks/useAppSelector';

const token = useAppSelector((state) => state.auth.token);
```

### Option 3: From AsyncStorage (in services/thunks)
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const token = await AsyncStorage.getItem('@token');
```

### Option 4: RTK Query BaseQuery (automatic)
The `apiSlice` baseQuery automatically reads from both AsyncStorage and Redux state:
```typescript
// In shared/libs/redux/apiSlice.ts
const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN) || state.auth.token;
```

## Auth Header Pattern

**Location**: `shared/libs/redux/apiSlice.ts`

```typescript
// RTK Query automatically attaches this to all requests
prepareHeaders: async (headers, { getState }) => {
  const state = getState() as RootState;
  const token = await AsyncStorage.getItem('@token') || state.auth.token;
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  headers.set('Accept', 'application/json');
  headers.set('Content-Type', 'application/json');
  
  return headers;
}
```

## JWT Payload Structure

**Type**: `UserProfile` (from `shared/libs/types/auth.types.ts`)

```typescript
interface UserProfile {
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
  profile?: UserProfileBasicInfo | null;
  addresses?: Address[];
}

interface UserProfileBasicInfo {
  maritalStatus?: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
  educationLevel?: 'PRIMARY' | 'SECONDARY' | 'DIPLOMA' | 'BACHELOR' | 'MASTER' | 'PHD' | 'OTHER';
  nationalId?: string;
  tin?: string;
  passportNo?: string;
}

interface Address {
  id: string;
  type: 'PRESENT' | 'PERMANENT';
  address: string;
  postCode: string;
  city: string;
  state: string;
  country: string;
  yearsAtAddress: number;
  isPrimary: boolean;
  createdAt?: string;
  updatedAt?: string;
}
```

## Auth Initialization Flow

**Location**: `shared/contexts/AuthContext.tsx` (useEffect)

1. App starts → AuthProvider initializes
2. Reads from AsyncStorage: `@user` and `@token`
3. If both exist:
   - Parse user JSON
   - Dispatch `setUser(userData)` to Redux
   - Dispatch `setToken(token)` to Redux
   - Dispatch `setIsAuthenticated(true)`
4. Sets `isLoading` to false

## Auto-Logout on 401

**Location**: `shared/libs/redux/apiSlice.ts`

The `baseQueryWithAutoLogout` wrapper:
- Intercepts all API responses
- If status === 401:
  - Clears AsyncStorage (`@user`, `@token`, `@deviceToken`)
  - Dispatches `setLogout()` action to Redux
  - User is redirected to login screen

## Auth API Endpoints

**Location**: `shared/libs/redux/features/auth/authApi.ts`

### Auth Endpoints
- `POST /v1/auth/register` - User registration
- `POST /v1/auth/login` - Login (returns accessToken + user)
- `POST /v1/auth/verify-email` - Verify email with OTP
- `POST /v1/auth/resend-otp` - Resend OTP
- `POST /v1/auth/forgot-password` - Initiate password reset
- `POST /v1/auth/verify-reset-otp` - Verify reset OTP
- `POST /v1/auth/reset-password` - Reset password with new password
- `GET /v1/auth/check-email` - Check if email exists
- `GET /v1/auth/check-username` - Check if username exists

### User Endpoints (Authenticated)
- `GET /v1/users/me` - Get user profile
- `PUT /v1/users/me` - Update profile
- `PUT /v1/users/me/basic-info` - Update basic info (marital, education, NID, etc.)
- `PUT /v1/users/me/change-password` - Change password
- `DELETE /v1/users/me` - Delete account

### Address Endpoints (Authenticated)
- `GET /v1/users/me/addresses` - Get all addresses
- `POST /v1/users/me/addresses` - Add new address
- `PUT /v1/users/me/addresses/{id}` - Update address

## Usage Examples

### Login
```typescript
const { login } = useAuth();

try {
  await login('user@example.com', 'password123');
  // Token automatically stored in AsyncStorage + Redux
  // User redirected to main app
} catch (error) {
  // Error shown via toast
}
```

### Access Protected API
```typescript
// Using RTK Query hook (auto-includes auth header)
import { useGetMeQuery } from '@/shared/libs/redux/features/auth/authApi';

function ProfileScreen() {
  const { data, error, isLoading } = useGetMeQuery();
  // Auth header attached automatically
}
```

### Logout
```typescript
const { logout } = useAuth();

// Clears AsyncStorage + Redux state
logout();
// Redirects to login screen
```
