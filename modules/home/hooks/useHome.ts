// ────────────────────────────────────────────────────────────────────────────────
// HOME MODULE HOOKS
//
// React hooks for home-related data and operations using RTK Query.
//
// ────────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  useGetMeQuery,
  useUpdateProfileMutation,
  useUpdateBasicInfoMutation,
  useChangePasswordMutation,
  useDeleteAccountMutation,
} from '@/shared/libs/redux/features/auth/authApi';
import { useAppDispatch } from '@/shared/hooks/useAppSelector';
import {
  setUser,
  setLogout,
} from '@/shared/libs/redux/features/auth/authSlice';
import type {
  UpdateProfileRequest,
  UpdateBasicInfoRequest,
  ChangePasswordRequest,
  DeleteAccountRequest,
} from '../types';
import { homeActions } from '../actions';

// ─── User Profile Hooks ─────────────────────────────────────────────────────────

export const useUserProfile = () => {
  const dispatch = useAppDispatch();
  const { data, isLoading, error, refetch } = useGetMeQuery();

  /**
   * Get the actual user profile data from the API response
   * The API returns: { success: true, message: string, data: UserProfile }
   */
  const userProfile = data?.data;

  const refresh = async () => {
    await refetch();
  };

  return {
    userProfile,
    isLoading,
    error,
    refresh,
  };
};

// ─── Update Profile Hook ────────────────────────────────────────────────────────

export const useUpdateProfile = () => {
  const [updateMutation, { isLoading }] = useUpdateProfileMutation();
  const dispatch = useAppDispatch();
  const [error, setError] = useState<string | null>(null);

  const updateProfile = async (data: UpdateProfileRequest) => {
    setError(null);
    try {
      // unwrap() returns: { success: true, message: string, data: UserProfile }
      const response = await updateMutation(data).unwrap();

      // Update Redux state with the new user data
      dispatch(setUser(response.data));

      return response;
    } catch (err: any) {
      const msg = err?.data?.message ?? 'Failed to update profile. Please try again.';
      setError(Array.isArray(msg) ? msg[0] : msg);
      throw err;
    }
  };

  return { updateProfile, isLoading, error };
};

// ─── Update Basic Info Hook ─────────────────────────────────────────────────────

export const useUpdateBasicInfo = () => {
  const [updateMutation, { isLoading }] = useUpdateBasicInfoMutation();
  const dispatch = useAppDispatch();
  const [error, setError] = useState<string | null>(null);

  const updateBasicInfo = async (data: UpdateBasicInfoRequest) => {
    setError(null);
    try {
      // unwrap() returns: { success: true, message: string, data: UserProfile }
      const response = await updateMutation(data).unwrap();

      // Update Redux state with the new user data
      dispatch(setUser(response.data));

      return response;
    } catch (err: any) {
      const msg = err?.data?.message ?? 'Failed to update basic info. Please try again.';
      setError(Array.isArray(msg) ? msg[0] : msg);
      throw err;
    }
  };

  return { updateBasicInfo, isLoading, error };
};

// ─── Change Password Hook ───────────────────────────────────────────────────────

export const useChangePassword = () => {
  const [changeMutation, { isLoading }] = useChangePasswordMutation();
  const [error, setError] = useState<string | null>(null);

  const changePassword = async (data: ChangePasswordRequest) => {
    setError(null);
    try {
      const response = await changeMutation(data).unwrap();
      return response;
    } catch (err: any) {
      const msg = err?.data?.message ?? 'Failed to change password. Please try again.';
      setError(Array.isArray(msg) ? msg[0] : msg);
      throw err;
    }
  };

  return { changePassword, isLoading, error };
};

// ─── Delete Account Hook ────────────────────────────────────────────────────────

export const useDeleteAccount = () => {
  const [deleteMutation, { isLoading }] = useDeleteAccountMutation();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const deleteAccount = async (data: DeleteAccountRequest) => {
    setError(null);
    try {
      const response = await deleteMutation(data).unwrap();

      // Clear Redux state and navigate to login
      dispatch(setLogout());
      router.replace('/auth/login' as any);

      return response;
    } catch (err: any) {
      const msg = err?.data?.message ?? 'Failed to delete account. Please try again.';
      setError(Array.isArray(msg) ? msg[0] : msg);
      throw err;
    }
  };

  return { deleteAccount, isLoading, error };
};

// ─── Biometric Status Hook ──────────────────────────────────────────────────────

export const useBiometricStatus = () => {
  const [biometricStatus, setBiometricStatus] = useState<{
    status: string;
    idVerified?: boolean;
    addressVerified?: boolean;
    faceVerified?: boolean;
    faceConfidence?: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const status = await homeActions.getBiometricStatus();
      setBiometricStatus(status);
    } catch (err: any) {
      const msg = err?.message ?? 'Failed to fetch biometric status.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    biometricStatus,
    isLoading,
    error,
    fetchStatus,
  };
};
