import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafePadding } from '@/shared/hooks/useSafePadding';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { BackIcon, BellIcon, CameraIcon } from '@/components/UI/icons/svg-icons';
import { AccountSettingsSection } from '@/modules/profile/components';

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

  const [isUpdating, setIsUpdating] = useState(false);
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(true);
  const [darkThemeEnabled, setDarkThemeEnabled] = useState(false);

  const handleCameraPress = () =>
    Alert.alert(
      'Update Profile Picture',
      'Camera/gallery functionality will be implemented for profile picture updates.',
      [{ text: 'OK' }]
    );

  const handleUpdateProfile = () =>
    Alert.alert('Update Profile', 'Profile update API integration coming soon.', [
      { text: 'OK', onPress: () => router.back() },
    ]);

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
              }}>
              <Text
                className="font-poppins-bold text-[#00D09E]"
                style={{ fontSize: 44, lineHeight: 52 }}>
                {initial}
              </Text>
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
          {/* Account Settings fields */}
          <AccountSettingsSection />

          {/* ── Toggle rows ── */}
          <View style={{ marginTop: 20, gap: 4 }}>
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
          </View>

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
