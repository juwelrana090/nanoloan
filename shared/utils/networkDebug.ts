/**
 * Network Debugging Utility
 * Use this to test API connectivity and diagnose network issues
 */

import { apiUrl } from '@/shared/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NetworkTestResult {
  success: boolean;
  message: string;
  details?: any;
}

/**
 * Test basic network connectivity by making a simple request
 */
export const testNetworkConnectivity = async (): Promise<NetworkTestResult> => {
  try {
    console.log('🔍 Testing network connectivity...');
    console.log('API URL:', apiUrl);

    // Test with a simple health check endpoint
    const testUrl = `${apiUrl}/v1`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log('Network test response status:', response.status);

    if (response.ok || response.status === 404) {
      // 404 is actually OK - it means the server is reachable, just the endpoint doesn't exist
      return {
        success: true,
        message: 'Network connectivity working',
        details: {
          status: response.status,
          server: apiUrl
        }
      };
    } else {
      return {
        success: false,
        message: `Server returned status: ${response.status}`,
        details: { status: response.status }
      };
    }
  } catch (error: any) {
    console.error('Network test failed:', error);

    if (error.name === 'AbortError') {
      return {
        success: false,
        message: 'Request timeout - server may be unreachable',
        details: { error: 'TIMEOUT' }
      };
    }

    return {
      success: false,
      message: error.message || 'Network request failed',
      details: {
        error: error.message,
        possibleCauses: [
          'No internet connection',
          'Server is down',
          'Firewall blocking requests',
          'SSL certificate issues',
          'DNS resolution failed'
        ]
      }
    };
  }
};

/**
 * Test authentication endpoint specifically
 */
export const testAuthEndpoint = async (): Promise<NetworkTestResult> => {
  try {
    console.log('🔍 Testing auth endpoint...');
    const testUrl = `${apiUrl}/v1/auth/login`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    // Send invalid credentials to test endpoint availability
    const response = await fetch(testUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        identifier: 'test@test.com',
        password: 'test123'
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log('Auth endpoint test response status:', response.status);

    // We expect this to fail (invalid credentials), but the endpoint should be reachable
    if (response.status === 400 || response.status === 401 || response.status === 422) {
      return {
        success: true,
        message: 'Auth endpoint is reachable',
        details: { status: response.status }
      };
    } else if (response.status >= 500) {
      return {
        success: false,
        message: 'Server error at auth endpoint',
        details: { status: response.status }
      };
    } else {
      return {
        success: true,
        message: 'Auth endpoint responded',
        details: { status: response.status }
      };
    }
  } catch (error: any) {
    console.error('Auth endpoint test failed:', error);
    return {
      success: false,
      message: error.message || 'Auth endpoint unreachable',
      details: { error: error.message }
    };
  }
};

/**
 * Check AsyncStorage for stored tokens
 */
export const checkStoredTokens = async (): Promise<NetworkTestResult> => {
  try {
    const token = await AsyncStorage.getItem('@token');
    const user = await AsyncStorage.getItem('@user');

    return {
      success: true,
      message: 'Storage check complete',
      details: {
        hasToken: !!token,
        hasUser: !!user,
        tokenLength: token?.length || 0
      }
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Storage check failed',
      details: { error: error.message }
    };
  }
};

/**
 * Run all network diagnostics
 */
export const runFullDiagnostics = async (): Promise<{
  connectivity: NetworkTestResult;
  authEndpoint: NetworkTestResult;
  storage: NetworkTestResult;
}> => {
  console.log('🔍 Running full network diagnostics...');

  const connectivity = await testNetworkConnectivity();
  const authEndpoint = await testAuthEndpoint();
  const storage = await checkStoredTokens();

  return {
    connectivity,
    authEndpoint,
    storage
  };
};

/**
 * Log current Redux state
 */
export const logReduxState = (state: any) => {
  console.log('📊 Current Redux State:', {
    isAuthenticated: state?.auth?.isAuthenticated,
    hasToken: !!state?.auth?.token,
    hasUser: !!state?.auth?.user,
    tokenLength: state?.auth?.token?.length || 0
  });
};
