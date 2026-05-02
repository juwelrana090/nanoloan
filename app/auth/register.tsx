import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafePadding } from '@/shared/hooks/useSafePadding';
import { useRegister } from '@/modules/register/hooks/useRegister';
import DatePickerField from '@/shared/components/DatePickerField';
import { KeyboardAwareScreen } from '@/shared/components/KeyboardAwareScreen';

export default function RegisterScreen() {
  const { paddingTop, scrollPaddingBottom } = useSafePadding();
  const router = useRouter();
  const { register, isLoading, error } = useRegister();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('8801');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSignUp = () => {
    setLocalError(null);
    if (
      !fullName.trim() ||
      !email.trim() ||
      !username.trim() ||
      !phoneNumber.trim() ||
      !dateOfBirth.trim() ||
      !password
    ) {
      setLocalError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters.');
      return;
    }
    const bdPhoneRegex = /^8801[3-9]\d{8}$/;
    if (!bdPhoneRegex.test(phoneNumber.trim())) {
      setLocalError('Please enter a valid Bangladeshi phone number (e.g., 8801800000000).');
      return;
    }
    register({
      fullName: fullName.trim(),
      email: email.trim(),
      username: username.trim(),
      password,
      phoneNumber: phoneNumber.trim(),
      dateOfBirth: dateOfBirth.trim(),
    });
  };

  const handleLogin = () => {
    router.push('/auth/login');
  };

  const displayError = localError || error;

  return (
    <View style={{ flex: 1, paddingTop }} className="bg-[#00C897]">
      {/* Header */}
      <View className="items-center pb-10">
        <Text className="text-[28px] font-bold text-[#0D2B1E]">Create Account</Text>
      </View>

      {/* White card */}
      <KeyboardAwareScreen
        backgroundColor="#F0FFF4"
        style={{ borderTopLeftRadius: 40, borderTopRightRadius: 40 }}
        scrollViewProps={{
          contentContainerStyle: {
            paddingHorizontal: 24,
            paddingTop: 32,
            paddingBottom: scrollPaddingBottom,
          },
        }}>
          {/* Error message */}
          {displayError ? (
            <View className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
              <Text className="text-[13px] text-red-600">{displayError}</Text>
            </View>
          ) : null}

          {/* Full Name */}
          <View className="mb-4">
            <Text className="mb-2 ml-1 text-[15px] font-semibold text-[#1A1A1A]">Full Name</Text>
            <View className="h-[52px] justify-center rounded-full bg-[#E4F7EE] px-5">
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Dalawer Hossain Juwel"
                placeholderTextColor="#A0C4B0"
                className="text-[15px] text-[#1A1A1A]"
                editable={!isLoading}
              />
            </View>
          </View>

          {/* Email */}
          <View className="mb-4">
            <Text className="mb-2 ml-1 text-[15px] font-semibold text-[#1A1A1A]">Email</Text>
            <View className="h-[52px] justify-center rounded-full bg-[#E4F7EE] px-5">
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="example@example.com"
                placeholderTextColor="#A0C4B0"
                keyboardType="email-address"
                autoCapitalize="none"
                className="text-[15px] text-[#1A1A1A]"
                editable={!isLoading}
              />
            </View>
          </View>

          {/* Username */}
          <View className="mb-4">
            <Text className="mb-2 ml-1 text-[15px] font-semibold text-[#1A1A1A]">Username</Text>
            <View className="h-[52px] justify-center rounded-full bg-[#E4F7EE] px-5">
              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="juwel090"
                placeholderTextColor="#A0C4B0"
                autoCapitalize="none"
                className="text-[15px] text-[#1A1A1A]"
                editable={!isLoading}
              />
            </View>
          </View>

          {/* Mobile Number */}
          <View className="mb-4">
            <Text className="mb-2 ml-1 text-[15px] font-semibold text-[#1A1A1A]">
              Mobile Number
            </Text>
            <View className="h-[52px] justify-center rounded-full bg-[#E4F7EE] px-5">
              <TextInput
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="+880 123 456 789"
                placeholderTextColor="#A0C4B0"
                keyboardType="phone-pad"
                className="text-[15px] text-[#1A1A1A]"
                editable={!isLoading}
              />
            </View>
          </View>

          {/* Date Of Birth */}
          <View className="mb-4">
            <Text className="mb-2 ml-1 text-[15px] font-semibold text-[#1A1A1A]">
              Date Of Birth
            </Text>
            <DatePickerField value={dateOfBirth} onChange={setDateOfBirth} disabled={isLoading} />
          </View>

          {/* Password */}
          <View className="mb-4">
            <Text className="mb-2 ml-1 text-[15px] font-semibold text-[#1A1A1A]">Password</Text>
            <View className="h-[52px] flex-row items-center justify-between rounded-full bg-[#E4F7EE] px-5">
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#A0C4B0"
                secureTextEntry={!showPassword}
                className="flex-1 text-[15px] text-[#1A1A1A]"
                editable={!isLoading}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} activeOpacity={0.7}>
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={22}
                  color="#00C897"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View className="mb-6">
            <Text className="mb-2 ml-1 text-[15px] font-semibold text-[#1A1A1A]">
              Confirm Password
            </Text>
            <View className="h-[52px] flex-row items-center justify-between rounded-full bg-[#E4F7EE] px-5">
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="••••••••"
                placeholderTextColor="#A0C4B0"
                secureTextEntry={!showConfirmPassword}
                className="flex-1 text-[15px] text-[#1A1A1A]"
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                activeOpacity={0.7}>
                <Ionicons
                  name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={22}
                  color="#00C897"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Terms & Privacy */}
          <View className="mb-5 items-center">
            <Text className="text-center text-[13px] text-[#888]">By continuing, you agree to</Text>
            <Text className="text-center text-[13px]">
              <Text className="font-bold text-[#1A1A1A]">Terms of Use </Text>
              <Text className="text-[#888]">and </Text>
              <Text className="font-bold text-[#1A1A1A]">Privacy Policy.</Text>
            </Text>
          </View>

          {/* Sign Up button */}
          <TouchableOpacity
            onPress={handleSignUp}
            disabled={isLoading}
            activeOpacity={0.8}
            className="mb-5 h-[54px] items-center justify-center rounded-full bg-[#00C897]">
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-[18px] font-bold text-white">Sign Up</Text>
            )}
          </TouchableOpacity>

          {/* Already have an account */}
          <View className="items-center">
            <Text className="text-[13px] text-[#888]">
              Already have an account?{' '}
              <Text className="font-semibold text-[#00C897]" onPress={handleLogin}>
                Log In
              </Text>
            </Text>
          </View>
      </KeyboardAwareScreen>
    </View>
  );
}
