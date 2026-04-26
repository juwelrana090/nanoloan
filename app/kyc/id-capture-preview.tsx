import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { KycHeader, KycCard } from '@/shared/components/kyc';
import Svg, { Path } from 'react-native-svg';
import { Image } from 'expo-image';
import { useState, useEffect } from 'react';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/shared/libs/redux/store';
import {
  setFrontImage,
  setBackImage,
  setFrontData,
  setBackData,
  clearFrontImage,
  clearBackImage,
  setLoading,
  setError,
} from '@/shared/libs/redux/features/kyc/kycSlice';
import { parseDocumentData } from '@/utils/ocr/nidParser';
import { ExtractedData, ValidationError } from '@/types/kyc';
import { useVerifyIdMutation } from '@/shared/libs/redux/features/biometric/biometricApi';
import { useToast } from '@/shared/hooks/useToast';

type CaptureSide = 'front' | 'back' | null;
type DocumentType = 'NID' | 'PASSPORT' | 'UNKNOWN';

const CheckIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 12 10" fill="none">
    <Path
      d="M1 5L4.5 8.5L11 1"
      stroke="#00C897"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const WarningIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
      stroke="#FF9800"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── helpers ──────────────────────────────────────────────────────────────────

/** Best-effort name: front first, fall back to MRZ from back */
function resolveName(front?: ExtractedData | null, back?: ExtractedData | null): string {
  return front?.name?.trim() || back?.name?.trim() || '';
}

/** Best-effort ID number: front first, fall back to MRZ from back */
function resolveId(front?: ExtractedData | null, back?: ExtractedData | null): string {
  return (
    front?.idNumber?.trim() ||
    front?.passportNumber?.trim() ||
    back?.idNumber?.trim() ||
    back?.passportNumber?.trim() ||
    ''
  );
}

/** Best-effort DOB: front first, fall back to MRZ from back */
function resolveDob(front?: ExtractedData | null, back?: ExtractedData | null): string {
  return front?.dob?.trim() || back?.dob?.trim() || '';
}

/** Mask NID middle digits: 730•••••782 */
function maskId(id: string): string {
  if (id.length <= 6) return id;
  return `${id.slice(0, 3)}${'•'.repeat(id.length - 6)}${id.slice(-3)}`;
}

// ─────────────────────────────────────────────────────────────────────────────

export default function IDCapturePreviewScreen() {
  const { uri, side } = useLocalSearchParams<{ uri: string; side?: 'front' | 'back' }>();
  const dispatch = useDispatch();
  const [verifyId, { isLoading: isVerifying }] = useVerifyIdMutation();
  const { showSuccess, showError } = useToast();
  const [currentSide, setCurrentSide] = useState<CaptureSide>('front');

  const frontUri = useSelector((state: RootState) => state.kyc.frontImageUri);
  const backUri = useSelector((state: RootState) => state.kyc.backImageUri);
  const frontData = useSelector((state: RootState) => state.kyc.frontData);
  const backData = useSelector((state: RootState) => state.kyc.backData);
  const isLoading = useSelector((state: RootState) => state.kyc.isLoading);
  const error = useSelector((state: RootState) => state.kyc.error);
  const selectedIdType = useSelector((state: RootState) => state.kyc.selectedIdType) || 'NID';

  const [debugText, setDebugText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const showDebug = __DEV__;

  useEffect(() => {
    if (side) setCurrentSide(side);
  }, [side]);

  useEffect(() => {
    if (!uri) return;
    const targetSide = side || currentSide;
    if (targetSide === 'front' && frontUri !== uri) {
      dispatch(setFrontImage(uri as string));
      extractTextFromImage(uri as string, 'front');
    } else if (targetSide === 'back' && backUri !== uri) {
      dispatch(setBackImage(uri as string));
      extractTextFromImage(uri as string, 'back');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uri]);

  // ── OCR ──────────────────────────────────────────────────────────────────

  const extractTextFromImage = async (imageUri: string, side: CaptureSide) => {
    if (side !== 'front' && side !== 'back') return;
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const result = await TextRecognition.recognize(imageUri);
      const rawText = result.text;

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`🔍 OCR (${side.toUpperCase()})\n` + rawText);
      rawText.split('\n').forEach((l, i) => {
        if (l.trim()) console.log(`  [${i}] "${l.trim()}"`);
      });

      if (showDebug) setDebugText((p) => `[${side.toUpperCase()}]\n${rawText}\n\n${p}`);

      const detectedType = detectDocumentType(rawText);
      const idType = detectedType === 'PASSPORT' ? 'passport' : 'nid';
      const parsedData = parseDocumentData(rawText, idType, side);
      parsedData.validationErrors = validateExtractedData(parsedData);

      if (side === 'front') dispatch(setFrontData(parsedData));
      else dispatch(setBackData(parsedData));
    } catch (err) {
      console.error('❌ OCR error:', err);
      dispatch(setError('Failed to extract text. Please retake the photo.'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const validateExtractedData = (data: ExtractedData): ValidationError[] => {
    const errors: ValidationError[] = [];
    if (!data.documentType || data.documentType === 'UNKNOWN') {
      errors.push({
        field: 'documentType',
        message: 'Document type not detected.',
        isCritical: false,
      });
    }
    if (!data.name || data.name.trim().length < 2) {
      errors.push({ field: 'name', message: 'Name could not be detected.', isCritical: false });
    }
    if (data.documentType === 'PASSPORT') {
      if (!data.passportNumber) {
        errors.push({
          field: 'passportNumber',
          message: 'Passport number not detected.',
          isCritical: true,
        });
      }
    } else {
      if (!data.idNumber || data.idNumber.length < 9) {
        errors.push({
          field: 'idNumber',
          message: 'NID number not detected or incomplete.',
          isCritical: false,
        });
      }
    }
    if (!data.dob) {
      errors.push({ field: 'dob', message: 'Date of birth not detected.', isCritical: false });
    }
    if (data.rawText.length < 30) {
      errors.push({
        field: 'imageQuality',
        message: 'Image too blurry or dark to read.',
        isCritical: true,
      });
    }
    return errors;
  };

  // ── navigation ───────────────────────────────────────────────────────────

  const handleRetake = (side: CaptureSide) => {
    if (side === 'front') {
      dispatch(clearFrontImage());
      router.push('/kyc/id-capture?side=front');
    } else {
      dispatch(clearBackImage());
      router.push('/kyc/id-capture?side=back');
    }
  };

  const handleCaptureNext = () => {
    if (!frontUri) router.push('/kyc/id-capture?side=front');
    else if (!backUri) {
      setCurrentSide('back');
      router.push('/kyc/id-capture?side=back');
    }
  };

  const canProceed = () => {
    if (!frontData || !backData) return false;
    return (
      !(frontData.validationErrors?.some((e) => e.isCritical) ?? false) &&
      !(backData.validationErrors?.some((e) => e.isCritical) ?? false)
    );
  };

  const handleConfirmAndContinue = async () => {
    if (!frontUri || !backUri) {
      showError({ title: 'Error', message: 'Both front and back images are required' });
      return;
    }

    // Prevent multiple simultaneous submissions
    if (isSubmitting || isVerifying) {
      return;
    }

    try {
      setIsSubmitting(true);
      dispatch(setLoading(true));

      // For now, we'll submit the front image (you may need to submit both front and back separately)
      const formData = new FormData();
      formData.append('idType', selectedIdType);
      formData.append('idCardImage', {
        uri: frontUri,
        name: `id-${selectedIdType.toLowerCase()}.jpg`,
        type: 'image/jpeg',
      } as any);

      const response = await verifyId(formData as any).unwrap();

      showSuccess({
        title: 'ID Verified',
        message: response.message || 'ID card verified successfully',
      });

      setIsSubmitting(false);
      dispatch(setLoading(false));
      router.push('/kyc/address-roles');
    } catch (error: any) {
      console.error('ID verification error:', error);
      setIsSubmitting(false);
      dispatch(setLoading(false));

      const errorMsg = error?.data?.message || 'Failed to verify ID card';
      showError({
        title: 'Verification Failed',
        message: errorMsg,
      });
    }
  };

  const detectDocumentType = (text: string): DocumentType => {
    const u = text.toUpperCase();
    if (u.includes('PASSPORT') || /P[<A-Z][A-Z]{3}/.test(text) || /<<[A-Z]+<</.test(text))
      return 'PASSPORT';
    if (
      u.includes('NID') ||
      u.includes('NATIONAL ID') ||
      /জাতীয় পরিচয়পত্র/.test(text) ||
      /I<BGD/.test(text) ||
      (text.match(/</g) || []).length > 10
    )
      return 'NID';
    return 'UNKNOWN';
  };

  // ── derived state ────────────────────────────────────────────────────────

  const bothCaptured = !!frontUri && !!backUri;
  const bothProcessed = !!frontData && !!backData;

  // Merge front + back for the best available values
  const resolvedName = resolveName(frontData, backData);
  const resolvedId = resolveId(frontData, backData);
  const resolvedDob = resolveDob(frontData, backData);

  const hasAllCoreFields = !!resolvedName && !!resolvedId && !!resolvedDob;

  const missingFields: string[] = [];
  if (!resolvedName) missingFields.push('Full Name');
  if (!resolvedId) missingFields.push('NID Number');
  if (!resolvedDob) missingFields.push('Date of Birth');

  const hasMissingFields = bothProcessed && missingFields.length > 0;

  // Section titles change when data is missing
  const qualityTitle = hasMissingFields
    ? '⚠️ Retake for Better Results'
    : 'Photo Quality Guidelines';
  const confirmTitle = hasMissingFields ? 'Could not detect the following' : 'Please confirm that';

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <View className="flex-1 bg-[#00C897]">
      <KycHeader
        title="Take NID Photo"
        showBar
        currentStep={currentSide === 'front' ? 2 : 3}
        totalSteps={5}
      />
      <KycCard>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}>
          {/* ── Progress ── */}
          <View className="mb-6 flex-row items-center justify-center">
            <View
              className={`h-1 flex-1 rounded-full ${frontUri ? 'bg-[#00C897]' : 'bg-[#E0E0E0]'}`}
            />
            <View
              className={`mx-2 h-8 w-8 items-center justify-center rounded-full ${frontUri ? 'bg-[#00C897]' : 'bg-[#E0E0E0]'}`}>
              <Text className="text-[12px] font-bold text-white">1</Text>
            </View>
            <View
              className={`mx-2 h-8 w-8 items-center justify-center rounded-full ${backUri ? 'bg-[#00C897]' : 'bg-[#E0E0E0]'}`}>
              <Text className="text-[12px] font-bold text-white">2</Text>
            </View>
            <View
              className={`h-1 flex-1 rounded-full ${backUri ? 'bg-[#00C897]' : 'bg-[#E0E0E0]'}`}
            />
          </View>

          {/* ── Front preview ── */}
          <View className="mb-6">
            <Text className="mb-3 text-[16px] font-bold text-[#1A1A1A]">
              Front Side {frontData ? '✓' : ''}
            </Text>
            <TouchableOpacity
              onPress={() => handleRetake('front')}
              activeOpacity={0.8}
              className="h-[200px] w-full items-center justify-center overflow-hidden rounded-2xl bg-[#E8E8E8]">
              {frontUri ? (
                <Image
                  source={{ uri: frontUri }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                />
              ) : (
                <View className="items-center">
                  <Text className="mb-2 text-[13px] text-[#AAA]">Front Side</Text>
                  <Text className="text-[14px] font-semibold text-[#00C897]">Tap to Capture</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* ── Back preview ── */}
          <View className="mb-6">
            <Text className="mb-3 text-[16px] font-bold text-[#1A1A1A]">
              Back Side {backData ? '✓' : ''}
            </Text>
            <TouchableOpacity
              onPress={() => handleRetake('back')}
              activeOpacity={0.8}
              className="h-[200px] w-full items-center justify-center overflow-hidden rounded-2xl bg-[#E8E8E8]">
              {backUri ? (
                <Image
                  source={{ uri: backUri }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                />
              ) : (
                <View className="items-center">
                  <Text className="mb-2 text-[13px] text-[#AAA]">Back Side</Text>
                  <Text className="text-[14px] font-semibold text-[#00C897]">
                    {frontUri ? 'Tap to Capture' : 'Capture front first'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* ── Loading ── */}
          {isLoading && (
            <View className="mb-4 items-center py-4">
              <ActivityIndicator size="small" color="#00C897" />
              <Text className="mt-2 text-[14px] text-[#555]">Extracting document data…</Text>
            </View>
          )}

          {/* ── DEV raw OCR ── */}
          {/* {showDebug && debugText.length > 0 && (
            <View className="mb-4 rounded-lg border border-blue-300 bg-blue-50 p-3">
              <Text className="mb-1 text-[13px] font-bold text-blue-700">🔍 DEV – Raw OCR</Text>
              <Text className="font-mono text-[10px] text-[#333]">{debugText}</Text>
            </View>
          )} */}

          {/* ══════════════════════════════════════════════════════════════
              SECTION A: Photo Quality Guidelines  OR  Retake guidance
          ══════════════════════════════════════════════════════════════ */}
          <Text className="mb-3 mt-5 text-[16px] font-bold text-[#1A1A1A]">{qualityTitle}</Text>

          {hasMissingFields ? (
            // Retake tips when data is missing
            <>
              <Text className="mb-3 text-[13px] leading-5 text-[#666]">
                Some information could not be read from your ID. For better results:
              </Text>
              {[
                'Hold camera directly above the ID (no angle)',
                'Ensure the entire card is inside the frame',
                'Use bright, even lighting — no shadows or glare',
                'Keep the card flat and still while shooting',
              ].map((tip, i) => (
                <View key={i} className="mb-2 flex-row items-start">
                  <View className="mr-2 mt-0.5">
                    <WarningIcon />
                  </View>
                  <Text className="flex-1 text-[14px] text-[#555]">{tip}</Text>
                </View>
              ))}
            </>
          ) : (
            // Normal quality checklist
            [
              'Readable, clear and not blurry',
              'Well-lit, not reflective, not too dark',
              'ID occupies most of the image',
            ].map((tip, i) => (
              <View key={i} className="mb-2 flex-row items-center">
                <CheckIcon />
                <Text className="ml-2 text-[14px] text-[#555]">{tip}</Text>
              </View>
            ))
          )}

          {/* ══════════════════════════════════════════════════════════════
              Extracted Information card
              — only shown when ALL 3 core fields (name, id, dob) found
              — NID number is masked for security
          ══════════════════════════════════════════════════════════════ */}
          {hasAllCoreFields && bothProcessed && (
            <View className="mt-6">
              <Text className="mb-3 text-[16px] font-bold text-[#1A1A1A]">
                Extracted Information
              </Text>
              <View className="rounded-2xl border border-[#00C897]/30 bg-[#E8F8F3] px-4 py-4">
                <InfoRow label="Full Name" value={resolvedName} />
                <View className="my-3 h-px bg-[#D8F0E8]" />
                <InfoRow label="NID Number" value={maskId(resolvedId)} />
                <View className="my-3 h-px bg-[#D8F0E8]" />
                <InfoRow label="Date of Birth" value={resolvedDob} />
              </View>
            </View>
          )}

          {/* ══════════════════════════════════════════════════════════════
              SECTION B: "Please confirm that"  OR  "Could not detect"
          ══════════════════════════════════════════════════════════════ */}
          <Text className="mb-3 mt-5 text-[16px] font-bold text-[#1A1A1A]">{confirmTitle}</Text>

          {/* Error banner */}
          {error && (
            <View className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3">
              <Text className="text-[14px] text-red-600">{error}</Text>
            </View>
          )}

          {hasMissingFields ? (
            // Missing fields card
            <View className="mb-3 rounded-xl border border-[#FF9800] bg-[#FFF8F0] p-4">
              {missingFields.map((field, i) => (
                <View key={i} className="mb-2 flex-row items-center">
                  <View className="mr-3 h-5 w-5 items-center justify-center rounded-full bg-[#FFE0B2]">
                    <Text className="text-[11px] font-bold text-[#FF9800]">!</Text>
                  </View>
                  <Text className="text-[14px] text-[#555]">{field}</Text>
                </View>
              ))}
              <Text className="mt-2 text-[12px] leading-4 text-[#999]">
                You may still continue — our team will verify your document manually.
              </Text>
            </View>
          ) : (
            // Normal confirm checklist
            ['ID is not expired', 'All details are clearly visible'].map((tip, i) => (
              <View key={i} className="mb-2 flex-row items-center">
                <View className="mr-3 h-1.5 w-1.5 rounded-full bg-[#888]" />
                <Text className="text-[14px] text-[#555]">{tip}</Text>
              </View>
            ))
          )}

          {/* ── Capture back side button ── */}
          {frontUri && !backUri && !isLoading && (
            <TouchableOpacity
              onPress={handleCaptureNext}
              activeOpacity={0.8}
              className="mt-8 h-[54px] items-center justify-center rounded-full bg-[#00C897]">
              <Text className="text-[17px] font-bold text-white">Capture Back Side →</Text>
            </TouchableOpacity>
          )}

          {/* ── Confirm / Continue button ── */}
          {bothCaptured && (
            <TouchableOpacity
              onPress={handleConfirmAndContinue}
              activeOpacity={0.8}
              className={`mt-8 h-[54px] items-center justify-center rounded-full ${
                isLoading || isVerifying || isSubmitting || !canProceed() ? 'bg-[#CCC]' : 'bg-[#00C897]'
              }`}
              disabled={isLoading || isVerifying || isSubmitting || !canProceed()}>
              <Text className="text-[17px] font-bold text-white">
                {isLoading || isVerifying || isSubmitting
                  ? 'Processing…'
                  : !canProceed()
                    ? 'Fix Issues First'
                    : hasMissingFields
                      ? 'Continue Anyway'
                      : 'Confirm & Continue'}
              </Text>
            </TouchableOpacity>
          )}

          {/* ── Cancel / Start over ── */}
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.8}
            className="mt-3 h-[54px] items-center justify-center rounded-full bg-[#E4F7EE]"
            disabled={isLoading}>
            <Text className="text-[17px] font-semibold text-[#888]">
              {bothCaptured ? 'Start Over' : 'Cancel'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KycCard>
    </View>
  );
}

// ── small helper component ───────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-[13px] text-[#888]">{label}</Text>
      <Text className="ml-4 flex-1 text-right text-[14px] font-semibold text-[#1A1A1A]">
        {value}
      </Text>
    </View>
  );
}
