import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import SplashScreenAnimated from '@/shared/components/SplashScreenAnimated';
import { persistor, store } from '@/shared/libs/redux/store';
import { AuthProvider } from '@/shared/contexts/AuthContext';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import '../global.css';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: 'welcome',
};

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make any API calls you need to do here
        // await Font.loadAsync({ ... });

        // Artificially delay for demo purposes
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return <SplashScreenAnimated />;
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <AuthProvider>
              <StatusBar
                hidden={false}
                style="light"
                backgroundColor="#00C897"
                translucent={false}
              />
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="welcome" options={{ headerShown: false }} />
                <Stack.Screen
                  name="auth"
                  options={{
                    headerShown: false,
                    headerStyle: {
                      backgroundColor: 'transparent',
                    },
                  }}
                />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              </Stack>
            </AuthProvider>
          </PersistGate>
        </Provider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
