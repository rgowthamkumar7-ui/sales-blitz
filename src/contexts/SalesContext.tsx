import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SaleTransaction, StockIssued, DSTarget, SalesmanMappedOutlets } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { mockUsers } from '@/data/mockData';

interface SalesContextType {
    transactions: SaleTransaction[];
    stockIssued: StockIssued[];
    dsTargets: DSTarget[];
    salesmanMappedOutlets: SalesmanMappedOutlets[];
    addSaleTransaction: (
        salesmanId: string,
        outletId: string,
        skuId: string,
        quantity: number,
        points: number,
        date?: string
    ) => void;
    addBulkSaleTransactions: (
        salesmanId: string,
        entries: { skuId: string; quantity: number; outletCount: number; points: number }[],
        date?: string
    ) => void;
    issueStock: (salesmanId: string, skuId: string, quantity: number, issuedBy: string) => void;
    setDSTargets: (targets: DSTarget[]) => void;
    getSalesmanSalesForDate: (salesmanId: string, date: string) => SaleTransaction[];
    hasSalesmanEntryForDate: (salesmanId: string, date: string) => boolean;
    getSalesmanMappedOutlets: (salesmanId: string) => number;
    setSalesmanMappedOutlets: (salesmanId: string, totalOutlets: number, updatedBy: string) => void;
}

const SalesContext = createContext<SalesContextType | undefined>(undefined);


export const SalesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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
        salesmanId: string,
        entries: { skuId: string; quantity: number; outletCount: number; points: number }[],
        date?: string
    ) => {
        const selectedDate = date || new Date().toISOString().split('T')[0];
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
    };

    // Get salesman's total mapped outlets
    const getSalesmanMappedOutlets = (salesmanId: string): number => {
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
    };

    return (
        <SalesContext.Provider
            value={{
                transactions,
                stockIssued,
                dsTargets,
                salesmanMappedOutlets,
                addSaleTransaction,
                addBulkSaleTransactions,
                issueStock,
                setDSTargets,
                getSalesmanSalesForDate,
                hasSalesmanEntryForDate,
                getSalesmanMappedOutlets,
                setSalesmanMappedOutlets,
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
