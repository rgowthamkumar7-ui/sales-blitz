import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Star, Package, ArrowRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import Confetti from './Confetti';

interface SaleSuccessProps {
  totalUnits: number;
  totalPoints: number;
  onNextOutlet: () => void;
  onEndDay: () => void;
}

const SaleSuccess: React.FC<SaleSuccessProps> = ({
  totalUnits,
  totalPoints,
  onNextOutlet,
  onEndDay,
}) => {
  const [showConfetti, setShowConfetti] = useState(true);
  const { successPattern, lightTap } = useHapticFeedback();

  useEffect(() => {
    successPattern();
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, [successPattern]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-8 relative overflow-hidden">
      {showConfetti && <Confetti />}

      {/* Success Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="mb-6"
      >
        <div className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
          >
            <CheckCircle className="w-16 h-16 text-success" />
          </motion.div>
        </div>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-bold text-foreground mb-2"
      >
        Sale Submitted!
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-muted-foreground mb-8"
      >
        Great job! Keep it up 🎉
      </motion.p>

      {/* Stats Cards */}
      <div className="w-full max-w-sm space-y-3 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Package className="text-primary" size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Units Sold</p>
              <p className="text-2xl font-bold text-foreground">{totalUnits}</p>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-4 flex items-center gap-4 bg-gradient-to-r from-points/10 to-warning/10 border-points/30">
            <div className="w-12 h-12 rounded-full bg-points/20 flex items-center justify-center">
              <Star className="text-points" size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Points Earned</p>
              <p className="text-2xl font-bold text-points">+{totalPoints}</p>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="w-full max-w-sm space-y-3"
      >
        <Button
          className="w-full h-14 text-lg font-bold rounded-xl"
          onClick={() => { lightTap(); onNextOutlet(); }}
        >
          Next Outlet
          <ArrowRight className="ml-2" size={20} />
        </Button>
        <Button
          variant="outline"
          className="w-full h-12 font-semibold rounded-xl"
          onClick={() => { lightTap(); onEndDay(); }}
        >
          <Home className="mr-2" size={18} />
          End Day
        </Button>
      </motion.div>
    </div>
  );
};

export default SaleSuccess;
