import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, TrendingUp, Award, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useSales } from '@/contexts/SalesContext';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { mockSKUs, mockIncentiveSlabs } from '@/data/mockData';

interface PerformanceProps {
  onBack: () => void;
}

const Performance: React.FC<PerformanceProps> = ({ onBack }) => {
  const { currentUser } = useAuth();
  const { getTodaysSales, getMonthlyPoints, getCurrentIncentive, getNextSlabProgress } = useSales();
  const { lightTap } = useHapticFeedback();

  const todaysSales = getTodaysSales();
  const monthlyPoints = getMonthlyPoints();
  const currentIncentive = getCurrentIncentive();
  const slabProgress = getNextSlabProgress();

  const todaysTotalUnits = todaysSales.reduce((sum, t) => sum + t.quantity, 0);
  const todaysTotalPoints = todaysSales.reduce((sum, t) => sum + t.points, 0);

  // Get next slab info
  const currentSlabIndex = mockIncentiveSlabs.findIndex(
    s => monthlyPoints >= s.minPoints && monthlyPoints <= s.maxPoints
  );
  const nextSlab = mockIncentiveSlabs[currentSlabIndex + 1];

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground px-4 pt-6 pb-12 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => { lightTap(); onBack(); }}
            className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-xl font-bold">My Performance</h1>
        </div>

        <div className="text-center">
          <p className="text-primary-foreground/80 text-sm mb-1">Welcome,</p>
          <p className="text-2xl font-bold">{currentUser?.name}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-4 -mt-6 space-y-4">
        {/* Today's Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="text-primary" size={18} />
              <h2 className="font-semibold text-foreground">Today's Sales</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-foreground">{todaysTotalUnits}</p>
                <p className="text-sm text-muted-foreground">Units Sold</p>
              </div>
              <div className="text-center p-3 bg-points/10 rounded-lg">
                <p className="text-2xl font-bold text-points">{todaysTotalPoints}</p>
                <p className="text-sm text-muted-foreground">Points</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Monthly Points */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <Star className="text-points" size={18} />
              <h2 className="font-semibold text-foreground">Monthly Progress</h2>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl font-bold text-foreground">{monthlyPoints}</span>
              <span className="text-sm text-muted-foreground">
                {nextSlab ? `/ ${nextSlab.minPoints} pts` : 'Max Level!'}
              </span>
            </div>
            <Progress value={slabProgress.percentage} className="h-3 mb-2" />
            {nextSlab && (
              <p className="text-sm text-muted-foreground">
                {nextSlab.minPoints - monthlyPoints} points to next level
              </p>
            )}
          </Card>
        </motion.div>

        {/* Incentive */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-4 shadow-lg bg-gradient-to-br from-success/10 to-success/5 border-success/30">
            <div className="flex items-center gap-2 mb-3">
              <Award className="text-success" size={18} />
              <h2 className="font-semibold text-foreground">Current Incentive</h2>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-sm text-muted-foreground">₹</span>
              <span className="text-4xl font-bold text-success">{currentIncentive.toLocaleString()}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Earned this month
            </p>
          </Card>
        </motion.div>

        {/* Incentive Slabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Target className="text-primary" size={18} />
              <h2 className="font-semibold text-foreground">Incentive Levels</h2>
            </div>
            <div className="space-y-3">
              {mockIncentiveSlabs.map((slab, index) => {
                const isCurrentSlab = monthlyPoints >= slab.minPoints && monthlyPoints <= slab.maxPoints;
                const isAchieved = monthlyPoints > slab.maxPoints;
                
                return (
                  <div
                    key={slab.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      isCurrentSlab
                        ? 'bg-primary/10 border-primary'
                        : isAchieved
                        ? 'bg-success/10 border-success/30'
                        : 'bg-muted/50 border-border'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        isCurrentSlab
                          ? 'bg-primary text-primary-foreground'
                          : isAchieved
                          ? 'bg-success text-success-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {slab.minPoints} - {slab.maxPoints === 99999 ? '∞' : slab.maxPoints} pts
                        </p>
                      </div>
                    </div>
                    <span className={`font-bold ${
                      isCurrentSlab ? 'text-primary' : isAchieved ? 'text-success' : 'text-muted-foreground'
                    }`}>
                      ₹{slab.incentiveAmount}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Performance;
