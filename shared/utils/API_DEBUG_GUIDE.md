# API Debugging Tools - Quick Start Guide

## 🚀 Quick Access to Debug Screen

### Method 1: From Profile Screen
1. Go to Profile tab
2. Scroll down to "🔧 Debug Network" option
3. Tap it to open the Network Debug Screen

### Method 2: Direct Navigation
```typescript
import { useRouter } from 'expo-router';

const router = useRouter();
router.push('/debug-network' as any);
```

## 🛠️ Available Debugging Tools

### 1. Network Debug Screen (`/debug-network`)
- **Full Diagnostics**: Tests connectivity, auth endpoint, and storage
- **Quick Tests**: Individual tests for each component
- **Visual Results**: Color-coded success/failure indicators
- **Redux State**: Shows current authentication state

### 2. Quick API Test Function
```typescript
import { quickApiTest } from '@/shared/utils/apiDebug';

// Test API from anywhere
const result = await quickApiTest();
console.log(result);
```

### 3. Global Console Function
Open your app's console and type:
```javascript
testAPI()
```

### 4. Comprehensive Logging
All API calls now log detailed information:
- 🔍 Request details
- 📥 Response status
- ❌ Error information

## 📊 What Gets Tested

### Network Connectivity Test
- Tests basic internet connectivity
- Verifies server is reachable
- Checks DNS resolution

### Auth Endpoint Test
- Tests `/v1/auth/login` endpoint
- Verifies CORS and headers
- Checks response format

### Storage Test
- Checks AsyncStorage for tokens
- Verifies user data persistence
- Shows token information

### Redux State Check
- Authentication status
- Token presence
- User information

## 🐛 Common Issues and Solutions

### "Network request failed"
**Possible causes:**
- No internet connection
- Server is down
- Firewall blocking requests

**Solution:**
1. Check internet connection
2. Try the API URL in a browser
3. Check server status

### "Timeout"
**Possible causes:**
- Server is slow
- Network issues
- Incorrect API URL

**Solution:**
1. Verify API URL in `.env` file
2. Test with curl/Postman
3. Check network speed

### "SSL Certificate Error"
**Possible causes:**
- Invalid SSL certificate
- Certificate not trusted

**Solution:**
1. Access API URL in browser
2. Check certificate warnings
3. Contact backend team

### "404 Not Found"
**Possible causes:**
- Wrong API URL
- Wrong endpoint path
- Server routing issue

**Solution:**
1. Verify API URL in config
2. Check endpoint path
3. Contact backend team

## 🔧 Manual Testing

### Test with curl:
```bash
# Test connectivity
curl -I https://backend-nanoloan.giize.com/v1

# Test auth endpoint
curl -X POST https://backend-nanoloan.giize.com/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"test@test.com","password":"test123"}'
```

### Test with browser:
1. Open `https://backend-nanoloan.giize.com/v1` in browser
2. You should see a 404 or API response (not connection error)

## 📝 Debug Output Examples

### Successful API Call:
```
🔍 API Request Debug:
Base URL: https://backend-nanoloan.giize.com/v1
Token present: true

🚀 Making API Request: { url: '/auth/login', method: 'POST' }

📥 API Response: { success: true, status: 200 }
```

### Failed API Call:
```
🔍 API Request Debug:
Base URL: https://backend-nanoloan.giize.com/v1
Token present: false

🚀 Making API Request: { url: '/auth/login', method: 'POST' }

❌ API Error: { status: 401, data: { message: 'Unauthorized' } }
```

## 🎯 Next Steps

1. **Run Full Diagnostics**: Use the debug screen to run all tests
2. **Check Logs**: Look at console output for detailed error messages
3. **Test Manually**: Use curl or browser to verify API is working
4. **Compare Results**: Compare working curl requests with app requests
5. **Check Configuration**: Verify all config files are correct

## 📞 Still Having Issues?

1. Check [TROUBLESHOOTING.md](../../TROUBLESHOOTING.md) for detailed guides
2. Verify `.env` file has correct API URL
3. Check server status with backend team
4. Review recent code changes
5. Check if issue is device-specific (try on different device/emulator)

## 🔒 Security Notes

- Debug screen should be removed in production builds
- Debug logs expose sensitive information in development
- Don't commit real credentials to the codebase
- Use test credentials for debugging
