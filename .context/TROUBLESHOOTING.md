# Troubleshooting Guide - Nano Loan App

## API Calling Issues 🔌

### Problem: API calls not working

If your app is not making successful API calls, follow these diagnostic steps:

### 1. Use the Network Debug Screen

We've created a dedicated debug screen to help diagnose network issues:

```typescript
// Navigate to the debug screen
router.push('/debug-network');
```

Or add it temporarily to your main navigation to access it easily.

### 2. Check API Configuration

**Verify .env file:**
```bash
# Check that your .env file has the correct API URL
EXPO_PUBLIC_API_URL="https://backend-nanoloan.giize.com"
```

**Verify config file:** Check [shared/config/index.ts](shared/config/index.ts:1)

### 3. Check Network Connectivity

Run these checks from the debug screen:
- Test basic connectivity
- Test auth endpoint specifically
- Check stored tokens

### 4. Common Issues and Solutions

**Issue: Network request failed**
- Check if you have an active internet connection
- Verify the API server is running and accessible
- Try accessing the API URL in a browser
- Check for firewall or proxy issues

**Issue: Timeout errors**
- Server might be slow or unresponsive
- Check your internet connection speed
- Verify the API URL is correct

**Issue: SSL/Certificate errors**
- The API server might have SSL certificate issues
- Try accessing the API URL in a browser to see certificate warnings
- Contact backend team about SSL configuration

**Issue: 404 Not Found**
- API endpoint might not exist
- Check if the base URL is correct
- Verify the API version in the URL (/v1)

**Issue: 401/403 Unauthorized**
- Token might be expired or invalid
- Check AsyncStorage for corrupted tokens
- Try logging out and logging back in

### 5. Enhanced Logging

The API layer now includes comprehensive logging. Check your console for:
- 🔍 API Request Debug logs
- 📥 API Response logs
- ❌ API Error logs

### 6. Manual API Testing

Test the API directly with curl or Postman:

```bash
# Test connectivity
curl -I https://backend-nanoloan.giize.com/v1

# Test auth endpoint
curl -X POST https://backend-nanoloan.giize.com/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"test@test.com","password":"test123"}'
```

### 7. Clear Cache and Restart

```bash
# Stop the metro bundler (Ctrl+C)
# Clear cache and restart
npx expo start --clear

# For Android
npx expo start --clear --android

# For iOS
npx expo start --clear --ios
```

### 8. Check Android Network Security

If you're on Android and getting network errors:

1. Check [android/app/src/main/AndroidManifest.xml](android/app/src/main/AndroidManifest.xml:22)
2. The app has `usesCleartextTraffic="false"` (only HTTPS allowed)
3. Your API URL must use HTTPS
4. If testing locally, you might need to create a network security config

### 9. Verify Redux Setup

Make sure your Redux store is properly configured:

1. Check [app/_layout.tsx](app/_layout.tsx:109) - Provider and PersistGate
2. Check [shared/libs/redux/store.ts](shared/libs/redux/store.ts:1) - Store configuration
3. Check [shared/libs/redux/apiSlice.ts](shared/libs/redux/apiSlice.ts:1) - API setup

### 10. Test with Simple Fetch

If RTK Query is failing, test with a simple fetch call:

```typescript
const testAPI = async () => {
  try {
    const response = await fetch('https://backend-nanoloan.giize.com/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        identifier: 'test@test.com',
        password: 'password123'
      })
    });

    const data = await response.json();
    console.log('Test API response:', data);
  } catch (error) {
    console.error('Test API error:', error);
  }
};
```

## Onboarding System Issues

## Import Resolution Issues

If you're experiencing import resolution errors with `@/shared/utils/onboarding`, follow these steps:

### 1. Clear Metro Bundler Cache

```bash
# Stop the metro bundler (Ctrl+C)
# Then run:
npx expo start --clear
```

### 2. Clear TypeScript Cache

```bash
# Delete node_modules/.cache
rm -rf node_modules/.cache
# Or on Windows:
Remove-Item -Recurse -Force node_modules\.cache
```

### 3. Verify File Structure

Ensure your project structure looks like this:
```
nanoloan/
├── app/
│   └── welcome.tsx
├── shared/
│   └── utils/
│       └── onboarding.ts
├── components/
├── tsconfig.json
└── metro.config.js
```

### 4. Check Configuration Files

**tsconfig.json** should have:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/shared/*": ["shared/*"]
    }
  }
}
```

**metro.config.js** should have:
```javascript
config.resolver = {
  ...config.resolver,
  alias: {
    '@': '.',
    '@/shared': './shared',
  },
};
```

### 5. Alternative: Use Relative Imports

If path aliases still don't work, you can use relative imports:

In `app/welcome.tsx`:
```typescript
// Instead of: import { ... } from '@/shared/utils/onboarding';
// Use:
import { ... } from '../shared/utils/onboarding';
```

## Common Issues and Solutions

### Issue: "Unable to resolve module"

**Solution:**
1. Clear Metro cache: `npx expo start --clear`
2. Restart TypeScript server in VS Code: `Cmd/Ctrl + Shift + P` → "TypeScript: Restart TS Server"
3. Verify file exists at correct location

### Issue: Onboarding shows every time

**Solution:**
- Check AsyncStorage is working properly
- Test using the debug utilities in `shared/utils/__tests__/onboarding.test.ts`

### Issue: Onboarding never shows

**Solution:**
- Reset onboarding status using `resetOnboarding()`
- Check console for AsyncStorage errors
- Verify AsyncStorage is properly initialized

## Debug Utilities

Use these utilities to debug onboarding issues:

```typescript
import { checkOnboardingStatus, resetForTesting } from '@/shared/utils/__tests__/onboarding.test';

// Check current status
await checkOnboardingStatus();

// Reset to see onboarding again
await resetForTesting();
```

## Testing Steps

1. **First Launch Test:**
   - Reset onboarding: `await resetOnboarding()`
   - Reload app
   - Should see onboarding screens

2. **Subsequent Launch Test:**
   - Complete onboarding
   - Reload app
   - Should skip to main screen

3. **Persistence Test:**
   - Complete onboarding
   - Close and reopen app
   - Should still skip onboarding

## VS Code Configuration

If using VS Code, ensure your `.vscode/settings.json` includes:

```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

## Need More Help?

Check these files:
- `shared/utils/onboarding.ts` - Core onboarding logic
- `app/welcome.tsx` - Welcome screen implementation
- `shared/utils/README.md` - Detailed documentation
- `shared/utils/__tests__/onboarding.test.ts` - Testing utilities
