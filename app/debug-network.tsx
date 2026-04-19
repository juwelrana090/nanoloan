/**
 * Debug Network Screen Route
 * Access this screen to test network connectivity and diagnose API issues
 */

import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import NetworkDebugScreen from '@/components/NetworkDebugScreen';
import { quickFetchErrorTest } from '@/shared/utils/quickNetworkTest';

export default function DebugNetworkScreen() {
  useEffect(() => {
    // Automatically run the quick test when screen loads
    console.log('🚀 Auto-running FETCH_ERROR diagnostic test...');
    quickFetchErrorTest();
  }, []);

  return <NetworkDebugScreen />;
}
