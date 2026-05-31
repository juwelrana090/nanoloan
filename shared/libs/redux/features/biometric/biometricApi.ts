import { apiSlice } from '@/shared/libs/redux/apiSlice';
import type {
  BiometricStartRequest,
  BiometricStartResponse,
  BiometricIdVerifyResponse,
  BiometricAddressVerifyResponse,
  BiometricFaceVerifyData,
  ApiSuccessResponse,
} from '@/shared/libs/types/auth.types';

export const biometricApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // POST /biometric/start
    startVerification: builder.mutation<ApiSuccessResponse<BiometricStartResponse>, BiometricStartRequest>({
      query: () => ({
        url: '/biometric/start',
        method: 'POST',
      }),
    }),

    // POST /biometric/id-verify
    // multipart/form-data  fields: idCardImage (file), idType (string)
    // formData: true — tells fetchBaseQuery NOT to JSON.stringify; browser sets boundary automatically
    verifyId: builder.mutation<ApiSuccessResponse<BiometricIdVerifyResponse>, FormData>({
      query: (formData) => ({
        url: '/biometric/id-verify',
        method: 'POST',
        body: formData,
        formData: true,
      }),
    }),

    // POST /biometric/address-verify
    // multipart/form-data  field: addressImage (file)
    verifyAddress: builder.mutation<ApiSuccessResponse<BiometricAddressVerifyResponse>, FormData>({
      query: (formData) => ({
        url: '/biometric/address-verify',
        method: 'POST',
        body: formData,
        formData: true,
      }),
    }),

    // POST /biometric/face-verify
    // multipart/form-data  field: faceImage (file)
    // response.data: { confidence: number, passed: boolean }  threshold: 0.8
    faceVerify: builder.mutation<ApiSuccessResponse<BiometricFaceVerifyData>, FormData>({
      query: (formData) => ({
        url: '/biometric/face-verify',
        method: 'POST',
        body: formData,
        formData: true,
      }),
    }),
  }),
},
{
  overrideExisting: true,
}
);

export const {
  useStartVerificationMutation,
  useVerifyIdMutation,
  useVerifyAddressMutation,
  useFaceVerifyMutation,
} = biometricApi;