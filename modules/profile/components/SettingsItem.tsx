import React from 'react';
import { View, Text, Switch } from 'react-native';

interface SettingsItemProps {
  label: string;
  value: boolean;
  onValueChange?: (value: boolean) => void;
}

export const SettingsItem: React.FC<SettingsItemProps> = ({ label, value, onValueChange }) => {
  return (
    <View className="flex-row items-center justify-between py-1">
      <Text className="font-poppins-medium text-[#093030]" style={{ fontSize: 15 }}>
        {label}
      </Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#DFF7E2', true: '#00D09E' }}
        thumbColor="#FFFFFF"
        ios_backgroundColor="#DFF7E2"
      />
    </View>
  );
};
