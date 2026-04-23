/**
 * facial-recognition.tsx
 *
 * Working facial recognition screen for expo-camera SDK 54+:
 *  - Manual capture with visual oval guide for face positioning
 *  - Post-capture face validation using expo-face-detector
 *  - Rejects non-face images automatically
 *  - Clean, working implementation compatible with current expo-camera
 */

import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';
import * as FaceDetector from 'expo-face-detector';
import { useRef, useState, useCallback } from 'react';
import { Image } from 'expo-image';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { useDispatch } from 'react-redux';
import { setFaceImage } from '@/shared/libs/redux/features/kyc/kycSlice';
import { useFaceVerifyMutation } from '@/shared/libs/redux/features/auth/authApi';
import Svg, { Path, Ellipse } from 'react-native-svg';

const { width: SW, height: SH } = Dimensions.get('window');

// Face oval guide dimensions
const OVAL_W = SW * 0.62;
const OVAL_H = OVAL_W * 1.28;
const OVAL_CX = SW / 2;
const OVAL_CY = SH * 0.38;

const ACCENT = '#00C897';

// ─── Status type ──────────────────────────────────────────────────────────────
type Status =
  | 'ready' // camera ready, waiting for user
  | 'capturing' // taking the photo
  | 'validating' // checking if face exists
  | 'success' // done
  | 'no_face'; // captured but no face found

// ─── Status bar color ─────────────────────────────────────────────────────────
function statusColor(s: Status): string {
  switch (s) {
    case 'success':
      return ACCENT;
    case 'no_face':
      return '#EF5350';
    case 'capturing':
    case 'validating':
      return '#FFB300';
    default:
      return 'rgba(255,255,255,0.5)';
  }
}

function statusMessage(s: Status): string {
  switch (s) {
    case 'ready':
      return 'Position your face in the oval';
    case 'capturing':
      return 'Capturing…';
    case 'validating':
      return 'Verifying face…';
    case 'success':
      return 'Face captured successfully';
    case 'no_face':
      return 'Verification failed — please retry';
    default:
      return '';
  }
}

// ─── OvalGuide ────────────────────────────────────────────────────────────────

function OvalGuide({ status }: { status: Status }) {
  const color =
    status === 'success' ? ACCENT : status === 'no_face' ? '#EF5350' : 'rgba(255,255,255,0.4)';

  return (
    <Svg width={SW} height={SH} style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {/* Dark mask outside the oval */}
      <Path
        d={`
          M 0 0 L ${SW} 0 L ${SW} ${SH} L 0 ${SH} Z
          M ${OVAL_CX} ${OVAL_CY}
          m ${-OVAL_W / 2} 0
          a ${OVAL_W / 2} ${OVAL_H / 2} 0 1 0 ${OVAL_W} 0
          a ${OVAL_W / 2} ${OVAL_H / 2} 0 1 0 ${-OVAL_W} 0
        `}
        fill="rgba(0,0,0,0.55)"
        fillRule="evenodd"
      />
      {/* Oval border */}
      <Ellipse
        cx={OVAL_CX}
        cy={OVAL_CY}
        rx={OVAL_W / 2}
        ry={OVAL_H / 2}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeDasharray="8 6"
      />
    </Svg>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function FacialRecognitionScreen() {
  console.log('🎯 FacialRecognitionScreen rendering...');

  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const cameraRef = useRef<any>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [facing] = useState<CameraType>('front');
  const [status, setStatus] = useState<Status>('ready');
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [faceVerifyData, setFaceVerifyData] = useState<{
    confidence: number;
    passed: boolean;
  } | null>(null);

  const [verifyFace, { isLoading: isVerifying }] = useFaceVerifyMutation();

  console.log(
    '📸 Permission state:',
    permission?.granted,
    'Status:',
    status,
    'Camera ready:',
    isCameraReady
  );

  // ── Validate captured image has a face ─────────────────────────────────────
  const validateFaceInImage = async (uri: string): Promise<boolean> => {
    try {
      const result = await FaceDetector.detectFacesAsync(uri, {
        mode: FaceDetector.FaceDetectorMode.fast,
        detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
        runClassifications: FaceDetector.FaceDetectorClassifications.none,
      });

      console.log('Face detection result:', result.faces.length, 'faces found');
      return result.faces.length > 0;
    } catch (error) {
      console.error('Face detection error:', error);
      return false;
    }
  };

  // ── Capture picture with face validation ────────────────────────────────────
  const handleCapture = useCallback(async () => {
    if (!cameraRef.current || !isCameraReady || status === 'capturing' || status === 'validating') {
      console.log(
        'Capture blocked - cameraRef:',
        !!cameraRef.current,
        'isCameraReady:',
        isCameraReady,
        'status:',
        status
      );
      return;
    }

    try {
      console.log('Starting capture...');
      setStatus('capturing');

      // Check if takePictureAsync exists
      if (!cameraRef.current.takePictureAsync) {
        console.error('takePictureAsync not available on cameraRef');
        throw new Error('Camera not ready - takePictureAsync method not found');
      }

      // Take the picture
      console.log('Calling takePictureAsync...');
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.92,
        base64: false,
        skipProcessing: false,
      });

      console.log('Photo captured:', photo);

      if (!photo?.uri) {
        console.error('No photo URI returned:', photo);
        throw new Error('No photo URI returned');
      }

      console.log('Photo URI:', photo.uri);
      setStatus('validating');

      // Validate that the image contains a face
      console.log('Validating face in image...');
      const hasFace = await validateFaceInImage(photo.uri);

      if (!hasFace) {
        console.log('No face detected');
        setStatus('no_face');
        Alert.alert(
          'No Face Detected',
          'We could not detect a human face in the image. Please ensure your face is clearly visible and well-lit.',
          [
            { text: 'Try Again', onPress: () => setStatus('ready') },
            { text: 'Cancel', onPress: () => router.back(), style: 'cancel' },
          ]
        );
        return;
      }

      console.log('Face detected, cropping image...');
      // Face detected - crop to oval area
      const cropSize = Math.round(OVAL_W * 1.1);
      const cropX = Math.round(OVAL_CX - cropSize / 2);
      const cropY = Math.round(OVAL_CY - OVAL_H * 0.6);

      const cropped = await manipulateAsync(
        photo.uri,
        [
          {
            crop: {
              originX: Math.max(0, cropX),
              originY: Math.max(0, cropY),
              width: cropSize,
              height: Math.round(OVAL_H * 1.2),
            },
          },
        ],
        { compress: 0.9, format: SaveFormat.JPEG }
      );

      console.log('Image cropped successfully');
      setCapturedUri(cropped.uri);
      dispatch(setFaceImage(cropped.uri));

      // Call face verification API
      console.log('🔍 Calling face verification API...');
      setStatus('validating');

      try {
        // Prepare face image data object (matches BiometricFaceVerifyRequest type)
        const faceImageData = {
          faceImage: {
            uri: cropped.uri,
            name: 'face.jpg',
            type: 'image/jpeg',
          },
        };

        // Call the face verification API
        const response = await verifyFace(faceImageData as any).unwrap();
        console.log('✅ Face verification response:', response);

        const { confidence, passed } = response.data;
        setFaceVerifyData({ confidence, passed });

        if (passed) {
          console.log(
            `✅ Face verified successfully with ${Math.round(confidence * 100)}% confidence`
          );
          setStatus('success');
        } else {
          console.log(
            `❌ Face verification failed with ${Math.round(confidence * 100)}% confidence (threshold: 80%)`
          );
          setStatus('no_face');
          Alert.alert(
            'Face Verification Failed',
            `Your face could not be verified (${Math.round(confidence * 100)}% confidence). Please ensure your face is clearly visible and well-lit, then try again.`,
            [
              { text: 'Try Again', onPress: () => setStatus('ready') },
              { text: 'Cancel', onPress: () => router.back(), style: 'cancel' },
            ]
          );
        }
      } catch (apiError: any) {
        console.error('❌ Face verification API error:', apiError);
        setStatus('no_face');

        const errorMsg = apiError?.data?.message || 'Face verification failed. Please try again.';
        Alert.alert('Verification Error', errorMsg, [
          { text: 'Try Again', onPress: () => setStatus('ready') },
          { text: 'Cancel', onPress: () => router.back(), style: 'cancel' },
        ]);
      }
    } catch (err: any) {
      console.error('Capture error:', err);
      console.error('Error message:', err?.message);
      console.error('Error stack:', err?.stack);
      setStatus('ready');
      Alert.alert(
        'Capture Failed',
        `Could not capture image: ${err?.message || 'Unknown error'}. Please try again.`,
        [{ text: 'OK' }]
      );
    }
  }, [status, dispatch, isCameraReady, verifyFace]);

  // ── Retry ──────────────────────────────────────────────────────────────────
  const handleRetry = () => {
    setCapturedUri(null);
    setStatus('ready');
  };

  // ── Permissions ────────────────────────────────────────────────────────────
  // Show loading indicator while permissions are being determined
  if (!permission) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator size="large" color="#00C897" />
        <Text className="mt-4 text-white">Loading permissions...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center bg-black px-8">
        <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-[#00C897]/20">
          <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
            <Path
              d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
              stroke={ACCENT}
              strokeWidth={2}
              strokeLinecap="round"
            />
            <Path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke={ACCENT} strokeWidth={2} />
          </Svg>
        </View>
        <Text className="mb-2 text-center text-[20px] font-bold text-white">
          Camera Access Required
        </Text>
        <Text className="mb-8 text-center text-[14px] leading-5 text-white/60">
          We need camera access to verify your identity via facial recognition.
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          activeOpacity={0.8}
          className="h-[52px] items-center justify-center rounded-full bg-[#00C897] px-10">
          <Text className="text-[16px] font-bold text-white">Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Success screen ─────────────────────────────────────────────────────────
  if (status === 'success' && capturedUri) {
    return (
      <View className="flex-1 bg-black">
        {/* Blurred preview */}
        <Image
          source={{ uri: capturedUri }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          blurRadius={8}
        />
        <View className="absolute inset-0 bg-black/60" />

        <View
          style={{ paddingTop: insets.top + 12 }}
          className="absolute left-0 right-0 top-0 z-10 px-5">
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Text className="text-[15px] font-medium text-white/70">← Back</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-1 items-center justify-center px-8">
          {/* Face preview circle */}
          <View className="mb-6 h-[180px] w-[180px] overflow-hidden rounded-full border-4 border-[#00C897]">
            <Image
              source={{ uri: capturedUri }}
              style={{ width: 180, height: 180 }}
              contentFit="cover"
            />
          </View>

          {/* Check badge */}
          <View className="mb-4 h-12 w-12 items-center justify-center rounded-full bg-[#00C897]">
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path
                d="M5 12l5 5L19 7"
                stroke="#fff"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>

          <Text className="mb-2 text-[24px] font-bold text-white">Face Verified</Text>
          <Text className="mb-10 text-center text-[14px] leading-5 text-white/60">
            Your face has been captured and verified successfully
            {faceVerifyData && ` with ${Math.round(faceVerifyData.confidence * 100)}% confidence`}
          </Text>

          <TouchableOpacity
            onPress={() => router.push('/kyc/verified')}
            activeOpacity={0.8}
            className="mb-3 h-[54px] w-full items-center justify-center rounded-full bg-[#00C897]">
            <Text className="text-[17px] font-bold text-white">Continue</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleRetry}
            activeOpacity={0.8}
            className="h-[54px] w-full items-center justify-center rounded-full bg-white/10">
            <Text className="text-[17px] font-semibold text-white/70">Retake</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Camera screen ──────────────────────────────────────────────────────────
  return (
    <View className="flex-1 bg-black">
      {/* Loading indicator while camera initializes */}
      {!isCameraReady && (
        <View className="absolute inset-0 z-30 items-center justify-center bg-black">
          <ActivityIndicator size="large" color="#00C897" />
          <Text className="mt-4 text-white">Initializing camera...</Text>
        </View>
      )}

      {/* Live camera — front facing */}
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFillObject}
        facing={facing}
        onCameraReady={() => {
          console.log('✅ Camera ready!');
          setIsCameraReady(true);
        }}
      />

      {/* Oval mask + guide */}
      <OvalGuide status={status} />

      {/* ── Top bar ── */}
      <View
        style={{ paddingTop: insets.top + 8 }}
        className="absolute left-0 right-0 top-0 z-20 flex-row items-center justify-between px-5 pb-2">
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          className="h-9 w-9 items-center justify-center rounded-full bg-black/40">
          <Text className="text-[18px] font-bold text-white">←</Text>
        </TouchableOpacity>
        <View className="rounded-full bg-black/40 px-4 py-1.5">
          <Text className="text-[13px] font-semibold text-white">Facial Recognition</Text>
        </View>
        <View className="h-9 w-9" />
      </View>

      {/* ── Instruction label (above oval) ── */}
      <View
        style={{ position: 'absolute', top: OVAL_CY - OVAL_H / 2 - 56, left: 0, right: 0 }}
        className="items-center px-6">
        <Text className="text-center text-[15px] font-semibold text-white">
          Position your face in the oval
        </Text>
      </View>

      {/* ── Status pill (below oval) ── */}
      <View
        style={{ position: 'absolute', top: OVAL_CY + OVAL_H / 2 + 20, left: 0, right: 0 }}
        className="items-center px-6">
        <View
          style={{ borderColor: statusColor(status) }}
          className="rounded-full border bg-black/50 px-5 py-2">
          <Text style={{ color: statusColor(status) }} className="text-[13px] font-semibold">
            {statusMessage(status)}
          </Text>
        </View>
      </View>

      {/* ── Bottom area ── */}
      <View
        style={{ paddingBottom: insets.bottom + 16 }}
        className="absolute bottom-0 left-0 right-0 z-10 items-center px-8">
        {/* Shutter button */}
        <TouchableOpacity
          onPress={handleCapture}
          disabled={
            !isCameraReady || status === 'capturing' || status === 'validating' || isVerifying
          }
          activeOpacity={0.8}
          className={`mb-5 h-[72px] w-[72px] items-center justify-center rounded-full border-4 ${
            !isCameraReady || status === 'capturing' || status === 'validating' || isVerifying
              ? 'border-white/30 bg-white/10'
              : 'border-[#00C897] bg-[#00C897]/20'
          }`}>
          {status === 'capturing' || status === 'validating' || isVerifying ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <View className="h-[52px] w-[52px] rounded-full bg-[#00C897]" />
          )}
        </TouchableOpacity>

        {/* Tips */}
        <View className="bg-black-50 w-full rounded-2xl bg-black/50 px-5 py-4">
          <Text className="mb-2 text-[13px] font-semibold text-white">Tips for best results:</Text>
          {[
            'Ensure your face is well-lit with no shadows',
            'Position your face within the oval guide',
            'Keep a neutral expression with eyes open',
            'Remove glasses or hat if possible',
          ].map((tip, i) => (
            <View key={i} className="mb-1 flex-row items-start">
              <Text className="mr-2 text-[#00C897]">•</Text>
              <Text className="flex-1 text-[12px] leading-5 text-white/70">{tip}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
