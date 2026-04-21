# Error Handling & Feedback - NanoLoan

## How Errors Are Shown to Users

### Toast Notifications (Primary Method)

**Library**: `react-native-toast-message`
**Config**: `shared/config/toastConfig.tsx`

#### Toast Hook

**Location**: `shared/hooks/useToast.ts`

```typescript
import { useToast } from '@/shared/hooks/useToast';

function MyScreen() {
  const { showSuccess, showError, showInfo, showWarning } = useToast();

  // Success toast
  showSuccess({
    title: 'Success',
    message: 'Profile updated successfully',
    duration: 2500,
    position: 'top',
  });

  // Error toast
  showError({
    title: 'Error',
    message: 'Failed to update profile',
    duration: 2500,
    position: 'top',
  });

  // Info toast
  showInfo({
    title: 'Info',
    message: 'Please complete all fields',
  });

  // Warning toast
  showWarning({
    title: 'Warning',
    message: 'Session expiring soon',
  });
}
```

#### Toast Types

| Type | Color | Use Case |
|------|-------|----------|
| `success` | Green | Successful operations (save, update, delete) |
| `error` | Red | API errors, validation failures |
| `info` | Blue | Informational messages |
| `warning` | Orange | Warnings, cautions |

#### Toast Display Options

- **Duration**: Default 2500ms (configurable)
- **Position**: `top` or `bottom`
- **Top Offset**: 60px (below status bar)
- **Bottom Offset**: 40px

### Alert Dialogs

**Usage**: Rare, only for critical confirmations

```typescript
import { Alert } from 'react-native';

Alert.alert(
  'Delete Account',
  'Are you sure you want to delete your account? This action cannot be undone.',
  [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: () => handleDelete() },
  ]
);
```

### Field-Level Validation Errors

**Pattern**: Show error text below input field

```typescript
<View>
  <Text className="mb-2 text-[15px] font-semibold">National ID</Text>
  <TextInput value={nationalId} onChangeText={setNationalId} />
  {errors.nationalId && (
    <Text className="mt-1 text-[12px] text-red-500">{errors.nationalId}</Text>
  )}
</View>
```

### Inline Error Banners

**Pattern**: Colored banner with error message

```typescript
{error && (
  <View className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3">
    <Text className="text-[14px] text-red-600">{error}</Text>
  </View>
)}
```

### Validation Warning Cards

**Pattern**: Card with warning icon and list of issues

```typescript
{hasMissingFields && (
  <View className="mb-3 rounded-xl border border-[#FF9800] bg-[#FFF8F0] p-4">
    <Text className="mb-2 text-[14px] font-semibold text-[#FF9800]">
      ⚠️ Missing Information
    </Text>
    {missingFields.map((field, i) => (
      <Text key={i} className="text-[14px] text-[#555]">
        • {field}
      </Text>
    ))}
  </View>
)}
```

## Loading State Pattern

### Pattern 1: RTK Query Built-in Loading

**Best for**: API calls via RTK Query mutations

```typescript
const [updateProfile, { isLoading }] = useUpdateProfileMutation();

<TouchableOpacity onPress={handleSubmit} disabled={isLoading}>
  {isLoading ? (
    <ActivityIndicator size="small" color="#00C897" />
  ) : (
    <Text>Submit</Text>
  )}
</TouchableOpacity>
```

### Pattern 2: Local useState Loading

**Best for**: Multi-step operations, custom async logic

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

<TouchableOpacity onPress={handleSubmit} disabled={loading}>
  {loading ? <ActivityIndicator /> : <Text>Submit</Text>}
</TouchableOpacity>
```

### Pattern 3: Redux State Loading

**Best for**: Global loading state (e.g., during OCR)

```typescript
import { useAppSelector } from '@/shared/hooks/useAppSelector';

const isLoading = useAppSelector((state) => state.kyc.isLoading);

{isLoading && (
  <View className="mb-4 items-center py-4">
    <ActivityIndicator size="small" color="#00C897" />
    <Text className="mt-2 text-[14px] text-[#555]">Processing document…</Text>
  </View>
)}
```

### Loading Spinner with Text

```typescript
{isLoading && (
  <View className="items-center py-4">
    <ActivityIndicator size="small" color="#00C897" />
    <Text className="mt-2 text-[14px] text-[#555]">
      Extracting document data…
    </Text>
  </View>
)}
```

### Loading Button State

```typescript
<TouchableOpacity
  onPress={handleSubmit}
  disabled={isLoading}
  className={`rounded-full ${
    isLoading ? 'bg-[#CCC]' : 'bg-[#00C897]'
  }`}>
  <Text className="text-[17px] font-bold text-white">
    {isLoading ? 'Processing…' : 'Submit'}
  </Text>
</TouchableOpacity>
```

## Success Feedback Pattern

### Success Toast

```typescript
const { showSuccess } = useToast();

const handleSuccess = () => {
  showSuccess({
    title: 'Success',
    message: 'Profile updated successfully',
  });
};
```

### Success Navigation

```typescript
const handleSuccess = async () => {
  try {
    await updateProfile(data).unwrap();
    showSuccess({ title: 'Success', message: 'Saved!' });
    router.push('/next-screen');
  } catch (error) {
    showError({ title: 'Error', message: 'Failed to save' });
  }
};
```

## Error Response Handling Pattern

### Standard Error Handling

```typescript
const handleSubmit = async () => {
  try {
    const response = await updateProfile(data).unwrap();
    showSuccess({ title: 'Success', message: response.message });
  } catch (error: any) {
    console.error('Update failed:', error);

    // Handle different error types
    if (error?.status === 422) {
      // Validation errors
      handleValidationErrors(error.data?.errors);
    } else if (error?.status === 401) {
      // Unauthorized (auto-logout already triggered)
      showError({ title: 'Session Expired', message: 'Please login again' });
    } else {
      // General error
      const errorMsg = error?.data?.message || 'Operation failed';
      showError({ title: 'Error', message: errorMsg });
    }
  }
};
```

### Field-Level Validation Errors (422)

```typescript
const handleValidationErrors = (errors: Record<string, string[]>) => {
  // Set error for each field
  Object.keys(errors).forEach((field) => {
    const messages = errors[field];
    setFieldErrors((prev) => ({
      ...prev,
      [field]: messages[0], // Show first error message
    }));
  });

  // Show general error toast
  showError({
    title: 'Validation Failed',
    message: 'Please fix the errors below',
  });
};
```

### Network Error Handling

```typescript
const handleSubmit = async () => {
  try {
    await updateProfile(data).unwrap();
  } catch (error: any) {
    if (error?.status === 'FETCH_ERROR') {
      showError({
        title: 'Network Error',
        message: 'Please check your internet connection',
      });
    } else {
      // Handle other errors
      handleError(error);
    }
  }
};
```

## Success Feedback Pattern

### Immediate Success

```typescript
const handleSubmit = async () => {
  try {
    await updateProfile(data).unwrap();
    
    // 1. Show success toast
    showSuccess({
      title: 'Success',
      message: 'Profile updated successfully',
    });
    
    // 2. Navigate to next screen
    router.push('/auth/addresses-update');
    
  } catch (error) {
    // Handle error
  }
};
```

### Success with Confirmation

```typescript
const handleSubmit = async () => {
  try {
    const response = await updateProfile(data).unwrap();
    
    // Show detailed success message
    showSuccess({
      title: 'Profile Updated',
      message: response.message || 'Your profile has been updated successfully',
      duration: 3000,
    });
    
    // Optionally navigate after delay
    setTimeout(() => {
      router.push('/next-screen');
    }, 500);
    
  } catch (error) {
    // Handle error
  }
};
```

## Common Error Messages

### Validation Errors
- "Please fill in all required fields"
- "Invalid email format"
- "Password must be at least 8 characters"
- "National ID is required"
- "TIN must be at least 10 characters"

### Network Errors
- "Network request failed"
- "Please check your internet connection"
- "Server is not responding. Please try again later."

### Auth Errors
- "Session expired. Please login again"
- "Invalid credentials"
- "Access denied"

### Server Errors
- "Something went wrong. Please try again."
- "Server error. Please try again later."
- "Unable to complete your request."

## Retry Pattern

### Retry Button

```typescript
{error && (
  <View>
    <Text className="text-red-500">{error}</Text>
    <TouchableOpacity onPress={handleSubmit} className="mt-2">
      <Text className="text-[#00C897]">Retry</Text>
    </TouchableOpacity>
  </View>
)}
```

### Retry with Back Navigation

```typescript
{error && (
  <View className="mb-4">
    <Text className="text-red-500">{error}</Text>
    <View className="mt-2 flex-row">
      <TouchableOpacity onPress={() => router.back()} className="mr-4">
        <Text className="text-[#888]">Go Back</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleSubmit}>
        <Text className="text-[#00C897]">Retry</Text>
      </TouchableOpacity>
    </View>
  </View>
)}
```

## Disabled State Pattern

### Disable All Inputs During Loading

```typescript
<View pointerEvents={isLoading ? 'none' : 'auto'}>
  <TextInput editable={!isLoading} />
  <TouchableOpacity onPress={handleSubmit} disabled={isLoading}>
    <Text>{isLoading ? 'Processing...' : 'Submit'}</Text>
  </TouchableOpacity>
</View>
```

### Conditional Opacity

```typescript
<TouchableOpacity
  onPress={handleSubmit}
  disabled={isLoading}
  activeOpacity={0.8}
  className={`rounded-full ${isLoading ? 'bg-[#CCC] opacity-50' : 'bg-[#00C897]'}`}>
  <Text className="text-[17px] font-bold text-white">
    {isLoading ? 'Processing…' : 'Submit'}
  </Text>
</TouchableOpacity>
```

## Best Practices

### DO ✅
- Show loading indicators for all async operations
- Provide clear error messages
- Offer retry options for failed operations
- Use success toasts for confirmation
- Disable buttons during loading
- Handle network errors gracefully
- Show field-level validation errors

### DON'T ❌
- Use `Alert.alert` for errors (use toasts instead)
- Leave users wondering what happened
- Show raw error messages to users
- Forget to re-enable buttons after loading
- Ignore network errors
- Allow form submission during validation errors
- Show errors after user navigated away

## Toast Message Guidelines

### Good Toast Messages
- ✅ "Profile updated successfully"
- ✅ "Address added successfully"
- ✅ "Document uploaded successfully"
- ✅ "Please fix the errors below"
- ✅ "Network error. Please check your connection."

### Bad Toast Messages
- ❌ "Error" (too vague)
- ❌ "12345" (error codes without context)
- ❌ "Server returned 500" (too technical)
- ❌ "Operation completed" (doesn't say what)
- ❌ Long paragraphs (keep it brief)
