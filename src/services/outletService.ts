import { supabase } from '@/lib/supabase';
import { Outlet } from '@/types';

// Transform database row to app Outlet type
function transformOutlet(row: any): Outlet {
    return {
        id: row.id,
        name: row.name,
        address: row.address || '',
        area: row.area || '',
    };
}

export const outletService = {
    // Get all outlets
    async getAll(): Promise<Outlet[]> {
        const { data, error } = await supabase
            .from('outlets')
            .select('*')
            .order('name');

        if (error) throw error;
        return data.map(transformOutlet);
    },

    // Get outlet by ID
    async getById(id: string): Promise<Outlet | null> {
        const { data, error } = await supabase
            .from('outlets')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (error || !data) return null;
        return transformOutlet(data);
    },

    // Get outlets by distributor
    async getByDistributor(distributorId: string): Promise<Outlet[]> {
        const { data, error } = await supabase
            .from('outlets')
            .select('*')
            .eq('distributor_id', distributorId)
            .order('name');

        if (error) throw error;
        return data.map(transformOutlet);
    },

    // Search outlets by name or area
    async search(query: string): Promise<Outlet[]> {
        const { data, error } = await supabase
            .from('outlets')
            .select('*')
            .or(`name.ilike.%${query}%,area.ilike.%${query}%`)
            .limit(20);

        if (error) throw error;
        return data.map(transformOutlet);
    },

    // Create outlet
    async create(outlet: Omit<Outlet, 'id'> & { distributorId?: string }): Promise<Outlet> {
        const { data, error } = await supabase
            .from('outlets')
            .insert({
                name: outlet.name,
                address: outlet.address,
                area: outlet.area,
                distributor_id: outlet.distributorId,
            })
            .select()
            .single();

        if (error) throw error;
        return transformOutlet(data);
    },

    // Update outlet
    async update(id: string, updates: Partial<Outlet>): Promise<Outlet> {
        const { data, error } = await supabase
            .from('outlets')
            .update({
                name: updates.name,
                address: updates.address,
                area: updates.area,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return transformOutlet(data);
    },
};
