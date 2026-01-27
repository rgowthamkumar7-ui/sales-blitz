import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingBag, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ProductCard from './ProductCard';
import { mockSKUs } from '@/data/mockData';
import { useSales } from '@/contexts/SalesContext';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { SaleEntry } from '@/types';

interface SalesPunchProps {
  onBack: () => void;
  onSubmit: (totalUnits: number, totalPoints: number) => void;
}

const SalesPunch: React.FC<SalesPunchProps> = ({ onBack, onSubmit }) => {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const { selectedOutlet, addSale } = useSales();
  const { strongTap, lightTap } = useHapticFeedback();

  const activeSKUs = mockSKUs.filter(sku => sku.isActive);

  const { totalUnits, totalPoints } = useMemo(() => {
    let units = 0;
    let points = 0;
    Object.entries(quantities).forEach(([skuId, qty]) => {
      const sku = mockSKUs.find(s => s.id === skuId);
      if (sku && qty > 0) {
        units += qty;
        points += qty * sku.pointsPerUnit;
      }
    });
    return { totalUnits: units, totalPoints: points };
  }, [quantities]);

  const handleIncrement = (skuId: string) => {
    setQuantities(prev => ({
      ...prev,
      [skuId]: (prev[skuId] || 0) + 1,
    }));
  };

  const handleDecrement = (skuId: string) => {
    setQuantities(prev => ({
      ...prev,
      [skuId]: Math.max((prev[skuId] || 0) - 1, 0),
    }));
  };

  const handleSubmit = () => {
    if (totalUnits === 0 || !selectedOutlet) return;
    
    strongTap();
    
    const entries: SaleEntry[] = Object.entries(quantities)
      .filter(([_, qty]) => qty > 0)
      .map(([skuId, quantity]) => ({ skuId, quantity }));
    
    addSale(selectedOutlet.id, entries);
    onSubmit(totalUnits, totalPoints);
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => { lightTap(); onBack(); }}
            className="shrink-0"
          >
            <ArrowLeft size={20} />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-foreground truncate">
              {selectedOutlet?.name}
            </h1>
            <p className="text-sm text-muted-foreground">Tap products to add</p>
          </div>
        </div>
      </div>

      {/* Running Total */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-[65px] z-10 px-4 py-2 bg-background/95 backdrop-blur-sm"
      >
        <Card className="p-3 bg-gradient-to-r from-primary/10 to-points/10 border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <ShoppingBag className="text-primary" size={18} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Units</p>
                <motion.p
                  key={totalUnits}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="text-xl font-bold text-foreground"
                >
                  {totalUnits}
                </motion.p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end">
                <Star className="text-points" size={14} />
                <p className="text-sm text-muted-foreground">Points</p>
              </div>
              <motion.p
                key={totalPoints}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-xl font-bold text-points"
              >
                {totalPoints}
              </motion.p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Product Grid */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-2 gap-3">
          {activeSKUs.map((sku, index) => (
            <motion.div
              key={sku.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <ProductCard
                sku={sku}
                quantity={quantities[sku.id] || 0}
                onIncrement={() => handleIncrement(sku.id)}
                onDecrement={() => handleDecrement(sku.id)}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: totalUnits > 0 ? 0 : 100 }}
        className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent"
      >
        <Button
          className="w-full h-14 text-lg font-bold rounded-xl shadow-lg bg-success hover:bg-success/90"
          onClick={handleSubmit}
          disabled={totalUnits === 0}
        >
          SUBMIT SALE ({totalUnits} units)
        </Button>
      </motion.div>
    </div>
  );
};

export default SalesPunch;
