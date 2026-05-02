import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useSafePadding } from '@/shared/hooks/useSafePadding';

const AuthLayout = () => {
  const { paddingTop } = useSafePadding();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, []);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <View
        style={{ paddingTop }}
        className="flex-1 items-center justify-center bg-[#00C897]/85 blur-sm">
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />
        <ActivityIndicator size="large" color="#FFF" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
};

export default AuthLayout;
