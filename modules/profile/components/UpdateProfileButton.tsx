import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

interface UpdateProfileButtonProps {
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export const UpdateProfileButton: React.FC<UpdateProfileButtonProps> = ({
  onPress,
  isLoading = false,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      className="items-center justify-center rounded-full"
      style={{
        backgroundColor: '#00D09E',
        height: 52,
        opacity: disabled || isLoading ? 0.6 : 1,
      }}>
      {isLoading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text className="font-poppins-semibold text-white" style={{ fontSize: 16 }}>
          Update Profile
        </Text>
      )}
    </TouchableOpacity>
  );
};
