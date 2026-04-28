import { View, Text, TouchableOpacity, ActivityIndicator, Animated, Easing } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useAppDispatch, useAppSelector } from '@/shared/hooks/useAppSelector';
import { setIsAuthenticated } from '@/shared/libs/redux/features/auth/authSlice';
import { useLazyGetBiometricStatusQuery } from '@/shared/libs/redux/features/auth/authApi';
import { useEffect, useState, useRef } from 'react';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const AnimatedCheckmarkIcon = ({ progress }: { progress: Animated.Value }) => {
  const pathLength = 24;

  return (
    <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
      <AnimatedPath
        d="M20 6L9 17L4 12"
        stroke="white"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={pathLength}
        strokeDashoffset={
          progress.interpolate({
            inputRange: [0, 1],
            outputRange: [pathLength, 0],
          }) as any
        }
      />
    </Svg>
  );
};

const OrbitRing = ({
  delay = 0,
  color = '#00C897',
  size = 130,
}: {
  delay?: number;
  color?: string;
  size?: number;
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.6,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ]);

    animation.start();

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    setTimeout(() => pulseAnimation.start(), delay + 800);

    return () => {
      animation.stop();
      pulseAnimation.stop();
    };
  }, [delay, scaleAnim, opacityAnim]);

  return (
    <Animated.View
      className={`absolute rounded-full border-2`}
      style={{
        width: size,
        height: size,
        borderColor: color,
        opacity: opacityAnim,
        transform: [{ scale: scaleAnim }],
      }}
    />
  );
};

const AnimatedDot = ({
  delay = 0,
  color = '#00C897',
  size = 8,
  top,
  right,
  bottom,
  left,
}: {
  delay?: number;
  color?: string;
  size?: number;
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.6,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]);

    animation.start();

    return () => animation.stop();
  }, [delay, scaleAnim, opacityAnim]);

  return (
    <Animated.View
      className={`absolute rounded-full`}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        top,
        right,
        bottom,
        left,
        opacity: opacityAnim,
        transform: [{ scale: scaleAnim }],
      }}
    />
  );
};

export default function VerifiedDoneScreen() {
  const insets = useSafeAreaInsets();

  const dispatch = useAppDispatch();
  const [getBiometricStatus, { isLoading }] = useLazyGetBiometricStatusQuery();

  const [verificationStatus, setVerificationStatus] = useState<
    'verified' | 'pending' | 'failed' | null
  >(null);

  // Animation values
  const checkmarkProgress = useRef(new Animated.Value(0)).current;
  const badgeScale = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(20)).current;
  const buttonScale = useRef(new Animated.Value(0.8)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;

  // Check verification status on mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await getBiometricStatus().unwrap();
        console.log('📊 Biometric status response:', response);

        const { idVerified, addressVerified, faceVerified } = response.data;

        if (idVerified && addressVerified && faceVerified) {
          setVerificationStatus('verified');
        } else if (idVerified === false || addressVerified === false || faceVerified === false) {
          setVerificationStatus('failed');
        } else {
          setVerificationStatus('pending');
        }
      } catch (error) {
        console.error('❌ Error checking verification status:', error);
        setVerificationStatus('pending');
      }
    };

    checkStatus();
  }, [getBiometricStatus]);

  // Trigger animations when status is determined
  useEffect(() => {
    if (verificationStatus !== null && !isLoading) {
      const successAnimation = Animated.sequence([
        Animated.timing(badgeScale, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
        Animated.timing(checkmarkProgress, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.parallel([
          Animated.timing(textOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(textTranslateY, {
            toValue: 0,
            duration: 400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(buttonOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(buttonScale, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }),
        ]),
      ]);

      successAnimation.start();

      return () => successAnimation.stop();
    }
  }, [
    verificationStatus,
    isLoading,
    badgeScale,
    checkmarkProgress,
    textOpacity,
    textTranslateY,
    buttonScale,
    buttonOpacity,
  ]);

  const handleDone = () => {
    dispatch(setIsAuthenticated(true));
    router.replace('/(tabs)');
  };

  const handleReverify = () => {
    router.push('/kyc/started');
  };

  const isVerified = verificationStatus === 'verified';
  const accentColor = isVerified ? '#00C897' : '#EF5350';

  return (
    <View
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom + 16 }}
      className="flex-1 items-center justify-between bg-[#F0FFF4] px-8">
      {isLoading || verificationStatus === null ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#00C897" />
          <Text className="mt-4 text-[14px] text-[#888]">Checking verification status...</Text>
        </View>
      ) : (
        <>
          <View className="flex-1 items-center justify-center">
            {/* Verified badge illustration */}
            <Animated.View
              className="relative mb-8 h-[140px] w-[140px] items-center justify-center"
              style={{ transform: [{ scale: badgeScale }] }}>
              {/* Animated orbit rings */}
              <OrbitRing delay={200} size={130} color={isVerified ? '#C8E6C9' : '#FFCDD2'} />
              <OrbitRing delay={400} size={100} color={isVerified ? '#A5D6A7' : '#EF9A9A'} />

              {/* Shield with animated checkmark */}
              <View
                style={{ backgroundColor: accentColor }}
                className="h-[72px] w-[72px] items-center justify-center rounded-full shadow-lg">
                <AnimatedCheckmarkIcon progress={checkmarkProgress} />
              </View>

              {/* Animated decorative dots */}
              <AnimatedDot delay={600} size={8} color={accentColor} top={8} right={16} />
              <AnimatedDot delay={700} size={6} color="#A5D6A7" bottom={12} left={12} />
              <AnimatedDot delay={800} size={4} color="#C8E6C9" top={24} left={8} />
            </Animated.View>

            {/* Animated text */}
            <Animated.View
              style={{ opacity: textOpacity, transform: [{ translateY: textTranslateY }] }}>
              <Text
                style={{ color: isVerified ? '#1A1A1A' : '#EF5350' }}
                className="mb-3 text-center text-[28px] font-bold">
                {isVerified ? 'Verified' : 'Verification Pending'}
              </Text>

              <Text className="text-center text-[14px] leading-5 text-[#888]">
                {isVerified
                  ? "You currently have access to all of VAEX's\nfeatures and high limits"
                  : 'Your verification is still in progress.\nPlease complete all required steps.'}
              </Text>
            </Animated.View>
          </View>

          {/* Animated button */}
          <Animated.View
            className="w-full"
            style={{
              opacity: buttonOpacity,
              transform: [{ scale: buttonScale }],
            }}>
            <TouchableOpacity
              onPress={isVerified ? handleDone : handleReverify}
              activeOpacity={0.85}
              style={{
                height: 58,
                borderRadius: 16,
                backgroundColor: accentColor,
                shadowColor: accentColor,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.35,
                shadowRadius: 12,
                elevation: 10,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                paddingHorizontal: 32,
              }}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                {isVerified ? (
                  <Path
                    d="M5 12h14M13 6l6 6-6 6"
                    stroke="white"
                    strokeWidth={2.2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ) : (
                  <Path
                    d="M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"
                    stroke="white"
                    strokeWidth={2.2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </Svg>
              <Text style={{ fontSize: 17, fontWeight: '700', color: 'white', letterSpacing: 0.3 }}>
                {isVerified ? 'Continue to Dashboard' : 'Re-Verification'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </>
      )}
    </View>
  );
}
