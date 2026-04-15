// ────────────────────────────────────────────────────────────────────────────────
// ADDRESS MANAGEMENT HOOKS
//
// React hooks for address-related operations using RTK Query.
//
// ────────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import {
  useGetAddressesQuery,
  useAddAddressMutation,
  useUpdateAddressMutation,
} from '@/shared/libs/redux/features/auth/authApi';
import type { Address, AddAddressRequest, UpdateAddressRequest } from '@/shared/libs/types/auth.types';

// ─── Get Addresses Hook ─────────────────────────────────────────────────────────

export const useAddresses = () => {
  const { data, isLoading, error, refetch } = useGetAddressesQuery();

  /**
   * Get the actual addresses from the API response
   * The API returns: { success: true, message: string, data: Address[] }
   */
  const addresses = data?.data || [];

  const refresh = async () => {
    await refetch();
  };

  return {
    addresses,
    isLoading,
    error,
    refresh,
  };
};

// ─── Add Address Hook ───────────────────────────────────────────────────────────

export const useAddAddress = () => {
  const [addMutation, { isLoading }] = useAddAddressMutation();
  const [error, setError] = useState<string | null>(null);

  const addAddress = async (data: AddAddressRequest) => {
    setError(null);
    try {
      // unwrap() returns: { success: true, message: string, data: Address }
      const response = await addMutation(data).unwrap();
      return response.data;
    } catch (err: any) {
      const msg = err?.data?.message ?? 'Failed to add address. Please try again.';
      setError(Array.isArray(msg) ? msg[0] : msg);
      throw err;
    }
  };

  return { addAddress, isLoading, error };
};

// ─── Update Address Hook ────────────────────────────────────────────────────────

export const useUpdateAddress = () => {
  const [updateMutation, { isLoading }] = useUpdateAddressMutation();
  const [error, setError] = useState<string | null>(null);

  const updateAddress = async (id: string, data: UpdateAddressRequest) => {
    setError(null);
    try {
      // unwrap() returns: { success: true, message: string, data: Address }
      const response = await updateMutation({ id, data }).unwrap();
      return response.data;
    } catch (err: any) {
      const msg = err?.data?.message ?? 'Failed to update address. Please try again.';
      setError(Array.isArray(msg) ? msg[0] : msg);
      throw err;
    }
  };

  return { updateAddress, isLoading, error };
};

// ─── Combined Address Management Hook ───────────────────────────────────────────

export const useAddressManagement = () => {
  const { addresses, isLoading: isLoadingAddresses, error: addressesError, refresh } = useAddresses();
  const { addAddress, isLoading: isAdding, error: addError } = useAddAddress();
  const { updateAddress, isLoading: isUpdating, error: updateError } = useUpdateAddress();

  const isLoading = isLoadingAddresses || isAdding || isUpdating;
  const error = addressesError || addError || updateError;

  return {
    addresses,
    addAddress,
    updateAddress,
    refresh,
    isLoading,
    error,
  };
};
