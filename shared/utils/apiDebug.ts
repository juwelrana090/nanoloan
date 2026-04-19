/**
 * Quick API Debug Utility
 * Import and call this function anywhere to test API connectivity
 */

import { apiUrl } from '@/shared/config';

export const quickApiTest = async () => {
  console.log('🧪 Quick API Test Started...');
  console.log('API URL:', apiUrl);

  try {
    // Test 1: Basic connectivity
    console.log('Test 1: Basic connectivity...');
    const connectivityResponse = await fetch(`${apiUrl}/v1`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    console.log('✅ Connectivity test result:', connectivityResponse.status);

    // Test 2: Auth endpoint
    console.log('Test 2: Auth endpoint...');
    const authResponse = await fetch(`${apiUrl}/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        identifier: 'test@test.com',
        password: 'test123',
      }),
    });
    console.log('✅ Auth endpoint test result:', authResponse.status);

    const authData = await authResponse.json();
    console.log('Auth response data:', authData);

    console.log('🎉 API tests completed successfully!');
    return {
      success: true,
      connectivity: connectivityResponse.status,
      auth: authResponse.status,
      authData,
    };
  } catch (error: any) {
    console.error('❌ API test failed:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
    });

    return {
      success: false,
      error: error.message,
      suggestions: [
        'Check internet connection',
        'Verify API URL in .env file',
        'Check if server is running',
        'Look for SSL certificate issues',
        'Check firewall/proxy settings',
      ],
    };
  }
};

/**
 * Call this function from any screen to test API quickly
 */
export const testAPINow = () => {
  console.log('🔧 Testing API... (check console for results)');
  quickApiTest();
};

// Add to global scope for easy access in console
if (typeof global !== 'undefined') {
  (global as any).testAPI = quickApiTest;
  console.log('💡 API test function available globally: testAPI()');
}
