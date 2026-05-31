// GreenHeader is no longer used by edit-profile.tsx.
// edit-profile.tsx inlines its own layout so the avatar can
// correctly straddle the green/white card boundary.
//
// This file is kept to avoid breaking any other screen that
// imports GreenHeader from modules/profile/components.

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { BackIcon, BellIcon } from '@/components/UI/icons/svg-icons';

interface GreenHeaderProps {
  paddingTop: number;
  title?: string;
  onPressCamera?: () => void;
}

export const GreenHeader: React.FC<GreenHeaderProps> = ({
  paddingTop,
  title = 'Edit My Profile',
}) => {
  const router = useRouter();

  return (
    <View
      style={{
        paddingTop: paddingTop + 10,
        paddingBottom: 16,
        paddingHorizontal: 24,
      }}>
      <View className="flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <BackIcon />
        </TouchableOpacity>

        <Text className="font-poppins-semibold text-[#0E3E3E]" style={{ fontSize: 18 }}>
          {title}
        </Text>

        <View
          className="items-center justify-center rounded-full"
          style={{
            width: 36,
            height: 36,
            backgroundColor: 'rgba(255,255,255,0.22)',
          }}>
          <BellIcon />
        </View>
      </View>
    </View>
  );
};
