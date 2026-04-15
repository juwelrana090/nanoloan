// ────────────────────────────────────────────────────────────────────────────────
// HOME MODULE SERVICES
//
// Direct API calls for home-related data.
// In most cases, use RTK Query hooks from hooks/useHome.ts instead.
//
// ────────────────────────────────────────────────────────────────────────────────

import { apiUrl } from '@/shared/config';
import type {
  GetMeResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  UpdateBasicInfoRequest,
  UpdateBasicInfoResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  DeleteAccountRequest,
  DeleteAccountResponse,
  GetAddressesResponse,
  AddAddressRequest,
  AddAddressResponse,
  UpdateAddressResponse,
  GetLoanSummaryResponse,
  GetBiometricStatusResponse,
} from '../types';

// ─── API Client Helper ──────────────────────────────────────────────────────────

const createHeaders = async (token?: string) => {
  const headers: HeadersInit = {
    'Accept': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }
  return response.json();
};

// ─── User Profile Services ──────────────────────────────────────────────────────

export const homeService = {
  /**
   * Get current user profile
   * GET /v1/users/me
   */
  getMe: async (token: string): Promise<GetMeResponse> => {
    const response = await fetch(`${apiUrl}/v1/users/me`, {
      method: 'GET',
      headers: await createHeaders(token),
    });
    return handleResponse<GetMeResponse>(response);
  },

  /**
   * Update user profile (name, phone, dob, gender)
   * PUT /v1/users/me
   */
  updateProfile: async (
    token: string,
    data: UpdateProfileRequest
  ): Promise<UpdateProfileResponse> => {
    const response = await fetch(`${apiUrl}/v1/users/me`, {
      method: 'PUT',
      headers: {
        ...(await createHeaders(token)),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<UpdateProfileResponse>(response);
  },

  /**
   * Update basic info (marital status, education, IDs)
   * PUT /v1/users/me/basic-info
   */
  updateBasicInfo: async (
    token: string,
    data: UpdateBasicInfoRequest
  ): Promise<UpdateBasicInfoResponse> => {
    const response = await fetch(`${apiUrl}/v1/users/me/basic-info`, {
      method: 'PUT',
      headers: {
        ...(await createHeaders(token)),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<UpdateBasicInfoResponse>(response);
  },

  /**
   * Change password
   * PUT /v1/users/me/change-password
   */
  changePassword: async (
    token: string,
    data: ChangePasswordRequest
  ): Promise<ChangePasswordResponse> => {
    const response = await fetch(`${apiUrl}/v1/users/me/change-password`, {
      method: 'PUT',
      headers: {
        ...(await createHeaders(token)),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<ChangePasswordResponse>(response);
  },

  /**
   * Delete account
   * DELETE /v1/users/me
   */
  deleteAccount: async (
    token: string,
    data: DeleteAccountRequest
  ): Promise<DeleteAccountResponse> => {
    const response = await fetch(`${apiUrl}/v1/users/me`, {
      method: 'DELETE',
      headers: {
        ...(await createHeaders(token)),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<DeleteAccountResponse>(response);
  },

  // ─── Address Services ───────────────────────────────────────────────────────────

  /**
   * Get all addresses
   * GET /v1/users/me/addresses
   */
  getAddresses: async (token: string): Promise<GetAddressesResponse> => {
    const response = await fetch(`${apiUrl}/v1/users/me/addresses`, {
      method: 'GET',
      headers: await createHeaders(token),
    });
    return handleResponse<GetAddressesResponse>(response);
  },

  /**
   * Add new address
   * POST /v1/users/me/addresses
   */
  addAddress: async (
    token: string,
    data: AddAddressRequest
  ): Promise<AddAddressResponse> => {
    const response = await fetch(`${apiUrl}/v1/users/me/addresses`, {
      method: 'POST',
      headers: {
        ...(await createHeaders(token)),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<AddAddressResponse>(response);
  },

  /**
   * Update address
   * PUT /v1/users/me/addresses/{id}
   */
  updateAddress: async (
    token: string,
    addressId: string,
    data: Parameters<typeof homeService.updateAddress>[2]
  ): Promise<UpdateAddressResponse> => {
    const response = await fetch(`${apiUrl}/v1/users/me/addresses/${addressId}`, {
      method: 'PUT',
      headers: {
        ...(await createHeaders(token)),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<UpdateAddressResponse>(response);
  },

  // ─── Biometric Services ────────────────────────────────────────────────────────

  /**
   * Get biometric verification status
   * GET /v1/biometric/status
   */
  getBiometricStatus: async (token: string): Promise<GetBiometricStatusResponse> => {
    const response = await fetch(`${apiUrl}/v1/biometric/status`, {
      method: 'GET',
      headers: await createHeaders(token),
    });
    return handleResponse<GetBiometricStatusResponse>(response);
  },
};
