
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

async function check() {
    console.log('Checking Salesmen Outlet Counts...');
    const { data, error } = await supabase
        .from('users')
        .select('name, total_mapped_outlets')
        .eq('role', 'salesman')
    if (error) {
        console.error(error);
        return;
    }

    console.log('--- Salesmen Stats ---');
    const totalOutlets = data.reduce((sum, s) => sum + (s.total_mapped_outlets || 0), 0);
    console.log(`Total Salesmen Found: ${data.length}`);
    console.log(`Total Outlets Sum: ${totalOutlets}`);

    console.log('--- Top 5 Salesmen ---');
    data.slice(0, 5).forEach(s => {
        console.log(`${s.name}: ${s.total_mapped_outlets}`);
    });
}

check();
