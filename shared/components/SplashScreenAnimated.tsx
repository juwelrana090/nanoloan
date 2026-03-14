import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { splashLogo } from '@/shared/constants/images';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

// ── Floating orb ─────────────────────────────────────────────────────────────
interface OrbProps {
  size: number;
  color: string;
  initialX: number;
  initialY: number;
  delay: number;
  duration: number;
}

function FloatingOrb({ size, color, initialX, initialY, delay, duration }: OrbProps) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(0.6, { duration: 800 }));
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-24, { duration, easing: Easing.inOut(Easing.ease) }),
          withTiming(24, { duration, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        animStyle,
        {
          position: 'absolute',
          left: initialX,
          top: initialY,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
      ]}
    />
  );
}

// ── Animated ring ─────────────────────────────────────────────────────────────
function PulsingRing({ delay }: { delay: number }) {
  const scale = useSharedValue(0.6);
  const ringOpacity = useSharedValue(0);

  useEffect(() => {
    ringOpacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(withTiming(0.35, { duration: 900 }), withTiming(0, { duration: 900 })),
        -1,
        false
      )
    );
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.6, { duration: 1800, easing: Easing.out(Easing.quad) }),
          withTiming(0.6, { duration: 0 })
        ),
        -1,
        false
      )
    );
  }, []);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: ringOpacity.value,
  }));

  return (
    <Animated.View
      style={[
        ringStyle,
        {
          position: 'absolute',
          width: 180,
          height: 180,
          borderRadius: 90,
          borderWidth: 2,
          borderColor: '#0DB7AF',
        },
      ]}
    />
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function SplashScreenAnimated() {
  const insets = useSafeAreaInsets();

  // Logo bounce-in
  const logoScale = useSharedValue(0.3);
  const logoOpacity = useSharedValue(0);

  // App name slide + fade
  const titleTranslateY = useSharedValue(30);
  const titleOpacity = useSharedValue(0);

  // Tagline
  const tagOpacity = useSharedValue(0);

  // Bottom loader bar
  const loaderWidth = useSharedValue(0);

  useEffect(() => {
    // Logo pops in
    logoScale.value = withTiming(1, {
      duration: 700,
      easing: Easing.out(Easing.back(1.6)),
    });
    logoOpacity.value = withTiming(1, { duration: 600 });

    // Title slides up after logo
    titleTranslateY.value = withDelay(
      500,
      withTiming(0, { duration: 600, easing: Easing.out(Easing.quad) })
    );
    titleOpacity.value = withDelay(500, withTiming(1, { duration: 600 }));

    // Tagline fades in
    tagOpacity.value = withDelay(900, withTiming(1, { duration: 600 }));

    // Loader bar fills up
    loaderWidth.value = withDelay(
      800,
      withTiming(width * 0.55, { duration: 1400, easing: Easing.out(Easing.quad) })
    );
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const titleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: titleTranslateY.value }],
    opacity: titleOpacity.value,
  }));

  const tagStyle = useAnimatedStyle(() => ({ opacity: tagOpacity.value }));

  const loaderStyle = useAnimatedStyle(() => ({ width: loaderWidth.value }));

  return (
    <LinearGradient
      colors={['#0A0C2A', '#0D178F', '#0A0C2A']}
      locations={[0, 0.5, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}>
      <StatusBar style="light" backgroundColor="#0A0C2A" translucent={false} />
      {/* Background decorative orbs */}
      <FloatingOrb
        size={220}
        color="#0D178F"
        initialX={-80}
        initialY={-60}
        delay={0}
        duration={3200}
      />
      <FloatingOrb
        size={160}
        color="#0DB7AF"
        initialX={width - 120}
        initialY={height - 280}
        delay={400}
        duration={2800}
      />
      <FloatingOrb
        size={100}
        color="#1A2FA0"
        initialX={width - 60}
        initialY={120}
        delay={200}
        duration={3600}
      />
      <FloatingOrb
        size={80}
        color="#0DB7AF"
        initialX={40}
        initialY={height - 200}
        delay={600}
        duration={3000}
      />

      {/* Centre content */}
      <View style={styles.centre}>
        {/* Pulsing rings behind logo */}
        <PulsingRing delay={700} />
        <PulsingRing delay={1300} />

        {/* Logo */}
        <Animated.View style={[styles.logoContainer, logoStyle]}>
          <Image source={splashLogo} style={styles.logo} resizeMode="contain" />
        </Animated.View>

        {/* App name */}
        <Animated.Text style={[styles.title, titleStyle]}>NanoLoan</Animated.Text>

        {/* Tagline */}
        <Animated.Text style={[styles.tagline, tagStyle]}>Fast · Secure · Flexible</Animated.Text>
      </View>

      {/* Bottom progress bar */}
      <Animated.View style={[styles.loaderTrack, { bottom: 80 + insets.bottom }]}>
        <Animated.View style={[styles.loaderBar]}>
          <Animated.View style={[styles.loaderFill, loaderStyle]} />
        </Animated.View>
        <Animated.Text entering={FadeIn.delay(900).duration(600)} style={styles.loadingText}>
          Loading…
        </Animated.Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centre: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    shadowColor: '#0DB7AF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 24,
    elevation: 20,
    marginBottom: 28,
  },
  logoGradientBg: {
    width: 120,
    height: 120,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  logo: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 38,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    textShadowColor: '#0DB7AF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  tagline: {
    fontSize: 14,
    color: '#7DD8D4',
    letterSpacing: 3,
    marginTop: 10,
    fontWeight: '500',
  },
  loaderTrack: {
    position: 'absolute',
    bottom: 80,
    alignItems: 'center',
  },
  loaderBar: {
    width: width * 0.55,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  loaderFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#0DB7AF',
    shadowColor: '#0DB7AF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  loadingText: {
    marginTop: 12,
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
    letterSpacing: 2,
  },
});
