import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { useAppSelector } from '@/shared/hooks/useAppSelector';

interface AccountSettingsSectionProps {
  username?: string;
  phone?: string;
  email?: string;
  onUsernameChange?: (text: string) => void;
  onPhoneChange?: (text: string) => void;
  onEmailChange?: (text: string) => void;
  editable?: boolean;
}

interface FieldProps {
  label: string;
  value: string;
  placeholder: string;
  onChangeText?: (text: string) => void;
  editable?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

const Field: React.FC<FieldProps> = ({
  label,
  value,
  placeholder,
  onChangeText,
  editable = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
}) => (
  <View className="gap-2">
    <Text className="font-poppins-medium text-[15px] text-[#093030]">{label}</Text>
    <View
      className="rounded-[10px] px-5 py-[14px]"
      style={{ backgroundColor: '#DFF7E2', opacity: editable ? 1 : 0.7 }}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#93B5A0"
        editable={editable}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        className="font-poppins-light m-0 p-0 text-[13px] text-[#093030]"
        style={{ height: 20 }}
      />
    </View>
  </View>
);

export const AccountSettingsSection: React.FC<AccountSettingsSectionProps> = ({
  username,
  phone,
  email,
  onUsernameChange,
  onPhoneChange,
  onEmailChange,
  editable = false,
}) => {
  const { user } = useAppSelector((state) => state.auth);

  const displayUsername = username ?? user?.username ?? '';
  const displayPhone = phone ?? user?.phoneNumber ?? '';
  const displayEmail = email ?? user?.email ?? '';

  return (
    <View className="mt-[30px] gap-5">
      {/* Section Title */}
      <Text className="font-poppins-semibold text-[20px] text-[#093030]">Account Settings</Text>

      {/* Username — always read-only */}
      <Field
        label="Username"
        value={displayUsername}
        placeholder="Username"
        editable={false}
        autoCapitalize="none"
      />

      {/* Phone — editable when editable prop is true */}
      <Field
        label="Phone"
        value={displayPhone}
        placeholder="+880 000 0000 00"
        onChangeText={onPhoneChange}
        editable={false}
        keyboardType="phone-pad"
        autoCapitalize="none"
      />

      {/* Email Address — always read-only */}
      <Field
        label="Email Address"
        value={displayEmail}
        placeholder="example@example.com"
        editable={false}
        keyboardType="email-address"
        autoCapitalize="none"
      />
    </View>
  );
};
