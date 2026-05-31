import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { BackIcon, BellIcon } from '@/components/UI/icons/svg-icons';
import { useSafePadding } from '@/shared/hooks/useSafePadding';

interface ProfileHeaderProps {
  scrollPaddingBottom?: number;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ scrollPaddingBottom }) => {
  const router = useRouter();
  const { paddingTop } = useSafePadding();

  return (
    <View
      style={{
        paddingTop: paddingTop + 20,
        paddingHorizontal: 38,
        paddingBottom: scrollPaddingBottom,
      }}
    >
      {/* Top Row */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
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
          }}
        >
          <BellIcon />
        </View>
      </View>

      {/* Title */}
      <View
        style={{
          marginTop: 20,
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            fontFamily: 'Poppins-Bold',
            fontSize: 20,
            color: '#0E3E3E',
            textTransform: 'capitalize',
          }}
        >
          Profile
        </Text>
      </View>
    </View>
  );
};
