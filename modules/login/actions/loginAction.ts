import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  setIsAuthenticated,
  setToken,
  setUser,
} from '@/shared/libs/redux/features/auth/authSlice';
import type { AppDispatch } from '@/shared/libs/redux/store';
import type { LoginResponse } from '@/shared/libs/types/auth.types';

const STORAGE_KEYS = {
  USER: '@user',
  TOKEN: '@token',
} as const;

export const persistLoginSession = async (
  dispatch: AppDispatch,
  response: LoginResponse
): Promise<void> => {
  const { accessToken, user } = response.data;
  await Promise.all([
    AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user)),
    AsyncStorage.setItem(STORAGE_KEYS.TOKEN, accessToken),
  ]);
  dispatch(setToken(accessToken));
  dispatch(setUser(user));
  dispatch(setIsAuthenticated(true));
};
