
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
    console.log('Checking TL count...');

    // 1. Check exact count of users with role 'team_leader'
    const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'team_leader');

    if (error) {
        console.error('Error fetching TLs:', error);
        return;
    }

    console.log(`Total Team Leaders in 'users' table: ${count}`);

    // dump all TL names
    const { data: tls } = await supabase
        .from('users')
        .select('name')
        .eq('role', 'team_leader');

    // console.log('TL Names:', tls?.map(t => t.name).join(', '));

    // 2. Check unique TLs assigned to salesmen
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
