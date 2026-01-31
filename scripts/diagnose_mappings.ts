
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

const supabase = createClient(supabaseUrl!, supabaseKey!);

async function diagnose() {
    const { data: users, error } = await supabase.from('users').select('*');
    if (error) { console.error(error); return; }

    const salesmen = users.filter(u => u.role === 'salesman');
    const tls = users.filter(u => u.role === 'team_leader');
    const managers = users.filter(u => u.role === 'manager');

    const salesmenWithoutDistributor = salesmen.filter(s => !s.distributor_id);
    const salesmenWithoutTL = salesmen.filter(s => !s.team_leader_id);

    // Crosstab
    let mismatchCount = 0;
    const tlMap = new Map(tls.map(t => [t.id, t]));
    salesmen.forEach(s => {
        if (s.team_leader_id && s.distributor_id) {
            const tl = tlMap.get(s.team_leader_id);
            if (tl && tl.distributor_id && tl.distributor_id !== s.distributor_id) {
                mismatchCount++;
            }
        }
    });

    const tlsWithoutDistributor = tls.filter(t => !t.distributor_id);
    const activeTLIds = new Set(salesmen.map(s => s.team_leader_id).filter(Boolean));

    const output = {
        totalUsers: users.length,
        totalSalesmen: salesmen.length,
        totalTLs: tls.length,
        totalManagers: managers.length,
        salesmenNoDist: salesmenWithoutDistributor.length,
        salesmenNoTL: salesmenWithoutTL.length,
        mismatchCount,
        tlsNoDist: tlsWithoutDistributor.length,
        activeTLs: activeTLIds.size
    };

    fs.writeFileSync('diagnosis.json', JSON.stringify(output, null, 2));
    console.log('Diagnosis written to diagnosis.json');
}

diagnose();
