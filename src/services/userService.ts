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
            .maybeSingle();

        if (error || !data) return null;

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

    // Login with name, role and password
    async login(name: string, role: 'manager' | 'team_leader', password?: string): Promise<User | null> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .ilike('name', name.trim())
            .eq('role', role)
            .maybeSingle();

        if (error || !data) return null;

        // Verify password if provided (for new system)
        // If password is in DB, check it.
        // We compare case-insensitively and trim whitespace to be forgiving
        // Verify password
        // Only enforce for managers as per request "There should not be a password check for Team leader"
        if (role === 'manager') {
            if (data.password) {
                if (!password) return null; // Password required for manager

                const dbPass = data.password.toString().trim().toLowerCase();
                const inputPass = password.toString().trim().toLowerCase();

                if (dbPass !== inputPass) return null;
            }
        }

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

    // Set password for a user
    async setPassword(id: string, password: string): Promise<void> {
        const { error } = await supabase
            .from('users')
            .update({
                password: password,
                updated_at: new Date().toISOString()
            } as any) // Type assertion due to manual column add
            .eq('id', id);

        if (error) throw error;
    },

    // Reset password to default (first 3 chars of name)
    async resetPassword(id: string, name: string): Promise<void> {
        const defaultPassword = name.substring(0, 3).toLowerCase();
        await this.setPassword(id, defaultPassword);
    },

    // Find user by name and role (legacy/internal use)
    async findByNameAndRole(name: string, role: 'manager' | 'team_leader'): Promise<User | null> {
        return this.login(name, role); // Reuse login without password?
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
