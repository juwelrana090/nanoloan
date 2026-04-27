import { apiSlice } from '@/shared/libs/redux/apiSlice';
import type {
  BiometricStartRequest,
  BiometricStartResponse,
  BiometricIdVerifyRequest,
  BiometricIdVerifyResponse,
  BiometricAddressVerifyRequest,
  BiometricAddressVerifyResponse,
  BiometricFaceVerifyData,
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
      }),
    }),

    // POST /v1/biometric/face-verify
    // multipart/form-data  field: faceImage (binary)
    // response.data: { confidence: number, passed: boolean }  threshold: 0.8
    faceVerify: builder.mutation<ApiSuccessResponse<BiometricFaceVerifyData>, FormData>({
      query: (formData) => ({
        url: '/biometric/face-verify',
        method: 'POST',
        body: formData,
      }),
    }),
  }),
});

export const {
  useStartVerificationMutation,
  useVerifyIdMutation,
  useVerifyAddressMutation,
  useFaceVerifyMutation,
} = biometricApi;