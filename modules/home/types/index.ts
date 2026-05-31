// ────────────────────────────────────────────────────────────────────────────────
// NANOLOAN API RESPONSE TYPES
//
// 📘 IMPORTANT - API Response Pattern:
//
// ALL API responses follow this standard wrapper:
// {
//   "success": boolean,
//   "message": string,
//   "data": T  // Actual payload
// }
//
// When using RTK Query mutations/queries:
// 1. The response from unwrap() is the FULL ApiSuccessResponse<T>
// 2. Access the actual data via response.data
// 3. Example: const { data } = await getMe().unwrap();  // data is the ApiSuccessResponse
//    const actualUser = data.data;  // The actual UserProfile object
//
// ────────────────────────────────────────────────────────────────────────────────

// Import shared types from auth.types to avoid duplication
export type {
  UserProfile,
  ApiSuccessResponse,
  ApiErrorResponse,
  UpdateProfileRequest,
  UpdateBasicInfoRequest,
  ChangePasswordRequest,
  DeleteAccountRequest,
} from '@/shared/libs/types/auth.types';

// ─── User Profile Endpoints ─────────────────────────────────────────────────────

// GET /v1/users/me
export type GetMeResponse = ApiSuccessResponse<UserProfile>;

// PUT /v1/users/me
export type UpdateProfileResponse = ApiSuccessResponse<UserProfile>;

// PUT /v1/users/me/basic-info
export type UpdateBasicInfoResponse = ApiSuccessResponse<UserProfile>;

// DELETE /v1/users/me
export type DeleteAccountResponse = ApiSuccessResponse<{ message: string }>;

// ─── Enums ─────────────────────────────────────────────────────────────────────

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type MaritalStatus = 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
export type EducationLevel = 'PRIMARY' | 'SECONDARY' | 'DIPLOMA' | 'BACHELOR' | 'MASTER' | 'PHD' | 'OTHER';
export type AddressType = 'PRESENT' | 'PERMANENT';

// ─── Address Endpoints ──────────────────────────────────────────────────────────

export interface Address {
  id: string;
  type: AddressType;
  address: string;
  postCode: string;
  city: string;
  state: string;
  country: string;
  yearsAtAddress: number;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

// GET /v1/users/me/addresses
export type GetAddressesResponse = ApiSuccessResponse<Address[]>;

// POST /v1/users/me/addresses
export interface AddAddressRequest {
  type: AddressType;
  address: string;
  postCode: string;
  city: string;
  state: string;
  country: string;
  yearsAtAddress: number;
  isPrimary?: boolean;
}

export type AddAddressResponse = ApiSuccessResponse<Address>;

// PUT /v1/users/me/addresses/{id}
export interface UpdateAddressRequest {
  type?: AddressType;
  address?: string;
  postCode?: string;
  city?: string;
  state?: string;
  country?: string;
  yearsAtAddress?: number;
  isPrimary?: boolean;
}

export type UpdateAddressResponse = ApiSuccessResponse<Address>;

// ─── Change Password ────────────────────────────────────────────────────────────

export type ChangePasswordResponse = ApiSuccessResponse<{ message: string }>;

// ─── Biometric Verification ─────────────────────────────────────────────────────

export type BiometricStatus = 'NOT_STARTED' | 'ID_VERIFIED' | 'ADDRESS_VERIFIED' | 'FACE_VERIFIED' | 'COMPLETED';

export interface BiometricVerificationStatus {
  status: BiometricStatus;
  idVerified?: boolean;
  addressVerified?: boolean;
  faceVerified?: boolean;
  faceConfidence?: number; // 0-1
}

export type GetBiometricStatusResponse = ApiSuccessResponse<BiometricVerificationStatus>;

// ─── Loan Summary (for Home Screen) ─────────────────────────────────────────────

export interface LoanSummary {
  totalLoan: number;
  totalDueLoan: number;
  nextPaymentAmount: number;
  nextPaymentDate: string;
  loanGoalAmount: number;
  loanGoalProgress: number; // 0-100
  loanLimit: number;
  accounts: {
    type: string;
    number: string;
  }[];
}

export type GetLoanSummaryResponse = ApiSuccessResponse<LoanSummary>;
