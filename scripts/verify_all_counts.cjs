
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) envVars[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/"/g, '');
});

const supabase = createClient(envVars.VITE_SUPABASE_URL, envVars.VITE_SUPABASE_ANON_KEY);

async function verify() {
    console.log('--- FINAL COUNT VERIFICATION ---');

    // Distributors
    const { count: wdCount, error: wdError } = await supabase
        .from('distributors')
        .select('*', { count: 'exact', head: true });

    // Team Leaders
    const { count: tlCount, error: tlError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'team_leader');

    // Salesmen
    const { count: dsCount, error: dsError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'salesman');

    // Outlets Sum
    const { data: outletData, error: outError } = await supabase
        .from('users')
        .select('total_mapped_outlets')
        .eq('role', 'salesman');

    if (wdError || tlError || dsError || outError) {
        console.error('Error fetching counts');
        return;
    }

    const totalOutlets = outletData.reduce((sum, u) => sum + (u.total_mapped_outlets || 0), 0);

    console.log(`Distributors (WDs): ${wdCount}`);
    console.log(`Team Leaders (TLs): ${tlCount}`);
    console.log(`Salesmen (DSs): ${dsCount}`);
    console.log(`Total Outlets: ${totalOutlets}`);
}

verify();
