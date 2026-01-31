import { supabase } from '@/lib/supabase';
import { StockIssued } from '@/types';

// Transform database row to app StockIssued type
function transformStockIssued(row: any): StockIssued {
    return {
        id: row.id,
        salesmanId: row.salesman_id,
        skuId: row.sku_id,
        quantity: row.quantity,
        date: row.date,
        issuedBy: row.issued_by,
    };
}

export const stockService = {
    // Issue stock to a salesman
    async issueStock(stock: Omit<StockIssued, 'id' | 'date'> & { date?: string }): Promise<StockIssued> {
        const { data, error } = await supabase
            .from('stock_issued')
            .insert({
                salesman_id: stock.salesmanId,
                sku_id: stock.skuId,
                quantity: stock.quantity,
                date: stock.date || new Date().toISOString().split('T')[0],
                issued_by: stock.issuedBy,
            })
            .select()
            .single();

        if (error) throw error;
        return transformStockIssued(data);
    },

    // Get all stock issued (alias for getAll)
    async getAllIssuedStock(): Promise<StockIssued[]> {
        return this.getAll();
    },

    // Get all stock issued
    async getAll(): Promise<StockIssued[]> {
        const { data, error } = await supabase
            .from('stock_issued')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data.map(transformStockIssued);
    },

    // Get stock issued to a salesman
    async getBySalesman(salesmanId: string): Promise<StockIssued[]> {
        const { data, error } = await supabase
            .from('stock_issued')
            .select('*')
            .eq('salesman_id', salesmanId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data.map(transformStockIssued);
    },

    // Get stock issued by date range
    async getByDateRange(startDate: string, endDate: string): Promise<StockIssued[]> {
        const { data, error } = await supabase
            .from('stock_issued')
            .select('*')
            .gte('date', startDate)
            .lte('date', endDate)
            .order('date', { ascending: false });

        if (error) throw error;
        return data.map(transformStockIssued);
    },

    // Get stock in hand for a salesman (issued - sold)
    async getStockInHand(salesmanId: string): Promise<{ skuId: string; quantity: number }[]> {
        // Get all stock issued
        const { data: issuedData, error: issuedError } = await supabase
            .from('stock_issued')
            .select('sku_id, quantity')
            .eq('salesman_id', salesmanId);

        if (issuedError) throw issuedError;

        // Get all sales
        const { data: salesData, error: salesError } = await supabase
            .from('sale_transactions')
            .select('sku_id, quantity')
            .eq('salesman_id', salesmanId);

        if (salesError) throw salesError;

        // Calculate stock in hand
        const stockMap = new Map<string, number>();

        // Add issued stock
        for (const item of issuedData || []) {
            stockMap.set(item.sku_id, (stockMap.get(item.sku_id) || 0) + item.quantity);
        }

        // Subtract sold stock
        for (const item of salesData || []) {
            stockMap.set(item.sku_id, (stockMap.get(item.sku_id) || 0) - item.quantity);
        }

        return Array.from(stockMap.entries())
            .filter(([, quantity]) => quantity > 0)
            .map(([skuId, quantity]) => ({ skuId, quantity }));
    },

    // Get issued by a team leader
    async getIssuedByTeamLeader(teamLeaderId: string): Promise<StockIssued[]> {
        const { data, error } = await supabase
            .from('stock_issued')
            .select('*')
            .eq('issued_by', teamLeaderId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data.map(transformStockIssued);
    },
};
