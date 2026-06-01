import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafePadding } from '@/shared/hooks/useSafePadding';
import { useAppSelector, useAppDispatch } from '@/shared/hooks/useAppSelector';
import { useToast } from '@/shared/hooks/useToast';
import { useUpdateProfileMutation } from '@/shared/libs/redux/features/auth/authApi';
import { setUser } from '@/shared/libs/redux/features/auth/authSlice';
import type { UpdateProfileRequest } from '@/shared/libs/types/auth.types';
import { BackIcon, BellIcon, CameraIcon, NotificationIcon } from '@/components/UI/icons/svg-icons';
import { AccountSettingsSection } from '@/modules/profile/components';

import * as ImagePicker from 'expo-image-picker';

// ─── constants ───────────────────────────────────────────────────────────────
const AVATAR_SIZE = 110; // diameter px
const OVERLAP = AVATAR_SIZE / 2; // 55px — half avatar in green
const GREEN_EXTRA = OVERLAP + 4; // 59px extra padding-bottom on green nav
const CARD_RADIUS = 40;

// ─── component ───────────────────────────────────────────────────────────────
export default function EditProfileScreen() {
  const { paddingTop, scrollPaddingBottom } = useSafePadding();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const { showSuccess, showError, showInfo } = useToast();
  const [image, setImage] = useState<string | null>(null);

  // Editable fields — pre-fill from Redux auth state
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber ?? '');
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth ?? '');

  // RTK mutation hook
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  // Local toggle states (not persisted to API yet)
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(true);
  const [darkThemeEnabled, setDarkThemeEnabled] = useState(false);

  const handleCameraPress = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        showError({ title: 'Permission Required', message: 'Please grant camera roll permissions to upload a photo.' });
        return;
      }

      // Launch image library
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const selectedImage = result.assets[0].uri;
        setImage(selectedImage);

        // TODO: Upload image to server when API endpoint is available
        // For now, just store locally
        showInfo({ title: 'Photo Selected', message: 'Profile photo updated locally.' });
      }
    } catch {
      showError({ title: 'Error', message: 'Failed to pick image. Please try again.' });
    }
  };

  const handleUpdateProfile = async () => {
    // Build payload — only include changed fields
    const payload: UpdateProfileRequest = {};
    if (fullName.trim() && fullName.trim() !== user?.fullName) payload.fullName = fullName.trim();
    if (phoneNumber.trim() && phoneNumber.trim() !== user?.phoneNumber)
      payload.phoneNumber = phoneNumber.trim();
    if (dateOfBirth.trim() && dateOfBirth.trim() !== user?.dateOfBirth)
      payload.dateOfBirth = dateOfBirth.trim();

    // Nothing changed
    if (Object.keys(payload).length === 0) {
      showSuccess({ title: 'No changes', message: 'Nothing to update' });
      return;
    }

    try {
      const result = await updateProfile(payload).unwrap();
      // Update Redux auth state so the whole app sees fresh data
      if (result.data) {
        dispatch(setUser({ ...user!, ...result.data }));
        // Also update local state so the current screen shows fresh data
        // Always update from API response to ensure UI shows server-confirmed values
        setFullName(result.data.fullName ?? fullName);
        setPhoneNumber(result.data.phoneNumber ?? phoneNumber);
        setDateOfBirth(result.data.dateOfBirth ?? dateOfBirth);
      }
      showSuccess({ title: 'Profile Updated', message: 'Your profile has been updated.' });
      router.back();
    } catch (error: any) {
      if (error?.status === 422 && error?.data?.errors) {
        const firstError = Object.values(error.data.errors as Record<string, string[]>)[0]?.[0];
        showError({ title: 'Validation Error', message: firstError ?? 'Please check your input' });
      } else {
        showError({
          title: 'Update Failed',
          message: error?.data?.message ?? 'Something went wrong. Please try again.',
        });
      }
    }
  };

  const initial = user?.fullName?.charAt(0).toUpperCase() ?? 'U';

  return (
    <View className="flex-1" style={{ backgroundColor: '#00D09E' }}>
      {/* ══════════════════════════════════════════════════════
          GREEN NAV BAR — nav row + space for the top half of the avatar
          paddingBottom: GREEN_EXTRA ensures the green shows behind
          the upper half of the avatar before the white card starts.
      ══════════════════════════════════════════════════════ */}
      <View
        style={{
          paddingTop: paddingTop + 10,
          paddingBottom: GREEN_EXTRA,
          paddingHorizontal: 24,
        }}>
        <View className="flex-row items-center justify-between">
          {/* Back */}
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <BackIcon />
          </TouchableOpacity>

          {/* Title */}
          <Text className="font-poppins-semibold text-[#0E3E3E]" style={{ fontSize: 18 }}>
            Edit My Profile
          </Text>

          {/* Bell */}
          <TouchableOpacity
            style={{
              marginRight: 20,
            }}
            onPress={() => {
              router.push('/(tabs)');
            }}
            className="h-[42px] w-[42px] items-center justify-center rounded-full bg-[#DFF7E2]"
            activeOpacity={0.8}>
            <NotificationIcon color="#093030" size={16} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ══════════════════════════════════════════════════════
          WHITE CARD — takes up the rest of the screen
          Avatar is pulled up by OVERLAP px so exactly half sits
          in the green area above.
      ══════════════════════════════════════════════════════ */}
      <View
        style={{
          flex: 1,
          backgroundColor: '#F0FFF4',
          borderTopLeftRadius: CARD_RADIUS,
          borderTopRightRadius: CARD_RADIUS,
        }}>
        {/* ── Avatar (straddles green / white boundary) ── */}
        <View style={{ alignItems: 'center', marginTop: -OVERLAP }}>
          {/* Circle */}
          <View style={{ position: 'relative', width: AVATAR_SIZE, height: AVATAR_SIZE }}>
            <View
              style={{
                width: AVATAR_SIZE,
                height: AVATAR_SIZE,
                borderRadius: AVATAR_SIZE / 2,
                backgroundColor: '#C5F0DC',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}>
              {image ? (
                <Image
                  source={{ uri: image }}
                  style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
                  resizeMode="cover"
                />
              ) : (
                <Text
                  className="font-poppins-bold text-[#00D09E]"
                  style={{ fontSize: 44, lineHeight: 52 }}>
                  {initial}
                </Text>
              )}
            </View>

            {/* Camera badge */}
            <TouchableOpacity
              onPress={handleCameraPress}
              activeOpacity={0.8}
              style={{
                position: 'absolute',
                bottom: 2,
                right: 2,
                width: 30,
                height: 30,
                borderRadius: 15,
                backgroundColor: '#00D09E',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: '#F0FFF4',
              }}>
              <CameraIcon />
            </TouchableOpacity>
          </View>

          {/* Name */}
          <Text
            className="font-poppins-bold text-[#0E3E3E]"
            style={{ fontSize: 20, marginTop: 12 }}>
            {user?.fullName ?? 'User Name'}
          </Text>

          {/* ID */}
          <Text
            className="font-poppins-medium text-[#093030]"
            style={{ fontSize: 13, marginTop: 2 }}>
            ID: <Text className="font-poppins-light">{user?.id ?? 'N/A'}</Text>
          </Text>
        </View>

        {/* ── Scrollable content ── */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 20,
            paddingBottom: scrollPaddingBottom + 40,
          }}>
          {/* Full Name — editable, maps to PUT /v1/users/me fullName */}
          <View className="mt-5 gap-2">
            <Text className="font-poppins-medium text-[15px] text-[#093030]">Full Name</Text>
            <View className="rounded-[10px] px-5 py-[14px]" style={{ backgroundColor: '#DFF7E2' }}>
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your full name"
                placeholderTextColor="#93B5A0"
                autoCapitalize="words"
                className="font-poppins-light m-0 p-0 text-[13px] text-[#093030]"
                style={{ height: 20 }}
              />
            </View>
          </View>

          {/* Date of Birth — editable, maps to PUT /v1/users/me dateOfBirth */}
          <View className="mt-5 gap-2">
            <Text className="font-poppins-medium text-[15px] text-[#093030]">Date of Birth</Text>
            <View className="rounded-[10px] px-5 py-[14px]" style={{ backgroundColor: '#DFF7E2' }}>
              <TextInput
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
                placeholder="YYYY-MM-DD (e.g., 1995-01-15)"
                placeholderTextColor="#93B5A0"
                keyboardType="numeric"
                maxLength={10}
                className="font-poppins-light m-0 p-0 text-[13px] text-[#093030]"
                style={{ height: 20 }}
              />
            </View>
          </View>

          {/* Account Settings fields */}
          <AccountSettingsSection
            editable={true}
            phone={phoneNumber}
            onPhoneChange={setPhoneNumber}
            username={user?.username}
            email={user?.email}
          />
          {/* ── Toggle rows ── */}
          {/* <View style={{ marginTop: 20, gap: 4 }}>
            <ToggleRow
              label="Push Notifications"
              value={pushNotificationsEnabled}
              onChange={setPushNotificationsEnabled}
            />
            <ToggleRow
              label="Turn Dark Theme"
              value={darkThemeEnabled}
              onChange={setDarkThemeEnabled}
            />
          </View> */}
          {/* ── Update Profile button ── */}
          <TouchableOpacity
            onPress={handleUpdateProfile}
            disabled={isUpdating}
            activeOpacity={0.85}
            style={{
              marginTop: 32,
              height: 52,
              borderRadius: 26,
              backgroundColor: '#00D09E',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isUpdating ? 0.7 : 1,
            }}>
            {isUpdating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="font-poppins-semibold text-white" style={{ fontSize: 16 }}>
                Update Profile
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}

// ─── inline sub-component ────────────────────────────────────────────────────
function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View className="flex-row items-center justify-between" style={{ paddingVertical: 10 }}>
      <Text className="font-poppins-medium text-[#093030]" style={{ fontSize: 15 }}>
        {label}
      </Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: '#DFF7E2', true: '#00D09E' }}
        thumbColor="#FFFFFF"
        ios_backgroundColor="#DFF7E2"
      />
    </View>
  );
}
