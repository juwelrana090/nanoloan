# 📘 Nanoloan API Integration Guide for AI

**Version:** 1.0.0
**Last Updated:** 2026-04-15
**API Base URL:** `https://backend-nanoloan.giize.com`

---

## 🎯 Quick Reference for AI Development

When working with the Nanoloan API, **always** follow this pattern. Deviating from it will cause bugs.

---

## 📦 Standard API Response Format

**ALL** API endpoints follow this response structure:

```typescript
// ✅ Success Response
{
  "success": true,
  "message": "Operation successful",
  "data": <T>  // Actual payload (varies by endpoint)
}

// ❌ Error Response
{
  "success": false,
  "message": "Error message",
  "errors": ["error1", "error2"]  // Optional
}
```

---

## 🔑 Critical Rule: Access Data via `.data` Property

When using RTK Query mutations/queries:

```typescript
// ❌ WRONG - Will cause undefined errors
const response = await loginMutation(data).unwrap();
const { accessToken, user } = response;  // undefined!

// ✅ CORRECT
const response = await loginMutation(data).unwrap();
const { accessToken, user } = response.data;  // Works!
```

### Why?

The RTK Query `unwrap()` returns the **full** API response object:
```typescript
{
  success: true,
  message: "Login successful",
  data: {
    accessToken: "...",
    user: {...}
  }
}
```

The actual data is nested under `response.data`.

---

## 🏗️ Module Structure Pattern

When creating a new module (e.g., `modules/xyz`), follow this structure:

```
modules/xyz/
├── types/
│   └── index.ts          # All TypeScript types/interfaces
├── services/
│   └── xyzService.ts     # Direct API calls (use sparingly)
├── hooks/
│   └── useXyz.ts         # React hooks using RTK Query
├── actions/
│   └── xyzActions.ts     # Complex business logic
└── index.ts              # Public API exports
```

---

## 📝 Type Definition Pattern

**File:** `modules/xyz/types/index.ts`

```typescript
// ─── API Response Wrappers (REQUIRED) ───────────────────────────────────────

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: string[];
}

// ─── Endpoint-Specific Types ───────────────────────────────────────────────────

// Example: GET /v1/users/me
export type GetMeResponse = ApiSuccessResponse<UserProfile>;

// Example: PUT /v1/users/me
export interface UpdateProfileRequest {
  fullName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: Gender;
}

export type UpdateProfileResponse = ApiSuccessResponse<UserProfile>;
```

**Rules:**
- **Always** wrap response data in `ApiSuccessResponse<T>`
- Use `ApiErrorResponse` for error handling
- Define request types separately from response types
- Include JSDoc comments with the endpoint path

---

## 🪝 Hook Pattern (RTK Query)

**File:** `modules/xyz/hooks/useXyz.ts`

```typescript
import { useState } from 'react';
import { useAppDispatch } from '@/shared/hooks/useAppSelector';
import { useUpdateXyzMutation } from '@/shared/libs/redux/features/xyz/xyzApi';
import { setXyz } from '@/shared/libs/redux/features/xyz/xyzSlice';
import type { UpdateXyzRequest } from '../types';

export const useUpdateXyz = () => {
  const [updateMutation, { isLoading }] = useUpdateXyzMutation();
  const dispatch = useAppDispatch();
  const [error, setError] = useState<string | null>(null);

  const updateXyz = async (data: UpdateXyzRequest) => {
    setError(null);
    try {
      // unwrap() returns { success: true, message: string, data: T }
      const response = await updateMutation(data).unwrap();

      // Access actual data via response.data
      dispatch(setXyz(response.data));

      return response;
    } catch (err: any) {
      const msg = err?.data?.message ?? 'Failed to update. Please try again.';
      setError(Array.isArray(msg) ? msg[0] : msg);
      throw err;
    }
  };

  return { updateXyz, isLoading, error };
};
```

**Rules:**
- **Always** access `response.data` for the actual payload
- Handle both array and string error messages
- Update Redux state with unwrapped data
- Return the full response for UI consumption

---

## 🎬 Action Pattern

**File:** `modules/xyz/actions/xyzActions.ts`

```typescript
import { xyzService } from '../services/xyzService';
import type { UserProfile } from '../types';

const getToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem('@token');
};

export const xyzActions = {
  /**
   * Fetch XYZ data
   * Returns the actual data (not the wrapped response)
   */
  getXyz: async (): Promise<UserProfile> => {
    const token = await getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await xyzService.getXyz(token);

    // Return the actual data, not the wrapper
    return response.data;
  },
};
```

**Rules:**
- Return **unwrapped** data (`response.data`) for ease of use
- Include token management
- Throw descriptive errors
- Include JSDoc comments

---

## 🌐 Service Pattern

**File:** `modules/xyz/services/xyzService.ts`

```typescript
import { apiUrl } from '@/shared/config';
import type { GetXyzResponse } from '../types';

const createHeaders = async (token?: string) => {
  const headers: HeadersInit = {
    'Accept': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }
  return response.json();
};

export const xyzService = {
  getXyz: async (token: string): Promise<GetXyzResponse> => {
    const response = await fetch(`${apiUrl}/v1/xyz`, {
      method: 'GET',
      headers: await createHeaders(token),
    });
    return handleResponse<GetXyzResponse>(response);
  },
};
```

**Rules:**
- Use services **only** when RTK Query is insufficient
- Prefer hooks for React components
- Include proper error handling
- Return the full API response (wrapped)

---

## 🔗 RTK Query API Slice Pattern

**File:** `shared/libs/redux/features/xyz/xyzApi.ts`

```typescript
export const xyzApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getXyz: builder.query<GetXyzResponse, void>({
      query: () => ({
        url: '/xyz',
        method: 'GET',
      }),
    }),
    updateXyz: builder.mutation<UpdateXyzResponse, UpdateXyzRequest>({
      query: (data) => ({
        url: '/xyz',
        method: 'PUT',
        body: data,
      }),
    }),
  }),
});

export const {
  useGetXyzQuery,
  useUpdateXyzMutation,
  useLazyGetXyzQuery,
} = xyzApi;
```

**Rules:**
- Type responses as `ApiSuccessResponse<T>`
- Keep endpoint definitions simple
- Export hooks for easy importing

---

## 📚 Common Examples

### Example 1: User Login

```typescript
// ❌ WRONG
const response = await loginMutation({ identifier, password }).unwrap();
const { accessToken, user } = response;  // undefined!

// ✅ CORRECT
const response = await loginMutation({ identifier, password }).unwrap();
const { accessToken, user } = response.data;  // Works!
await persistLoginSession(dispatch, response.data);
```

### Example 2: Update Profile

```typescript
// Hook
const { updateProfile, isLoading, error } = useUpdateProfile();

// Usage
try {
  await updateProfile({
    fullName: 'John Doe',
    phoneNumber: '+8801712345678',
  });
  // Success!
} catch (err) {
  // Error handled by hook
  console.log(error);
}
```

### Example 3: Query Data

```typescript
// Hook
const { userProfile, isLoading, error, refresh } = useUserProfile();

// Usage
if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage />;

return (
  <View>
    <Text>Welcome, {userProfile.fullName}</Text>
  </View>
);
```

---

## ⚠️ Common Pitfalls to Avoid

1. **Forgetting `.data`**: Always access `response.data` for the actual payload
2. **Inconsistent error handling**: Handle both array and string errors
3. **Not updating Redux**: Always sync API responses with Redux state
4. **Direct service calls in components**: Use hooks instead
5. **Ignoring token management**: Services need tokens for authenticated endpoints

---

## 📋 Checklist for New Features

When adding a new API endpoint:

- [ ] Add types to `types/index.ts` with `ApiSuccessResponse<T>` wrapper
- [ ] Add RTK Query endpoint to `*Api.ts`
- [ ] Create hook in `hooks/useXyz.ts`
- [ ] Access `response.data` in hook logic
- [ ] Handle errors properly
- [ ] Update Redux state if needed
- [ ] Add action for complex operations
- [ ] Export from `index.ts`
- [ ] Test with actual API

---

## 🔗 Useful Resources

- **API Documentation:** https://backend-nanoloan.giize.com/api-json
- **Current Auth Types:** `shared/libs/types/auth.types.ts`
- **Home Module Example:** `modules/home/`
- **Auth API:** `shared/libs/redux/features/auth/authApi.ts`

---

**🤖 AI Instructions:**
When you encounter a task requiring API integration:
1. Read this guide first
2. Follow the patterns exactly
3. Don't reinvent the wheel
4. Test against actual API responses
5. Update this guide if patterns change

**⚡ Pro Tip:** Always assume `.data` exists. If it doesn't, the API response format changed and needs investigation.
