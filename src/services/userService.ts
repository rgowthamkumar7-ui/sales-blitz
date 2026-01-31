import { supabase } from '@/lib/supabase';
import { User } from '@/types';

// Transform database row to app User type
function transformUser(row: any): User {
    return {
        id: row.id,
        name: row.name,
        phone: row.phone,
        role: row.role,
        managerLevel: row.manager_level,
        teamLeaderId: row.team_leader_id,
        distributorId: row.distributor_id,
        distributorIds: row.distributor_ids || [],
        totalMappedOutlets: row.total_mapped_outlets || 0,
    };
}

export const userService = {
    // Get all users
    async getAll(): Promise<User[]> {
        const { data, error } = await supabase
            .from('users')
            .select('*');

        if (error) throw error;

        // For AE managers, get their distributor IDs
        const users = data.map(transformUser);
        const aeManagers = users.filter(u => u.role === 'manager' && u.managerLevel === 'AE');

        // Fetch distributor assignments for AE managers
        for (const ae of aeManagers) {
            const { data: assignments } = await supabase
                .from('manager_distributors')
                .select('distributor_id')
                .eq('manager_id', ae.id);

            if (assignments) {
                ae.distributorIds = assignments.map(a => a.distributor_id);
            }
        }

        return users;
    },

    // Get user by ID
    async getById(id: string): Promise<User | null> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;

        const user = transformUser(data);

        // For AE managers, get their distributor IDs
        if (user.role === 'manager' && user.managerLevel === 'AE') {
            const { data: assignments } = await supabase
                .from('manager_distributors')
                .select('distributor_id')
                .eq('manager_id', user.id);

            if (assignments) {
                user.distributorIds = assignments.map(a => a.distributor_id);
            }
        }

        return user;
    },

    // Get user by name and role (for login)
    async findByNameAndRole(name: string, role: 'manager' | 'team_leader'): Promise<User | null> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .ilike('name', name.trim())
            .eq('role', role)
            .single();

        if (error) return null;

        const user = transformUser(data);

        // For AE managers, get their distributor IDs
        if (user.role === 'manager' && user.managerLevel === 'AE') {
            const { data: assignments } = await supabase
                .from('manager_distributors')
                .select('distributor_id')
                .eq('manager_id', user.id);

            if (assignments) {
                user.distributorIds = assignments.map(a => a.distributor_id);
            }
        }

        return user;
    },

    // Get managers
    async getManagers(): Promise<User[]> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('role', 'manager');

        if (error) throw error;

        const users = data.map(transformUser);

        // Fetch distributor assignments for AE managers
        for (const user of users) {
            if (user.managerLevel === 'AE') {
                const { data: assignments } = await supabase
                    .from('manager_distributors')
                    .select('distributor_id')
                    .eq('manager_id', user.id);

                if (assignments) {
                    user.distributorIds = assignments.map(a => a.distributor_id);
                }
            }
        }

        return users;
    },

    // Get team leaders
    async getTeamLeaders(): Promise<User[]> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('role', 'team_leader');

        if (error) throw error;
        return data.map(transformUser);
    },

    // Get salesmen for a team leader
    async getSalesmenForTeamLeader(teamLeaderId: string): Promise<User[]> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('role', 'salesman')
            .eq('team_leader_id', teamLeaderId);

        if (error) throw error;
        return data.map(transformUser);
    },

    // Get all salesmen
    async getSalesmen(): Promise<User[]> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('role', 'salesman');

        if (error) throw error;
        return data.map(transformUser);
    },

    // Get salesmen by distributor
    async getSalesmenByDistributor(distributorId: string): Promise<User[]> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('role', 'salesman')
            .eq('distributor_id', distributorId);

        if (error) throw error;
        return data.map(transformUser);
    },

    // Update user
    async update(id: string, updates: Partial<User>): Promise<User | null> {
        const { data, error } = await supabase
            .from('users')
            .update({
                name: updates.name,
                phone: updates.phone,
                total_mapped_outlets: updates.totalMappedOutlets,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return transformUser(data);
    },

    // Update mapped outlets for a salesman
    async updateMappedOutlets(salesmanId: string, totalOutlets: number): Promise<void> {
        const { error } = await supabase
            .from('users')
            .update({
                total_mapped_outlets: totalOutlets,
                updated_at: new Date().toISOString(),
            })
            .eq('id', salesmanId);

        if (error) throw error;
    },
};
