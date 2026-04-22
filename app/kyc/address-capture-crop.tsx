import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  PanResponder,
  Animated,
  Image as RNImage,
  StyleSheet,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useRef, useEffect, useMemo } from 'react';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { useDispatch } from 'react-redux';
import { setAddressImage } from '@/shared/libs/redux/features/kyc/kycSlice';
import Svg, { Path, Line, Rect } from 'react-native-svg';

const { width: SW, height: SH } = Dimensions.get('window');

const HANDLE_SIZE = 44;
const HANDLE_VIS = 24;
const MIN_CROP = 120;
const ACCENT = '#00C897';

const INIT = {
  x: 24,
  y: 110,
  w: SW - 48,
  h: SH - 300,
};

type CornerPos = 'tl' | 'tr' | 'bl' | 'br';

// ─── CornerHandle ─────────────────────────────────────────────────────────────

interface CornerHandleProps {
  pos: CornerPos;
  x: number;
  y: number;
  panHandlers: object;
  pulse: Animated.Value;
}

function CornerHandle({ pos, x, y, panHandlers, pulse }: CornerHandleProps) {
  const hs = HANDLE_SIZE;
  const vs = HANDLE_VIS;
  const t = hs / 2;
  const isLeft = pos === 'tl' || pos === 'bl';
  const isTop = pos === 'tl' || pos === 'tr';

  const hx1 = isLeft ? vs : 0;
  const hx2 = vs / 2;
  const hy = vs / 2;
  const vx = vs / 2;
  const vy1 = isTop ? vs : 0;
  const vy2 = vs / 2;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: hs,
        height: hs,
        left: x - t,
        top: y - t,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ scale: pulse }],
        zIndex: 20,
      }}
      {...panHandlers}>
      <Svg width={vs} height={vs} viewBox={`0 0 ${vs} ${vs}`}>
        <Rect x={0} y={0} width={vs} height={vs} fill={ACCENT} opacity={0.18} rx={3} />
        <Line
          x1={hx1}
          y1={hy}
          x2={hx2}
          y2={hy}
          stroke="#fff"
          strokeWidth={3}
          strokeLinecap="round"
        />
        <Line
          x1={vx}
          y1={vy1}
          x2={vx}
          y2={vy2}
          stroke="#fff"
          strokeWidth={3}
          strokeLinecap="round"
        />
        <Rect x={vs / 2 - 3} y={vs / 2 - 3} width={6} height={6} rx={3} fill={ACCENT} />
      </Svg>
    </Animated.View>
  );
}

// ─── GridLines ────────────────────────────────────────────────────────────────

function GridLines({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <View pointerEvents="none" className="absolute inset-0">
      {[1, 2].map((i) => (
        <View
          key={`v${i}`}
          style={{ position: 'absolute', left: x + (w / 3) * i, top: y, width: 1, height: h }}
          className="bg-white/20"
        />
      ))}
      {[1, 2].map((i) => (
        <View
          key={`h${i}`}
          style={{ position: 'absolute', left: x, top: y + (h / 3) * i, width: w, height: 1 }}
          className="bg-white/20"
        />
      ))}
    </View>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const ResetIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"
      stroke="#fff"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M3 3v5h5" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const SkipIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 12h14M15 6l6 6-6 6"
      stroke="#fff"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function AddressCaptureCropScreen() {
  const { uri } = useLocalSearchParams<{ uri: string }>();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

  const [cropping, setCropping] = useState(false);
  const [crop, setCrop] = useState({ x: INIT.x, y: INIT.y, w: INIT.w, h: INIT.h });

  // ── cropRef: always holds the latest crop so pan responders never go stale ─
  const cropRef = useRef(crop);
  useEffect(() => {
    cropRef.current = crop;
  }, [crop]);

  // ── Animations ────────────────────────────────────────────────────────────
  const scanAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(scanAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // ── Pan responders (created ONCE via useRef — never recreated) ─────────────
  //    Each responder reads cropRef.current on grant so it always gets the
  //    latest position without needing crop in its dependency array.

  const startTL = useRef({ x: 0, y: 0, w: 0, h: 0 });
  const startTR = useRef({ x: 0, y: 0, w: 0, h: 0 });
  const startBL = useRef({ x: 0, y: 0, w: 0, h: 0 });
  const startBR = useRef({ x: 0, y: 0, w: 0, h: 0 });
  const startBody = useRef({ x: 0, y: 0, w: 0, h: 0 });

  const prTL = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startTL.current = { ...cropRef.current };
      },
      onPanResponderMove: (_, { dx, dy }) => {
        const s = startTL.current;
        setCrop({
          x: Math.max(0, s.x + dx),
          y: Math.max(80, s.y + dy),
          w: Math.max(MIN_CROP, s.w - dx),
          h: Math.max(MIN_CROP, s.h - dy),
        });
      },
    })
  ).current;

  const prTR = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startTR.current = { ...cropRef.current };
      },
      onPanResponderMove: (_, { dx, dy }) => {
        const s = startTR.current;
        setCrop({
          x: s.x,
          y: Math.max(80, s.y + dy),
          w: Math.max(MIN_CROP, s.w + dx),
          h: Math.max(MIN_CROP, s.h - dy),
        });
      },
    })
  ).current;

  const prBL = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startBL.current = { ...cropRef.current };
      },
      onPanResponderMove: (_, { dx, dy }) => {
        const s = startBL.current;
        setCrop({
          x: Math.max(0, s.x + dx),
          y: s.y,
          w: Math.max(MIN_CROP, s.w - dx),
          h: Math.max(MIN_CROP, s.h + dy),
        });
      },
    })
  ).current;

  const prBR = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startBR.current = { ...cropRef.current };
      },
      onPanResponderMove: (_, { dx, dy }) => {
        const s = startBR.current;
        setCrop({
          x: s.x,
          y: s.y,
          w: Math.max(MIN_CROP, s.w + dx),
          h: Math.max(MIN_CROP, s.h + dy),
        });
      },
    })
  ).current;

  const prBody = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startBody.current = { ...cropRef.current };
      },
      onPanResponderMove: (_, { dx, dy }) => {
        const s = startBody.current;
        setCrop({
          x: Math.max(0, Math.min(SW - s.w, s.x + dx)),
          y: Math.max(80, Math.min(SH - s.h - 120, s.y + dy)),
          w: s.w,
          h: s.h,
        });
      },
    })
  ).current;

  // ── Crop action ────────────────────────────────────────────────────────────
  const handleCrop = async () => {
    setCropping(true);
    try {
      const [imgW, imgH] = await new Promise<number[]>((resolve, reject) => {
        RNImage.getSize(uri, (w, h) => resolve([w, h]), reject);
      });

      const scaleX = imgW / SW;
      const scaleY = imgH / SH;
      const c = cropRef.current;

      const result = await manipulateAsync(
        uri,
        [
          {
            crop: {
              originX: Math.max(0, Math.round(c.x * scaleX)),
              originY: Math.max(0, Math.round(c.y * scaleY)),
              width: Math.min(imgW, Math.round(c.w * scaleX)),
              height: Math.min(imgH, Math.round(c.h * scaleY)),
            },
          },
        ],
        { compress: 0.92, format: SaveFormat.JPEG }
      );

      dispatch(setAddressImage(result.uri));
      router.push({ pathname: '/kyc/address-capture-preview', params: { uri: result.uri } });
    } catch (err) {
      console.error('Crop error:', err);
      dispatch(setAddressImage(uri));
      router.push({ pathname: '/kyc/address-capture-preview', params: { uri } });
    } finally {
      setCropping(false);
    }
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const { x, y, w, h } = crop;
  const right = x + w;
  const bottom = y + h;

  const scanY = useMemo(
    () => scanAnim.interpolate({ inputRange: [0, 1], outputRange: [y, bottom - 2] }),
    [y, bottom]
  );

  // ──────────────────────────────────────────────────────────────────────────

  return (
    <View className="flex-1 bg-black">
      {/* ── Background image: must use style prop for dimensions ── */}
      <Image source={{ uri }} style={StyleSheet.absoluteFillObject} contentFit="cover" />

      {/* ── Dark vignette outside crop ── */}
      <View
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: y }}
        className="bg-black/55"
        pointerEvents="none"
      />
      <View
        style={{ position: 'absolute', top: bottom, left: 0, right: 0, bottom: 0 }}
        className="bg-black/55"
        pointerEvents="none"
      />
      <View
        style={{ position: 'absolute', top: y, left: 0, width: x, height: h }}
        className="bg-black/55"
        pointerEvents="none"
      />
      <View
        style={{ position: 'absolute', top: y, left: right, right: 0, height: h }}
        className="bg-black/55"
        pointerEvents="none"
      />

      {/* ── Crop border ── */}
      <View
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: w,
          height: h,
          borderWidth: 1.5,
          borderColor: 'rgba(255,255,255,0.55)',
        }}
        pointerEvents="none"
      />

      {/* ── Grid ── */}
      <GridLines x={x} y={y} w={w} h={h} />

      {/* ── Scan line ── */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: x + 1,
          width: w - 2,
          height: 2,
          backgroundColor: ACCENT,
          opacity: 0.7,
          transform: [{ translateY: scanY }],
        }}
      />

      {/* ── Body drag zone ── */}
      <View
        style={{ position: 'absolute', left: x + 30, top: y + 30, width: w - 60, height: h - 60 }}
        {...prBody.panHandlers}
      />

      {/* ── Corner handles ── */}
      <CornerHandle pos="tl" x={x} y={y} panHandlers={prTL.panHandlers} pulse={pulseAnim} />
      <CornerHandle pos="tr" x={right} y={y} panHandlers={prTR.panHandlers} pulse={pulseAnim} />
      <CornerHandle pos="bl" x={x} y={bottom} panHandlers={prBL.panHandlers} pulse={pulseAnim} />
      <CornerHandle
        pos="br"
        x={right}
        y={bottom}
        panHandlers={prBR.panHandlers}
        pulse={pulseAnim}
      />

      {/* ── Dimension badge ── */}
      <View
        pointerEvents="none"
        style={{ position: 'absolute', left: x + w / 2 - 36, top: y - 28 }}
        className="rounded-lg bg-black/65 px-3 py-1">
        <Text className="text-[11px] font-semibold tracking-wide text-white">
          {Math.round(w)} × {Math.round(h)}
        </Text>
      </View>

      {/* ══════════════════════════════════════
          TOP BAR
      ══════════════════════════════════════ */}
      <View
        style={{ paddingTop: insets.top + 10 }}
        className="absolute left-0 right-0 top-0 z-30 flex-row items-center justify-between bg-black/55 px-4 pb-3">
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          className="min-w-[72px]">
          <Text className="text-[15px] font-medium text-white/80">Cancel</Text>
        </TouchableOpacity>

        <View className="items-center">
          <Text className="text-[16px] font-bold tracking-wide text-white">Crop Document</Text>
          <Text className="mt-0.5 text-[11px] text-white/55">Drag corners to adjust</Text>
        </View>

        <TouchableOpacity
          onPress={handleCrop}
          disabled={cropping}
          activeOpacity={0.7}
          className={`min-w-[72px] items-center rounded-full px-5 py-2 ${
            cropping ? 'bg-[#00C897]/50' : 'bg-[#00C897]'
          }`}>
          {cropping ? (
            <ActivityIndicator color="#000" size="small" />
          ) : (
            <Text className="text-[15px] font-bold text-white">Done</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* ══════════════════════════════════════
          BOTTOM TOOLBAR
      ══════════════════════════════════════ */}
      <View
        style={{ paddingBottom: insets.bottom + 12 }}
        className="absolute bottom-0 left-0 right-0 z-30 flex-row items-center justify-between bg-black/70 px-6 pt-4">
        <TouchableOpacity
          onPress={() => setCrop({ x: INIT.x, y: INIT.y, w: INIT.w, h: INIT.h })}
          activeOpacity={0.7}
          className="min-w-[56px] items-center">
          <ResetIcon />
          <Text className="mt-1.5 text-[11px] font-medium text-white/75">Reset</Text>
        </TouchableOpacity>

        <View className="rounded-full border border-white/15 bg-white/10 px-4 py-1.5">
          <Text className="text-center text-[11px] text-white/65">
            Drag corners · Move to reposition
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => {
            dispatch(setAddressImage(uri));
            router.push({ pathname: '/kyc/address-capture-preview', params: { uri } });
          }}
          activeOpacity={0.7}
          className="min-w-[56px] items-center">
          <SkipIcon />
          <Text className="mt-1.5 text-[11px] font-medium text-white/75">Skip</Text>
        </TouchableOpacity>
      </View>

      {/* ── Loading overlay ── */}
      {cropping && (
        <View className="absolute inset-0 z-50 items-center justify-center bg-black/60">
          <View className="items-center rounded-2xl border border-white/10 bg-[#1A1A1A] px-10 py-7">
            <ActivityIndicator size="large" color={ACCENT} />
            <Text className="mt-3 text-[15px] font-semibold text-white">Cropping…</Text>
          </View>
        </View>
      )}
    </View>
  );
}
