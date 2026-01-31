<<<<<<< HEAD
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { SaleTransaction, StockIssued, DSTarget, SalesmanMappedOutlets, User } from '@/types';
import { salesService } from '@/services/salesService';
import { stockService } from '@/services/stockService';
import { targetService } from '@/services/targetService';
import { userService } from '@/services/userService';
=======
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SaleTransaction, StockIssued, DSTarget, SalesmanMappedOutlets } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { mockUsers } from '@/data/mockData';
>>>>>>> 91d69597fce6244da13b3b6b325eef99d1452b9c

interface SalesContextType {
    transactions: SaleTransaction[];
    stockIssued: StockIssued[];
    dsTargets: DSTarget[];
    salesmanMappedOutlets: SalesmanMappedOutlets[];
<<<<<<< HEAD
    isLoading: boolean;
=======
>>>>>>> 91d69597fce6244da13b3b6b325eef99d1452b9c
    addSaleTransaction: (
        salesmanId: string,
        outletId: string,
        skuId: string,
        quantity: number,
        points: number,
        date?: string
<<<<<<< HEAD
    ) => Promise<void>;
=======
    ) => void;
>>>>>>> 91d69597fce6244da13b3b6b325eef99d1452b9c
    addBulkSaleTransactions: (
        salesmanId: string,
        entries: { skuId: string; quantity: number; outletCount: number; points: number }[],
        date?: string
<<<<<<< HEAD
    ) => Promise<void>;
    issueStock: (salesmanId: string, skuId: string, quantity: number, issuedBy: string) => Promise<void>;
    setDSTargets: (targets: DSTarget[]) => Promise<void>;
    getSalesmanSalesForDate: (salesmanId: string, date: string) => SaleTransaction[];
    hasSalesmanEntryForDate: (salesmanId: string, date: string) => boolean;
    getSalesmanMappedOutlets: (salesmanId: string) => number;
    setSalesmanMappedOutlets: (salesmanId: string, totalOutlets: number, updatedBy: string) => Promise<void>;
    refreshData: () => Promise<void>;
=======
    ) => void;
    issueStock: (salesmanId: string, skuId: string, quantity: number, issuedBy: string) => void;
    setDSTargets: (targets: DSTarget[]) => void;
    getSalesmanSalesForDate: (salesmanId: string, date: string) => SaleTransaction[];
    hasSalesmanEntryForDate: (salesmanId: string, date: string) => boolean;
    getSalesmanMappedOutlets: (salesmanId: string) => number;
    setSalesmanMappedOutlets: (salesmanId: string, totalOutlets: number, updatedBy: string) => void;
>>>>>>> 91d69597fce6244da13b3b6b325eef99d1452b9c
}

const SalesContext = createContext<SalesContextType | undefined>(undefined);


export const SalesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
<<<<<<< HEAD
    const [transactions, setTransactions] = useState<SaleTransaction[]>([]);
    const [stockIssued, setStockIssued] = useState<StockIssued[]>([]);
    const [dsTargets, setDSTargetsState] = useState<DSTarget[]>([]);
    const [salesmanMappedOutlets, setSalesmanMappedOutletsState] = useState<SalesmanMappedOutlets[]>([]);
    const [salesmenData, setSalesmenData] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch all data from Supabase on mount
    const refreshData = useCallback(async () => {
        setIsLoading(true);
        try {
            // Fetch transactions from last 30 days for performance
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const startDate = thirtyDaysAgo.toISOString().split('T')[0];
            const endDate = new Date().toISOString().split('T')[0];

            const [txnData, stockData, targetsData, salesmen] = await Promise.all([
                salesService.getByDateRange(startDate, endDate),
                stockService.getAllIssuedStock(),
                targetService.getDSTargets(),
                userService.getSalesmen()
            ]);

            setTransactions(txnData);
            setStockIssued(stockData);
            setDSTargetsState(targetsData);
            setSalesmenData(salesmen);

            // Build mapped outlets from salesmen data
            const mappedOutlets: SalesmanMappedOutlets[] = salesmen.map(s => ({
                salesmanId: s.id,
                totalMappedOutlets: s.totalMappedOutlets || 0,
                updatedAt: new Date().toISOString(),
                updatedBy: 'system'
            }));
            setSalesmanMappedOutletsState(mappedOutlets);

        } catch (error) {
            console.error('Failed to fetch sales data:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    // Add a single sale transaction
    const addSaleTransaction = async (
        salesmanId: string,
        outletId: string,
        skuId: string,
        quantity: number,
        points: number,
        date?: string
    ) => {
        try {
            const newTxn = await salesService.create({
                salesmanId,
                outletId,
                skuId,
                quantity,
                outletCount: 1,
                points,
                date: date || new Date().toISOString().split('T')[0]
            });

            if (newTxn) {
                setTransactions(prev => [...prev, newTxn]);
            }
        } catch (error) {
            console.error('Failed to add transaction:', error);
            throw error;
        }
    };

    // Add bulk sale transactions (used by Team Leader for entering daily sales)
    const addBulkSaleTransactions = async (
=======
    const [transactions, setTransactions] = useLocalStorage<SaleTransaction[]>('salesTransactions', []);
    const [stockIssued, setStockIssued] = useLocalStorage<StockIssued[]>('stockIssued', []);
    const [dsTargets, setDSTargetsState] = useLocalStorage<DSTarget[]>('dsTargets', []);
    const [salesmanMappedOutlets, setSalesmanMappedOutletsState] = useLocalStorage<SalesmanMappedOutlets[]>('salesmanMappedOutlets', []);

    // Add a single sale transaction
    const addSaleTransaction = (
        salesmanId: string,
        outletId: string,
        skuId: string,
        quantity: number,
        points: number,
        date?: string
    ) => {
        const transaction: SaleTransaction = {
            id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            salesmanId,
            outletId,
            skuId,
            quantity,
            outletCount: 1, // Default to 1 outlet for single transaction
            points,
            timestamp: date || new Date().toISOString(),
        };

        setTransactions(prev => [...prev, transaction]);
    };

    // Add bulk sale transactions (used by Team Leader for entering daily sales)
    const addBulkSaleTransactions = (
>>>>>>> 91d69597fce6244da13b3b6b325eef99d1452b9c
        salesmanId: string,
        entries: { skuId: string; quantity: number; outletCount: number; points: number }[],
        date?: string
    ) => {
        const selectedDate = date || new Date().toISOString().split('T')[0];
<<<<<<< HEAD

        try {
            // Delete existing entries for this salesman on this date
            await salesService.deleteByDate(salesmanId, selectedDate);

            // Create new transactions
            const newTransactions: SaleTransaction[] = [];
            for (const entry of entries) {
                if (entry.quantity > 0 || entry.outletCount > 0) {
                    const txn = await salesService.create({
                        salesmanId,
                        outletId: 'TL-ENTRY', // Special marker for TL-entered sales
                        skuId: entry.skuId,
                        quantity: entry.quantity,
                        outletCount: entry.outletCount,
                        points: entry.points,
                        date: selectedDate
                    });
                    if (txn) {
                        newTransactions.push(txn);
                    }
                }
            }

            // Update local state
            setTransactions(prev => {
                const filtered = prev.filter(t => {
                    const txnDate = new Date(t.timestamp).toISOString().split('T')[0];
                    return !(t.salesmanId === salesmanId && txnDate === selectedDate);
                });
                return [...filtered, ...newTransactions];
            });
        } catch (error) {
            console.error('Failed to add bulk transactions:', error);
            throw error;
        }
=======
        const timestamp = new Date(selectedDate).toISOString();

        // Remove existing entries for this salesman on this date
        setTransactions(prev => {
            const filtered = prev.filter(t => {
                const txnDate = new Date(t.timestamp).toISOString().split('T')[0];
                return !(t.salesmanId === salesmanId && txnDate === selectedDate);
            });

            // Add new transactions
            const newTransactions = entries
                .filter(e => e.quantity > 0 || e.outletCount > 0)
                .map((entry, index) => ({
                    id: `txn-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
                    salesmanId,
                    outletId: 'TL-ENTRY', // Special marker for TL-entered sales
                    skuId: entry.skuId,
                    quantity: entry.quantity,
                    outletCount: entry.outletCount,
                    points: entry.points,
                    timestamp,
                }));

            return [...filtered, ...newTransactions];
        });
>>>>>>> 91d69597fce6244da13b3b6b325eef99d1452b9c
    };

    // Get sales for a specific salesman on a specific date
    const getSalesmanSalesForDate = (salesmanId: string, date: string): SaleTransaction[] => {
        return transactions.filter(t => {
            const txnDate = new Date(t.timestamp).toISOString().split('T')[0];
            return t.salesmanId === salesmanId && txnDate === date;
        });
    };

    // Check if salesman has any entry for a specific date
    const hasSalesmanEntryForDate = (salesmanId: string, date: string): boolean => {
        return transactions.some(t => {
            const txnDate = new Date(t.timestamp).toISOString().split('T')[0];
            return t.salesmanId === salesmanId && txnDate === date;
        });
    };

    // Issue stock from TL to Salesman
<<<<<<< HEAD
    const issueStock = async (salesmanId: string, skuId: string, quantity: number, issuedBy: string) => {
        try {
            const stockEntry = await stockService.issueStock({
                salesmanId,
                skuId,
                quantity,
                issuedBy
            });

            if (stockEntry) {
                setStockIssued(prev => [...prev, stockEntry]);
            }
        } catch (error) {
            console.error('Failed to issue stock:', error);
            throw error;
        }
    };

    // Set DS Targets (used by Manager upload)
    const setDSTargets = async (targets: DSTarget[]) => {
        try {
            // Upload targets to Supabase
            await targetService.uploadDSTargets(targets);
            setDSTargetsState(targets);
        } catch (error) {
            console.error('Failed to set DS targets:', error);
            throw error;
        }
=======
    const issueStock = (salesmanId: string, skuId: string, quantity: number, issuedBy: string) => {
        const stockEntry: StockIssued = {
            id: `stock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            salesmanId,
            skuId,
            quantity,
            date: new Date().toISOString(),
            issuedBy,
        };

        setStockIssued(prev => [...prev, stockEntry]);
    };

    // Set DS Targets (used by Manager upload)
    const setDSTargets = (targets: DSTarget[]) => {
        setDSTargetsState(targets);
>>>>>>> 91d69597fce6244da13b3b6b325eef99d1452b9c
    };

    // Get salesman's total mapped outlets
    const getSalesmanMappedOutlets = (salesmanId: string): number => {
<<<<<<< HEAD
        const entry = salesmanMappedOutlets.find(m => m.salesmanId === salesmanId);
        if (entry) return entry.totalMappedOutlets;

        // Fallback to salesmen data
        const salesman = salesmenData.find(s => s.id === salesmanId);
        return salesman?.totalMappedOutlets || 0;
    };

    // Set salesman's total mapped outlets
    const setSalesmanMappedOutlets = async (salesmanId: string, totalOutlets: number, updatedBy: string) => {
        try {
            // Update in Supabase
            await userService.updateMappedOutlets(salesmanId, totalOutlets);

            // Update local state
            setSalesmanMappedOutletsState(prev => {
                const filtered = prev.filter(m => m.salesmanId !== salesmanId);
                return [...filtered, {
                    salesmanId,
                    totalMappedOutlets: totalOutlets,
                    updatedAt: new Date().toISOString(),
                    updatedBy,
                }];
            });
        } catch (error) {
            console.error('Failed to update mapped outlets:', error);
            throw error;
        }
=======
        // First check locally saved override
        const entry = salesmanMappedOutlets.find(m => m.salesmanId === salesmanId);
        if (entry) return entry.totalMappedOutlets;

        // Fallback to default user data (mock)
        // Note: In a real app, this would be part of the user object fetched from API
        const user = mockUsers.find((u) => u.id === salesmanId);
        return user?.totalMappedOutlets || 0;
    };

    // Set salesman's total mapped outlets
    const setSalesmanMappedOutlets = (salesmanId: string, totalOutlets: number, updatedBy: string) => {

        setSalesmanMappedOutletsState(prev => {
            // Remove existing entry for this salesman
            const filtered = prev.filter(m => m.salesmanId !== salesmanId);
            // Add new entry
            return [...filtered, {
                salesmanId,
                totalMappedOutlets: totalOutlets,
                updatedAt: new Date().toISOString(),
                updatedBy,
            }];
        });
>>>>>>> 91d69597fce6244da13b3b6b325eef99d1452b9c
    };

    return (
        <SalesContext.Provider
            value={{
                transactions,
                stockIssued,
                dsTargets,
                salesmanMappedOutlets,
<<<<<<< HEAD
                isLoading,
=======
>>>>>>> 91d69597fce6244da13b3b6b325eef99d1452b9c
                addSaleTransaction,
                addBulkSaleTransactions,
                issueStock,
                setDSTargets,
                getSalesmanSalesForDate,
                hasSalesmanEntryForDate,
                getSalesmanMappedOutlets,
                setSalesmanMappedOutlets,
<<<<<<< HEAD
                refreshData,
=======
>>>>>>> 91d69597fce6244da13b3b6b325eef99d1452b9c
            }}
        >
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
