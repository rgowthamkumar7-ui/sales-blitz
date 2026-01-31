import { supabase } from '@/lib/supabase';
import { SaleTransaction } from '@/types';

// Transform database row to app SaleTransaction type
function transformTransaction(row: any): SaleTransaction {
    return {
        id: row.id,
        salesmanId: row.salesman_id,
        outletId: row.outlet_id,
        skuId: row.sku_id,
        quantity: row.quantity,
        outletCount: row.outlet_count || 1,
        points: row.points || 0,
        timestamp: row.created_at,
    };
}

export const salesService = {
    // Create a new sale transaction
    async create(transaction: Omit<SaleTransaction, 'id' | 'timestamp'> & { date?: string }): Promise<SaleTransaction> {
        const { data, error } = await supabase
            .from('sale_transactions')
            .insert({
                salesman_id: transaction.salesmanId,
                outlet_id: transaction.outletId,
                sku_id: transaction.skuId,
                quantity: transaction.quantity,
                outlet_count: transaction.outletCount,
                points: transaction.points,
                transaction_date: transaction.date || new Date().toISOString().split('T')[0],
            } as unknown as never)
            .select()
            .single();

        if (error) throw error;
        return transformTransaction(data);
    },

    // Delete transactions for a salesman on a specific date
    async deleteByDate(salesmanId: string, date: string): Promise<void> {
        const { error } = await supabase
            .from('sale_transactions')
            .delete()
            .eq('salesman_id', salesmanId)
            .eq('transaction_date', date);

        if (error) throw error;
    },

    // Get all transactions
    async getAll(): Promise<SaleTransaction[]> {
        const { data, error } = await supabase
            .from('sale_transactions')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data.map(transformTransaction);
    },

    // Get transactions by salesman
    async getBySalesman(salesmanId: string): Promise<SaleTransaction[]> {
        const { data, error } = await supabase
            .from('sale_transactions')
            .select('*')
            .eq('salesman_id', salesmanId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data.map(transformTransaction);
    },

    // Get transactions by date range
    async getByDateRange(startDate: string, endDate: string): Promise<SaleTransaction[]> {
        const { data, error } = await supabase
            .from('sale_transactions')
            .select('*')
            .gte('transaction_date', startDate)
            .lte('transaction_date', endDate)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data.map(transformTransaction);
    },

    // Get transactions with filters (for manager dashboard)
    async getFiltered(params: {
        startDate?: string;
        endDate?: string;
        distributorIds?: string[];
        salesmanIds?: string[];
        skuIds?: string[];
    }): Promise<SaleTransaction[]> {
        let query = supabase.from('sale_transactions').select(`
      *,
      salesman:users!salesman_id(id, name, distributor_id)
    `);

        if (params.startDate) {
            query = query.gte('transaction_date', params.startDate);
        }

        if (params.endDate) {
            query = query.lte('transaction_date', params.endDate);
        }

        if (params.salesmanIds && params.salesmanIds.length > 0) {
            query = query.in('salesman_id', params.salesmanIds);
        }

        if (params.skuIds && params.skuIds.length > 0) {
            query = query.in('sku_id', params.skuIds);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;

        // Cast data to any[] because complex joins often break type inference
        const rows = data as any[] || [];
        let transactions = rows.map(transformTransaction);

        // Filter by distributor if specified
        if (params.distributorIds && params.distributorIds.length > 0) {
            transactions = transactions.filter((t: any) => {
                const salesman = rows.find((d: any) => d.id === t.id)?.salesman;
                return salesman && params.distributorIds!.includes(salesman.distributor_id);
            });
        }

        return transactions;
    },

    // Get sales summary by SKU for a date range
    async getSalesBySKU(startDate: string, endDate: string, distributorIds?: string[]): Promise<{ skuId: string; totalQuantity: number; totalPoints: number }[]> {
        const transactions = await this.getFiltered({ startDate, endDate, distributorIds });

        const summaryMap = new Map<string, { skuId: string; totalQuantity: number; totalPoints: number }>();

        for (const t of transactions) {
            const existing = summaryMap.get(t.skuId);
            if (existing) {
                existing.totalQuantity += t.quantity;
                existing.totalPoints += t.points;
            } else {
                summaryMap.set(t.skuId, {
                    skuId: t.skuId,
                    totalQuantity: t.quantity,
                    totalPoints: t.points,
                });
            }
        }

        return Array.from(summaryMap.values());
    },

    // Get daily sales for chart
    async getDailySales(startDate: string, endDate: string, distributorIds?: string[]): Promise<{ date: string; quantity: number }[]> {
        const transactions = await this.getFiltered({ startDate, endDate, distributorIds });

        const dailyMap = new Map<string, number>();

        for (const t of transactions) {
            const date = t.timestamp.split('T')[0];
            dailyMap.set(date, (dailyMap.get(date) || 0) + t.quantity);
        }

        return Array.from(dailyMap.entries())
            .map(([date, quantity]) => ({ date, quantity }))
            .sort((a, b) => a.date.localeCompare(b.date));
    },
};
