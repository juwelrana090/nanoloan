import { apiSlice } from '@/shared/libs/redux/apiSlice';
import type {
  BiometricStartRequest,
  BiometricStartResponse,
  BiometricIdVerifyRequest,
  BiometricIdVerifyResponse,
  BiometricAddressVerifyRequest,
  BiometricAddressVerifyResponse,
  ApiSuccessResponse,
} from '@/shared/libs/types/auth.types';

export const biometricApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Start biometric verification session
    startVerification: builder.mutation<ApiSuccessResponse<BiometricStartResponse>, BiometricStartRequest>({
      query: () => ({
        url: '/biometric/start',
        method: 'POST',
      }),
    }),

    // Upload ID card for verification
    verifyId: builder.mutation<ApiSuccessResponse<BiometricIdVerifyResponse>, BiometricIdVerifyRequest>({
      query: (data) => ({
        url: '/biometric/id-verify',
        method: 'POST',
        body: data,
        // Don't set Content-Type for FormData - fetch does it automatically with boundary
      }),
    }),

    // Upload address document for verification
    verifyAddress: builder.mutation<
      ApiSuccessResponse<BiometricAddressVerifyResponse>,
      BiometricAddressVerifyRequest
    >({
      query: (data) => ({
        url: '/biometric/address-verify',
        method: 'POST',
        body: data,
        // Don't set Content-Type for FormData - fetch does it automatically with boundary
      }),
    }),
  }),
});

export const {
  useStartVerificationMutation,
  useVerifyIdMutation,
  useVerifyAddressMutation,
} = biometricApi;
