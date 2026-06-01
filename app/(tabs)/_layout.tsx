import { Tabs, Stack, useRouter } from 'expo-router';
import { CustomTabBar } from '@/shared/components/CustomTabBar';
// eslint-disable-next-line import/no-named-as-default
import ProtectedRoute from '@/shared/components/ProtectedRoute';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { BackIcon, NotificationIcon } from '@/components/UI/icons/svg-icons';

export default function TabLayout() {
  const router = useRouter();
  return (
    <ProtectedRoute>
      <Tabs
        screenOptions={{
          headerShown: false,
          title: '',
        }}
        tabBar={(props) => <CustomTabBar {...props} />}>
        <Tabs.Screen
          name="index"
          options={{
            headerShown: false,
            title: '',
          }}
        />
        <Tabs.Screen
          name="analysis"
          options={{
            headerShown: false,
            title: '',
          }}
        />
        <Tabs.Screen
          name="transactions"
          options={{
            headerShown: false,
            title: '',
          }}
        />
        <Tabs.Screen
          name="category"
          options={{
            headerShown: false,
            title: '',
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            headerShown: true,
            headerTransparent: true,
            headerStyle: {
              backgroundColor: 'transparent',
            },
            headerTintColor: '#0E3E3E',
            headerTitleAlign: 'center',
            headerTitleStyle: {
              color: '#0E3E3E',
              fontFamily: 'Poppins-SemiBold',
              fontSize: 20,
            },
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => {
                  router.push('/(tabs)');
                }}
                style={{
                  marginLeft: 20,
                }}
                activeOpacity={0.8}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <BackIcon />
              </TouchableOpacity>
            ),
            headerRight: () => (
              <TouchableOpacity
                style={{
                  marginRight: 20,
                }}
                onPress={() => {
                  router.push('/(tabs)');
                }}
                className="h-[42px] w-[42px] items-center justify-center rounded-full bg-[#DFF7E2]"
                activeOpacity={0.8}>
                <NotificationIcon color="#093030" size={16} />
              </TouchableOpacity>
            ),
          }}
        />
      </Tabs>
    </ProtectedRoute>
  );
}
