import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { useRef, useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { NotificationIcon, RoundBDTIcon, BankAccountIcon } from '@/shared/constants/icons';
import { useBiometricStatus } from '@/modules/home/hooks/useHome';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.44;

const ACCOUNTS = [
  { type: 'Personal', number: '172*****6987' },
  { type: 'Saving', number: '172*****6987' },
];

// ── Exact SVG icons from design ──────────────────────────────────────────────

// Total Loan Icon (arrow up-right in rounded square)
const TotalLoanIcon = ({ color = '#052224', size = 12 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 12 12" fill="none">
    <Rect
      x={0.5}
      y={11.5}
      width={11}
      height={11}
      rx={2.5}
      transform="rotate(-90 0.500001 11.5)"
      stroke={color}
    />
    <Path
      d="M9.5 3C9.5 2.72386 9.27614 2.5 9 2.5L4.5 2.5C4.22386 2.5 4 2.72386 4 3C4 3.27614 4.22386 3.5 4.5 3.5L8.5 3.5L8.5 7.5C8.5 7.77614 8.72386 8 9 8C9.27614 8 9.5 7.77614 9.5 7.5L9.5 3ZM3 9L3.35355 9.35355L9.35355 3.35355L9 3L8.64645 2.64645L2.64645 8.64645L3 9Z"
      fill={color}
    />
  </Svg>
);

// Total Due Loan Icon (arrow down-right in rounded square)
const TotalDueLoanIcon = ({ color = '#052224', size = 12 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 12 12" fill="none">
    <Rect x={0.5} y={0.5} width={11} height={11} rx={2.5} stroke={color} />
    <Path
      d="M9 9.5C9.27614 9.5 9.5 9.27614 9.5 9L9.5 4.5C9.5 4.22386 9.27614 4 9 4C8.72386 4 8.5 4.22386 8.5 4.5L8.5 8.5L4.5 8.5C4.22386 8.5 4 8.72386 4 9C4 9.27614 4.22386 9.5 4.5 9.5L9 9.5ZM3 3L2.64645 3.35355L8.64645 9.35355L9 9L9.35355 8.64645L3.35355 2.64645L3 3Z"
      fill={color}
    />
  </Svg>
);

// Next Loan Payment Icon (3D layers/box)
const NextLoanIcon = ({ size = 28 }: { size?: number }) => (
  <Svg width={size} height={size * (30 / 33)} viewBox="0 0 33 30" fill="none">
    <Path
      d="M21.6682 14.3281L12.8841 19.9656C12.7171 20.0727 12.5042 20.0773 12.3328 19.9775L1.31933 13.5628C0.978086 13.3641 0.967583 12.8748 1.29998 12.6616L19.2618 1.14019C19.4286 1.03315 19.6414 1.02855 19.8127 1.12827L30.8261 7.53792C31.1674 7.73659 31.178 8.22588 30.8456 8.43917L25.66 11.7665M21.6736 18.8055L12.8839 24.4432C12.7171 24.5502 12.5043 24.5548 12.333 24.4551L1.31919 18.0452C0.977947 17.8466 0.967201 17.3575 1.29939 17.1441L4.23372 15.2591M27.912 10.3243L30.8258 12.0205C31.1672 12.2192 31.1777 12.7086 30.8451 12.9218L25.6119 16.2762M28.1254 14.6618L30.8608 16.357C31.1911 16.5616 31.1948 17.0408 30.8678 17.2506L12.8841 28.7913C12.7171 28.8984 12.5043 28.903 12.3328 28.8032L1.31932 22.3885C0.978082 22.1897 0.967578 21.7005 1.29998 21.4873L4.12165 19.6773M13.8573 4.94934L25.3494 11.6406C25.512 11.7352 25.6119 11.9091 25.6119 12.0971V20.3305C25.6119 20.5104 25.5204 20.6779 25.3691 20.775L22.4873 22.6258C22.1357 22.8516 21.6736 22.5991 21.6736 22.1813V14.6317C21.6736 14.4437 21.5737 14.2699 21.4112 14.1753L10.3854 7.75056C10.0444 7.55183 10.0338 7.06288 10.3659 6.84958L13.306 4.96136C13.473 4.85415 13.6859 4.84951 13.8573 4.94934Z"
      stroke="#093030"
      strokeWidth={2.11321}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Calendar / Date Icon
const DateIcon = ({ size = 26 }: { size?: number }) => (
  <Svg width={size} height={size * (28 / 30)} viewBox="0 0 30 28" fill="none">
    <Path
      d="M30.0001 6.20275C29.938 4.89518 28.854 3.77463 27.3944 3.78174H26.901V3.0451C26.901 1.81135 25.8259 0.807832 24.504 0.807832H24.3048C22.9829 0.807832 21.9077 1.81135 21.9077 3.0451V3.78174H19.5487V2.88814C19.5487 1.65439 18.4735 0.650879 17.1516 0.650879H16.9524C15.6305 0.650879 14.5553 1.65439 14.5553 2.88814V3.78174H12.1964V2.9926C12.1964 1.75885 11.1212 0.755332 9.79929 0.755332H9.60007C8.2782 0.755332 7.203 1.75885 7.203 2.9926V3.78174H6.71023C5.28933 3.78174 4.13386 4.86018 4.13386 6.18635V8.81572C4.15613 9.02682 4.128 9.23955 4.14031 9.4501C4.1198 13.381 3.84324 17.4224 0.298899 21.431C-0.0251248 21.7974 -0.0913357 22.2918 0.125461 22.7211C0.342258 23.1499 0.792258 23.4162 1.30027 23.4162H4.13386V24.9436C4.13386 26.2698 5.28933 27.3482 6.71023 27.3482H27.3938C28.8147 27.3482 29.9702 26.2692 29.9702 24.9436C29.9702 24.9436 29.962 7.48463 29.9995 6.20221L30.0001 6.20275ZM23.212 3.0451C23.212 2.48236 23.7024 2.02463 24.3053 2.02463H24.5046C25.1075 2.02463 25.5979 2.48236 25.5979 3.0451V3.78174H23.212V3.0451ZM15.8596 2.88814C15.8596 2.32541 16.3501 1.86768 16.953 1.86768H17.1522C17.7552 1.86768 18.2456 2.32541 18.2456 2.88814V3.78174H15.8596V2.88814ZM8.5073 2.9926C8.5073 2.42986 8.99773 1.97213 9.60066 1.97213H9.79988C10.4028 1.97213 10.8932 2.42986 10.8932 2.9926V3.78174H8.5073V2.9926ZM6.71081 4.99854H10.8932V5.47432C10.8932 6.03705 10.4028 6.49479 9.79988 6.49479C9.44011 6.49479 9.14831 6.76713 9.14831 7.10291C9.14831 7.43869 9.44011 7.71104 9.79988 7.71104C11.1218 7.71104 12.1969 6.70752 12.1969 5.47377V4.99799H18.2456V5.36932C18.2456 5.93205 17.7552 6.38978 17.1522 6.38978C16.7925 6.38978 16.5007 6.66213 16.5007 6.99791C16.5007 7.33369 16.7925 7.60604 17.1522 7.60604C18.4741 7.60604 19.5493 6.60252 19.5493 5.36877V4.99744H25.5979V5.52572C25.5979 6.08846 25.1075 6.54619 24.5046 6.54619C24.1448 6.54619 23.853 6.81854 23.853 7.15432C23.853 7.4901 24.1448 7.76244 24.5046 7.76244C25.8264 7.76244 26.9016 6.75893 26.9016 5.52518V4.99689H27.395C28.0969 4.99689 28.6677 5.52955 28.6677 6.18471V8.7583H5.44636V8.44932C5.44636 7.6733 5.44636 6.93994 5.46745 6.20166C5.46921 6.14588 5.46218 6.09228 5.4487 6.04033C5.52546 5.45354 6.06159 4.99689 6.71081 4.99689V4.99854ZM4.93484 15.1819C5.32859 13.4155 5.41941 11.6759 5.43991 9.97674H28.6671V10.1178C28.6096 13.9525 28.1491 17.8818 24.5157 21.7799C24.3923 21.912 24.24 22.0178 24.0691 22.0903C23.8982 22.1627 23.7126 22.2001 23.5249 22.1999H1.31023C3.16413 20.1005 4.35007 17.8053 4.93484 15.1819ZM27.3944 26.1325H6.71081C6.00886 26.1325 5.43816 25.5999 5.43816 24.9447V23.4173H23.5255C24.2837 23.4173 25.0032 23.1116 25.4995 22.5789C26.8987 21.0778 27.9458 19.4771 28.6671 17.7314V24.9447C28.6671 25.5999 28.0964 26.1325 27.3944 26.1325Z"
      fill="#052224"
    />
  </Svg>
);

// BDT Symbol Icon (for Loan Goals circle)
const BDTSymbolIcon = ({ color = 'white', size = 22 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size * (35 / 29)} viewBox="0 0 29 35" fill="none">
    <Path
      d="M29 16.7701V19.6874C29 28.1307 22.1697 35 13.7742 35H9.42433C6.62505 35 4.34987 32.7094 4.34987 29.8966V16.0414H0V11.6667H4.34987V5.10341C4.34987 4.69533 4.03106 4.3747 3.6253 4.3747H0V0H3.6253C6.42458 0 8.69976 2.29058 8.69976 5.10341V11.6667H13.0496V16.0414H8.69976V29.8942C8.69976 30.3022 9.01857 30.6229 9.42433 30.6229H13.7742C19.7761 30.6229 24.6501 25.7235 24.6501 19.6849V16.7701C24.6501 16.362 24.3313 16.0414 23.9255 16.0414H18.8511V11.6667H23.9255C26.7248 11.6667 29 13.9548 29 16.7701Z"
      fill={color}
    />
  </Svg>
);

const SyncIcon = ({ color = '#00C897', size = 18 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M23 4v6h-6"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M1 20v-6h6"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── HomeScreen ───────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [activeAccount, setActiveAccount] = useState(0);
  const [sheetVisible, setSheetVisible] = useState(false);
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const { biometricStatus, isLoading: bioLoading, fetchStatus } = useBiometricStatus();

  // Fetch biometric status on mount
  useEffect(() => {
    fetchStatus();
  }, []);

  // Check if verification is needed
  const needsVerification =
    !bioLoading &&
    biometricStatus &&
    (!biometricStatus.idVerified ||
      !biometricStatus.addressVerified ||
      !biometricStatus.faceVerified);

  // Get the next verification step
  const getNextVerificationRoute = () => {
    if (!biometricStatus) return null;

    // Check in order: ID → Address → Face
    if (!biometricStatus.idVerified) {
      return '/kyc/select-id-type';
    }
    if (!biometricStatus.addressVerified) {
      return '/kyc/address-roles';
    }
    if (!biometricStatus.faceVerified) {
      return '/kyc/facial-recognition';
    }
    return null;
  };

  const handleVerifyPress = () => {
    const route = getNextVerificationRoute();
    if (route) {
      router.push(route as any);
    }
  };

  const openSheet = () => {
    setSheetVisible(true);
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  const closeSheet = () => {
    Animated.timing(translateY, {
      toValue: SHEET_HEIGHT,
      duration: 260,
      useNativeDriver: true,
    }).start(() => setSheetVisible(false));
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) translateY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 80) closeSheet();
        else Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
      },
    })
  ).current;

  console.log('biometricStatus', biometricStatus);

  return (
    <View style={{ flex: 1, backgroundColor: '#00C897' }}>
      {/* ── GREEN HEADER ─────────────────────────────────────────── */}
      <View style={{ paddingTop: insets.top }} className="px-5 pb-5">
        {/* Row 1 — Greeting + Bell */}
        <View className="mb-1 mt-3 flex-row items-start justify-between">
          <View>
            <Text className="text-[24px] font-extrabold leading-7 text-[#0D2B1E]">
              Hi, Welcome Back
            </Text>
            <Text className="mt-0.5 text-[13px] text-[#0D2B1E]/70">Good Morning</Text>
          </View>
          <TouchableOpacity
            className="h-[42px] w-[42px] items-center justify-center rounded-full bg-[#DFF7E2]"
            activeOpacity={0.8}>
            <NotificationIcon color="#093030" size={16} />
          </TouchableOpacity>
        </View>

        {/* Row 2 — Account + Switcher */}
        <View className="mb-4 mt-4 flex-row items-center justify-between">
          <View>
            <Text className="text-[12px] text-[#0D2B1E]/60">Account</Text>
            <Text className="text-[16px] font-bold text-[#0D2B1E]">172*****6987</Text>
          </View>
          <TouchableOpacity
            onPress={openSheet}
            activeOpacity={0.8}
            className="flex-row items-center gap-3">
            <View className="h-[38px] w-[38px] items-center justify-center">
              <RoundBDTIcon color="#FFFFFF" size={38} />
            </View>
            <View className="h-6 w-[1px] bg-white/40" />
            <View className="h-[38px] w-[38px] items-center justify-center">
              <BankAccountIcon color="#FFFFFF" size={38} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Row 3 — Total Loan | Total Due Loan */}
        <View className="mb-5 flex-row items-start">
          <View className="flex-1 pr-4">
            <View className="mb-1 flex-row items-center gap-1">
              <TotalLoanIcon color="#052224" size={12} />
              <Text className="text-[12px] text-[#0D2B1E]/70">Total Loan</Text>
            </View>
            <Text className="text-[26px] font-extrabold leading-8 text-[#0D2B1E]">৳7,783.00</Text>
          </View>
          <View className="w-[1px] self-stretch bg-[#0D2B1E]/20" />
          <View className="flex-1 pl-4">
            <View className="mb-1 flex-row items-center gap-1">
              <TotalDueLoanIcon color="#052224" size={12} />
              <Text className="text-[12px] text-[#0D2B1E]/70">Total Due Loan</Text>
            </View>
            <Text className="text-[26px] font-extrabold leading-8 text-red-400">-৳1,187.40</Text>
          </View>
        </View>

        {/* Row 4 — Progress bar */}
        <View className="flex-row items-center gap-2">
          <View className="h-[30px] flex-1 flex-row items-center rounded-full bg-[#0D2B1E] px-3">
            <Text className="mr-2 text-[12px] font-bold text-white">30%</Text>
            <View className="h-[5px] flex-1 rounded-full bg-white/20">
              <View className="h-full w-[30%] rounded-full bg-white" />
            </View>
          </View>
          <View className="h-[30px] items-center justify-center rounded-full border border-[#0D2B1E]/25 px-3">
            <Text className="text-[12px] font-semibold text-[#0D2B1E]">৳ 20,000.00</Text>
          </View>
        </View>
      </View>

      {/* ── WHITE CARD ───────────────────────────────────────────── */}
      <View className="flex-1 rounded-tl-[40px] rounded-tr-[40px] bg-[#F0FFF4] px-4 pt-6">
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Verification Banner - Show if any verification is needed */}
          {needsVerification && (
            <View className="mb-4 rounded-2xl bg-gradient-to-r from-[#FFF8E1] to-[#FFE8B8] p-4 shadow-sm">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="mb-1 text-[15px] font-bold text-[#1A1A1A]">
                    Complete Your Verification
                  </Text>
                  <Text className="text-[13px] text-[#666]">
                    {(!biometricStatus?.idVerified && 'Verify your ID to continue') ||
                      (!biometricStatus?.addressVerified && 'Verify your address to continue') ||
                      (!biometricStatus?.faceVerified &&
                        'Complete facial recognition to continue') ||
                      'Complete verification to access all features'}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleVerifyPress}
                  activeOpacity={0.8}
                  className="ml-3 h-[44px] items-center justify-center rounded-full bg-[#00C897] px-5">
                  <Text className="text-[14px] font-bold text-white">Verify</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Loan Goals + Next Payment */}
          <View className="mb-4 flex-row items-stretch rounded-[22px] bg-[#00C897] p-4">
            {/* Left — Circular gauge */}
            <View className="mr-4 items-center justify-center">
              <View className="h-[82px] w-[82px] items-center justify-center rounded-full border-4 border-white/20">
                <View
                  className="h-[66px] w-[66px] items-center justify-center rounded-full"
                  style={{
                    borderWidth: 4,
                    borderTopColor: 'rgba(255,255,255,0.15)',
                    borderRightColor: 'rgba(255,255,255,0.15)',
                    borderBottomColor: '#5B8DEF',
                    borderLeftColor: '#5B8DEF',
                    transform: [{ rotate: '45deg' }],
                  }}>
                  <View style={{ transform: [{ rotate: '-45deg' }] }}>
                    <BDTSymbolIcon color="white" size={20} />
                  </View>
                </View>
              </View>
              <Text className="mt-2 text-[12px] font-semibold text-white">Loan Goals</Text>
            </View>

            {/* Divider */}
            <View className="mx-2 w-[1px] self-stretch bg-white/25" />

            {/* Right — Next Payment */}
            <View className="flex-1 justify-center pl-2">
              <View className="mb-2 flex-row items-center gap-2">
                <NextLoanIcon size={24} />
                <Text className="text-[12px] text-white/80">Next Loan Payment</Text>
              </View>
              <Text className="mb-3 text-[22px] font-extrabold text-white">৳4,000.00</Text>
              <View className="mb-3 h-[1px] w-full bg-white/20" />
              <View className="flex-row items-center gap-2">
                <DateIcon size={22} />
                <Text className="text-[13px] font-semibold text-white">7th December 2026</Text>
              </View>
            </View>
          </View>

          {/* Make a loan */}
          <View className="rounded-[22px] bg-[#00C897] p-5">
            <Text className="mb-1 text-[18px] font-extrabold text-[#0D2B1E]">Make a loan</Text>
            <Text className="mb-5 text-[13px] leading-5 text-[#0D2B1E]/70">
              {`we are ready to help you for your awesome work. let's invest there.`}
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              className="h-[36px] items-center justify-center self-start rounded-full bg-white px-5">
              <Text className="text-[13px] font-semibold text-[#1A1A1A]">Create Application</Text>
            </TouchableOpacity>
          </View>

          <View className="h-6" />
        </ScrollView>
      </View>

      {/* ── ACCOUNT SWITCH BOTTOM SHEET ──────────────────────────── */}
      <Modal visible={sheetVisible} transparent animationType="none">
        <TouchableOpacity className="flex-1 bg-black/40" activeOpacity={1} onPress={closeSheet} />
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: SHEET_HEIGHT,
            transform: [{ translateY }],
            backgroundColor: 'white',
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            paddingBottom: insets.bottom + 16,
          }}>
          {/* Drag handle */}
          <View {...panResponder.panHandlers} className="items-center pb-4 pt-3">
            <View className="h-1 w-10 rounded-full bg-[#E0E0E0]" />
          </View>

          <View className="px-5">
            <Text className="mb-4 text-[18px] font-bold text-[#1A1A1A]">My Accounts</Text>

            {/* Sync row */}
            <View className="mb-4 h-[46px] flex-row items-center gap-2 rounded-xl bg-[#F5F5F5] px-4">
              <SyncIcon color="#00C897" size={17} />
              <Text className="flex-1 text-[13px] text-[#555]">
                Tap to see recent added accounts
              </Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text className="text-[13px] font-bold text-[#00C897]">Sync</Text>
              </TouchableOpacity>
            </View>

            {/* Account list */}
            {ACCOUNTS.map((acc, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => {
                  setActiveAccount(i);
                  closeSheet();
                }}
                activeOpacity={0.8}
                className={`mb-3 h-[64px] flex-row items-center justify-between rounded-2xl px-4 ${
                  activeAccount === i ? 'border border-[#00C897] bg-[#E4F7EE]' : 'bg-[#F9F9F9]'
                }`}>
                <View>
                  <Text className="text-[15px] font-bold text-[#1A1A1A]">{acc.type}</Text>
                  <Text className="text-[13px] text-[#888]">{acc.number}</Text>
                </View>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M9 18l6-6-6-6"
                    stroke={activeAccount === i ? '#00C897' : '#CCC'}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </Modal>
    </View>
  );
}
