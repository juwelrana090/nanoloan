import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AuthLayout = () => {
    const insets = useSafeAreaInsets();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setIsLoading(false);
        }, 2000);
    }, []);

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <View style={{ paddingTop: insets.top }} className="flex-1 items-center justify-center bg-[#00C897]/85 blur-sm">
                <Stack.Screen
                    options={{
                        headerShown: false,
                    }}
                />
                <ActivityIndicator size="large" color="#FFF" />
            </View>
        );
    }

    return (
        <Stack
            screenOptions={{
                contentStyle: { backgroundColor: 'transparent' },
                headerTransparent: true,
                headerStyle: {
                    backgroundColor: 'transparent',
                },
                headerTintColor: '#FFFFFF',
                headerTitleAlign: 'center',
                headerTitleStyle: {
                    color: '#FFF',
                    fontFamily: 'Inter_500Medium',
                    fontSize: 16,
                    fontWeight: '500',
                },
            }}>
            <Stack.Screen
                name="login"
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="register"
                options={{
                    headerShown: false,
                }}
            />

            <Stack.Screen
                name="email-otp-verification"
                options={{
                    headerShown: false,
                }}
            />

        </Stack>
    );
};

export default AuthLayout;
