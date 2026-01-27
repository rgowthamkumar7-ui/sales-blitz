import React, { createContext, useContext, ReactNode } from 'react';
import { SaleTransaction, StockIssued, SaleEntry, Outlet } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { mockSKUs, mockIncentiveSlabs } from '@/data/mockData';
import { useAuth } from './AuthContext';

interface SalesContextType {
  transactions: SaleTransaction[];
  stockIssued: StockIssued[];
  addSale: (outletId: string, entries: SaleEntry[]) => void;
  getTodaysSales: () => SaleTransaction[];
  getMonthlyPoints: () => number;
  getCurrentIncentive: () => number;
  getNextSlabProgress: () => { current: number; target: number; percentage: number };
  selectedOutlet: Outlet | null;
  setSelectedOutlet: (outlet: Outlet | null) => void;
}

const SalesContext = createContext<SalesContextType | undefined>(undefined);

export const SalesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useLocalStorage<SaleTransaction[]>('salesTransactions', []);
  const [stockIssued] = useLocalStorage<StockIssued[]>('stockIssued', []);
  const [selectedOutlet, setSelectedOutlet] = useLocalStorage<Outlet | null>('selectedOutlet', null);

  const addSale = (outletId: string, entries: SaleEntry[]) => {
    if (!currentUser) return;

    const newTransactions: SaleTransaction[] = entries
      .filter(entry => entry.quantity > 0)
      .map(entry => {
        const sku = mockSKUs.find(s => s.id === entry.skuId);
        return {
          id: `${Date.now()}-${entry.skuId}`,
          salesmanId: currentUser.id,
          outletId,
          skuId: entry.skuId,
          quantity: entry.quantity,
          points: (sku?.pointsPerUnit || 0) * entry.quantity,
          timestamp: new Date().toISOString(),
        };
      });

    setTransactions(prev => [...prev, ...newTransactions]);
  };

  const getTodaysSales = (): SaleTransaction[] => {
    if (!currentUser) return [];
    const today = new Date().toDateString();
    return transactions.filter(t => 
      t.salesmanId === currentUser.id && 
      new Date(t.timestamp).toDateString() === today
    );
  };

  const getMonthlyPoints = (): number => {
    if (!currentUser) return 0;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return transactions
      .filter(t => 
        t.salesmanId === currentUser.id && 
        new Date(t.timestamp) >= monthStart
      )
      .reduce((sum, t) => sum + t.points, 0);
  };

  const getCurrentIncentive = (): number => {
    const points = getMonthlyPoints();
    const slab = mockIncentiveSlabs.find(s => points >= s.minPoints && points <= s.maxPoints);
    return slab?.incentiveAmount || 0;
  };

  const getNextSlabProgress = () => {
    const points = getMonthlyPoints();
    const currentSlabIndex = mockIncentiveSlabs.findIndex(s => points >= s.minPoints && points <= s.maxPoints);
    const nextSlab = mockIncentiveSlabs[currentSlabIndex + 1];
    
    if (!nextSlab) {
      return { current: points, target: points, percentage: 100 };
    }

    const currentSlab = mockIncentiveSlabs[currentSlabIndex];
    const progressInSlab = points - currentSlab.minPoints;
    const slabRange = nextSlab.minPoints - currentSlab.minPoints;
    const percentage = Math.min((progressInSlab / slabRange) * 100, 100);

    return { current: points, target: nextSlab.minPoints, percentage };
  };

  return (
    <SalesContext.Provider value={{
      transactions,
      stockIssued,
      addSale,
      getTodaysSales,
      getMonthlyPoints,
      getCurrentIncentive,
      getNextSlabProgress,
      selectedOutlet,
      setSelectedOutlet,
    }}>
      {children}
    </SalesContext.Provider>
  );
};

export const useSales = () => {
  const context = useContext(SalesContext);
  if (context === undefined) {
    throw new Error('useSales must be used within a SalesProvider');
  }
  return context;
};
