import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRegister } from '@/modules/register/hooks/useRegister';
import DatePickerField from '@/shared/components/DatePickerField';

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { register, isLoading, error } = useRegister();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSignUp = () => {
    setLocalError(null);
    if (!fullName.trim() || !email.trim() || !username.trim() || !phoneNumber.trim() || !dateOfBirth.trim() || !password) {
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
    <View style={{ flex: 1, paddingTop: insets.top }} className="bg-[#00C897]">

      {/* Header */}
      <View className="pb-10 items-center">
        <Text className="text-[28px] font-bold text-[#0D2B1E]">
          Create Account
        </Text>
      </View>

      {/* White card */}
      <View className="flex-1 bg-[#F0FFF4] rounded-tl-[40px] rounded-tr-[40px]">
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 32, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* Error message */}
          {displayError ? (
            <View className="mb-4 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
              <Text className="text-[13px] text-red-600">{displayError}</Text>
            </View>
          ) : null}

          {/* Full Name */}
          <View className="mb-4">
            <Text className="text-[15px] font-semibold text-[#1A1A1A] ml-1 mb-2">Full Name</Text>
            <View className="h-[52px] bg-[#E4F7EE] rounded-full px-5 justify-center">
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
            <Text className="text-[15px] font-semibold text-[#1A1A1A] ml-1 mb-2">Email</Text>
            <View className="h-[52px] bg-[#E4F7EE] rounded-full px-5 justify-center">
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
            <Text className="text-[15px] font-semibold text-[#1A1A1A] ml-1 mb-2">Username</Text>
            <View className="h-[52px] bg-[#E4F7EE] rounded-full px-5 justify-center">
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
            <Text className="text-[15px] font-semibold text-[#1A1A1A] ml-1 mb-2">Mobile Number</Text>
            <View className="h-[52px] bg-[#E4F7EE] rounded-full px-5 justify-center">
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
            <Text className="text-[15px] font-semibold text-[#1A1A1A] ml-1 mb-2">Date Of Birth</Text>
            <DatePickerField
              value={dateOfBirth}
              onChange={setDateOfBirth}
              disabled={isLoading}
            />
          </View>

          {/* Password */}
          <View className="mb-4">
            <Text className="text-[15px] font-semibold text-[#1A1A1A] ml-1 mb-2">Password</Text>
            <View className="h-[52px] bg-[#E4F7EE] rounded-full px-5 flex-row items-center justify-between">
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
                <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={22} color="#00C897" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View className="mb-6">
            <Text className="text-[15px] font-semibold text-[#1A1A1A] ml-1 mb-2">Confirm Password</Text>
            <View className="h-[52px] bg-[#E4F7EE] rounded-full px-5 flex-row items-center justify-between">
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="••••••••"
                placeholderTextColor="#A0C4B0"
                secureTextEntry={!showConfirmPassword}
                className="flex-1 text-[15px] text-[#1A1A1A]"
                editable={!isLoading}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} activeOpacity={0.7}>
                <Ionicons name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'} size={22} color="#00C897" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Terms & Privacy */}
          <View className="items-center mb-5">
            <Text className="text-[13px] text-[#888] text-center">By continuing, you agree to</Text>
            <Text className="text-[13px] text-center">
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
            className="h-[54px] bg-[#00C897] rounded-full items-center justify-center mb-5"
          >
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
              <Text className="text-[#00C897] font-semibold" onPress={handleLogin}>
                Log In
              </Text>
            </Text>
          </View>

        </ScrollView>
      </View>
    </View>
  );
}
