
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

async function diagnoseTL() {
    const tlName = "395 ASLAM";
    console.log(`Diagnosing TL: "${tlName}"`);

    // 1. Find the TL
    const { data: tl, error: tlError } = await supabase
        .from('users')
        .select('*')
        .ilike('name', `%${tlName}%`) // Flexible search
        .eq('role', 'team_leader');

    if (tlError) {
        console.error('Error finding TL:', tlError);
        return;
    }

    if (!tl || tl.length === 0) {
        console.error(`TL "${tlName}" not found in DB!`);
        return;
    }

    console.log(`Found ${tl.length} matching TL(s).`);
    tl.forEach(t => console.log(`- ID: ${t.id}, Name: "${t.name}", DistributorID: ${t.distributor_id}`));

    const targetTL = tl[0];

    // 2. Find Salesmen linked to this TL
    const { data: salesmen, error: dsError } = await supabase
        .from('users')
        .select('name, total_mapped_outlets, distributor_id')
        .eq('team_leader_id', targetTL.id)
        .eq('role', 'salesman');

    if (dsError) {
        console.error('Error finding salesmen:', dsError);
        return;
    }

    console.log(`\nLinked Salesmen in DB: ${salesmen.length}`);
    salesmen.forEach(s => console.log(`- DS: "${s.name}", Outlets: ${s.total_mapped_outlets}, DistID: ${s.distributor_id}`));

    if (salesmen.length === 0) {
        console.log('\n!!! NO SALESMEN LINKED TO THIS TL !!!');
    }
}

diagnoseTL();
