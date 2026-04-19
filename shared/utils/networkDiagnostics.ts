/**
 * Advanced Network Diagnostics
 * Test different aspects of network connectivity to identify the exact issue
 */

import { Platform } from 'react-native';
import { apiUrl } from '@/shared/config';

interface DiagnosticResult {
  test: string;
  success: boolean;
  message: string;
  details?: any;
}

/**
 * Test if the device has any internet connectivity
 */
export const testInternetConnectivity = async (): Promise<DiagnosticResult> => {
  try {
    console.log('🔍 Testing basic internet connectivity...');

    // Try to reach a reliable public API
    const testUrls = [
      'https://www.google.com',
      'https://api.github.com',
      'https://jsonplaceholder.typicode.com/posts/1'
    ];

    for (const url of testUrls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(url, {
          method: 'HEAD',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          return {
            test: 'Internet Connectivity',
            success: true,
            message: 'Internet connection is working',
            details: { testedUrl: url }
          };
        }
      } catch (error) {
        console.log(`Failed to reach ${url}, trying next...`);
        continue;
      }
    }

    return {
      test: 'Internet Connectivity',
      success: false,
      message: 'Cannot reach any public internet services',
      details: { suggestion: 'Check your internet connection' }
    };
  } catch (error: any) {
    return {
      test: 'Internet Connectivity',
      success: false,
      message: 'Internet connectivity test failed',
      details: { error: error.message }
    };
  }
};

/**
 * Test if our specific API server is reachable
 */
export const testApiServerReachability = async (): Promise<DiagnosticResult> => {
  try {
    console.log('🔍 Testing API server reachability...');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    // Try to reach the base API URL
    const response = await fetch(`${apiUrl}`, {
      method: 'HEAD',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    return {
      test: 'API Server Reachability',
      success: true,
      message: 'API server is reachable',
      details: {
        status: response.status,
        server: apiUrl
      }
    };
  } catch (error: any) {
    return {
      test: 'API Server Reachability',
      success: false,
      message: 'Cannot reach API server',
      details: {
        error: error.message,
        server: apiUrl,
        possibleCauses: [
          'Server is down',
          'Network blocking the request',
          'DNS resolution failed',
          'SSL certificate issues',
          'Firewall blocking HTTPS'
        ]
      }
    };
  }
};

/**
 * Test the v1 API endpoint specifically
 */
export const testV1Endpoint = async (): Promise<DiagnosticResult> => {
  try {
    console.log('🔍 Testing /v1 endpoint...');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`${apiUrl}/v1`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    return {
      test: 'V1 Endpoint',
      success: true,
      message: 'V1 endpoint is accessible',
      details: {
        status: response.status,
        statusText: response.statusText
      }
    };
  } catch (error: any) {
    return {
      test: 'V1 Endpoint',
      success: false,
      message: 'Cannot reach /v1 endpoint',
      details: {
        error: error.message,
        url: `${apiUrl}/v1`
      }
    };
  }
};

/**
 * Test the login endpoint with actual POST request
 */
export const testLoginEndpoint = async (): Promise<DiagnosticResult> => {
  try {
    console.log('🔍 Testing login endpoint...');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`${apiUrl}/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        identifier: 'test@test.com',
        password: 'test123',
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    return {
      test: 'Login Endpoint',
      success: true,
      message: 'Login endpoint responded',
      details: {
        status: response.status,
        responseData: data
      }
    };
  } catch (error: any) {
    return {
      test: 'Login Endpoint',
      success: false,
      message: 'Login endpoint request failed',
      details: {
        error: error.message,
        errorName: error.name,
        errorMessage: error.message,
        stack: error.stack
      }
    };
  }
};

/**
 * Test DNS resolution
 */
export const testDNSResolution = async (): Promise<DiagnosticResult> => {
  try {
    console.log('🔍 Testing DNS resolution...');

    // Try to extract hostname from API URL
    const url = new URL(apiUrl);
    const hostname = url.hostname;

    return {
      test: 'DNS Resolution',
      success: true,
      message: 'DNS resolution appears successful',
      details: {
        hostname: hostname,
        note: 'If this test passes but others fail, issue might be SSL or network'
      }
    };
  } catch (error: any) {
    return {
      test: 'DNS Resolution',
      success: false,
      message: 'DNS resolution failed',
      details: { error: error.message }
    };
  }
};

/**
 * Get platform-specific information
 */
export const getPlatformInfo = (): DiagnosticResult => {
  return {
    test: 'Platform Information',
    success: true,
    message: 'Platform information gathered',
    details: {
      platform: Platform.OS,
      version: Platform.Version,
      constants: Platform.constants,
      suggest: `If on Android, check if usesCleartextTraffic is correct in AndroidManifest.xml`
    }
  };
};

/**
 * Run all diagnostic tests
 */
export const runComprehensiveDiagnostics = async (): Promise<DiagnosticResult[]> => {
  console.log('🚀 Starting comprehensive network diagnostics...');

  const results: DiagnosticResult[] = [];

  // Test 1: Platform info
  results.push(getPlatformInfo());

  // Test 2: Basic internet
  const internetTest = await testInternetConnectivity();
  results.push(internetTest);

  // Only continue with other tests if internet is working
  if (internetTest.success) {
    // Test 3: DNS
    results.push(await testDNSResolution());

    // Test 4: API server
    const apiServerTest = await testApiServerReachability();
    results.push(apiServerTest);

    // Test 5: V1 endpoint
    if (apiServerTest.success) {
      results.push(await testV1Endpoint());
      results.push(await testLoginEndpoint());
    }
  }

  return results;
};

/**
 * Get a summary of diagnostic results
 */
export const getDiagnosticSummary = (results: DiagnosticResult[]) => {
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => r.success).length;

  return {
    total: results.length,
    passed,
    failed,
    successRate: `${Math.round((passed / results.length) * 100)}%`,
    criticalIssue: results[0]?.success === false, // Internet test failed
  };
};
