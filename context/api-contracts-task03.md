# API Contracts - Task 03 Integration

**Source**: Live OpenAPI spec from `https://backend-nanoloan.giize.com/api-json`
**Extracted**: 2025-04-21

---

## Endpoint 1: Update User Profile

**PUT** `/v1/users/me`

**Purpose**: Update user's basic profile information (gender, marital status, education, IDs)

**Auth Required**: ✅ Yes (JWT Bearer Token)

**Content-Type**: `application/json`

### Request Headers

```http
Authorization: Bearer <token>
Content-Type: application/json
```

### Request Body (UpdateBasicInfoDto)

```typescript
interface UpdateBasicInfoRequest {
  maritalStatus?: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
  educationLevel?: 'PRIMARY' | 'SECONDARY' | 'DIPLOMA' | 'BACHELOR' | 'MASTER' | 'PHD' | 'OTHER';
  nationalId?: string;
  tin?: string;
  passportNo?: string;
}
```

**All fields are optional** - only send fields that should be updated

### Request Example

```json
{
  "maritalStatus": "MARRIED",
  "educationLevel": "BACHELOR",
  "nationalId": "1234567890123",
  "tin": "123456789",
  "passportNo": "A1234567"
}
```

### Success Response (200 OK)

```typescript
interface ApiSuccessResponse {
  success: true;
  message: string;
  data: UserProfile;
}
```

**Example**:
```json
{
  "success": true,
  "message": "Basic info updated",
  "data": {
    "id": "uuid",
    "fullName": "John Doe",
    "email": "john@example.com",
    "profile": {
      "maritalStatus": "MARRIED",
      "educationLevel": "BACHELOR",
      "nationalId": "1234567890123",
      "tin": "123456789",
      "passportNo": "A1234567"
    }
  }
}
```

### Error Responses

**401 Unauthorized**:
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**422 Validation Error**:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["nationalId must be a valid NID number", "tin must be at least 10 characters"]
}
```

---

## Endpoint 2: Add User Address

**POST** `/v1/users/me/addresses`

**Purpose**: Add a new address to the user's profile

**Auth Required**: ✅ Yes (JWT Bearer Token)

**Content-Type**: `application/json`

### Request Headers

```http
Authorization: Bearer <token>
Content-Type: application/json
```

### Request Body (AddAddressDto)

```typescript
interface AddAddressRequest {
  type: 'PRESENT' | 'PERMANENT';
  address: string;
  postCode: string;
  city: string;
  state: string;
  country: string;
  yearsAtAddress: number;
  isPrimary?: boolean;
}
```

### Request Example

```json
{
  "type": "PRESENT",
  "address": "House 12, Road 5, Block A",
  "postCode": "1207",
  "city": "Dhaka",
  "state": "Dhaka Division",
  "country": "Bangladesh",
  "yearsAtAddress": 3,
  "isPrimary": false
}
```

### Success Response (201 Created)

```typescript
interface ApiSuccessResponse {
  success: true;
  message: string;
  data: Address;
}
```

**Example**:
```json
{
  "success": true,
  "message": "Address added successfully",
  "data": {
    "id": "uuid",
    "type": "PRESENT",
    "address": "House 12, Road 5, Block A",
    "postCode": "1207",
    "city": "Dhaka",
    "state": "Dhaka Division",
    "country": "Bangladesh",
    "yearsAtAddress": 3,
    "isPrimary": false,
    "createdAt": "2025-04-21T10:30:00Z"
  }
}
```

### Error Responses

**401 Unauthorized**:
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**422 Validation Error**:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["postCode is required", "yearsAtAddress must be a positive number"]
}
```

---

## Endpoint 3: Start Biometric Verification

**POST** `/v1/biometric/start`

**Purpose**: Initialize a biometric verification session and obtain a session token

**Auth Required**: ✅ Yes (JWT Bearer Token)

**Content-Type**: `application/json`

**Request Body**: None (empty POST)

### Request Headers

```http
Authorization: Bearer <token>
Content-Type: application/json
```

### Request Example

```http
POST /v1/biometric/start
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// No body required
```

### Success Response (200 OK)

```typescript
interface BiometricStartResponse {
  success: true;
  message: string;
  data: {
    sessionId: string; // ⚠️ IMPORTANT: Save this for subsequent calls
    // Other possible fields (verify from actual response)
  };
}
```

**Example**:
```json
{
  "success": true,
  "message": "Biometric verification session started",
  "data": {
    "sessionId": "bio_sess_abc123xyz"
  }
}
```

### Error Responses

**400 Bad Request** (Session already in progress):
```json
{
  "success": false,
  "message": "Biometric session already in progress"
}
```

**401 Unauthorized**:
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

---

## Endpoint 4: Verify ID Card

**POST** `/v1/biometric/id-verify`

**Purpose**: Upload ID card image for verification (NID or Passport)

**Auth Required**: ✅ Yes (JWT Bearer Token)

**Content-Type**: `multipart/form-data`

### Request Headers

```http
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

### Request Body (FormData)

```typescript
// FormData fields
{
  idType: 'NID' | 'PASSPORT';
  idCardImage: File; // Binary image file
}
```

### FormData Build Example

```typescript
const formData = new FormData();
formData.append('idType', 'NID');
formData.append('idCardImage', {
  uri: 'file://path/to/image.jpg',
  name: 'id-card.jpg',
  type: 'image/jpeg',
} as any);
```

### Required Fields

- `idType` (string): Must be "NID" or "PASSPORT"
- `idCardImage` (file): Image file of the ID card

**Note**: The API spec shows these are the ONLY required fields. The `sessionId` from the biometric start call is likely tracked on the backend via the JWT token/session, but verify in testing if it needs to be included.

### Success Response (201 Created)

```typescript
interface ApiSuccessResponse {
  success: true;
  message: string;
  data: {
    // Response data shape varies - verify from actual response
    id: string;
    status: string;
    ocrData?: {
      name?: string;
      idNumber?: string;
      dateOfBirth?: string;
    };
  };
}
```

**Example**:
```json
{
  "success": true,
  "message": "ID card uploaded for verification",
  "data": {
    "id": "id_verify_uuid",
    "status": "pending",
    "ocrData": {
      "name": "JOHN DOE",
      "idNumber": "1234567890123",
      "dateOfBirth": "1990-01-15"
    }
  }
}
```

### Error Responses

**400 Bad Request** (Invalid file or ID type):
```json
{
  "success": false,
  "message": "Invalid file format or ID type",
  "errors": ["idCardImage must be a valid image file (jpg, png)"]
}
```

**401 Unauthorized**:
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

---

## Endpoint 5: Verify Address Document

**POST** `/v1/biometric/address-verify`

**Purpose**: Upload address proof document image for verification

**Auth Required**: ✅ Yes (JWT Bearer Token)

**Content-Type**: `multipart/form-data`

### Request Headers

```http
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

### Request Body (FormData)

```typescript
// FormData fields
{
  addressImage: File; // Binary image file
}
```

### FormData Build Example

```typescript
const formData = new FormData();
formData.append('addressImage', {
  uri: 'file://path/to/address-doc.jpg',
  name: 'address-doc.jpg',
  type: 'image/jpeg',
} as any);
```

### Required Fields

- `addressImage` (file): Image file of the address proof document

**Note**: Similar to ID verify, the `sessionId` is likely tracked via the session/JWT. Verify if additional fields are needed during testing.

### Success Response (201 Created)

```typescript
interface ApiSuccessResponse {
  success: true;
  message: string;
  data: {
    // Response data shape varies - verify from actual response
    id: string;
    status: string;
  };
}
```

**Example**:
```json
{
  "success": true,
  "message": "Address document uploaded successfully",
  "data": {
    "id": "addr_verify_uuid",
    "status": "pending"
  }
}
```

### Error Responses

**400 Bad Request** (Invalid file):
```json
{
  "success": false,
  "message": "Invalid file format",
  "errors": ["addressImage must be a valid image file (jpg, png, pdf)"]
}
```

**401 Unauthorized**:
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

---

## Additional Biometric Endpoints (For Reference)

### POST /v1/biometric/id-match
Match OCR-extracted ID data against user profile
- **Body**: `{ fullName: string, dateOfBirth: string, idNumber: string }`
- **Content-Type**: `application/json`

### POST /v1/biometric/id-retake
Re-upload ID card image (same format as id-verify)
- **Body**: `FormData { idCardImage: File }`

### POST /v1/biometric/address-match
Match address document data against stored address
- **Body**: `{ address: string, postCode: string, city: string }`
- **Content-Type**: `application/json`

### POST /v1/biometric/address-retake
Re-upload address document image (same format as address-verify)
- **Body**: `FormData { addressImage: File }`

### POST /v1/biometric/face-verify
Facial recognition verification
- **Body**: `FormData { faceImage: File }`
- **Returns**: Confidence score (0-1) and pass/fail result (threshold: 0.8)

### GET /v1/biometric/status
Get current biometric verification status
- **Returns**: Overall status of KYC process

---

## TypeScript Type Definitions

### Import Types for Task 03

```typescript
// Add to shared/libs/types/auth.types.ts or create new file

// Endpoint 1: Update Basic Info
export interface UpdateBasicInfoRequest {
  maritalStatus?: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
  educationLevel?: 'PRIMARY' | 'SECONDARY' | 'DIPLOMA' | 'BACHELOR' | 'MASTER' | 'PHD' | 'OTHER';
  nationalId?: string;
  tin?: string;
  passportNo?: string;
}

// Endpoint 2: Add Address
export interface AddAddressRequest {
  type: 'PRESENT' | 'PERMANENT';
  address: string;
  postCode: string;
  city: string;
  state: string;
  country: string;
  yearsAtAddress: number;
  isPrimary?: boolean;
}

// Endpoint 3: Start Biometric
export interface BiometricStartRequest {
  // No body required
}

export interface BiometricStartResponse {
  sessionId: string; // ⚠️ CRITICAL: Save to Redux store
  [key: string]: any;
}

// Endpoint 4: Verify ID
export interface BiometricIdVerifyRequest {
  idType: 'NID' | 'PASSPORT';
  idCardImage: File;
}

export interface BiometricIdVerifyResponse {
  id: string;
  status: string;
  ocrData?: {
    name?: string;
    idNumber?: string;
    dateOfBirth?: string;
  };
}

// Endpoint 5: Verify Address
export interface BiometricAddressVerifyRequest {
  addressImage: File;
}

export interface BiometricAddressVerifyResponse {
  id: string;
  status: string;
}
```

---

## Implementation Notes

### ⚠️ Critical Observations

1. **Session ID Handling**: 
   - `POST /v1/biometric/start` returns a `sessionId`
   - This MUST be stored in Redux KYC state
   - Subsequent ID and address verify calls likely use this session (tracked server-side via JWT/session cookie)
   - **Verify during testing**: If id-verify or address-verify fail with "no active session", the sessionId may need to be sent as a form field or header

2. **FormData Uploads**:
   - RTK Query handles FormData automatically
   - Don't manually set `Content-Type` header for FormData
   - File objects should have `{ uri, name, type }` structure

3. **Enum Values**:
   - `maritalStatus`: Must match exactly (all caps, no typos)
   - `educationLevel`: Must match exactly (all caps)
   - `idType`: Must be "NID" or "PASSPORT" (all caps)
   - `type` (address): Must be "PRESENT" or "PERMANENT" (all caps)

4. **Field Names**:
   - `postCode` (not `postalCode` or `postcode`)
   - `yearsAtAddress` (camelCase)
   - `isPrimary` (optional boolean)
   - `nationalId` (not `nidNumber` or `nationalIdNumber`)

5. **Validation Errors**:
   - 422 responses return an `errors` array with field-level messages
   - Display these errors under each input field

6. **Image File Requirements**:
   - Acceptable formats: JPG, PNG (verify from actual error messages)
   - Max file size: (verify from actual API limits)
   - File name requirement: Provide descriptive names

---

## Testing Checklist

Before implementing, verify these assumptions with the live API:

- [ ] Does `POST /v1/biometric/start` always return `sessionId`? What's the exact field name?
- [ ] Does `POST /v1/biometric/id-verify` require `sessionId` in FormData, or is it tracked via session?
- [ ] Does `POST /v1/biometric/address-verify` require `sessionId` in FormData?
- [ ] What are the exact file size limits and accepted formats for image uploads?
- [ ] What does the OCR data structure look like in the id-verify response?
- [ ] Are there any additional optional fields in these endpoints not shown in the spec?
- [ ] Do file uploads require any specific metadata (e.g., `documentSide` for front/back)?

---

## Response Flow Diagram

```
BasicInformationScreen
  ├─ PUT /v1/users/me (UpdateBasicInfoDto)
  └─→ 200 OK { success, message, data: UserProfile }
     └─→ Navigate to AddressesUpdateScreen

AddressesUpdateScreen
  ├─ POST /v1/users/me/addresses (AddAddressDto)
  └─→ 201 Created { success, message, data: Address }
     └─→ Navigate to StartedVerificationScreen

StartedVerificationScreen
  ├─ POST /v1/biometric/start (empty)
  └─→ 200 OK { success, message, data: { sessionId } }
     └─→ Save sessionId to Redux
     └─→ Navigate to SelectIDTypeScreen

IDCapturePreviewScreen
  ├─ POST /v1/biometric/id-verify (FormData: idType, idCardImage)
  └─→ 201 Created { success, message, data: { id, status, ocrData } }
     └─→ Navigate to next screen (back capture or address-roles)

AddressCapturePreviewScreen
  ├─ POST /v1/biometric/address-verify (FormData: addressImage)
  └─→ 201 Created { success, message, data: { id, status } }
     └─→ Navigate to FacialRecognitionScreen
```
