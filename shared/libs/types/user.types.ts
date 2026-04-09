import type { UserProfile } from './auth.types';

export type User = UserProfile;

export interface DeviceToken {
  fcmToken: string;
  deviceType: 'ios' | 'android';
  deviceId?: string;
  appVersion?: string;
  osVersion?: string;
}
