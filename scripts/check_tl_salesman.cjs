const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTLSalesman() {
    console.log('=== Checking TL and Salesman Relationship ===\n');

    // Find the TL
    const { data: tls, error: tlError } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'team_leader')
        .ilike('name', '%NAZIR%');

    if (tlError) {
        console.error('Error fetching TL:', tlError);
        return;
    }

    console.log(`Found ${tls.length} TL(s) matching NAZIR:`);
    tls.forEach(tl => {
        console.log(`  - ${tl.name} (ID: ${tl.id})`);
    });
    console.log();

    // Find the salesman
    const { data: salesmen, error: dsError } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'salesman')
        .ilike('name', '%SHYAMLAL%');

    if (dsError) {
        console.error('Error fetching salesman:', dsError);
        return;
    }

    console.log(`Found ${salesmen.length} salesman matching SHYAMLAL:`);
    salesmen.forEach(ds => {
        console.log(`  - ${ds.name} (ID: ${ds.id})`);
        console.log(`    Team Leader ID: ${ds.team_leader_id}`);
        console.log(`    Distributor ID: ${ds.distributor_id}`);
    });
    console.log();

    // Check if they're linked
    if (tls.length > 0 && salesmen.length > 0) {
        const tl = tls[0];
        const ds = salesmen[0];

        console.log('=== Relationship Check ===');
        console.log(`TL: ${tl.name} (${tl.id})`);
        console.log(`DS: ${ds.name} (${ds.id})`);
        console.log(`DS's team_leader_id: ${ds.team_leader_id}`);
        console.log(`Match: ${ds.team_leader_id === tl.id ? '✅ YES' : '❌ NO'}`);
        console.log();

        // Get all salesmen for this TL
        const { data: allSalesmen, error: allError } = await supabase
            .from('users')
            .select('*')
            .eq('role', 'salesman')
            .eq('team_leader_id', tl.id);

        if (allError) {
            console.error('Error fetching all salesmen:', allError);
            return;
        }

        console.log(`\n=== All Salesmen for ${tl.name} ===`);
        console.log(`Total: ${allSalesmen.length}`);
        allSalesmen.forEach((s, i) => {
            console.log(`${i + 1}. ${s.name} (ID: ${s.id})`);
        });
    }

    // Also check for any salesmen without team_leader_id
    const { data: orphans, error: orphanError } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'salesman')
        .is('team_leader_id', null);

    if (orphanError) {
        console.error('Error fetching orphan salesmen:', orphanError);
        return;
    }

    if (orphans.length > 0) {
        console.log(`\n⚠️  Found ${orphans.length} salesmen without team_leader_id:`);
        orphans.forEach(s => {
            console.log(`  - ${s.name} (ID: ${s.id})`);
        });
    } else {
        console.log('\n✅ All salesmen have team_leader_id assigned');
    }
}

checkTLSalesman().catch(console.error);
