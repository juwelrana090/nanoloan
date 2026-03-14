import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RegisterScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter()
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [mobile, setMobile] = useState('')
    const [dob, setDob] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const handleSignUp = () => {
        // TODO: Implement register logic
        router.push('/auth/email-otp-verification')
    }

    const handleLogin = () => {
        router.push('/auth/login')
    }

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

                    {/* Full Name */}
                    <View className="mb-4">
                        <Text className="text-[15px] font-semibold text-[#1A1A1A] ml-1 mb-2">
                            Full Name
                        </Text>
                        <View className="h-[52px] bg-[#E4F7EE] rounded-full px-5 justify-center">
                            <TextInput
                                value={fullName}
                                onChangeText={setFullName}
                                placeholder="Dalawer Hossain Juwel"
                                placeholderTextColor="#A0C4B0"
                                className="text-[15px] text-[#1A1A1A]"
                            />
                        </View>
                    </View>

                    {/* Email */}
                    <View className="mb-4">
                        <Text className="text-[15px] font-semibold text-[#1A1A1A] ml-1 mb-2">
                            Email
                        </Text>
                        <View className="h-[52px] bg-[#E4F7EE] rounded-full px-5 justify-center">
                            <TextInput
                                value={email}
                                onChangeText={setEmail}
                                placeholder="example@example.com"
                                placeholderTextColor="#A0C4B0"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                className="text-[15px] text-[#1A1A1A]"
                            />
                        </View>
                    </View>

                    {/* Mobile Number */}
                    <View className="mb-4">
                        <Text className="text-[15px] font-semibold text-[#1A1A1A] ml-1 mb-2">
                            Mobile Number
                        </Text>
                        <View className="h-[52px] bg-[#E4F7EE] rounded-full px-5 justify-center">
                            <TextInput
                                value={mobile}
                                onChangeText={setMobile}
                                placeholder="+ 123 456 789"
                                placeholderTextColor="#A0C4B0"
                                keyboardType="phone-pad"
                                className="text-[15px] text-[#1A1A1A]"
                            />
                        </View>
                    </View>

                    {/* Date Of Birth */}
                    <View className="mb-4">
                        <Text className="text-[15px] font-semibold text-[#1A1A1A] ml-1 mb-2">
                            Date Of Birth
                        </Text>
                        <View className="h-[52px] bg-[#E4F7EE] rounded-full px-5 justify-center">
                            <TextInput
                                value={dob}
                                onChangeText={setDob}
                                placeholder="DD / MM / YYY"
                                placeholderTextColor="#A0C4B0"
                                keyboardType="numeric"
                                className="text-[15px] text-[#1A1A1A]"
                            />
                        </View>
                    </View>

                    {/* Password */}
                    <View className="mb-4">
                        <Text className="text-[15px] font-semibold text-[#1A1A1A] ml-1 mb-2">
                            Password
                        </Text>
                        <View className="h-[52px] bg-[#E4F7EE] rounded-full px-5 flex-row items-center justify-between">
                            <TextInput
                                value={password}
                                onChangeText={setPassword}
                                placeholder="••••••••"
                                placeholderTextColor="#A0C4B0"
                                secureTextEntry={!showPassword}
                                className="flex-1 text-[15px] text-[#1A1A1A]"
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
                        <Text className="text-[15px] font-semibold text-[#1A1A1A] ml-1 mb-2">
                            Confirm Password
                        </Text>
                        <View className="h-[52px] bg-[#E4F7EE] rounded-full px-5 flex-row items-center justify-between">
                            <TextInput
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholder="••••••••"
                                placeholderTextColor="#A0C4B0"
                                secureTextEntry={!showConfirmPassword}
                                className="flex-1 text-[15px] text-[#1A1A1A]"
                            />
                            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} activeOpacity={0.7}>
                                <Ionicons
                                    name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                                    size={22}
                                    color="#00C897"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Terms & Privacy */}
                    <View className="items-center mb-5">
                        <Text className="text-[13px] text-[#888] text-center">
                            By continuing, you agree to
                        </Text>
                        <Text className="text-[13px] text-center">
                            <Text className="font-bold text-[#1A1A1A]">Terms of Use </Text>
                            <Text className="text-[#888]">and </Text>
                            <Text className="font-bold text-[#1A1A1A]">Privacy Policy.</Text>
                        </Text>
                    </View>

                    {/* Sign Up button */}
                    <TouchableOpacity
                        onPress={handleSignUp}
                        activeOpacity={0.8}
                        className="h-[54px] bg-[#00C897] rounded-full items-center justify-center mb-5"
                    >
                        <Text className="text-[18px] font-bold text-white">
                            Sign Up
                        </Text>
                    </TouchableOpacity>

                    {/* Already have an account */}
                    <View className="items-center">
                        <Text className="text-[13px] text-[#888]">
                            Already have an account?{' '}
                            <Text
                                className="text-[#00C897] font-semibold"
                                onPress={handleLogin}
                            >
                                Log In
                            </Text>
                        </Text>
                    </View>

                </ScrollView>
            </View>
        </View>
    )
}