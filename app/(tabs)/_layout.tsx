import { Tabs } from 'expo-router';
import { CustomTabBar } from '@/shared/components/CustomTabBar';
// eslint-disable-next-line import/no-named-as-default
import ProtectedRoute from '@/shared/components/ProtectedRoute';

export default function TabLayout() {
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
            headerShown: false,
            title: '',
          }}
        />
      </Tabs>
    </ProtectedRoute>
  );
}
