// ────────────────────────────────────────────────────────────────────────────────
// HOME MODULE - PUBLIC API
//
// Exports all types, hooks, actions, and services for the home module.
//
// ────────────────────────────────────────────────────────────────────────────────

// Types
export type {
  UserProfile,
  Gender,
  MaritalStatus,
  EducationLevel,
  AddressType,
  ApiSuccessResponse,
  ApiErrorResponse,
  GetMeResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  UpdateBasicInfoRequest,
  UpdateBasicInfoResponse,
  DeleteAccountRequest,
  DeleteAccountResponse,
  Address,
  GetAddressesResponse,
  AddAddressRequest,
  AddAddressResponse,
  UpdateAddressResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  BiometricStatus,
  BiometricVerificationStatus,
  GetBiometricStatusResponse,
  LoanSummary,
  GetLoanSummaryResponse,
} from './types';

// Hooks
export {
  useUserProfile,
  useUpdateProfile,
  useUpdateBasicInfo,
  useChangePassword,
  useDeleteAccount,
  useBiometricStatus,
} from './hooks/useHome';

export {
  useAddresses,
  useAddAddress,
  useUpdateAddress,
  useAddressManagement,
} from './hooks/useAddress';

// Actions
export { homeActions } from './actions/homeActions';

// Services (direct API calls - use hooks instead when possible)
export { homeService } from './services/homeService';
