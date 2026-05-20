# Login Module
> Last updated: 2026-05-20 by /r-memory scan

## Purpose
Handles user login flow, credential validation, and authentication state management.

## Files
- `modules/login/types/index.ts` - Login-specific types
- `modules/login/actions/loginAction.ts` - Login action (delegates to authApi)
- `modules/login/hooks/useLogin.ts` - Custom hook for login logic
- `app/auth/login.tsx` - Login screen

## Type Definitions
```typescript
interface LoginRequest {
  identifier: string;  // email or username
  password: string;
}

interface LoginResponse {
  user: UserProfile;
  token: string;
}
```

## Login Hook
```typescript
const { login, isLoading, error } = useLogin();

const handleLogin = async ({ identifier, password }: LoginRequest) => {
  try {
    const response = await login({ identifier, password }).unwrap();
    // Success: User logged in, token stored
  } catch (error) {
    // Error: Show error message
  }
};
```

## Login Flow
1. User enters email/username and password
2. Client-side validation (non-empty fields)
3. Call `POST /v1/auth/login`
4. On success:
   - Store user and token in Redux
   - Store token in AsyncStorage
   - Navigate to home screen `/(tabs)`
5. On error:
   - Show error toast
   - Keep user on login screen

## API Endpoint
- `POST /v1/auth/login`
- Request: `{ identifier: string, password: string }`
- Response: `{ user: UserProfile, token: string }`

## Dependencies
- Depends on: `auth` module (authApi, authSlice)
- Uses: `useToast` for notifications
- Uses: `router` for navigation

## UI Features
- Email/username input field
- Password input with show/hide toggle
- "Forgot ID or Password?" link
- Login button with loading state
- Fingerprint login button (UI only, backend incomplete)
- Link to registration screen

## Password Toggle
```typescript
const [showPassword, setShowPassword] = useState(false);

<TextInput
  secureTextEntry={!showPassword}
/>
<TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
  <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} />
</TouchableOpacity>
```

## Error Handling
- Shows error message in red box above form
- Handles network errors, invalid credentials
- Type-safe error handling with error casting

## Notes
- Identifier can be email or username
- Password visibility toggle for UX
- Loading state prevents double submission
- KeyboardAwareScrollView for better UX on small screens
- Fingerprint button present but not fully functional
