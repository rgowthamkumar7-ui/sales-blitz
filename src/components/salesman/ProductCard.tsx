import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SKU } from '@/types';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  sku: SKU;
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  sku,
  quantity,
  onIncrement,
  onDecrement,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showRipple, setShowRipple] = useState(false);
  const [ripplePosition, setRipplePosition] = useState({ x: 0, y: 0 });
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);
  const { lightTap, mediumTap } = useHapticFeedback();

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    isLongPress.current = false;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    setRipplePosition({
      x: clientX - rect.left,
      y: clientY - rect.top,
    });

    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      if (quantity > 0) {
        mediumTap();
        onDecrement();
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 200);
      }
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }

    if (!isLongPress.current) {
      lightTap();
      onIncrement();
      setIsAnimating(true);
      setShowRipple(true);
      setTimeout(() => {
        setIsAnimating(false);
        setShowRipple(false);
      }, 300);
    }
  };

  const handleTouchCancel = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  return (
    <motion.div
      animate={isAnimating ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 0.2 }}
      className="relative overflow-hidden rounded-xl bg-card shadow-md border border-border touch-manipulation select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchCancel}
    >
      {/* Ripple Effect */}
      <AnimatePresence>
        {showRipple && (
          <motion.div
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute w-20 h-20 rounded-full bg-primary/30 pointer-events-none"
            style={{
              left: ripplePosition.x - 40,
              top: ripplePosition.y - 40,
            }}
          />
        )}
      </AnimatePresence>

      {/* Counter Badge */}
      <AnimatePresence>
        {quantity > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute top-2 right-2 z-10"
          >
            <Badge className={cn(
              "h-8 min-w-8 flex items-center justify-center text-lg font-bold rounded-full px-2",
              "bg-primary text-primary-foreground shadow-lg"
            )}>
              <motion.span
                key={quantity}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
              >
                {quantity}
              </motion.span>
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Image */}
      <div className="aspect-square bg-muted overflow-hidden">
        <img
          src={sku.imageUrl}
          alt={sku.name}
          className="w-full h-full object-cover pointer-events-none"
          draggable={false}
        />
      </div>

      {/* Product Info */}
      <div className="p-3">
        <p className="font-medium text-sm text-foreground line-clamp-2 leading-tight">
          {sku.name}
        </p>
        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs text-points font-semibold">
            +{sku.pointsPerUnit} pts
          </span>
        </div>
      </div>

      {/* Tap Indicator Overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <AnimatePresence>
          {isAnimating && quantity > 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              exit={{ opacity: 0 }}
              className="w-16 h-16 rounded-full border-4 border-primary"
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ProductCard;
