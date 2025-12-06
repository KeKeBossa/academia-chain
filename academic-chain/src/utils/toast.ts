/**
 * Toast handler utilities
 * Centralizes toast notification logic across components
 */

import { toast } from 'sonner';

/**
 * Create a toast handler for a given message
 */
export function createToastHandler(message: string, type: 'success' | 'error' | 'info' = 'success') {
  return () => {
    toast[type](message);
  };
}

/**
 * Create an async toast handler with delayed success message
 */
export function createAsyncToastHandler(
  loadingMessage: string,
  successMessage: string,
  delay: number = 2000
) {
  return () => {
    toast.info(loadingMessage);
    setTimeout(() => {
      toast.success(successMessage);
    }, delay);
  };
}

/**
 * Create a toggle toast handler
 */
export function createToggleToastHandler(
  enabledMessage: string,
  disabledMessage: string,
  getter: () => boolean,
  setter: (value: boolean) => void
) {
  return () => {
    const newState = !getter();
    setter(newState);
    const message = newState ? enabledMessage : disabledMessage;
    const toastType = newState ? 'success' : 'info';
    toast[toastType](message);
  };
}
