
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load env vars manually
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars: Record<string, string> = {};

envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim().replace(/"/g, '');
        envVars[key] = value;
    }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('Checking DS (Salesman) count...');

    // 1. Check exact count of users with role 'salesman'
    const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'salesman');

    if (error) {
        console.error('Error fetching DSs:', error);
        return;
    }

    console.log(`Total Salesmen (DS) in 'users' table: ${count}`);

    // dump breakdown by distributor if possible
    // we can't easily group by in js client without fetching all, but for just counting it's fine.

    const { data: allSalesmen } = await supabase
        .from('users')
        .select('id, name, distributor_id')
        .eq('role', 'salesman');

    if (!allSalesmen) return;

    // Count by Distributor ID
    const countsByDistributor: Record<string, number> = {};
    let nullDistributorCount = 0;

    allSalesmen.forEach(ds => {
        if (ds.distributor_id) {
            countsByDistributor[ds.distributor_id] = (countsByDistributor[ds.distributor_id] || 0) + 1;
        } else {
            nullDistributorCount++;
        }
    });

    console.log(`DS count by Distributor ID entries: ${Object.keys(countsByDistributor).length} distributors have salesmen.`);
    console.log(`Salesmen without Distributor ID: ${nullDistributorCount}`);

    if (nullDistributorCount > 0) {
        console.log('Warning: Some salesmen are not mapped to any distributor.');
    }
}

check();
