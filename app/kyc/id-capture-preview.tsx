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

type CaptureSide = 'front' | 'back' | null;

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

type DocumentType = 'NID' | 'PASSPORT' | 'UNKNOWN';

interface ValidationError {
  field: string;
  message: string;
  isCritical: boolean;
}

interface ExtractedData {
  documentType?: DocumentType;
  name?: string;
  idNumber?: string;
  passportNumber?: string;
  personalNumber?: string;
  expiryDate?: string;
  dob?: string;
  placeOfBirth?: string;
  dateOfIssue?: string;
  nationality?: string;
  sex?: string;
  // NID Back side specific fields
  fatherName?: string;
  motherName?: string;
  spouseName?: string;
  presentAddress?: string;
  permanentAddress?: string;
  bloodGroup?: string;
  district?: string;
  // Passport Back side specific fields
  emergencyContact?: string;
  address?: string;
  observations?: string;
  fileNumber?: string;
  rawText: string;
  validationErrors?: ValidationError[];
}

export default function IDCapturePreviewScreen() {
  const { uri, side } = useLocalSearchParams<{ uri: string; side?: 'front' | 'back' }>();
  const dispatch = useDispatch();
  const [currentSide, setCurrentSide] = useState<CaptureSide>('front');

  // Get KYC state from Redux
  const frontUri = useSelector((state: RootState) => state.kyc.frontImageUri);
  const backUri = useSelector((state: RootState) => state.kyc.backImageUri);
  const frontData = useSelector((state: RootState) => state.kyc.frontData);
  const backData = useSelector((state: RootState) => state.kyc.backData);
  const isLoading = useSelector((state: RootState) => state.kyc.isLoading);
  const error = useSelector((state: RootState) => state.kyc.error);

  // Update currentSide when side parameter changes
  useEffect(() => {
    if (side) {
      setCurrentSide(side);
    }
  }, [side]);

  // Process new image URI when received from camera
  useEffect(() => {
    if (uri) {
      const targetSide = side || currentSide;

      // Always process the new image based on which side it is
      if (targetSide === 'front') {
        // Only update if this is a different image (prevent duplicate processing)
        if (frontUri !== uri) {
          dispatch(setFrontImage(uri as string));
          extractTextFromImage(uri as string, 'front');
        }
      } else if (targetSide === 'back') {
        // Only update if this is a different image (prevent duplicate processing)
        if (backUri !== uri) {
          dispatch(setBackImage(uri as string));
          extractTextFromImage(uri as string, 'back');
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uri, side]);

  const extractTextFromImage = async (imageUri: string, side: CaptureSide) => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      // Using ML Kit Text Recognition
      const result = await TextRecognition.recognize(imageUri);

      const text = result.text;

      // Detect document type and parse accordingly
      const documentType = detectDocumentType(text);
      let parsedData: ExtractedData;

      if (documentType === 'PASSPORT') {
        parsedData = parsePassportData(text);
      } else {
        parsedData = parseIDCardData(text);
      }

      // Validate extracted data
      const validationErrors = validateExtractedData(parsedData);
      parsedData.validationErrors = validationErrors;

      // Store data based on side
      if (side === 'front') {
        dispatch(setFrontData(parsedData));
      } else {
        dispatch(setBackData(parsedData));
      }
    } catch (err) {
      console.error('Text extraction error:', err);
      dispatch(setError('Failed to extract text from image. Please retake the photo.'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const validateExtractedData = (data: ExtractedData): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Check document type detection
    if (!data.documentType || data.documentType === 'UNKNOWN') {
      errors.push({
        field: 'documentType',
        message:
          'Unable to detect document type. Please ensure NID or Passport is clearly visible.',
        isCritical: true,
      });
    }

    // Check name
    if (!data.name || data.name.trim().length < 2) {
      errors.push({
        field: 'name',
        message: 'Name could not be detected. Please ensure the name is clearly visible.',
        isCritical: true,
      });
    }

    // Check ID number based on document type
    if (data.documentType === 'PASSPORT') {
      if (!data.passportNumber) {
        errors.push({
          field: 'passportNumber',
          message: 'Passport number could not be detected.',
          isCritical: true,
        });
      }
    } else {
      if (!data.idNumber || data.idNumber.length < 10) {
        errors.push({
          field: 'idNumber',
          message: 'NID number could not be detected or is incomplete.',
          isCritical: true,
        });
      }
    }

    // Check date of birth
    if (!data.dob) {
      errors.push({
        field: 'dob',
        message: 'Date of birth could not be detected.',
        isCritical: true,
      });
    }

    // For passports, check expiry date
    if (data.documentType === 'PASSPORT' && !data.expiryDate) {
      errors.push({
        field: 'expiryDate',
        message: 'Passport expiry date could not be detected.',
        isCritical: false,
      });
    }

    // Check if image quality is too poor (very short text)
    if (data.rawText.length < 50) {
      errors.push({
        field: 'imageQuality',
        message: 'Image text is too short. The image may be blurry, dark, or cropped.',
        isCritical: true,
      });
    }

    return errors;
  };

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
    if (!frontUri) {
      // Need to capture front first
      router.push('/kyc/id-capture?side=front');
    } else if (!backUri) {
      // Front done, need to capture back
      setCurrentSide('back');
      router.push('/kyc/id-capture?side=back');
    }
  };

  const canProceed = () => {
    if (!frontData || !backData) return false;

    // Check if both sides have no critical errors
    const frontHasCriticalErrors = frontData.validationErrors?.some((e) => e.isCritical);
    const backHasCriticalErrors = backData.validationErrors?.some((e) => e.isCritical);

    return !frontHasCriticalErrors && !backHasCriticalErrors;
  };

  const getMergedValidationErrors = (): ValidationError[] => {
    const errors: ValidationError[] = [];

    if (frontData?.validationErrors) {
      errors.push(...frontData.validationErrors.map((e) => ({ ...e, field: `Front: ${e.field}` })));
    }

    if (backData?.validationErrors) {
      errors.push(...backData.validationErrors.map((e) => ({ ...e, field: `Back: ${e.field}` })));
    }

    if (!frontUri) {
      errors.push({
        field: 'Front: capture',
        message: 'Front side of NID not captured',
        isCritical: true,
      });
    }

    if (!backUri) {
      errors.push({
        field: 'Back: capture',
        message: 'Back side of NID not captured',
        isCritical: true,
      });
    }

    return errors;
  };

  const detectDocumentType = (text: string): DocumentType => {
    const upperText = text.toUpperCase();

    // Check for passport indicators
    if (
      upperText.includes('PASSPORT') ||
      upperText.includes('TYPE') ||
      upperText.includes('COUNTRY CODE') ||
      /P<[A-Z]{3}/.test(text) || // MRZ pattern
      /<<[A-Z]+<</.test(text) // MRZ name pattern
    ) {
      return 'PASSPORT';
    }

    // Check for NID indicators
    if (
      upperText.includes('NID') ||
      upperText.includes('NATIONAL ID') ||
      upperText.includes('জাতীয় পরিচয়পত্র') ||
      /^\d{10,17}$/.test(text.trim()) // Standalone NID number
    ) {
      return 'NID';
    }

    return 'UNKNOWN';
  };

  const parsePassportData = (text: string): ExtractedData => {
    const lines = text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const data: ExtractedData = { rawText: text, documentType: 'PASSPORT' };

    // Passport number patterns
    const passportPatterns = [
      /Passport\s*Number\/পাসপোর্ট\s*নম্বর\s*:?\s*([A-Z]\d{8,9})/i,
      /Passport\s*No\.?\s*:?\s*([A-Z]\d{8,9})/i,
      /No\.?\s*:?\s*([A-Z]\d{8,9})/i,
    ];

    // Personal number (NID number in passport)
    const personalNumberPatterns = [
      /Personal\s*No\.?\s*\/ব্যক্তিগত\s*নম্বর\s*:?\s*(\d{10,17})/i,
      /Personal\s*No\.?\s*:?\s*(\d{10,17})/i,
    ];

    // Date patterns for passport (DD MMM YYYY format)
    const datePatterns = [
      /Date\s*of\s*Birth\/জন্ম\s*তারিখ\s*:?\s*(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})/i,
      /Date\s*of\s*Issue\/জারি\s*তারিখ\s*:?\s*(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})/i,
      /Date\s*of\s*Expiry\/মেয়াদ\sউত্তীর্ণ\s*:?\s*(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})/i,
    ];

    // Name patterns
    const namePatterns = [
      /Surname\/পরিবারের\s*নাম\s*:?\s*([A-Z]+)/i,
      /Given\s*Name\/প্রদত্ত\s*নাম\s*:?\s*([A-Z\s]+)/i,
      /ধারকের\s*স্বাক্ষর\s*:?\s*([A-Z\s]+)/i,
    ];

    // Place of birth pattern
    const placeOfBirthPatterns = [/Place\s*of\s*Birth\/জন্মস্থান\s*:?\s*([A-Z]+)/i];

    // Extract passport number
    for (const pattern of passportPatterns) {
      const match = text.match(pattern);
      if (match) {
        data.passportNumber = match[1];
        data.idNumber = match[1]; // Also set idNumber for compatibility
        break;
      }
    }

    // Extract personal number (NID)
    for (const pattern of personalNumberPatterns) {
      const match = text.match(pattern);
      if (match) {
        data.personalNumber = match[1];
        break;
      }
    }

    // Extract dates with context
    lines.forEach((line) => {
      for (const pattern of datePatterns) {
        const match = line.match(pattern);
        if (match && match[1]) {
          const lowerLine = line.toLowerCase();
          if (lowerLine.includes('birth') || lowerLine.includes('জন্ম')) {
            data.dob = match[1].trim();
          } else if (lowerLine.includes('issue') || lowerLine.includes('জারি')) {
            data.dateOfIssue = match[1].trim();
          } else if (lowerLine.includes('expiry') || lowerLine.includes('মেয়াদ')) {
            data.expiryDate = match[1].trim();
          }
        }
      }
    });

    // Extract names
    let surname = '';
    let givenName = '';

    for (const pattern of namePatterns) {
      const match = text.match(pattern);
      if (match) {
        const label = match[0]?.toLowerCase() || '';
        const name = match[1]?.trim() || '';

        if (label.includes('surname')) {
          surname = name;
        } else if (label.includes('given')) {
          givenName = name;
        }
      }
    }

    // Combine names
    if (surname && givenName) {
      data.name = `${surname} ${givenName}`.trim();
    } else if (givenName) {
      data.name = givenName;
    }

    // Extract place of birth
    for (const pattern of placeOfBirthPatterns) {
      const match = text.match(pattern);
      if (match) {
        data.placeOfBirth = match[1];
        break;
      }
    }

    // ========== PASSPORT BACK SIDE PATTERNS ==========
    // Extract emergency contact
    const emergencyContactPatterns = [
      /Emergency\s*Contact\s*:?\s*([A-Z][A-Z\s\d]+)/i,
      /Emergency\s*Contact\s*\/জরুরী\s*যোগাযোগ\s*:?\s*([A-Z][A-Z\s\d]+)/i,
      /জরুরী\s*যোগাযোগ\s*:?\s*([ঀ-৿\s\d]+)/,
      /In\s*case\s*of\s*emergency\s*:?\s*([A-Z][A-Z\s\d]+)/i,
    ];

    // Extract address
    const addressPatterns = [
      /Address\s*:?\s*([\s\S]+?)(?=\n\s*(?:Emergency|File|Observations|$))/i,
      /ঠিকানা\s*:?\s*([\s\S]+?)(?=\n\s*(?:জরুরী|ফাইল|$))/,
      /Permanent\s*Address\s*:?\s*([\s\S]+?)(?=\n\s*(?:Emergency|File|Observations|$))/i,
      /স্থায়ী\s*ঠিকানা\s*:?\s*([\s\S]+?)(?=\n\s*(?:জরুরী|ফাইল|$))/,
    ];

    // Extract observations / remarks
    const observationsPatterns = [
      /Observations?\s*:?\s*([\s\S]+?)(?=\n\s*(?:Emergency|Address|File|$))/i,
      /Remarks?\s*:?\s*([\s\S]+?)(?=\n\s*(?:Emergency|Address|File|$))/i,
      /মন্তব্য\s*:?\s*([\s\S]+?)(?=\n\s*(?:জরুরী|ঠিকানা|ফাইল|$))/,
    ];

    // Extract file number
    const fileNumberPatterns = [
      /File\s*No\.?\s*:?\s*([A-Z0-9]+)/i,
      /File\s*Number\s*:?\s*([A-Z0-9]+)/i,
      /ফাইল\s*নম্বর\s*:?\s*([ঀ-৿0-9]+)/,
    ];

    // Extract emergency contact
    for (const pattern of emergencyContactPatterns) {
      const match = text.match(pattern);
      if (match) {
        data.emergencyContact = match[1].trim();
        break;
      }
    }

    // Extract address
    for (const pattern of addressPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        data.address = match[1].trim().substring(0, 200);
        break;
      }
    }

    // Extract observations
    for (const pattern of observationsPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        data.observations = match[1].trim().substring(0, 200);
        break;
      }
    }

    // Extract file number
    for (const pattern of fileNumberPatterns) {
      const match = text.match(pattern);
      if (match) {
        data.fileNumber = match[1].trim();
        break;
      }
    }

    return data;
  };

  const parseIDCardData = (text: string): ExtractedData => {
    const lines = text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const data: ExtractedData = { rawText: text, documentType: 'NID' };

    // Bangladeshi NID patterns (both old and new formats)
    const nidPatterns = [
      // New format: "NID No. 730 738 7782"
      /NID\s*No\.?\s*:?\s*(\d[\d\s]{8,15})/i,
      /National\s+ID\s*[:#]?\s*(\d[\d\s]{8,15})/i,
      /জাতীয়\s+পরিচয়পত্র\s*নম্বর\s*:?\s*(\d[\d\s]{8,15})/,
      /NID\s*[:#]?\s*(\d[\d\s]{8,15})/i,
      // Old format: "ID NO: 1234567890123" or plain numbers
      /ID\s*NO\.?\s*:?\s*(\d{10,17})/i,
      /CARD\s*NO\.?\s*:?\s*(\d{10,17})/i,
      // Standalone 13-17 digit number (old NID format)
      /(?:^|\D)(\d{13,17})(?:\D|$)/,
    ];

    // Date patterns (multiple formats for old and new NIDs)
    const datePatterns = [
      // New format: "06 Oct 1993"
      /Date\s+of\s+Birth\s*:?\s*(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})/i,
      /DOB?\s*:?\s*(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})/i,
      /জন্ম\s+তারিখ\s*:?\s*(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})/i,
      // Old format: "06/10/1993" or "06-10-1993"
      /Date\s+of\s+Birth\s*:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
      /DOB?\s*:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
      /জন্ম\s+তারিখ\s*:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
      // General date pattern
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
      // Expiry dates
      /Exp[iry]?\s*:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
      /Expiry\s+Date\s*:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    ];

    // Name patterns (Bengali and English, old and new formats)
    const namePatterns = [
      // New format labels
      /Name\s*:?\s*([A-Z][A-Z\s]+)/i,
      /নাম\s*:?\s*([ঀ-৿\s]+)/,
      // Old format labels
      /অনুস্বাক্ষর\s*:?\s*([A-Z][A-Z\s]+)/,
    ];

    // Extract NID number (remove spaces)
    for (const pattern of nidPatterns) {
      const match = text.match(pattern);
      if (match) {
        data.idNumber = match[1].replace(/\s/g, '');
        break;
      }
    }

    // Extract dates with better context awareness
    lines.forEach((line, index) => {
      for (const pattern of datePatterns) {
        const match = line.match(pattern);
        if (match && match[1]) {
          const lowerLine = line.toLowerCase();
          const lowerLines = lines.map((l) => l.toLowerCase());

          // Check for DOB context (both English and Bengali)
          if (
            lowerLine.includes('birth') ||
            lowerLine.includes('dob') ||
            lowerLine.includes('জন্ম') ||
            (index > 0 &&
              (lowerLines[index - 1].includes('birth') ||
                lowerLines[index - 1].includes('জন্ম'))) ||
            (index < lines.length - 1 &&
              (lowerLines[index + 1].includes('birth') || lowerLines[index + 1].includes('জন্ম')))
          ) {
            data.dob = match[1].trim();
          }
          // Check for expiry context
          else if (lowerLine.includes('exp') || lowerLine.includes('expiry')) {
            data.expiryDate = match[1].trim();
          }
        }
      }
    });

    // Extract name (English uppercase version preferred)
    for (const pattern of namePatterns) {
      const match = text.match(pattern);
      if (match) {
        const name = match[1].trim();
        // Prefer English names (all caps) over Bengali
        if (!data.name || /^[A-Z\s]+$/.test(name)) {
          data.name = name;
        }
      }
    }

    // Enhanced fallback: Find name by context (old and new formats)
    if (!data.name) {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Look for all-caps English names (usually 2-4 words)
        if (/^[A-Z]{2,}(?:\s+[A-Z]{2,}){1,3}$/.test(line) && line.length > 5 && line.length < 60) {
          // Check nearby lines for name-related labels
          const contextLines = [];
          if (i > 0) contextLines.push(lines[i - 1].toLowerCase());
          if (i < lines.length - 1) contextLines.push(lines[i + 1].toLowerCase());

          const hasNameContext = contextLines.some(
            (ctx) =>
              ctx.includes('name') ||
              ctx.includes('নাম') ||
              ctx.includes('অনুস্বাক্ষর') ||
              ctx.includes('signature')
          );

          if (hasNameContext || i < 8) {
            // Names usually appear in first 8 lines
            data.name = line;
            break;
          }
        }
      }
    }

    // ========== NID BACK SIDE PATTERNS ==========
    // Extract father's name (old and new formats)
    const fatherNamePatterns = [
      // New format labels
      /Father['']?s?\s*Name\s*:?\s*([A-Z][A-Z\s]+)/i,
      /Father['']?s?\s*নাম\s*:?\s*([ঀ-৿\s]+)/,
      /পিতার\s*নাম\s*:?\s*([ঀ-৿\s]+)/,
      /পিতা\s*:?\s*([ঀ-৿\s]+)/,
      // Old format labels
      /পিতা\s*:\s*([ঀ-৿\s]+)/,
      /পিতার\s*স্বাক্ষর\s*:?\s*([ঀ-৿\s]+)/,
    ];

    // Extract mother's name (old and new formats)
    const motherNamePatterns = [
      // New format labels
      /Mother['']?s?\s*Name\s*:?\s*([A-Z][A-Z\s]+)/i,
      /Mother['']?s?\s*নাম\s*:?\s*([ঀ-৿\s]+)/,
      /মাতার\s*নাম\s*:?\s*([ঀ-৿\s]+)/,
      /মাতা\s*:?\s*([ঀ-৿\s]+)/,
      // Old format labels
      /মাতা\s*:\s*([ঀ-৿\s]+)/,
      /মাতার\s*স্বাক্ষর\s*:?\s*([ঀ-৿\s]+)/,
    ];

    // Extract spouse name
    const spouseNamePatterns = [
      /Spouse['']?s?\s*Name\s*:?\s*([A-Z][A-Z\s]+)/i,
      /স্বামী\/স্ত্রী\s*নাম\s*:?\s*([ঀ-৿\s]+)/,
      /স্বামী\s*:\s*([ঀ-৿\s]+)/,
      /স্ত্রী\s*:\s*([ঀ-৿\s]+)/,
    ];

    // Extract present address (old and new formats)
    const presentAddressPatterns = [
      // New format
      /Present\s*Address\s*:?\s*([\s\S]+?)(?=\n\s*(?:Permanent|স্থায়ী|$))/i,
      /বর্তমান\s*ঠিকানা\s*:?\s*([\s\S]+?)(?=\n\s*(?:Permanent|স্থায়ী|$))/,
      // Old format
      /বর্তমান\s*ঠিকানা\s*:\s*([\s\S]+?)(?=\n\s*(?:স্থায়ী|গ্রাম|$))/,
    ];

    // Extract permanent address (old and new formats)
    const permanentAddressPatterns = [
      // New format
      /Permanent\s*Address\s*:?\s*([\s\S]+?)(?=\n\s*(?:Present|বর্তমান|$))/i,
      /স্থায়ী\s*ঠিকানা\s*:?\s*([\s\S]+?)(?=\n\s*(?:Present|বর্তমান|$))/,
      // Old format
      /স্থায়ী\s*ঠিকানা\s*:\s*([\s\S]+?)(?=\n\s*(?:বর্তমান|গ্রাম|$))/,
    ];

    // Extract blood group (new format)
    const bloodGroupPatterns = [
      /Blood\s*Group\s*:?\s*([A-O][A-B]?\s*(?:\+|\-))/i,
      /রক্তের\s*গ্রুপ\s*:?\s*([A-O][A-B]?\s*(?:\+|\-))/,
      /Blood\s*:\s*([A-O][A-B]?\s*(?:\+|\-))/i,
    ];

    // Extract date of issue (new format back side)
    const dateOfIssuePatterns = [
      /Date\s*of\s*Issue\s*:?\s*(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})/i,
      /জারি\s*তারিখ\s*:?\s*(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})/i,
      /Issue\s*Date\s*:?\s*(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})/i,
    ];

    // Extract district (old format)
    const districtPatterns = [
      /District\s*:?\s*([A-Z][a-z\s]+)/i,
      /জেলা\s*:?\s*([ঀ-৿\s]+)/,
      /জেলা\s*-\s*([ঀ-৿\s]+)/,
    ];

    // Extract father's name
    for (const pattern of fatherNamePatterns) {
      const match = text.match(pattern);
      if (match) {
        const name = match[1].trim();
        // Prefer English names
        if (!data.fatherName || /^[A-Z\s]+$/.test(name)) {
          data.fatherName = name;
        }
      }
    }

    // Extract mother's name
    for (const pattern of motherNamePatterns) {
      const match = text.match(pattern);
      if (match) {
        const name = match[1].trim();
        // Prefer English names
        if (!data.motherName || /^[A-Z\s]+$/.test(name)) {
          data.motherName = name;
        }
      }
    }

    // Extract spouse name
    for (const pattern of spouseNamePatterns) {
      const match = text.match(pattern);
      if (match) {
        const name = match[1].trim();
        // Prefer English names
        if (!data.spouseName || /^[A-Z\s]+$/.test(name)) {
          data.spouseName = name;
        }
      }
    }

    // Extract present address
    for (const pattern of presentAddressPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        data.presentAddress = match[1].trim().substring(0, 200); // Limit length
        break;
      }
    }

    // Extract permanent address
    for (const pattern of permanentAddressPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        data.permanentAddress = match[1].trim().substring(0, 200); // Limit length
        break;
      }
    }

    // Extract blood group
    for (const pattern of bloodGroupPatterns) {
      const match = text.match(pattern);
      if (match) {
        data.bloodGroup = match[1].trim();
        break;
      }
    }

    // Extract date of issue
    for (const pattern of dateOfIssuePatterns) {
      const match = text.match(pattern);
      if (match) {
        data.dateOfIssue = match[1].trim();
        break;
      }
    }

    // Extract district
    for (const pattern of districtPatterns) {
      const match = text.match(pattern);
      if (match) {
        data.district = match[1].trim();
        break;
      }
    }

    return data;
  };

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
          {/* Progress indicator */}
          <View className="mb-6 flex-row items-center justify-center">
            <View
              className={`h-1 flex-1 rounded-full ${frontUri ? 'bg-[#00C897]' : 'bg-[#E0E0E0]'}`}
            />
            <View
              className={`mx-2 h-8 w-8 items-center justify-center rounded-full ${frontUri ? 'bg-[#00C897]' : 'bg-[#E0E0E0]'}`}>
              <Text className="text-[12px] font-bold text-white">{frontUri ? '1' : '1'}</Text>
            </View>
            <View
              className={`mx-2 h-8 w-8 items-center justify-center rounded-full ${backUri ? 'bg-[#00C897]' : 'bg-[#E0E0E0]'}`}>
              <Text className="text-[12px] font-bold text-white">{backUri ? '2' : '2'}</Text>
            </View>
            <View
              className={`h-1 flex-1 rounded-full ${backUri ? 'bg-[#00C897]' : 'bg-[#E0E0E0]'}`}
            />
          </View>

          {/* Front Side Preview */}
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

            {/* Front extracted data */}
            {frontData && (
              <View className="mt-3 rounded-lg border border-[#00C897]/30 bg-[#E8F8F3] p-3">
                <Text className="mb-1 text-[14px] font-semibold text-[#00C897]">
                  {frontData.documentType === 'PASSPORT' ? '🛂 Passport' : '📋 NID'}
                </Text>
                <Text className="text-[12px] text-[#555]">
                  {frontData.name && `Name: ${frontData.name}`}
                  {(frontData.idNumber || frontData.passportNumber) &&
                    `\nID: ${frontData.idNumber || frontData.passportNumber}`}
                  {frontData.dob && `\nDOB: ${frontData.dob}`}
                </Text>
              </View>
            )}
          </View>

          {/* Back Side Preview */}
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

            {/* Back extracted data */}
            {backData && (
              <View className="mt-3 rounded-lg border border-[#00C897]/30 bg-[#E8F8F3] p-3">
                <Text className="mb-1 text-[14px] font-semibold text-[#00C897]">
                  {backData.documentType === 'PASSPORT' ? '🛂 Passport' : '📋 NID'}
                </Text>
                <Text className="text-[12px] text-[#555]">
                  {backData.name && `Name: ${backData.name}`}
                  {(backData.idNumber || backData.passportNumber) &&
                    `\nID: ${backData.idNumber || backData.passportNumber}`}
                  {backData.dob && `\nDOB: ${backData.dob}`}
                </Text>

                {/* NID Back side specific fields */}
                {backData.documentType === 'NID' && (
                  <Text className="mt-2 text-[11px] text-[#666]">
                    {backData.fatherName && `\nFather: ${backData.fatherName}`}
                    {backData.motherName && `\nMother: ${backData.motherName}`}
                    {backData.spouseName && `\nSpouse: ${backData.spouseName}`}
                    {backData.bloodGroup && `\nBlood Group: ${backData.bloodGroup}`}
                    {backData.dateOfIssue && `\nIssue Date: ${backData.dateOfIssue}`}
                    {backData.district && `\nDistrict: ${backData.district}`}
                    {backData.presentAddress && `\nPresent Address: ${backData.presentAddress.substring(0, 50)}...`}
                    {backData.permanentAddress && `\nPermanent Address: ${backData.permanentAddress.substring(0, 50)}...`}
                  </Text>
                )}

                {/* Passport Back side specific fields */}
                {backData.documentType === 'PASSPORT' && (
                  <Text className="mt-2 text-[11px] text-[#666]">
                    {backData.emergencyContact && `\nEmergency Contact: ${backData.emergencyContact}`}
                    {backData.address && `\nAddress: ${backData.address.substring(0, 80)}...`}
                    {backData.observations && `\nObservations: ${backData.observations.substring(0, 80)}...`}
                    {backData.fileNumber && `\nFile No: ${backData.fileNumber}`}
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Loading indicator */}
          {isLoading && (
            <View className="mb-4 items-center py-4">
              <ActivityIndicator size="small" color="#00C897" />
              <Text className="mt-2 text-[14px] text-[#555]">
                Detecting document type & extracting text...
              </Text>
            </View>
          )}

          {/* Error message */}
          {error && (
            <View className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
              <Text className="text-[14px] text-red-600">{error}</Text>
            </View>
          )}

          {/* Validation errors */}
          {(frontData?.validationErrors || backData?.validationErrors || !frontUri || !backUri) && (
            <View
              className={`mb-4 rounded-lg border p-3 ${
                getMergedValidationErrors().some((e) => e.isCritical)
                  ? 'border-[#FF9800] bg-[#FFF3E0]'
                  : 'border-[#00C897]/30 bg-[#E8F8F3]'
              }`}>
              <Text
                className={`mb-2 text-[14px] font-bold ${
                  getMergedValidationErrors().some((e) => e.isCritical)
                    ? 'text-[#FF9800]'
                    : 'text-[#00C897]'
                }`}>
                {getMergedValidationErrors().some((e) => e.isCritical)
                  ? '⚠️ Issues Detected:'
                  : '✓ Looking Good!'}
              </Text>
              {getMergedValidationErrors().map((error, i) => (
                <View key={i} className="mb-1 flex-row items-start">
                  <Text className="mr-2 text-[12px] text-[#FF6B6B]">
                    {error.isCritical ? '🚫' : '⚠️'}
                  </Text>
                  <Text className="flex-1 text-[13px] text-[#555]">{error.message}</Text>
                </View>
              ))}
            </View>
          )}

          <Text className="mb-3 mt-5 text-[16px] font-bold text-[#1A1A1A]">
            Photo Quality Guidelines
          </Text>
          {[
            'Readable, clear and not blurry',
            'Well-lit, not reflective, not too dark',
            'ID occupies most of the image',
          ].map((tip, i) => (
            <View key={i} className="mb-2 flex-row items-center">
              <CheckIcon />
              <Text className="ml-2 text-[14px] text-[#555]">{tip}</Text>
            </View>
          ))}

          <Text className="mb-3 mt-5 text-[16px] font-bold text-[#1A1A1A]">
            Please confirm that
          </Text>
          {['ID is not expired'].map((tip, i) => (
            <View key={i} className="mb-2 flex-row items-center">
              <View className="mr-3 h-1.5 w-1.5 rounded-full bg-[#888]" />
              <Text className="text-[14px] text-[#555]">{tip}</Text>
            </View>
          ))}

          {/* Capture Next Button - Only show if front is captured but back is not */}
          {frontUri && !backUri && !isLoading && (
            <TouchableOpacity
              onPress={handleCaptureNext}
              activeOpacity={0.8}
              className="mt-8 h-[54px] items-center justify-center rounded-full bg-[#00C897]">
              <Text className="text-[17px] font-bold text-white">Capture Back Side →</Text>
            </TouchableOpacity>
          )}

          {/* Confirm Button - Only show when both sides are captured */}
          {frontUri && backUri && (
            <TouchableOpacity
              onPress={() => router.push('/kyc/address-roles')}
              activeOpacity={0.8}
              className={`mt-8 h-[54px] items-center justify-center rounded-full ${
                !canProceed() ? 'bg-[#CCC]' : 'bg-[#00C897]'
              }`}
              disabled={isLoading || !canProceed()}>
              <Text className="text-[17px] font-bold text-white">
                {!canProceed() ? 'Fix Issues First' : 'Confirm & Continue'}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.8}
            className="mt-3 h-[54px] items-center justify-center rounded-full bg-[#E4F7EE]"
            disabled={isLoading}>
            <Text className="text-[17px] font-semibold text-[#888]">
              {frontUri && backUri ? 'Start Over' : 'Cancel'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KycCard>
    </View>
  );
}
