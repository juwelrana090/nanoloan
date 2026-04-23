📋 Backend API Endpoints - Complete Guide
🎯 Updated API Endpoints
Your backend now has 4 main endpoints for biometric verification:

read all:
app\kyc\id-capture-preview.tsx
app\kyc\address-capture-preview.tsx
app\kyc\facial-recognition.tsx
app\kyc\verified.tsx

shared\config\index.ts

Base URL: https://backend-nanoloan.giize.com (API Gateway)
1️⃣ ID Card Verification
Endpoint

POST /biometric/id-verify
Request

Content-Type: multipart/form-data
Authorization: Bearer <JWT_TOKEN>

FormData {
idType: "NID" | "PASSPORT",
idCardImage: File (image/jpeg, max 10MB)
}
Backend Logic

1. Authenticate user from JWT token
2. Validate file size (max 10MB)
3. Convert image to buffer
4. OCR Processing:
   - Preprocess image (grayscale + contrast)
   - Extract text using Tesseract.js (Bangla + English)
   - Get confidence score
5. Parse Document:
   - If NID: Extract name, ID number, DOB, address
   - If Passport: Extract name, passport number, DOB, expiry
6. Validate extracted data
7. Store in Database:
   - Create/Update BiometricVerification record
   - Save raw OCR text + extracted data
   - Update User.idVerified flag
8. Log verification attempt
9. Return response
   Response

{
"success": true,
"message": "ID card submitted for verification",
"data": {
"id": "uuid-of-verification-record",
"status": "VERIFIED" | "PENDING_MANUAL_REVIEW",
"ocrData": {
"name": "John Doe",
"nameBangla": "জন ডো",
"idNumber": "1234567890123",
"dob": "1990-01-15",
"address": "123 Main Street, Dhaka",
"issueDate": "2020-01-01",
"expiryDate": "2030-01-01"
}
}
}
2️⃣ Address Verification
Endpoint

POST /biometric/address-verify
Request

Content-Type: multipart/form-data
Authorization: Bearer <JWT_TOKEN>

FormData {
addressImage: File (image/jpeg, max 10MB)
}
Backend Logic

1. Authenticate user from JWT token
2. Validate file size (max 10MB)
3. Convert image to buffer
4. OCR Processing:
   - Preprocess image
   - Extract text using Tesseract.js
   - Get confidence score
5. Detect Document Type:
   - UTILITY_BILL (electricity, gas, water)
   - BANK_STATEMENT
   - LEASE_AGREEMENT
   - GOVT_LETTER
6. Extract Address Data:
   - Name, address, issue date
7. Validate extracted data
8. Store in Database:
   - Update BiometricVerification record
   - Save raw OCR text + extracted data
   - Update User.addressVerified flag
9. Log verification attempt
10. Return response
    Response

{
"success": true,
"message": "Address document submitted for verification",
"data": {
"id": "uuid-of-verification-record",
"status": "VERIFIED" | "PENDING_MANUAL_REVIEW",
"documentType": "UTILITY_BILL"
}
}
3️⃣ Face Verification ⭐
Endpoint

POST /biometric/face-verify
Request

Content-Type: multipart/form-data
Authorization: Bearer <JWT_TOKEN>

FormData {
faceImage: File (image/jpeg, max 5MB)
}
Backend Logic 🔥
First Time (Enrollment):

1. Authenticate user from JWT token
2. Validate file size (max 5MB)
3. Convert image to buffer
4. Check User.referenceFaceEmbedding:
   - If NULL → First time enrollment
5. Extract Face Embedding:
   - Process image with face recognition
   - Generate 128-dimensional face descriptor
   - Handle "No face detected" error
6. Store Reference Face:
   - Save embedding as Bytes in User table
   - Save image path to User.referenceFacePath
   - Set User.faceEnrolledAt = now()
   - Set User.faceVerified = true
7. Return enrollment response
   Returning User (Verification):

8. Load user's reference face embedding
9. Extract embedding from submitted image
10. Compare Face Embeddings:
    - Calculate cosine similarity
    - Convert to 0-1 confidence score
11. Apply Threshold:
    - If confidence >= 0.8 (80%) → PASSED
    - If confidence < 0.8 → FAILED
12. Store Verification Attempt:
    - Update BiometricVerification record
    - Save confidence score
    - Update User.faceVerified flag
    - Set User.lastFaceVerifiedAt = now()
13. Log verification attempt
14. Return verification result
    Response
    Enrollment (First Time):

{
"success": true,
"message": "Face enrolled successfully",
"data": {
"confidence": 1.0,
"passed": true,
"status": "enrolled"
}
}
Verification (Returning):

{
"success": true,
"message": "Face verified successfully",
"data": {
"confidence": 0.92,
"passed": true,
"id": "uuid-of-verification-record",
"status": "verified"
}
}
Failed Verification:

{
"success": false,
"message": "Face verification failed with 72% confidence (threshold: 80%)",
"errors": []
}
4️⃣ Get Biometric Status
Endpoint

GET /biometric/status
Request

Authorization: Bearer <JWT_TOKEN>
Backend Logic

1. Authenticate user from JWT token
2. Query User table for verification flags:
   - user.idVerified
   - user.addressVerified
   - user.faceVerified
3. Calculate Overall Status:
   - All 3 true → "VERIFIED"
   - Any 1-2 true → "IN_PROGRESS"
   - All false → "PENDING"
4. Build Step Lists:
   - completedSteps: ["id_verification", "address_verification", "face_verification"]
   - pendingSteps: Remaining steps
5. Return status response
   Response

{
"success": true,
"data": {
"idVerified": true,
"addressVerified": true,
"faceVerified": false,
"overallStatus": "IN_PROGRESS",
"completedSteps": ["id_verification", "address_verification"],
"pendingSteps": ["face_verification"]
}
}
📊 Database Schema Updates
User Table (users_db)

-- New columns added:
idVerified BOOLEAN DEFAULT FALSE
addressVerified BOOLEAN DEFAULT FALSE
faceVerified BOOLEAN DEFAULT FALSE
idVerificationId UUID UNIQUE
addressVerificationId UUID UNIQUE
faceVerificationId UUID UNIQUE
referenceFaceEmbedding BYTEA -- 128-dimensional face embedding
referenceFacePath VARCHAR(255)
faceEnrolledAt TIMESTAMP
lastFaceVerifiedAt TIMESTAMP
BiometricVerification Table (biometric_db)

-- New columns added:
rawOcrText TEXT -- Raw OCR output
extractedData JSONB -- Parsed document data
documentType VARCHAR -- UTILITY_BILL, BANK_STATEMENT, etc.
confidenceScore FLOAT -- Face verification confidence (0-1)
🔧 Backend Service Flow
Face Recognition Service (face-recognition.service.ts)

// 1. Extract Face Embedding (128 dimensions)
async extractFaceEmbedding(imageBuffer: Buffer): Promise<Float32Array>

// 2. Compare Two Embeddings (Cosine Similarity)
compareFaces(embedding1, embedding2): number (0-1)

// 3. Verify Face with Threshold
async verifyFace(referenceEmbedding, submittedImage): {
passed: boolean,
confidence: number,
similarity: number
}

// 4. Convert Embedding to/from Database
embeddingToBuffer(embedding): Buffer
bufferToEmbedding(buffer): Float32Array
OCR Service (ocr.service.ts)

// 1. Extract Text with Preprocessing
async extractText(imageBuffer): Promise<{
text: string,
confidence: number
}>

// 2. Parse NID Data
parseNIDData(ocrText, side: 'FRONT' | 'BACK'): {
name, nameBangla, idNumber, dob, address,
fatherName, motherName, bloodGroup, ...
}

// 3. Parse Passport Data
parsePassportData(ocrText): {
name, passportNumber, dob, expiryDate,
nationality, placeOfBirth, sex, ...
}

// 4. Validate Extracted Data
validateParsedData(data, requiredFields): {
valid: boolean,
missing: string[]
}
🚀 How to Integrate with Your App
Step 1: Update API Base URL

const API_BASE_URL = 'http://your-server:4000';
Step 2: Call Endpoints
ID Verification

const formData = new FormData();
formData.append('idType', 'NID');
formData.append('idCardImage', {
uri: imageUri,
type: 'image/jpeg',
name: 'id-nid.jpg',
});

const response = await fetch(`${API_BASE_URL}/biometric/id-verify`, {
method: 'POST',
headers: {
'Authorization': `Bearer ${token}`,
'Accept': 'application/json',
},
body: formData,
});

const result = await response.json();
// result.data.ocrData contains extracted info
Face Verification

const formData = new FormData();
formData.append('faceImage', {
uri: faceImageUri,
type: 'image/jpeg',
name: 'face.jpg',
});

const response = await fetch(`${API_BASE_URL}/biometric/face-verify`, {
method: 'POST',
headers: {
'Authorization': `Bearer ${token}`,
},
body: formData,
});

const result = await response.json();
// result.data.status: "enrolled" | "verified" | "failed"
// result.data.confidence: 0.0 - 1.0
// result.data.passed: true | false
Get Status

const response = await fetch(`${API_BASE_URL}/biometric/status`, {
method: 'GET',
headers: {
'Authorization': `Bearer ${token}`,
},
});

const result = await response.json();
// result.data.idVerified: boolean
// result.data.addressVerified: boolean
// result.data.faceVerified: boolean
// result.data.overallStatus: "PENDING" | "IN_PROGRESS" | "VERIFIED"
⚡ Key Features

1. Face Verification Flow
   ✅ Enrollment: First time → Store reference face
   ✅ Verification: Returning → Match with 80% threshold
   ✅ Confidence: 0-1 scale with percentage display
   ✅ Error Handling: "No face detected" messages
2. OCR Processing
   ✅ Languages: Bangla + English (Tesseract.js)
   ✅ Preprocessing: Grayscale + contrast enhancement
   ✅ Confidence: OCR accuracy score
   ✅ Extraction: Name, ID, DOB, address, etc.
3. Status Tracking
   ✅ Real-time: Get current verification status
   ✅ Progress: Completed vs pending steps
   ✅ Overall: PENDING → IN_PROGRESS → VERIFIED
   📝 Response Format Summary
   Endpoint Success Response Key Fields
   ID Verify {success, message, data: {id, status, ocrData}} ocrData.name, ocrData.idNumber, ocrData.dob
   Address Verify {success, message, data: {id, status}} status, documentType
   Face Verify {success, message, data: {confidence, passed, status}} confidence (0-1), passed, status
   Get Status {success, data: {idVerified, addressVerified, faceVerified, overallStatus}} All flags + overallStatus
   ✅
