// ────────────────────────────────────────────────────────────────────────────────
// HOME MODULE ACTIONS
//
// Complex operations that may involve multiple API calls or business logic.
// For simple CRUD operations, use the hooks directly.
//
// ────────────────────────────────────────────────────────────────────────────────

import AsyncStorage from '@react-native-async-storage/async-storage';
import { homeService } from '../services/homeService';
import type {
  UserProfile,
  BiometricVerificationStatus,
} from '../types';

// ─── Token Management ───────────────────────────────────────────────────────────

const getToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem('@token');
};

// ─── User Profile Actions ───────────────────────────────────────────────────────

export const homeActions = {
  /**
   * Fetch current user profile with token management
   * Returns the actual UserProfile object (not the wrapped response)
   */
  getProfile: async (): Promise<UserProfile> => {
    const token = await getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await homeService.getMe(token);

    // Return the actual data, not the wrapper
    return response.data;
  },

  /**
   * Update user profile
   * @param data - Profile fields to update
   * @returns Updated user profile
   */
  updateProfile: async (data: {
    fullName?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
  }): Promise<UserProfile> => {
    const token = await getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await homeService.updateProfile(token, data);

    // Return the actual data, not the wrapper
    return response.data;
  },

  /**
   * Update basic user information
   * @param data - Basic info fields to update
   * @returns Updated user profile
   */
  updateBasicInfo: async (data: {
    maritalStatus?: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
    educationLevel?: 'PRIMARY' | 'SECONDARY' | 'DIPLOMA' | 'BACHELOR' | 'MASTER' | 'PHD' | 'OTHER';
    nationalId?: string;
    tin?: string;
    passportNo?: string;
  }): Promise<UserProfile> => {
    const token = await getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await homeService.updateBasicInfo(token, data);

    // Return the actual data, not the wrapper
    return response.data;
  },

  /**
   * Change user password
   * @param currentPassword - Current password for verification
   * @param newPassword - New password (min 8 characters)
   */
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    const token = await getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    await homeService.changePassword(token, {
      currentPassword,
      newPassword,
    });
  },

  /**
   * Delete user account
   * @param password - Current password for confirmation
   * @returns Success message
   */
  deleteAccount: async (password: string): Promise<string> => {
    const token = await getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await homeService.deleteAccount(token, { password });

    // Clear local storage
    await AsyncStorage.multiRemove(['@user', '@token', '@deviceToken']);

    // Return success message
    return response.data.message;
  },

  // ─── Address Actions ───────────────────────────────────────────────────────────

  /**
   * Get all user addresses
   */
  getAddresses: async () => {
    const token = await getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await homeService.getAddresses(token);

    // Return the actual data, not the wrapper
    return response.data;
  },

  /**
   * Add a new address
   * @param data - Address details
   */
  addAddress: async (data: {
    type: 'PRESENT' | 'PERMANENT';
    address: string;
    postCode: string;
    city: string;
    state: string;
    country: string;
    yearsAtAddress: number;
    isPrimary?: boolean;
  }) => {
    const token = await getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await homeService.addAddress(token, data);

    // Return the actual data, not the wrapper
    return response.data;
  },

  /**
   * Update an existing address
   * @param addressId - Address UUID
   * @param data - Address fields to update
   */
  updateAddress: async (
    addressId: string,
    data: {
      type?: 'PRESENT' | 'PERMANENT';
      address?: string;
      postCode?: string;
      city?: string;
      state?: string;
      country?: string;
      yearsAtAddress?: number;
      isPrimary?: boolean;
    }
  ) => {
    const token = await getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await homeService.updateAddress(token, addressId, data);

    // Return the actual data, not the wrapper
    return response.data;
  },

  // ─── Biometric Actions ─────────────────────────────────────────────────────────

  /**
   * Get biometric verification status
   * @returns Biometric status object
   */
  getBiometricStatus: async (): Promise<BiometricVerificationStatus> => {
    const token = await getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await homeService.getBiometricStatus(token);

    // Return the actual data, not the wrapper
    return response.data;
  },
};
