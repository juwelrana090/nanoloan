# KYC Screens - Navigation Flow & API Connections

## Complete KYC Navigation Flow

```
Registration/Login
        ↓
app/auth/basic-information          →  PUT /v1/users/me
        ↓
app/auth/addresses-update           →  POST /v1/users/me/addresses
        ↓
app/kyc/started                     →  (info screen)
        ↓
app/kyc/select-id-type              →  (selection only)
        ↓
app/kyc/id-capture                  →  (camera capture - front)
        ↓
app/kyc/id-capture-preview          →  POST /v1/biometric/id-verify (front)
        ↓
app/kyc/id-capture                  →  (camera capture - back)
        ↓
app/kyc/id-capture-preview          →  POST /v1/biometric/id-verify (back)
        ↓
app/kyc/address-roles               →  (selection only)
        ↓
app/kyc/address-capture             →  (camera capture)
        ↓
app/kyc/address-capture-preview     →  POST /v1/biometric/address-verify
        ↓
app/kyc/facial-recognition          →  (facial verification)
        ↓
KYC Complete → Main App (tabs)
```

## Screen Inventory

### Auth Flow Screens

#### 1. BasicInformationScreen
**Path**: `app/auth/basic-information.tsx`
**Purpose**: Collect user's basic information
**Inputs**:
- Gender (dropdown): Male | Female | Other
- Marital Status (dropdown): Single | Married | Divorced | Widowed
- Education Level (dropdown): Primary | Secondary | Diploma | Bachelor | Master | PhD
- National ID (text input)
- TIN (text input)
- Passport No (text input)

**Outputs**:
- Calls API: `PUT /v1/users/me` with UpdateProfileRequest
- Navigates to: `/auth/addresses-update`
- Shows: Success toast on success, error toast on failure
- Loading: Local useState or RTK Query isLoading

**Current State**: ❌ No API call - just navigates to next screen
**Required**: ✅ Wire up API integration

#### 2. AddressesUpdateScreen
**Path**: `app/auth/addresses-update.tsx`
**Purpose**: Collect user's address information
**Inputs**:
- Type (dropdown): Home | Work | Other
- Address (text input)
- Post Code (text input, numeric)
- City (dropdown): Dhaka | Chittagong | Sylhet | Rajshahi | Khulna
- State (dropdown): Dhaka Division | Chittagong Division | etc.
- Country (text, fixed): Bangladesh
- Years At Address (text input, numeric)

**Outputs**:
- Calls API: `POST /v1/users/me/addresses` with AddAddressRequest
- Navigates to: `/kyc/started`
- Shows: Success toast on success, error toast on failure
- Loading: Local useState or RTK Query isLoading

**Current State**: ❌ No API call - just navigates to next screen
**Required**: ✅ Wire up API integration

### KYC Flow Screens

#### 3. StartedVerificationScreen
**Path**: `app/kyc/started.tsx`
**Purpose**: Introduction and agreement to KYC process
**Inputs**: None (display only)
**Outputs**:
- Calls API: `POST /v1/biometric/start` (on "Agree And Continue" press)
- Saves: `biometricSessionId` from response to Redux KYC state
- Navigates to: `/kyc/select-id-type`
- Shows: Error toast + retry option on failure
- Loading: RTK Query isLoading

**Current State**: ❌ No API call - just navigates
**Required**: ✅ Wire up API integration
**Important**: Must store `sessionId` (or `biometricSessionToken`) for subsequent ID and address verification calls

#### 4. SelectIDTypeScreen
**Path**: `app/kyc/select-id-type.tsx`
**Purpose**: User selects ID card type
**Inputs**: Selection - NID or Passport
**Outputs**:
- Saves: `selectedIdType` to Redux KYC state
- Navigates to: `/kyc/id-capture?side=front`
- No API call

**Current State**: ✅ Complete (no API needed)

#### 5. IDCaptureScreen
**Path**: `app/kyc/id-capture.tsx`
**Purpose**: Camera capture for ID card
**Inputs**: Camera stream
**Outputs**:
- Saves: Captured image URI to Redux KYC state (frontImageUri or backImageUri)
- Navigates to: `/kyc/id-capture-preview?uri=...&side=front|back`
- No API call

**Current State**: ✅ Complete (no API needed)

#### 6. IDCapturePreviewScreen
**Path**: `app/kyc/id-capture-preview.tsx`
**Purpose**: Preview captured ID, extract OCR data, and submit to backend
**Inputs**:
- Image URI (from route params or Redux state)
- Side: 'front' | 'back'

**Process**:
1. Display image preview
2. Run OCR extraction (using ML Kit)
3. Validate extracted data
4. Display extracted fields (name, NID number, DOB)
5. On "Confirm & Continue": Submit to backend

**Outputs**:
- Calls API: `POST /v1/biometric/id-verify`
- Request: FormData with `{ idType, idCardImage, sessionId }`
  - `idType`: 'NID' | 'PASSPORT'
  - `idCardImage`: File object from croppedImageUri
  - `sessionId`: From biometric start response
- Navigates to:
  - Front: `/kyc/id-capture?side=back`
  - Back: `/kyc/address-roles`
- Shows: Success toast, error toast + retake option
- Loading: Redux KYC state `isLoading` or RTK Query

**Current State**: ❌ No backend API call - only OCR extraction
**Required**: ✅ Wire up backend API integration on "Confirm & Continue"

**Read from KYC State**:
- `frontImageUri` or `backImageUri`
- `selectedIdType` (NID or Passport)
- `biometricSessionId` (from started-verification)

#### 7. AddressRolesScreen
**Path**: `app/kyc/address-roles.tsx`
**Purpose**: Select address proof document type
**Inputs**: Selection - Utility bill, Bank statement, etc.
**Outputs**:
- Saves: Selected document type to Redux KYC state
- Navigates to: `/kyc/address-capture`
- No API call

**Current State**: ✅ Complete (no API needed)

#### 8. AddressCaptureScreen
**Path**: `app/kyc/address-capture.tsx`
**Purpose**: Camera capture for address proof document
**Inputs**: Camera stream
**Outputs**:
- Saves: Captured image URI to Redux KYC state (addressImageUri)
- Navigates to: `/kyc/address-capture-preview?uri=...`
- No API call

**Current State**: ✅ Complete (no API needed)

#### 9. AddressCapturePreviewScreen
**Path**: `app/kyc/address-capture-preview.tsx`
**Purpose**: Preview address document and submit to backend
**Inputs**:
- Image URI (from route params or Redux state)

**Process**:
1. Display image preview
2. Validate image quality
3. On "Confirm": Submit to backend

**Outputs**:
- Calls API: `POST /v1/biometric/address-verify`
- Request: FormData with `{ addressImage, sessionId }`
  - `addressImage`: File object from croppedAddressImageUri
  - `sessionId`: From biometric start response
- Navigates to: `/kyc/facial-recognition`
- Shows: Success toast, error toast + retake option
- Loading: Redux KYC state `isLoading` or RTK Query

**Current State**: ❌ No backend API call - only navigation
**Required**: ✅ Wire up backend API integration on "Confirm"

**Read from KYC State**:
- `addressImageUri`
- `biometricSessionId` (from started-verification)

#### 10. FacialRecognitionScreen
**Path**: `app/kyc/facial-recognition.tsx`
**Purpose**: Facial recognition verification
**Inputs**: Camera stream + facial capture
**Outputs**:
- Calls API: (TBD - may have facial verification endpoint)
- Navigates to: `/kyc/verified` (success) or main app
- Shows: Success/error feedback

**Current State**: ❓ May need API integration (verify spec)

## API Connections Summary

| Screen | API Endpoint | Method | Auth Required | Request Type | Status |
|--------|-------------|--------|---------------|--------------|--------|
| BasicInformationScreen | `/v1/users/me` | PUT | ✅ | JSON | ❌ Not wired |
| AddressesUpdateScreen | `/v1/users/me/addresses` | POST | ✅ | JSON | ❌ Not wired |
| StartedVerificationScreen | `/v1/biometric/start` | POST | ✅ | JSON (empty) | ❌ Not wired |
| IDCapturePreviewScreen | `/v1/biometric/id-verify` | POST | ✅ | FormData | ❌ Not wired |
| AddressCapturePreviewScreen | `/v1/biometric/address-verify` | POST | ✅ | FormData | ❌ Not wired |

## Redux State Used by KYC Screens

### Reading State
- `kyc.documentType` - Selected ID type
- `kyc.frontImageUri` - Front ID card image
- `kyc.backImageUri` - Back ID card image
- `kyc.addressImageUri` - Address document image
- `kyc.frontData` - OCR data from front
- `kyc.backData` - OCR data from back
- `kyc.isLoading` - Loading state
- `kyc.error` - Error message
- `auth.token` - Access token for API calls

### Writing State (to be added)
- `kyc.biometricSessionId` - Session ID from biometric start
- `kyc.selectedIdType` - User-selected ID type
- `kyc.croppedFrontImageUri` - Cropped front image
- `kyc.croppedBackImageUri` - Cropped back image
- `kyc.croppedAddressImageUri` - Cropped address image
- `kyc.idSubmitted` - Track if ID was submitted
- `kyc.addressSubmitted` - Track if address was submitted

## Error Handling Flow

### On API Success
1. Show success toast: `showSuccess({ title: 'Success', message: response.message })`
2. Update Redux state if needed
3. Navigate to next screen

### On 422 Validation Error
1. Extract field errors from response
2. Show errors under each input field
3. Show error toast: `showError({ title: 'Validation Failed', message: 'Please fix the errors' })`

### On 401 Unauthorized
1. Auto-logout triggered by apiSlice
2. User redirected to login
3. Show info toast: Session expired

### On Other Errors
1. Show error toast: `showError({ title: 'Error', message: error.data?.message || 'Operation failed' })`
2. Keep user on current screen
3. Provide retry option

## Navigation Guards

**Current Implementation**:
- No explicit guards on KYC screens
- Navigation relies on user following flow
- Each screen checks if required data exists in Redux state

**Recommended Improvements**:
- Add guards to ensure biometric session exists before ID/address verification
- Check if previous step completed before allowing access
- Redirect to start if session missing

## Screen Status Summary

| Screen | File Path | API Call | Navigation | Loading | Errors | Status |
|--------|-----------|----------|------------|---------|--------|--------|
| BasicInformation | app/auth/basic-information.tsx | ❌ None | ✅ Complete | ❌ | ❌ | ⚠️ Needs API |
| AddressesUpdate | app/auth/addresses-update.tsx | ❌ None | ✅ Complete | ❌ | ❌ | ⚠️ Needs API |
| StartedVerification | app/kyc/started.tsx | ❌ None | ✅ Complete | ❌ | ❌ | ⚠️ Needs API |
| SelectIDType | app/kyc/select-id-type.tsx | N/A | ✅ Complete | N/A | N/A | ✅ Complete |
| IDCapture | app/kyc/id-capture.tsx | N/A | ✅ Complete | N/A | N/A | ✅ Complete |
| IDCapturePreview | app/kyc/id-capture-preview.tsx | ❌ No backend | ✅ Complete | ✅ | ✅ | ⚠️ Needs API |
| AddressRoles | app/kyc/address-roles.tsx | N/A | ✅ Complete | N/A | N/A | ✅ Complete |
| AddressCapture | app/kyc/address-capture.tsx | N/A | ✅ Complete | N/A | N/A | ✅ Complete |
| AddressCapturePreview | app/kyc/address-capture-preview.tsx | ❌ No backend | ✅ Complete | ✅ | ✅ | ⚠️ Needs API |
| FacialRecognition | app/kyc/facial-recognition.tsx | ❓ Unknown | ✅ Complete | ❓ | ❓ | ❓ Verify spec |

## Notes for Implementation

1. **Biometric Session ID** must be stored after calling `/v1/biometric/start`
2. **ID verification** needs both front and back images
3. **Address verification** needs single image
4. **FormData uploads** require special handling in RTK Query
5. **OCR extraction** is already working - don't break it
6. **Loading states** should use RTK Query `isLoading` for consistency
7. **Error messages** should be user-friendly
8. **Validation errors** (422) should show field-level feedback
