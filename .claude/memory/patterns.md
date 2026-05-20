# Established Patterns
> Last updated: 2026-05-20 by /r-memory scan

#### Screen Component Pattern

- **When to use**: For all screen components in `app/` directory
- **Example**: [app/(tabs)/index.tsx](app/(tabs)/index.tsx)
- **Anti-pattern**: Putting business logic directly in screen component

```typescript
export default function HomeScreen() {
  const { paddingTop, scrollPaddingBottom } = useSafePadding();
  const dispatch = useAppDispatch();
  const { showSuccess, showError } = useToast();
  const [refreshing, setRefreshing] = useState(false);

  // RTK Query hooks
  const { data: accountsData, isLoading, refetch } = useGetAccountsQuery();
  const [setPrimary] = useSetPrimaryAccountMutation();

  // Derived data
  const accounts = Array.isArray(accountsData?.data) ? accountsData.data : [];

  // Helper functions
  const maskAccountNumber = (num: string): string =>
    num.length >= 7 ? `${num.slice(0, 3)}*****${num.slice(-4)}` : num;

  // Event handlers
  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <View style={{ flex: 1, paddingTop }}>
      {/* Screen content */}
    </View>
  );
}
```

#### Custom Hook Pattern

- **When to use**: For complex business logic or API integration
- **Example**: [modules/login/hooks/useLogin.ts](modules/login/hooks/useLogin.ts)
- **Anti-pattern**: Duplicating API logic across screens

```typescript
export const useLogin = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { showError } = useToast();
  const [login, { isLoading }] = useLoginMutation();

  const handleLogin = async ({ identifier, password }: LoginRequest) => {
    try {
      const response = await login({ identifier, password }).unwrap();
      dispatch(setUser({ user: response.user, token: response.token }));
      router.replace('/(tabs)');
    } catch (error: any) {
      showError({ title: 'Login Failed', message: error?.data?.message || 'Invalid credentials' });
    }
  };

  return { login: handleLogin, isLoading };
};
```

#### RTK Query API Pattern

- **When to use**: For all API endpoints
- **Example**: [shared/libs/redux/features/auth/authApi.ts](shared/libs/redux/features/auth/authApi.ts)
- **Anti-pattern**: Using fetch/axios directly in components

```typescript
export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (data) => ({
        url: '/auth/login',
        method: 'POST',
        body: data,
      }),
    }),
    getMe: builder.query<ApiSuccessResponse<UserProfile>, void>({
      query: () => ({
        url: '/users/me',
        method: 'GET',
      }),
      providesTags: ['user'],
    }),
  }),
});

export const { useLoginMutation, useGetMeQuery } = authApi;
```

#### Error Handling Pattern

- **When to use**: For all API calls in try-catch blocks
- **Example**: [app/(tabs)/index.tsx](app/(tabs)/index.tsx#L123-L134)
- **Anti-pattern**: Ignoring errors or showing raw error messages

```typescript
try {
  await setPrimary(accountId).unwrap();
  dispatch(setSelectedAccount(accountId));
  showSuccess({ title: 'Account Switched', message: 'Primary account updated' });
  closeSheet();
  refetchAccounts();
} catch (err: unknown) {
  const error = err as { status?: number; data?: { message?: string } };
  showError({ title: 'Error', message: error?.data?.message ?? 'Failed to switch account' });
}
```

#### Form State Pattern

- **When to use**: For forms with multiple fields
- **Example**: [app/auth/login.tsx](app/auth/login.tsx)
- **Anti-pattern**: Using uncontrolled inputs without validation

```typescript
const [identifier, setIdentifier] = useState('');
const [password, setPassword] = useState('');
const [showPassword, setShowPassword] = useState(false);

const handleLogin = () => {
  if (!identifier.trim() || !password.trim()) return;
  login({ identifier: identifier.trim(), password });
};

return (
  <TextInput
    value={identifier}
    onChangeText={setIdentifier}
    placeholder="example@example.com"
    keyboardType="email-address"
    autoCapitalize="none"
    editable={!isLoading}
  />
);
```

#### Redux Slice Pattern

- **When to use**: For managing local component state that needs persistence
- **Example**: [shared/libs/redux/features/bank/bankSlice.ts](shared/libs/redux/features/bank/bankSlice.ts)
- **Anti-pattern**: Using useState for data that should persist

```typescript
interface BankState {
  selectedAccountId: string | null;
}

const initialState: BankState = {
  selectedAccountId: null,
};

const bankSlice = createSlice({
  name: 'bank',
  initialState,
  reducers: {
    setSelectedAccount: (state, action: PayloadAction<string>) => {
      state.selectedAccountId = action.payload;
    },
    clearSelectedAccount: (state) => {
      state.selectedAccountId = null;
    },
  },
});

export const { setSelectedAccount, clearSelectedAccount } = bankSlice.actions;
export default bankSlice.reducer;
```

#### Navigation Pattern

- **When to use**: For programmatic navigation
- **Example**: [app/(tabs)/index.tsx](app/(tabs)/index.tsx#L453)
- **Anti-pattern**: Using navigation without type safety

```typescript
import { router } from 'expo-router';

// Push to new route
router.push('/loans/check-eligibility' as any);

// Replace current route
router.replace('/(tabs)');

// Go back
router.back();
```

#### Toast Notification Pattern

- **When to use**: For user feedback after actions
- **Example**: [shared/hooks/useToast.ts](shared/hooks/useToast.ts)
- **Anti-pattern**: Using Alert.alert for non-critical messages

```typescript
const { showSuccess, showError, showInfo, showWarning } = useToast();

// Success
showSuccess({ title: 'Success', message: 'Account updated' });

// Error
showError({ title: 'Error', message: 'Something went wrong' });

// Info
showInfo({ title: 'Info', message: 'Please wait...' });

// Warning
showWarning({ title: 'Warning', message: 'Are you sure?' });
```

#### Conditional Rendering Pattern

- **When to use**: For showing/hiding UI based on state
- **Example**: [app/(tabs)/index.tsx](app/(tabs)/index.tsx#L206-L304)
- **Anti-pattern**: Using inline if-else in JSX

```typescript
{isLoading ? (
  <ActivityIndicator color="#00C897" />
) : (
  <Text>Data loaded</Text>
)}

{error && (
  <View className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
    <Text className="text-[13px] text-red-600">{error}</Text>
  </View>
)}

{needsVerification === true && (
  <Modal visible={needsVerification} transparent>
    {/* Verification modal */}
  </Modal>
)}
```
