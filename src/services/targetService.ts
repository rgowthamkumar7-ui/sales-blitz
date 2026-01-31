import { supabase } from '@/lib/supabase';
import { DSTarget, SalesmanTarget } from '@/types';

// Transform database row to app DSTarget type
function transformDSTarget(row: any): DSTarget {
    return {
        id: row.id,
        wdCode: row.wd_code,
        wdName: row.wd_name,
        tlName: row.tl_name,
        tlId: row.tl_id,
        dsName: row.ds_name,
        dsId: row.ds_id,
        skuName: row.sku_name,
        month: row.month,
        targetQty: row.target_qty,
        uploadedAt: row.uploaded_at,
        uploadedBy: row.uploaded_by,
    };
}

// Transform database row to app SalesmanTarget type
function transformSalesmanTarget(row: any): SalesmanTarget {
    return {
        id: row.id,
        salesmanId: row.salesman_id,
        focusProductId: row.focus_product_id,
        targetQuantity: row.target_quantity,
        month: row.month,
        maxReward: row.max_reward,
    };
}

export const targetService = {
    // Upload DS targets (batch insert)
    async uploadDSTargets(targets: Omit<DSTarget, 'id' | 'uploadedAt'>[]): Promise<DSTarget[]> {
        const insertData = targets.map(t => ({
            wd_code: t.wdCode,
            wd_name: t.wdName,
            tl_name: t.tlName,
            tl_id: t.tlId,
            ds_name: t.dsName,
            ds_id: t.dsId,
            sku_name: t.skuName,
            month: t.month,
            target_qty: t.targetQty,
            uploaded_by: t.uploadedBy,
        }));

        const { data, error } = await supabase
            .from('ds_targets')
            .insert(insertData)
            .select();

        if (error) throw error;
        return data.map(transformDSTarget);
    },

    // Get DS targets
    async getDSTargets(filters?: { month?: string; dsId?: string }): Promise<DSTarget[]> {
        let query = supabase
            .from('ds_targets')
            .select('*')
            .order('uploaded_at', { ascending: false });

        if (filters?.month) {
            query = query.eq('month', filters.month);
        }

        if (filters?.dsId) {
            query = query.eq('ds_id', filters.dsId);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data.map(transformDSTarget);
    },

    // Delete DS targets for a month (before re-upload)
    async deleteDSTargetsForMonth(month: string): Promise<void> {
        const { error } = await supabase
            .from('ds_targets')
            .delete()
            .eq('month', month);

        if (error) throw error;
    },

    // Get salesman targets
    async getSalesmanTargets(salesmanId?: string, month?: string): Promise<SalesmanTarget[]> {
        let query = supabase
            .from('salesman_targets')
            .select('*');

        if (salesmanId) {
            query = query.eq('salesman_id', salesmanId);
        }

        if (month) {
            query = query.eq('month', month);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data.map(transformSalesmanTarget);
    },

    // Create or update salesman target
    async upsertSalesmanTarget(target: Omit<SalesmanTarget, 'id'>): Promise<SalesmanTarget> {
        const { data, error } = await supabase
            .from('salesman_targets')
            .upsert({
                salesman_id: target.salesmanId,
                focus_product_id: target.focusProductId,
                target_quantity: target.targetQuantity,
                month: target.month,
                max_reward: target.maxReward,
            }, {
                onConflict: 'salesman_id,focus_product_id,month',
            })
            .select()
            .single();

        if (error) throw error;
        return transformSalesmanTarget(data);
    },
};
