import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useSafePadding } from '@/shared/hooks/useSafePadding';
import { useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector } from '@/shared/hooks/useAppSelector';
import { setLogout } from '@/shared/libs/redux/features/auth/authSlice';
import { useState } from 'react';
import {
  ProfileIcon,
  SecurityIcon,
  SettingsIcon,
  KyCIcon,
  HelpIcon,
  LogoutIcon,
  BackIcon,
  BellIcon,
} from '@/components/UI/icons/svg-icons';

export default function ProfileScreen() {
  const { paddingTop, scrollPaddingBottom } = useSafePadding();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              dispatch(setLogout());
              router.replace('/auth/login' as any);
            } catch {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const menuItems = [
    {
      id: 'edit-profile',
      title: 'Edit Profile',
      icon: <ProfileIcon />,
      color: '#6DB6FE',
      onPress: () => router.push('/auth/basic-information' as any),
    },
    {
      id: 'security',
      title: 'Security',
      icon: <SecurityIcon />,
      color: '#3299FF',
      onPress: () => {},
    },
    {
      id: 'settings',
      title: 'Setting',
      icon: <SettingsIcon />,
      color: '#0068FF',
      onPress: () => {},
    },
    {
      id: 'ekyc',
      title: 'E-KYC',
      icon: <KyCIcon />,
      color: '#0068FF',
      onPress: () => {},
    },
    {
      id: 'help',
      title: 'Help',
      icon: <HelpIcon />,
      color: '#6DB6FE',
      onPress: () => {},
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#00D09E' }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View
          style={{
            paddingTop: paddingTop + 20,
            paddingHorizontal: 38,
            paddingBottom: scrollPaddingBottom,
          }}>
          {/* Top Row */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <TouchableOpacity onPress={() => router.back()}>
              <BackIcon />
            </TouchableOpacity>
            <View
              style={{
                backgroundColor: '#DFF7E2',
                borderRadius: 25.7,
                width: 30,
                height: 30,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <BellIcon />
            </View>
          </View>

          {/* Title */}
          <View
            style={{
              marginTop: 20,
              alignItems: 'center',
            }}>
            <Text
              style={{
                fontFamily: 'Poppins-Bold',
                fontSize: 20,
                color: '#0E3E3E',
                textTransform: 'capitalize',
              }}>
              Profile
            </Text>
          </View>

          {/* Profile Avatar */}
          <View
            style={{
              marginTop: 10,
              alignItems: 'center',
            }}>
            <View
              style={{
                width: 117,
                height: 117,
                borderRadius: 58.5,
                backgroundColor: '#C5F0DC',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
              }}>
              <Text
                style={{
                  fontFamily: 'Poppins-Bold',
                  fontSize: 48,
                  color: '#00D09E',
                }}>
                {user?.fullName?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>

            {/* User Name */}
            <Text
              style={{
                fontFamily: 'Poppins-Bold',
                fontSize: 20,
                color: '#0E3E3E',
                textTransform: 'capitalize',
              }}>
              {user?.fullName || 'User Name'}
            </Text>

            {/* User ID */}
            <Text
              style={{
                fontFamily: 'Poppins-SemiBold',
                fontSize: 13,
                color: '#093030',
                marginTop: 4,
              }}>
              ID:{' '}
              <Text
                style={{
                  fontFamily: 'Poppins-Light',
                }}>
                {user?.id || 'N/A'}
              </Text>
            </Text>
          </View>
        </View>

        {/* Menu Items */}
        <View
          style={{
            backgroundColor: '#F0FFF4',
            borderTopLeftRadius: 70,
            borderTopRightRadius: 70,
            paddingHorizontal: 38,
            paddingTop: 80,
            paddingBottom: scrollPaddingBottom,
            minHeight: 600,
          }}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              onPress={item.onPress}
              activeOpacity={0.7}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: index === menuItems.length - 1 ? 0 : 35,
              }}>
              <View
                style={{
                  width: 57,
                  height: 53,
                  borderRadius: 22,
                  backgroundColor: item.color,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                {item.icon}
              </View>
              <Text
                style={{
                  fontFamily: 'Poppins-Medium',
                  fontSize: 15,
                  color: '#093030',
                  marginLeft: 13,
                  textTransform: 'capitalize',
                }}>
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Logout Button */}
          <TouchableOpacity
            onPress={handleLogout}
            disabled={isLoggingOut}
            activeOpacity={0.7}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 35,
              opacity: isLoggingOut ? 0.5 : 1,
            }}>
            <View
              style={{
                width: 57,
                height: 53,
                borderRadius: 22,
                backgroundColor: '#3299FF',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <LogoutIcon />
            </View>
            <Text
              style={{
                fontFamily: 'Poppins-Medium',
                fontSize: 15,
                color: '#093030',
                marginLeft: 13,
                textTransform: 'capitalize',
              }}>
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
