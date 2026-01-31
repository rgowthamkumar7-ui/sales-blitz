import { supabase } from '@/lib/supabase';
import { SKU, FocusProduct } from '@/types';

// Transform database row to app SKU type
function transformSKU(row: any): SKU {
    return {
        id: row.id,
        name: row.name,
        imageUrl: row.image_url || '',
        pointsPerUnit: row.points_per_unit,
        isActive: row.is_active,
    };
}

// Transform database row to app FocusProduct type
function transformFocusProduct(row: any): FocusProduct {
    return {
        id: row.id,
        skuId: row.sku_id,
        name: row.name,
        rewardPerUnit: row.reward_per_unit,
        color: row.color || '',
    };
}

export const skuService = {
    // Get all SKUs
    async getAll(): Promise<SKU[]> {
        const { data, error } = await supabase
            .from('skus')
            .select('*')
            .order('name');

        if (error) {
            console.error('Error fetching SKUs from Supabase:', error);
            return [];
        }

        return data.map(transformSKU);
    },

    // Get active SKUs only
    async getActive(): Promise<SKU[]> {
        const { data, error } = await supabase
            .from('skus')
            .select('*')
            .eq('is_active', true)
            .order('name');

        if (error) {
            console.error('Error fetching active SKUs:', error);
            return [];
        }

        return data.map(transformSKU);
    },

    // Get SKU by ID
    async getById(id: string): Promise<SKU | null> {
        const { data, error } = await supabase
            .from('skus')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (error || !data) return null;
        return transformSKU(data);
    },

    // Create SKU
    async create(sku: Omit<SKU, 'id'>): Promise<SKU> {
        const { data, error } = await supabase
            .from('skus')
            .insert({
                name: sku.name,
                image_url: sku.imageUrl,
                points_per_unit: sku.pointsPerUnit,
                is_active: sku.isActive,
            })
            .select()
            .single();

        if (error) throw error;
        return transformSKU(data);
    },

    // Update SKU
    async update(id: string, updates: Partial<SKU>): Promise<SKU> {
        const { data, error } = await supabase
            .from('skus')
            .update({
                name: updates.name,
                image_url: updates.imageUrl,
                points_per_unit: updates.pointsPerUnit,
                is_active: updates.isActive,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return transformSKU(data);
    },

    // Get all focus products
    async getFocusProducts(): Promise<FocusProduct[]> {
        const { data, error } = await supabase
            .from('focus_products')
            .select('*')
            .eq('is_active', true)
            .order('name');

        if (error) throw error;
        return data.map(transformFocusProduct);
    },

    // Create focus product
    async createFocusProduct(product: Omit<FocusProduct, 'id'>): Promise<FocusProduct> {
        const { data, error } = await supabase
            .from('focus_products')
            .insert({
                sku_id: product.skuId,
                name: product.name,
                reward_per_unit: product.rewardPerUnit,
                color: product.color,
            })
            .select()
            .single();

        if (error) throw error;
        return transformFocusProduct(data);
    },
};
