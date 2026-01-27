import { useCallback } from 'react';

export const useHapticFeedback = () => {
  const vibrate = useCallback((pattern: number | number[] = 10) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  const lightTap = useCallback(() => {
    vibrate(10);
  }, [vibrate]);

  const mediumTap = useCallback(() => {
    vibrate(25);
  }, [vibrate]);

  const strongTap = useCallback(() => {
    vibrate(50);
  }, [vibrate]);

  const successPattern = useCallback(() => {
    vibrate([30, 50, 30]);
  }, [vibrate]);

  const errorPattern = useCallback(() => {
    vibrate([100, 50, 100]);
  }, [vibrate]);

  return {
    lightTap,
    mediumTap,
    strongTap,
    successPattern,
    errorPattern,
  };
};
