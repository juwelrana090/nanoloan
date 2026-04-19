/**
 * Quick Network Test - Run this immediately to diagnose FETCH_ERROR
 * Copy and paste this into any component or run in console
 */

import { apiUrl } from '@/shared/config';

export const quickFetchErrorTest = async () => {
  console.log('🚨 FETCH_ERROR DIAGNOSTIC TEST STARTED');
  console.log('📡 API URL:', apiUrl);

  const results = {
    platform: '',
    internet: false,
    apiServer: false,
    dns: false,
    specificEndpoint: false,
    postRequest: false,
  };

  // Test 1: Check if we can reach ANY HTTPS server
  console.log('\n🔍 Test 1: Basic Internet (Google.com)');
  try {
    const response = await fetch('https://www.google.com', {
      method: 'HEAD',
      timeout: 5000,
    });
    console.log('✅ Internet is working');
    results.internet = true;
  } catch (error) {
    console.log('❌ NO INTERNET CONNECTION');
    console.log('Error:', error.message);
    console.log('🔧 SOLUTION: Check your internet connection');
  }

  if (!results.internet) {
    console.log('\n🛑 STOPPING: No internet connection');
    return results;
  }

  // Test 2: DNS Resolution
  console.log('\n🔍 Test 2: DNS Resolution');
  try {
    const url = new URL(apiUrl);
    console.log('Hostname:', url.hostname);
    console.log('✅ DNS resolution appears possible');
    results.dns = true;
  } catch (error) {
    console.log('❌ DNS resolution failed');
    console.log('Error:', error.message);
  }

  // Test 3: Can we reach the API server at all?
  console.log('\n🔍 Test 3: API Server Reachability');
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(apiUrl, {
      method: 'HEAD',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    console.log('✅ API server is reachable');
    console.log('Status:', response.status);
    results.apiServer = true;
  } catch (error) {
    console.log('❌ CANNOT REACH API SERVER');
    console.log('Error:', error.message);
    console.log('🔧 POSSIBLE CAUSES:');
    console.log('   - Server is down');
    console.log('   - Network blocking the request');
    console.log('   - SSL certificate issues');
    console.log('   - Firewall problems');
  }

  if (!results.apiServer) {
    console.log('\n🛑 CRITICAL: API server is not reachable');
    console.log('🔧 NEXT STEPS:');
    console.log('   1. Try opening this URL in your browser:', apiUrl);
    console.log('   2. Contact backend team to verify server status');
    console.log('   3. Check if you\'re behind a firewall');
    return results;
  }

  // Test 4: Can we reach the /v1 endpoint?
  console.log('\n🔍 Test 4: /v1 Endpoint');
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`${apiUrl}/v1`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    console.log('✅ /v1 endpoint is accessible');
    console.log('Status:', response.status);
    results.specificEndpoint = true;
  } catch (error) {
    console.log('❌ /v1 endpoint failed');
    console.log('Error:', error.message);
  }

  // Test 5: Can we make a POST request to login?
  console.log('\n🔍 Test 5: POST Request to Login Endpoint');
  try {
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

    console.log('✅ POST request succeeded');
    console.log('Status:', response.status);

    const data = await response.json();
    console.log('Response data:', data);
    results.postRequest = true;
  } catch (error) {
    console.log('❌ POST REQUEST FAILED');
    console.log('Error:', error.message);
    console.log('Error name:', error.name);
    console.log('🔧 POSSIBLE CAUSES:');
    console.log('   - CORS issues (less likely in React Native)');
    console.log('   - Server rejecting the request');
    console.log('   - Network timeout');
    console.log('   - SSL/TLS handshake issues');
  }

  // Summary
  console.log('\n📊 DIAGNOSTIC SUMMARY:');
  console.log('Internet:', results.internet ? '✅' : '❌');
  console.log('DNS:', results.dns ? '✅' : '❌');
  console.log('API Server:', results.apiServer ? '✅' : '❌');
  console.log('/v1 Endpoint:', results.specificEndpoint ? '✅' : '❌');
  console.log('POST Request:', results.postRequest ? '✅' : '❌');

  if (results.postRequest) {
    console.log('\n🎉 ALL TESTS PASSED - API is working!');
    console.log('The issue might be in RTK Query configuration');
  } else {
    console.log('\n❌ SOME TESTS FAILED');
    console.log('🔧 Check the failed tests above for specific solutions');
  }

  return results;
};

// Make it available globally for easy console access
if (typeof global !== 'undefined') {
  (global as any).testFetchError = quickFetchErrorTest;
  console.log('💡 Quick test available: call testFetchError() in console');
}
