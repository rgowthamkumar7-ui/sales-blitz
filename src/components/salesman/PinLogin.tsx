import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { cn } from '@/lib/utils';

interface PinLoginProps {
  onSuccess: () => void;
}

const PinLogin: React.FC<PinLoginProps> = ({ onSuccess }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const { login } = useAuth();
  const { lightTap, errorPattern, successPattern } = useHapticFeedback();

  const handleDigitPress = (digit: string) => {
    if (pin.length < 4) {
      lightTap();
      setPin(prev => prev + digit);
      setError(false);
    }
  };

  const handleDelete = () => {
    lightTap();
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  const handleClear = () => {
    lightTap();
    setPin('');
    setError(false);
  };

  useEffect(() => {
    if (pin.length === 4) {
      const user = login(pin);
      if (user) {
        successPattern();
        setTimeout(onSuccess, 300);
      } else {
        errorPattern();
        setError(true);
        setTimeout(() => {
          setPin('');
          setError(false);
        }, 500);
      }
    }
  }, [pin, login, onSuccess, successPattern, errorPattern]);

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-foreground mb-2">Sales Punch</h1>
        <p className="text-muted-foreground">Enter your 4-digit PIN</p>
      </motion.div>

      {/* PIN Dots */}
      <div className="flex gap-4 mb-8">
        {[0, 1, 2, 3].map(i => (
          <motion.div
            key={i}
            animate={error ? { x: [-5, 5, -5, 5, 0] } : {}}
            transition={{ duration: 0.3 }}
            className={cn(
              "w-4 h-4 rounded-full border-2 transition-all duration-200",
              pin.length > i 
                ? error 
                  ? "bg-destructive border-destructive" 
                  : "bg-primary border-primary"
                : "border-muted-foreground"
            )}
          />
        ))}
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-destructive text-sm mb-4"
          >
            Invalid PIN. Please try again.
          </motion.p>
        )}
      </AnimatePresence>

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-4 max-w-xs w-full">
        {digits.map(digit => (
          <motion.button
            key={digit}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (digit === 'C') handleClear();
              else if (digit === '⌫') handleDelete();
              else handleDigitPress(digit);
            }}
            className={cn(
              "h-16 rounded-xl text-2xl font-semibold transition-colors touch-manipulation",
              digit === 'C' || digit === '⌫'
                ? "bg-muted text-muted-foreground"
                : "bg-card text-card-foreground shadow-sm border border-border hover:bg-accent"
            )}
          >
            {digit}
          </motion.button>
        ))}
      </div>

      <p className="mt-8 text-xs text-muted-foreground">
        Demo PINs: 1234, 2345, 3456, 4567, 5678
      </p>
    </div>
  );
};

export default PinLogin;
