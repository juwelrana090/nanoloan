import { useCallback } from 'react';
import Toast from 'react-native-toast-message';

interface ToastConfig {
  title: string;
  message?: string;
  duration?: number;
  position?: 'top' | 'bottom';
}

export const useToast = () => {
  const showSuccess = useCallback(({ title, message, duration = 2500, position = 'top' }: ToastConfig) => {
    Toast.show({
      type: 'success',
      text1: title,
      text2: message,
      visibilityTime: duration,
      position,
      topOffset: 60,
      bottomOffset: 40,
    });
  }, []);

  const showError = useCallback(({ title, message, duration = 2500, position = 'top' }: ToastConfig) => {
    Toast.show({
      type: 'error',
      text1: title,
      text2: message,
      visibilityTime: duration,
      position,
      topOffset: 60,
      bottomOffset: 40,
    });
  }, []);

  const showInfo = useCallback(({ title, message, duration = 2500, position = 'top' }: ToastConfig) => {
    Toast.show({
      type: 'info',
      text1: title,
      text2: message,
      visibilityTime: duration,
      position,
      topOffset: 60,
      bottomOffset: 40,
    });
  }, []);

  const showWarning = useCallback(({ title, message, duration = 2500, position = 'top' }: ToastConfig) => {
    Toast.show({
      type: 'warning',
      text1: title,
      text2: message,
      visibilityTime: duration,
      position,
      topOffset: 60,
      bottomOffset: 40,
    });
  }, []);

  const hide = useCallback(() => {
    Toast.hide();
  }, []);

  const hideAll = useCallback(() => {
    Toast.hide();
  }, []);

  // Additional utility methods for enhanced functionality
  const showCustom = useCallback((config: {
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message?: string;
    duration?: number;
    position?: 'top' | 'bottom';
  }) => {
    Toast.show({
      type: config.type,
      text1: config.title,
      text2: config.message,
      visibilityTime: config.duration || 4000,
      position: config.position || 'top',
      topOffset: 60,
      bottomOffset: 40,
    });
  }, []);

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showCustom,
    hide,
    hideAll,
  };
};
