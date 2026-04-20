# Senior Developer Agent Prompt — KYC: NID/Passport OCR Fix + ID Capture Frame Crop

## 🎯 Your Role

You are a **Senior React Native Mobile Developer** specializing in camera, image processing, and OCR integration. You work on the **NanoLoan** React Native Expo project. You fix bugs precisely — you read the full existing implementation first, then fix without breaking anything else.

---

## ⚠️ CRITICAL: Read First

Before changing anything, read ALL of the following files completely:

```
app/kyc/id-capture.tsx              ← IDCaptureScreen (camera + frame border)
app/kyc/id-capture-preview.tsx      ← IDCapturePreviewScreen (OCR trigger + result display)
```

Then search the entire project for:

- The OCR / document detection service: search `nid`, `ocr`, `detection`, `passport`, `tesseract`, `google vision`, `mlkit`, `textRecognition`
- Any hook like `useDocumentScan`, `useOCR`, `useNIDDetection`
- Any utility in `lib/`, `utils/`, `services/`, `shared/` related to document parsing
- Any API call that sends the image for server-side OCR

Map exactly:

1. How the current NID/Passport detection works (library used, config, field extraction logic)
2. Where the extracted fields are stored (state, Zustand store, AsyncStorage, context)
3. How the extracted data flows to the next screen(s)
4. Where field names are mapped (what key maps to "name", "date of birth", etc.)

**Do NOT write any code until this mapping is complete.**

---

## 📁 Project Root

```
D:\ReactNative\nano-loan
```

(or wherever the project root is — confirm by checking `package.json`)

---

## 🐛 Task 01 — Fix NID / Passport Detection

### Problem

The NID and Passport detection is not extracting fields correctly.

### Required Field Extraction — Fix to Extract Exactly These Fields:

#### 🪪 NID Front

| Field Key     | Display Label | Notes                        |
| ------------- | ------------- | ---------------------------- |
| `name`        | Name          | English name printed on NID  |
| `dateOfBirth` | Date of Birth | Format: DD MMM YYYY          |
| `nidNo`       | NID No        | 10 or 17 digit number        |
| `fatherName`  | পিতা          | Bengali text — father's name |
| `motherName`  | মাতা          | Bengali text — mother's name |

#### 🪪 NID Back

| Field Key      | Display Label  | Notes                 |
| -------------- | -------------- | --------------------- |
| `address`      | ঠিকানা         | Bengali address block |
| `placeOfBirth` | Place of Birth | English text          |

#### 🛂 Passport Front

| Field Key        | Display Label   | Notes |
| ---------------- | --------------- | ----- |
| `surname`        | Surname         |       |
| `givenName`      | Given Name      |       |
| `dateOfBirth`    | Date of Birth   |       |
| `passportNumber` | Passport Number |       |
| `dateOfIssue`    | Date of Issue   |       |
| `dateOfExpiry`   | Date of Expiry  |       |

#### 🛂 Passport Back

| Field Key                   | Display Label                  | Notes |
| --------------------------- | ------------------------------ | ----- |
| `permanentAddress`          | Permanent Address              |       |
| `emergencyContactAddress`   | Emergency Contact Address      |       |
| `emergencyContactTelephone` | Emergency Contact Telephone No |       |

---

### Detection Fix — Implementation Rules

#### Step 1 — Identify the current OCR library

Check which library is currently installed and used:

- `@react-native-ml-kit/text-recognition` — Google ML Kit (best for Bengali text)
- `expo-camera` with manual OCR
- A backend API call with base64 image
- `react-native-text-detector`
- Any other

#### Step 2 — If using ML Kit (`@react-native-ml-kit/text-recognition`)

The current extraction logic is likely using naive line-by-line text matching. Fix it with **regex + label-based parsing**:

```typescript
// services/ocr/nidParser.ts

export function parseNIDFront(rawText: string): Partial<NIDFrontFields> {
  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const result: Partial<NIDFrontFields> = {};

  // Name — line after "Name" label (English)
  const nameIdx = lines.findIndex((l) => /^Name$/i.test(l));
  if (nameIdx !== -1 && lines[nameIdx + 1]) {
    result.name = lines[nameIdx + 1];
  }

  // Date of Birth
  const dobMatch = rawText.match(/Date of Birth[:\s]*(\d{1,2}\s+\w+\s+\d{4})/i);
  if (dobMatch) result.dateOfBirth = dobMatch[1];

  // NID No — 10 or 17 consecutive digits
  const nidMatch = rawText.match(/\b(\d{10}|\d{17})\b/);
  if (nidMatch) result.nidNo = nidMatch[1];

  // পিতা (Father) — Bengali label followed by name
  const fatherMatch = rawText.match(/পিতা[:\s]*([^\n]+)/);
  if (fatherMatch) result.fatherName = fatherMatch[1].trim();

  // মাতা (Mother) — Bengali label followed by name
  const motherMatch = rawText.match(/মাতা[:\s]*([^\n]+)/);
  if (motherMatch) result.motherName = motherMatch[1].trim();

  return result;
}

export function parseNIDBack(rawText: string): Partial<NIDBackFields> {
  const result: Partial<NIDBackFields> = {};

  // ঠিকানা (Address) — Bengali address block after label
  const addressMatch = rawText.match(/ঠিকানা[:\s]*([^\n]+(?:\n[^\n]+)*?)(?=Place of Birth|$)/i);
  if (addressMatch) result.address = addressMatch[1].trim();

  // Place of Birth
  const pobMatch = rawText.match(/Place of Birth[:\s]*([^\n]+)/i);
  if (pobMatch) result.placeOfBirth = pobMatch[1].trim();

  return result;
}

export function parsePassportFront(rawText: string): Partial<PassportFrontFields> {
  const result: Partial<PassportFrontFields> = {};

  // Surname
  const surnameMatch = rawText.match(/Surname[:\s]*([^\n]+)/i);
  if (surnameMatch) result.surname = surnameMatch[1].trim();

  // Given Name
  const givenMatch = rawText.match(/Given Name[s]?[:\s]*([^\n]+)/i);
  if (givenMatch) result.givenName = givenMatch[1].trim();

  // Passport Number — 2 letters + 7 digits (Bangladesh format: A1234567)
  const passportNoMatch = rawText.match(/\b([A-Z]{1,2}\d{7})\b/);
  if (passportNoMatch) result.passportNumber = passportNoMatch[1];

  // Dates — DD MMM YYYY or DD/MM/YYYY patterns
  const datePattern = /(\d{1,2}[\s\/\-]\w{3,9}[\s\/\-]\d{4})/g;
  const dates = [...rawText.matchAll(datePattern)].map((m) => m[1]);

  const dobMatch = rawText.match(/Date of Birth[:\s]*(\d{1,2}[\s\/]\w+[\s\/]\d{4})/i);
  if (dobMatch) result.dateOfBirth = dobMatch[1];

  const issueMatch = rawText.match(/Date of Issue[:\s]*(\d{1,2}[\s\/]\w+[\s\/]\d{4})/i);
  if (issueMatch) result.dateOfIssue = issueMatch[1];

  const expiryMatch = rawText.match(/Date of Expir[y|ation][:\s]*(\d{1,2}[\s\/]\w+[\s\/]\d{4})/i);
  if (expiryMatch) result.dateOfExpiry = expiryMatch[1];

  return result;
}

export function parsePassportBack(rawText: string): Partial<PassportBackFields> {
  const result: Partial<PassportBackFields> = {};

  // Permanent Address
  const permAddrMatch = rawText.match(/Permanent Address[:\s]*([^\n]+(?:\n[^\n]+)?)/i);
  if (permAddrMatch) result.permanentAddress = permAddrMatch[1].trim();

  // Emergency Contact Address
  const emergAddrMatch = rawText.match(/Address[:\s]*([^\n]+)/i);
  if (emergAddrMatch) result.emergencyContactAddress = emergAddrMatch[1].trim();

  // Telephone No
  const telMatch = rawText.match(/Telephone[^:]*[:\s]*([+\d\s\-()]+)/i);
  if (telMatch) result.emergencyContactTelephone = telMatch[1].trim();

  return result;
}
```

#### Step 3 — TypeScript Types

Create or update:

```typescript
// types/kyc.ts

export interface NIDFrontFields {
  name: string;
  dateOfBirth: string;
  nidNo: string;
  fatherName: string; // পিতা
  motherName: string; // মাতা
}

export interface NIDBackFields {
  address: string; // ঠিকানা
  placeOfBirth: string;
}

export interface PassportFrontFields {
  surname: string;
  givenName: string;
  dateOfBirth: string;
  passportNumber: string;
  dateOfIssue: string;
  dateOfExpiry: string;
}

export interface PassportBackFields {
  permanentAddress: string;
  emergencyContactAddress: string;
  emergencyContactTelephone: string;
}

export type IDSide = 'front' | 'back';
export type IDType = 'nid' | 'passport';

export interface KYCDocumentState {
  idType: IDType;
  frontFields: NIDFrontFields | PassportFrontFields | null;
  backFields: NIDBackFields | PassportBackFields | null;
  frontImage: string | null;
  backImage: string | null;
}
```

#### Step 4 — Wire into the preview screen

In `app/kyc/id-capture-preview.tsx`:

- After OCR runs, call the correct parser based on `idType` and `side` (front/back)
- Display ALL extracted fields from the parser result
- Show a fallback `"—"` for any field that returned empty/undefined
- Store the parsed result in the KYC state/store for use in the final submission

#### Step 5 — Bengali text support

If Bengali text (পিতা, মাতা, ঠিকানা) is not being recognised:

- Confirm `@react-native-ml-kit/text-recognition` is being run in **Latin + Bengali** script mode
- If using ML Kit, ensure the Bengali language model is loaded:
  ```typescript
  import TextRecognition, { TextRecognitionScript } from '@react-native-ml-kit/text-recognition';
  const result = await TextRecognition.recognize(imagePath, TextRecognitionScript.DEVANAGARI);
  // Note: ML Kit uses DEVANAGARI script for Bengali — confirm this matches your library version
  ```
- If Bengali still fails, fall back to **positional parsing** (the Bengali fields appear in a known position relative to English fields — parse by line index offset instead of label match)

---

## 🎯 Task 02 — ID Capture: Crop Image to Frame Border Only

### Problem

The camera currently captures the **full screen image**. The requirement is to **crop the captured image to only the area inside the green frame border** defined by `FRAME_WIDTH`, `FRAME_HEIGHT`, `FRAME_LEFT`, `FRAME_TOP`.

### Current Frame Code (from `app/kyc/id-capture.tsx`)

```tsx
<View
  className="absolute z-10 overflow-hidden rounded-xl border-2 border-white/40"
  style={{ width: FRAME_WIDTH, height: FRAME_HEIGHT, left: FRAME_LEFT, top: FRAME_TOP }}>
  {/* Corner accents */}
  <View className="absolute left-0 top-0 h-7 w-7 rounded-tl-xl border-l-4 border-t-4 border-[#25d17f]" />
  <View className="absolute right-0 top-0 h-7 w-7 rounded-tr-xl border-r-4 border-t-4 border-[#25d17f]" />
  <View className="absolute bottom-0 left-0 h-7 w-7 rounded-bl-xl border-b-4 border-l-4 border-[#25d17f]" />
  <View className="absolute bottom-0 right-0 h-7 w-7 rounded-br-xl border-b-4 border-r-4 border-[#25d17f]" />
  {/* MRZ lines */}
  <View className="absolute bottom-3 left-3 right-3">
    <Text className="text-[16px] leading-[21px] tracking-widest text-white/60">
      {'<'.repeat(44)}
    </Text>
    <Text className="text-[16px] leading-[21px] tracking-widest text-white/60">
      {'<'.repeat(44)}
    </Text>
  </View>
</View>
```

### Fix — Implement Frame-Only Crop

#### Step 1 — Read existing constants

Find `FRAME_WIDTH`, `FRAME_HEIGHT`, `FRAME_LEFT`, `FRAME_TOP` in `id-capture.tsx`.
They are likely computed from `Dimensions.get('window')`. Read the exact values.

#### Step 2 — Install image cropping library (if not already installed)

Check `package.json` for:

- `expo-image-manipulator` ← preferred (already in Expo ecosystem)
- `react-native-image-crop-picker`
- `@shopify/react-native-skia`

If `expo-image-manipulator` is not installed:

```bash
npx expo install expo-image-manipulator
```

#### Step 3 — Implement crop after capture

```typescript
// utils/cropToFrame.ts
import * as ImageManipulator from 'expo-image-manipulator';
import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FrameConfig {
  frameWidth: number;
  frameHeight: number;
  frameLeft: number;
  frameTop: number;
}

export async function cropImageToFrame(
  photoUri: string,
  frame: FrameConfig,
  photoWidth: number, // actual photo resolution width
  photoHeight: number // actual photo resolution height
): Promise<string> {
  // Calculate scale ratio between photo resolution and screen size
  const scaleX = photoWidth / SCREEN_WIDTH;
  const scaleY = photoHeight / SCREEN_HEIGHT;

  // Map frame screen coordinates to actual photo pixel coordinates
  const cropRegion = {
    originX: Math.round(frame.frameLeft * scaleX),
    originY: Math.round(frame.frameTop * scaleY),
    width: Math.round(frame.frameWidth * scaleX),
    height: Math.round(frame.frameHeight * scaleY),
  };

  const result = await ImageManipulator.manipulateAsync(photoUri, [{ crop: cropRegion }], {
    compress: 0.9,
    format: ImageManipulator.SaveFormat.JPEG,
  });

  return result.uri;
}
```

#### Step 4 — Wire into the capture handler

In `app/kyc/id-capture.tsx`, find the camera capture handler (likely `takePicture()` or `onCapture`). After the photo is taken:

```typescript
// After capturing photo
const photo = await cameraRef.current.takePictureAsync({
  quality: 0.9,
  exif: false,
});

// Crop to frame area only
const croppedUri = await cropImageToFrame(
  photo.uri,
  {
    frameWidth: FRAME_WIDTH,
    frameHeight: FRAME_HEIGHT,
    frameLeft: FRAME_LEFT,
    frameTop: FRAME_TOP,
  },
  photo.width,
  photo.height
);

// Navigate to preview with cropped image (not raw photo)
router.push({
  pathname: '/kyc/id-capture-preview',
  params: { imageUri: croppedUri, idType, side },
});
```

#### Step 5 — Verify OCR improvement

After cropping, the OCR input is a tight ID card image with no background noise.
This alone will significantly improve text recognition accuracy.
Confirm the preview screen uses `croppedUri` not the original `photo.uri` for OCR.

---

## 📋 Implementation Order

Execute in this exact order:

1. Read all existing files (audit only, no edits)
2. Create `types/kyc.ts` with all field interfaces
3. Create `utils/ocr/nidParser.ts` with all 4 parser functions
4. Create `utils/cropToFrame.ts` with the crop utility
5. Fix `app/kyc/id-capture.tsx` — add crop after capture
6. Fix `app/kyc/id-capture-preview.tsx` — wire correct parser per `idType` + `side`, display all fields
7. Run on device and test with a real NID image (both front and back)
8. Run on device and test with a real Passport image (both front and back)

---

## ✅ Definition of Done

```
✅ TASK 01 — NID/Passport Detection Fixed

NID Front extracts:
- [ ] name
- [ ] dateOfBirth
- [ ] nidNo
- [ ] fatherName (পিতা)
- [ ] motherName (মাতা)

NID Back extracts:
- [ ] address (ঠিকানা)
- [ ] placeOfBirth

Passport Front extracts:
- [ ] surname
- [ ] givenName
- [ ] dateOfBirth
- [ ] passportNumber
- [ ] dateOfIssue
- [ ] dateOfExpiry

Passport Back extracts:
- [ ] permanentAddress
- [ ] emergencyContactAddress
- [ ] emergencyContactTelephone

✅ TASK 02 — ID Capture Frame Crop Fixed

- [ ] expo-image-manipulator installed (or existing lib used)
- [ ] cropImageToFrame() utility created
- [ ] Capture handler crops to frame before navigating to preview
- [ ] OCR receives cropped image (not full screen photo)
- [ ] Preview screen shows cropped image, not full screen photo
- [ ] No regression on camera UI (frame border, corners, MRZ lines unchanged)

⚠️ Issues found (if any):
- [list anything that blocked implementation]
```
