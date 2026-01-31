// Database types for Supabase
// These types match the database schema

export type UserRole = 'salesman' | 'team_leader' | 'manager';
export type ManagerLevel = 'AM2' | 'AM1' | 'AE';

export interface Database {
    public: {
        Tables: {
            distributors: {
                Row: {
                    id: string;
                    wd_code: string;
                    name: string;
                    section: string | null;
                    ae_id: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    wd_code: string;
                    name: string;
                    section?: string | null;
                    ae_id?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    wd_code?: string;
                    name?: string;
                    section?: string | null;
                    ae_id?: string | null;
                    updated_at?: string;
                };
            };
            users: {
                Row: {
                    id: string;
                    name: string;
                    phone: string | null;
                    role: UserRole;
                    manager_level: ManagerLevel | null;
                    team_leader_id: string | null;
                    distributor_id: string | null;
                    total_mapped_outlets: number;
                    password: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    phone?: string | null;
                    role: UserRole;
                    manager_level?: ManagerLevel | null;
                    team_leader_id?: string | null;
                    distributor_id?: string | null;
                    total_mapped_outlets?: number;
                    password?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    phone?: string | null;
                    role?: UserRole;
                    manager_level?: ManagerLevel | null;
                    team_leader_id?: string | null;
                    distributor_id?: string | null;
                    total_mapped_outlets?: number;
                    password?: string | null;
                    updated_at?: string;
                };
            };
            manager_distributors: {
                Row: {
                    id: string;
                    manager_id: string;
                    distributor_id: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    manager_id: string;
                    distributor_id: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    manager_id?: string;
                    distributor_id?: string;
                };
            };
            outlets: {
                Row: {
                    id: string;
                    name: string;
                    address: string | null;
                    area: string | null;
                    distributor_id: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    address?: string | null;
                    area?: string | null;
                    distributor_id?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    address?: string | null;
                    area?: string | null;
                    distributor_id?: string | null;
                    updated_at?: string;
                };
            };
            skus: {
                Row: {
                    id: string;
                    name: string;
                    image_url: string | null;
                    points_per_unit: number;
                    is_active: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    image_url?: string | null;
                    points_per_unit?: number;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    image_url?: string | null;
                    points_per_unit?: number;
                    is_active?: boolean;
                    updated_at?: string;
                };
            };
            focus_products: {
                Row: {
                    id: string;
                    sku_id: string;
                    name: string;
                    reward_per_unit: number;
                    color: string | null;
                    is_active: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    sku_id: string;
                    name: string;
                    reward_per_unit?: number;
                    color?: string | null;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    sku_id?: string;
                    name?: string;
                    reward_per_unit?: number;
                    color?: string | null;
                    is_active?: boolean;
                    updated_at?: string;
                };
            };
            stock_issued: {
                Row: {
                    id: string;
                    salesman_id: string;
                    sku_id: string;
                    quantity: number;
                    date: string;
                    issued_by: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    salesman_id: string;
                    sku_id: string;
                    quantity: number;
                    date?: string;
                    issued_by: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    salesman_id?: string;
                    sku_id?: string;
                    quantity?: number;
                    date?: string;
                    issued_by?: string;
                };
            };
            sale_transactions: {
                Row: {
                    id: string;
                    salesman_id: string;
                    outlet_id: string | null;
                    sku_id: string;
                    quantity: number;
                    outlet_count: number;
                    points: number;
                    transaction_date: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    salesman_id: string;
                    outlet_id?: string | null;
                    sku_id: string;
                    quantity: number;
                    outlet_count?: number;
                    points?: number;
                    transaction_date?: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    salesman_id?: string;
                    outlet_id?: string | null;
                    sku_id?: string;
                    quantity?: number;
                    outlet_count?: number;
                    points?: number;
                    transaction_date?: string;
                };
            };
            salesman_targets: {
                Row: {
                    id: string;
                    salesman_id: string;
                    focus_product_id: string;
                    target_quantity: number;
                    month: string;
                    max_reward: number | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    salesman_id: string;
                    focus_product_id: string;
                    target_quantity: number;
                    month: string;
                    max_reward?: number | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    salesman_id?: string;
                    focus_product_id?: string;
                    target_quantity?: number;
                    month?: string;
                    max_reward?: number | null;
                    updated_at?: string;
                };
            };
            ds_targets: {
                Row: {
                    id: string;
                    wd_code: string | null;
                    wd_name: string | null;
                    tl_name: string | null;
                    tl_id: string | null;
                    ds_name: string | null;
                    ds_id: string | null;
                    sku_name: string | null;
                    month: string | null;
                    target_qty: number;
                    uploaded_at: string;
                    uploaded_by: string | null;
                };
                Insert: {
                    id?: string;
                    wd_code?: string | null;
                    wd_name?: string | null;
                    tl_name?: string | null;
                    tl_id?: string | null;
                    ds_name?: string | null;
                    ds_id?: string | null;
                    sku_name?: string | null;
                    month?: string | null;
                    target_qty: number;
                    uploaded_at?: string;
                    uploaded_by?: string | null;
                };
                Update: {
                    id?: string;
                    wd_code?: string | null;
                    wd_name?: string | null;
                    tl_name?: string | null;
                    tl_id?: string | null;
                    ds_name?: string | null;
                    ds_id?: string | null;
                    sku_name?: string | null;
                    month?: string | null;
                    target_qty?: number;
                    uploaded_by?: string | null;
                };
            };
        };
    };
}
