import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import StartDay from './StartDay';
import SalesPunch from './SalesPunch';
import SaleSuccess from './SaleSuccess';
import Performance from './Performance';
import BottomNav from './BottomNav';
import { useSales } from '@/contexts/SalesContext';

type Screen = 'start' | 'punch' | 'success' | 'performance';
type NavItem = 'home' | 'sales' | 'performance';

const SalesmanApp: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('start');
  const [activeNav, setActiveNav] = useState<NavItem>('home');
  const [lastSale, setLastSale] = useState({ units: 0, points: 0 });
  const { setSelectedOutlet } = useSales();

  const handleStartSales = () => {
    setCurrentScreen('punch');
    setActiveNav('sales');
  };

  const handleSaleSubmit = (totalUnits: number, totalPoints: number) => {
    setLastSale({ units: totalUnits, points: totalPoints });
    setCurrentScreen('success');
  };

  const handleNextOutlet = () => {
    setSelectedOutlet(null);
    setCurrentScreen('start');
    setActiveNav('home');
  };

  const handleEndDay = () => {
    setSelectedOutlet(null);
    setCurrentScreen('start');
    setActiveNav('home');
  };

  const handleNavigation = (item: NavItem) => {
    setActiveNav(item);
    if (item === 'home') {
      setCurrentScreen('start');
    } else if (item === 'performance') {
      setCurrentScreen('performance');
    } else if (item === 'sales' && currentScreen !== 'punch' && currentScreen !== 'success') {
      // Only go to punch if we have an outlet selected
      setCurrentScreen('start');
    }
  };

  const showBottomNav = currentScreen !== 'punch' && currentScreen !== 'success';

  const pageTransition = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.2 },
  };

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {currentScreen === 'start' && (
          <motion.div key="start" {...pageTransition}>
            <StartDay onStartSales={handleStartSales} />
          </motion.div>
        )}
        {currentScreen === 'punch' && (
          <motion.div key="punch" {...pageTransition}>
            <SalesPunch
              onBack={() => {
                setCurrentScreen('start');
                setActiveNav('home');
              }}
              onSubmit={handleSaleSubmit}
            />
          </motion.div>
        )}
        {currentScreen === 'success' && (
          <motion.div key="success" {...pageTransition}>
            <SaleSuccess
              totalUnits={lastSale.units}
              totalPoints={lastSale.points}
              onNextOutlet={handleNextOutlet}
              onEndDay={handleEndDay}
            />
          </motion.div>
        )}
        {currentScreen === 'performance' && (
          <motion.div key="performance" {...pageTransition}>
            <Performance
              onBack={() => {
                setCurrentScreen('start');
                setActiveNav('home');
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {showBottomNav && (
        <BottomNav activeItem={activeNav} onNavigate={handleNavigation} />
      )}
    </div>
  );
};

export default SalesmanApp;
