import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { SaleTransaction, StockIssued, DSTarget, SalesmanMappedOutlets, User } from '@/types';
import { salesService } from '@/services/salesService';
import { stockService } from '@/services/stockService';
import { targetService } from '@/services/targetService';
import { userService } from '@/services/userService';

interface SalesContextType {
    transactions: SaleTransaction[];
    stockIssued: StockIssued[];
    dsTargets: DSTarget[];
    salesmanMappedOutlets: SalesmanMappedOutlets[];
    isLoading: boolean;
    addSaleTransaction: (
        salesmanId: string,
        outletId: string,
        skuId: string,
        quantity: number,
        points: number,
        date?: string
    ) => Promise<void>;
    addBulkSaleTransactions: (
        salesmanId: string,
        entries: { skuId: string; quantity: number; outletCount: number; points: number }[],
        date?: string
    ) => Promise<void>;
    issueStock: (salesmanId: string, skuId: string, quantity: number, issuedBy: string) => Promise<void>;
    setDSTargets: (targets: DSTarget[]) => Promise<void>;
    getSalesmanSalesForDate: (salesmanId: string, date: string) => SaleTransaction[];
    hasSalesmanEntryForDate: (salesmanId: string, date: string) => boolean;
    getSalesmanMappedOutlets: (salesmanId: string) => number;
    setSalesmanMappedOutlets: (salesmanId: string, totalOutlets: number, updatedBy: string) => Promise<void>;
    refreshData: () => Promise<void>;
}

const SalesContext = createContext<SalesContextType | undefined>(undefined);


export const SalesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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
        salesmanId: string,
        entries: { skuId: string; quantity: number; outletCount: number; points: number }[],
        date?: string
    ) => {
        const selectedDate = date || new Date().toISOString().split('T')[0];

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
    };

    // Get salesman's total mapped outlets
    const getSalesmanMappedOutlets = (salesmanId: string): number => {
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
    };

    return (
        <SalesContext.Provider
            value={{
                transactions,
                stockIssued,
                dsTargets,
                salesmanMappedOutlets,
                isLoading,
                addSaleTransaction,
                addBulkSaleTransactions,
                issueStock,
                setDSTargets,
                getSalesmanSalesForDate,
                hasSalesmanEntryForDate,
                getSalesmanMappedOutlets,
                setSalesmanMappedOutlets,
                refreshData,
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
