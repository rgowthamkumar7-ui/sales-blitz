import { supabase } from '@/lib/supabase';
import { Distributor } from '@/types';

// Transform database row to app Distributor type
function transformDistributor(row: any): Distributor {
    return {
        id: row.id,
        wdCode: row.wd_code,
        name: row.name,
        section: row.section,
        aeId: row.ae_id,
    };
}

export const distributorService = {
    // Get all distributors
    async getAll(): Promise<Distributor[]> {
        const { data, error } = await supabase
            .from('distributors')
            .select('*')
            .order('name');

        if (error) throw error;
        return data.map(transformDistributor);
    },

    // Get distributor by ID
    async getById(id: string): Promise<Distributor | null> {
        const { data, error } = await supabase
            .from('distributors')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;
        return transformDistributor(data);
    },

    // Get distributors for a manager based on their level
    async getForManager(managerId: string, managerLevel: string): Promise<Distributor[]> {
        // AM1 and AM2 see all distributors
        if (managerLevel === 'AM1' || managerLevel === 'AM2') {
            return this.getAll();
        }

        // AE sees only assigned distributors
        const { data, error } = await supabase
            .from('manager_distributors')
            .select(`
        distributor:distributors(*)
      `)
            .eq('manager_id', managerId);

        if (error) throw error;

        return data
            .filter((d: any) => d.distributor)
            .map((d: any) => transformDistributor(d.distributor));
    },

    // Get distributor by WD code
    async getByWdCode(wdCode: string): Promise<Distributor | null> {
        const { data, error } = await supabase
            .from('distributors')
            .select('*')
            .eq('wd_code', wdCode)
            .single();

        if (error) return null;
        return transformDistributor(data);
    },

    // Create distributor
    async create(distributor: Omit<Distributor, 'id'>): Promise<Distributor> {
        const { data, error } = await supabase
            .from('distributors')
            .insert({
                wd_code: distributor.wdCode,
                name: distributor.name,
                section: distributor.section,
                ae_id: distributor.aeId,
            })
            .select()
            .single();

        if (error) throw error;
        return transformDistributor(data);
    },

    // Update distributor
    async update(id: string, updates: Partial<Distributor>): Promise<Distributor> {
        const { data, error } = await supabase
            .from('distributors')
            .update({
                wd_code: updates.wdCode,
                name: updates.name,
                section: updates.section,
                ae_id: updates.aeId,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return transformDistributor(data);
    },
};
