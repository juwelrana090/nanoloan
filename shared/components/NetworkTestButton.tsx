/**
 * Emergency Network Test Button
 * Add this to your login screen temporarily to diagnose FETCH_ERROR
 */

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';

export const NetworkTestButton: React.FC = () => {
  const runEmergencyTest = async () => {
    console.log('🚨 EMERGENCY NETWORK TEST STARTED');

    const results = {
      internet: false,
      apiServer: false,
      postRequest: false,
    };

    // Test 1: Internet connection
    console.log('\n🔍 Test 1: Internet Connection');
    try {
      const googleResponse = await fetch('https://www.google.com', {
        method: 'HEAD',
      });
      console.log('✅ Test 1 PASSED: Internet is working');
      results.internet = true;
    } catch (error: any) {
      console.log('❌ Test 1 FAILED: No internet');
      Alert.alert('Test 1 Failed', 'No internet connection. Please check your device internet.');
      return;
    }

    // Test 2: API Server Reachability
    console.log('\n🔍 Test 2: API Server');
    try {
      const apiResponse = await fetch('https://backend-nanoloan.giize.com', {
        method: 'HEAD',
      });
      console.log('✅ Test 2 PASSED: API server reachable');
      results.apiServer = true;
    } catch (error: any) {
      console.log('❌ Test 2 FAILED: API server unreachable');
      Alert.alert(
        'Test 2 Failed',
        'Cannot reach API server. Try this URL in your browser: https://backend-nanoloan.giize.com'
      );
      return;
    }

    // Test 3: POST Request
    console.log('\n🔍 Test 3: POST Request');
    try {
      const postResponse = await fetch('https://backend-nanoloan.giize.com/v1/auth/login', {
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
      console.log('✅ Test 3 PASSED: POST request works');
      console.log('Status:', postResponse.status);
      results.postRequest = true;

      const data = await postResponse.json();
      console.log('Response:', data);

      Alert.alert(
        'Success!',
        'All tests passed! The API is working. Check console for details.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.log('❌ Test 3 FAILED: POST failed');
      console.log('Error:', error.message);
      Alert.alert(
        'Test 3 Failed',
        `POST request failed: ${error.message}\n\nCheck console for details.`,
        [{ text: 'OK' }]
      );
    }

    console.log('\n📊 FINAL RESULTS:', results);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={runEmergencyTest}
      >
        <Text style={styles.buttonText}>🔧 Test Network</Text>
      </TouchableOpacity>
      <Text style={styles.hint}>
        Tap to run emergency network diagnostic (check console)
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  hint: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
