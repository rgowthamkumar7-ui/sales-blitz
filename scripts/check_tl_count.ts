
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('Checking TL count...');

    const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'team_leader');

    if (error) {
        console.error('Error fetching TLs:', error);
        return;
    }

    console.log(`Total Team Leaders in DB: ${count}`);

    // Let's also check distinct team_leader_id from users table who are salesmen
    const { data: salesmen, error: sErr } = await supabase
        .from('users')
        .select('team_leader_id')
        .eq('role', 'salesman');

    if (sErr) console.error(sErr);
    else {
        const uniqueTLs = new Set(salesmen.map(s => s.team_leader_id).filter(Boolean));
        console.log(`Unique TL IDs assigned to Salesmen: ${uniqueTLs.size}`);
    }
}

check();
