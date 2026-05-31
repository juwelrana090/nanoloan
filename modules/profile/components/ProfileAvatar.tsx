import React from 'react';
import { View, Text } from 'react-native';
import { useAppSelector } from '@/shared/hooks/useAppSelector';

export const ProfileAvatar: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <View
      style={{
        marginTop: 10,
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: 117,
          height: 117,
          borderRadius: 58.5,
          backgroundColor: '#C5F0DC',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
        }}
      >
        <Text
          style={{
            fontFamily: 'Poppins-Bold',
            fontSize: 48,
            color: '#00D09E',
          }}
        >
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
        }}
      >
        {user?.fullName || 'User Name'}
      </Text>

      {/* User ID */}
      <Text
        style={{
          fontFamily: 'Poppins-SemiBold',
          fontSize: 13,
          color: '#093030',
          marginTop: 4,
        }}
      >
        ID:{' '}
        <Text
          style={{
            fontFamily: 'Poppins-Light',
          }}
        >
          {user?.id || 'N/A'}
        </Text>
      </Text>
    </View>
  );
};
