# API / HTTP Layer - NanoLoan

## Base URL

**Location**: `shared/config/index.ts`

```typescript
const apiUrl = process.env.EXPO_PUBLIC_API_URL || "https://backend-nanoloan.giize.com"
```

**Full API Base URL**: `https://backend-nanoloan.giize.com/v1`

## HTTP Client Setup

**Location**: `shared/libs/redux/apiSlice.ts`

**Library**: RTK Query (`@reduxjs/toolkit/query/react`)

### Base Query Configuration

```typescript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: `${apiUrl}/v1`,
  prepareHeaders: async (headers, { getState }) => {
    const state: RootState = getState() as RootState;
    const token = await AsyncStorage.getItem('@token') || state.auth.token;

    // Clear and set headers
    headers.delete('Content-Type');
    headers.set('Accept', 'application/json');
    headers.set('Content-Type', 'application/json');

    // Attach auth header
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }
});
```

### Base Query with Auto-Logout

```typescript
const baseQueryWithAutoLogout = async (args: any, api: any, extraOptions: any) => {
  const result = await baseQuery(args, api, extraOptions);

  // Auto-logout on 401
  if (result.error && result.error.status === 401) {
    await AsyncStorage.multiRemove(['@user', '@token', '@deviceToken']);
    api.dispatch(setLogout());
  }

  return result;
};
```

### API Slice Export

```typescript
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithAutoLogout,
  tagTypes: ['user'],
  endpoints: () => ({})
});
```

## Auth Header Injection

**Pattern**: `Authorization: Bearer <token>`

- Automatically attached by RTK Query baseQuery
- Token read from AsyncStorage first, then Redux state fallback
- Header set for ALL requests (authenticated and public)
- 401 responses trigger automatic logout

## Standard Response Envelope

### Success Response

```typescript
interface ApiSuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
}
```

**Example**:
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "123",
    "fullName": "John Doe",
    "email": "john@example.com"
  }
}
```

### Error Response

```typescript
interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: string[];
}
```

**Example**:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["nationalId is required", "tin must be 10 digits"]
}
```

## Standard Error Response Shapes

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid request data"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access token is invalid or expired"
}
```
**Action**: Auto-logout triggered

### 422 Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "nationalId": ["NID is required"],
    "tin": ["TIN must be at least 10 characters"]
  }
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Making API Calls

### Method 1: RTK Query Hooks (Preferred)

**For components** - Auto-caching, loading states, error handling:

```typescript
import { useUpdateProfileMutation, useGetMeQuery } from '@/shared/libs/redux/features/auth/authApi';

function ProfileScreen() {
  // Query (GET)
  const { data, error, isLoading, refetch } = useGetMeQuery();

  // Mutation (POST/PUT/DELETE)
  const [updateProfile, { isLoading: isUpdating, error: updateError }] = useUpdateProfileMutation();

  const handleSubmit = async (profileData) => {
    try {
      const result = await updateProfile(profileData).unwrap();
      // result.data contains the response
      console.log('Profile updated:', result.data);
    } catch (error) {
      // Handle error
      console.error('Update failed:', error);
    }
  };
}
```

### Method 2: Direct API Slice Injection

**For adding new endpoints**:

```typescript
// In your feature's API file (e.g., biometricApi.ts)
import { apiSlice } from '@/shared/libs/redux/apiSlice';

export const biometricApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    startVerification: builder.mutation<BiometricStartResponse, void>({
      query: () => ({
        url: '/biometric/start',
        method: 'POST',
      }),
    }),
    verifyId: builder.mutation<BiometricVerifyResponse, FormData>({
      query: (formData) => ({
        url: '/biometric/id-verify',
        method: 'POST',
        body: formData,
        // Don't set Content-Type for FormData - browser sets it with boundary
      }),
    }),
  }),
});

export const {
  useStartVerificationMutation,
  useVerifyIdMutation,
} = biometricApi;
```

## Error Handling Pattern

### Global Error Handling (API Layer)

Handled in `baseQueryWithAutoLogout`:
- Logs all errors to console
- Auto-logout on 401
- Returns error object to component

### Component-Level Error Handling

```typescript
const [updateProfile, { isLoading, error }] = useUpdateProfileMutation();

const handleSubmit = async () => {
  try {
    await updateProfile(data).unwrap();
    // Success - show toast
    showSuccess({ title: 'Success', message: 'Profile updated' });
  } catch (error: any) {
    // Error - show error toast
    const errorMsg = error?.data?.message || 'Update failed';
    showError({ title: 'Error', message: errorMsg });
  }
};
```

### Validation Error Handling (422)

```typescript
try {
  await updateProfile(data).unwrap();
} catch (error: any) {
  if (error?.status === 422 && error?.data?.errors) {
    // Show field-level errors
    const errors = error.data.errors;
    // Display errors under each input field
  } else {
    // Show general error
    showError({ title: 'Error', message: error?.data?.message });
  }
}
```

## Loading State Pattern

### Local Component State

```typescript
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  try {
    await updateProfile(data).unwrap();
  } finally {
    setLoading(false);
  }
};
```

### RTK Query Built-in Loading

```typescript
const [updateProfile, { isLoading }] = useUpdateProfileMutation();

<TouchableOpacity onPress={handleSubmit} disabled={isLoading}>
  {isLoading ? <ActivityIndicator /> : <Text>Submit</Text>}
</TouchableOpacity>
```

## Request Types

### JSON Request

```typescript
query: (data: UpdateProfileRequest) => ({
  url: '/users/me',
  method: 'PUT',
  body: data, // Automatically serialized as JSON
}),
```

### FormData Request (File Upload)

```typescript
query: (formData: FormData) => ({
  url: '/biometric/id-verify',
  method: 'POST',
  body: formData,
  // Don't set Content-Type header - fetch does it automatically with boundary
}),
```

**Building FormData**:
```typescript
const formData = new FormData();
formData.append('idType', 'NID');
formData.append('idCardImage', {
  uri: imageUri,
  name: 'id-card.jpg',
  type: 'image/jpeg',
} as any);
```

## API Call Example (Complete)

```typescript
import { useUpdateProfileMutation } from '@/shared/libs/redux/features/auth/authApi';
import { useToast } from '@/shared/hooks/useToast';
import { useAppSelector } from '@/shared/hooks/useAppSelector';

function BasicInformationScreen() {
  const { token } = useAppSelector((state) => state.auth);
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const { showSuccess, showError } = useToast();

  const handleSubmit = async (formData: UpdateProfileRequest) => {
    try {
      // Auth header attached automatically by RTK Query
      const response = await updateProfile(formData).unwrap();
      
      // Success
      showSuccess({
        title: 'Success',
        message: response.message || 'Profile updated successfully',
      });
      
      // Navigate to next screen
      router.push('/auth/addresses-update');
      
    } catch (error: any) {
      // Error
      console.error('Update profile error:', error);
      
      if (error?.status === 422) {
        // Validation errors
        const errors = error.data?.errors || {};
        // Display field-level errors
      } else if (error?.status === 401) {
        // Token expired (auto-logout already triggered)
        showError({ title: 'Session Expired', message: 'Please login again' });
      } else {
        // General error
        const errorMsg = error?.data?.message || 'Failed to update profile';
        showError({ title: 'Error', message: errorMsg });
      }
    }
  };

  return (
    <TouchableOpacity onPress={() => handleSubmit(data)} disabled={isLoading}>
      {isLoading ? <ActivityIndicator /> : <Text>Submit</Text>}
    </TouchableOpacity>
  );
}
```

## Debugging API Calls

**Enable console logging** (already enabled in `apiSlice.ts`):

```typescript
console.log('🚀 Making API Request:', {
  url: typeof args === 'string' ? args : args.url,
  method: typeof args === 'string' ? 'GET' : args.method,
  baseUrl: `${apiUrl}/v1`
});

console.log('📥 API Response:', {
  success: !result.error,
  status: result.error?.status,
  data: result.data ? 'Data received' : 'No data'
});
```

**Network debugging tools** (available in project):
- `shared/utils/networkDebug.ts`
- `shared/utils/apiDebug.ts`
- `shared/utils/networkDiagnostics.ts`
- `shared/components/NetworkDebugScreen.tsx`
