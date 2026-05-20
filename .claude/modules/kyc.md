# KYC Module
> Last updated: 2026-05-20 by /r-memory scan

## Purpose
Handles Know Your Customer (KYC) verification flow including ID capture, OCR, address proof, and facial recognition.

## Files
- `shared/libs/redux/features/kyc/kycSlice.ts` - Redux state for KYC
- `shared/components/kyc/` - KYC-specific components
- `types/kyc.ts` - KYC type definitions
- `app/kyc/` - KYC screens

## State Shape
```typescript
interface KYCState {
  documentType: DocumentType | null;  // 'NID' | 'PASSPORT' | 'UNKNOWN'
  frontImageUri: string | null;
  backImageUri: string | null;
  addressImageUri: string | null;
  frontData: ExtractedData | null;
  backData: ExtractedData | null;
  currentStep: string;
  isLoading: boolean;
  error: string | null;
}
```

## Type Definitions
```typescript
type DocumentType = 'NID' | 'PASSPORT' | 'UNKNOWN';

interface ExtractedData {
  documentType?: DocumentType;
  name?: string;
  idNumber?: string;
  nidNo?: string;
  passportNumber?: string;
  dob?: string;
  expiryDate?: string;
  address?: string;
  rawText: string;
  validationErrors?: ValidationError[];
}
```

## KYC Flow

### 1. Basic Information
- Screen: `/auth/basic-information`
- Collects: Gender, marital status, education, NID, TIN
- API: `PUT /v1/users/me/basic-info`

### 2. Address Information
- Screen: `/auth/addresses-update`
- Collects: Present address, permanent address
- API: `POST /v1/users/me/addresses`

### 3. ID Verification
- Screen: `/kyc/select-id-type` → `/kyc/id-capture` → `/kyc/id-capture-preview`
- Captures: Front and back of ID card
- OCR: ML Kit for text extraction
- Manual correction if OCR fails

### 4. Address Verification
- Screen: `/kyc/address-roles` → `/kyc/address-capture` → `/kyc/address-capture-preview`
- Captures: Address proof document
- Document types: Utility bill, bank statement, etc.

### 5. Facial Recognition
- Screen: `/kyc/facial-recognition`
- API: `POST /v1/biometric/start` → Upload images → `POST /v1/biometric/verify`
- Status: ⏳ API not fully wired

## Biometric Status Check
- API: `GET /v1/biometric/status`
- Returns:
  ```typescript
  {
    idVerified: boolean;
    addressVerified: boolean;
    faceVerified: boolean;
    overallStatus: string;
  }
  ```
- Used to show verification prompt on home screen

## Dependencies
- ML Kit: OCR for ID card text extraction
- Camera: Expo Camera for document capture
- Image Manipulator: Expo ImageManipulator for cropping
- Biometric API: Backend endpoints for verification

## Screens Status
- `/kyc/started` - ✅ Complete
- `/kyc/select-id-type` - ✅ Complete
- `/kyc/id-capture` - ✅ Complete
- `/kyc/id-capture-preview` - ✅ Complete (with OCR)
- `/kyc/address-roles` - ✅ Complete
- `/kyc/address-capture` - ✅ Complete
- `/kyc/address-capture-preview` - ✅ Complete
- `/kyc/facial-recognition` - ⏳ Created, API not wired
- `/kyc/verified` - ✅ Complete

## Notes
- KYC state persisted to AsyncStorage (user can resume flow)
- Images stored as URIs (not in AsyncStorage due to size limits)
- OCR results shown for user verification before submission
- Manual correction allowed if OCR fails
