import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafePadding } from '@/shared/hooks/useSafePadding';
import { useAppDispatch, useAppSelector } from '@/shared/hooks/useAppSelector';
import { setLogout } from '@/shared/libs/redux/features/auth/authSlice';
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

// ─── constants ───────────────────────────────────────────────────────────────
const AVATAR_SIZE = 117; // diameter px
const OVERLAP = AVATAR_SIZE / 2; // 58.5px — half avatar in green
const GREEN_HEADER_HEIGHT = OVERLAP + 160; // Green space for nav + title + top half of avatar + name + ID
const CARD_RADIUS = 70;
const MENU_ITEM_HEIGHT = 53;
const MENU_ITEM_GAP = 16;

// ─── component ───────────────────────────────────────────────────────────────
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
      color: '#0068FF',
      onPress: () => router.push('/profile/edit-profile' as any),
    },
    {
      id: 'security',
      title: 'Security',
      icon: <SecurityIcon />,
      color: '#0068FF',
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
      color: '#0068FF',
      onPress: () => {},
    },
  ];

  const initial = user?.fullName?.charAt(0).toUpperCase() ?? 'U';

  return (
    <View className="flex-1" style={{ backgroundColor: '#00D09E' }}>
      {/* ══════════════════════════════════════════════════════
          GREEN HEADER — nav row + title
      ══════════════════════════════════════════════════════ */}
      <View
        style={{
          paddingTop: paddingTop + 10,
          paddingHorizontal: 38,
          paddingBottom: OVERLAP,
        }}>
        {/* Top Row */}
        {/* <View className="flex-row items-center justify-between"> */}
        {/* Back */}
        {/* <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <BackIcon />
          </TouchableOpacity> */}

        {/* Bell Icon */}
        {/* <View
            className="items-center justify-center overflow-hidden rounded-full"
            style={{
              width: 30,
              height: 30,
              backgroundColor: '#DFF7E2',
              borderRadius: 25.7,
            }}>
            <BellIcon />
          </View> */}
        {/* </View> */}

        {/* Title */}
        {/* <View className="mt-5 items-center">
          <Text
            className="font-poppins-semibold text-center capitalize text-[#0E3E3E]"
            style={{ fontSize: 20 }}>
            Profile
          </Text>
        </View> */}
      </View>

      {/* ══════════════════════════════════════════════════════
          WHITE CARD — avatar + name + ID + menu items
          Avatar is pulled up by OVERLAP px so half sits in green
      ══════════════════════════════════════════════════════ */}
      <View
        style={{
          flex: 1,
          backgroundColor: '#F0FFF4',
          borderTopLeftRadius: CARD_RADIUS,
          borderTopRightRadius: CARD_RADIUS,
          paddingHorizontal: 38,
          marginTop: 76,
        }}>
        {/* ── Avatar (straddles green / white boundary) ── */}
        <View style={{ alignItems: 'center', marginTop: -OVERLAP }}>
          {/* Avatar Circle */}
          <View
            style={{
              width: AVATAR_SIZE,
              height: AVATAR_SIZE,
              borderRadius: AVATAR_SIZE / 2,
              backgroundColor: '#C5F0DC',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text
              className="font-poppins-bold text-[#00D09E]"
              style={{ fontSize: 48, lineHeight: 52 }}>
              {initial}
            </Text>
          </View>

          {/* User Name */}
          <Text
            className="font-poppins-bold text-center capitalize text-[#0E3E3E]"
            style={{ fontSize: 20, marginTop: 12 }}>
            {user?.fullName ?? 'User Name'}
          </Text>

          {/* User ID */}
          <Text
            className="font-poppins-medium text-center text-[#093030]"
            style={{ fontSize: 13, marginTop: 2 }}>
            ID: <Text className="font-poppins-light">{user?.id ?? 'N/A'}</Text>
          </Text>
        </View>

        {/* ── Menu Items ── */}
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: 24,
            paddingBottom: scrollPaddingBottom + 40,
          }}>
          <View className="gap-4">
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={item.onPress}
                activeOpacity={0.7}
                className="flex-row items-center gap-[13px]">
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
                  className="font-poppins-medium capitalize text-[#093030]"
                  style={{ fontSize: 15 }}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            onPress={handleLogout}
            disabled={isLoggingOut}
            activeOpacity={0.7}
            className="mt-4 flex-row items-center gap-[13px]"
            style={{ opacity: isLoggingOut ? 0.5 : 1 }}>
            <View
              style={{
                width: 57,
                height: 53,
                borderRadius: 22,
                backgroundColor: '#0068FF',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <LogoutIcon />
            </View>
            {isLoggingOut ? (
              <ActivityIndicator size="small" color="#093030" />
            ) : (
              <Text
                className="font-poppins-medium capitalize text-[#093030]"
                style={{ fontSize: 15 }}>
                Logout
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}
