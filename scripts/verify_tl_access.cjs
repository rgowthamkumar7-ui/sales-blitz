const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyTLAccess() {
    console.log('=== Verifying TL Access to Salesmen ===\n');

    // Get the specific TL
    const { data: tl, error: tlError } = await supabase
        .from('users')
        .select('*')
        .eq('name', '96 NAZIR(OPL) 1')
        .eq('role', 'team_leader')
        .single();

    if (tlError || !tl) {
        console.error('TL not found:', tlError);
        return;
    }

    console.log(`✅ Found TL: ${tl.name} (${tl.id})\n`);

    // Get all salesmen for this TL (simulating what the frontend does)
    const { data: salesmen, error: salesmenError } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'salesman')
        .eq('team_leader_id', tl.id);

    if (salesmenError) {
        console.error('Error fetching salesmen:', salesmenError);
        return;
    }

    console.log(`✅ Query returned ${salesmen.length} salesmen for this TL:\n`);

    salesmen.forEach((s, i) => {
        console.log(`${i + 1}. ${s.name}`);
        console.log(`   ID: ${s.id}`);
        console.log(`   Team Leader ID: ${s.team_leader_id}`);
        console.log(`   Distributor ID: ${s.distributor_id || 'NULL'}`);
        console.log();
    });

    // Check specifically for SHYAMLAL
    const shyamlal = salesmen.find(s => s.name === 'SHYAMLAL');

    if (shyamlal) {
        console.log('✅ SHYAMLAL IS IN THE LIST!');
        console.log(`   This means the TL should be able to see and select SHYAMLAL.\n`);
    } else {
        console.log('❌ SHYAMLAL IS NOT IN THE LIST!');
        console.log('   This is unexpected. Checking if SHYAMLAL exists...\n');

        const { data: shyamlalCheck } = await supabase
            .from('users')
            .select('*')
            .eq('name', 'SHYAMLAL')
            .eq('role', 'salesman')
            .single();

        if (shyamlalCheck) {
            console.log(`   SHYAMLAL exists with team_leader_id: ${shyamlalCheck.team_leader_id}`);
            console.log(`   Expected team_leader_id: ${tl.id}`);
            console.log(`   Match: ${shyamlalCheck.team_leader_id === tl.id ? 'YES' : 'NO'}`);
        }
    }

    // Summary
    console.log('\n=== Summary ===');
    console.log(`TL Name: ${tl.name}`);
    console.log(`TL ID: ${tl.id}`);
    console.log(`Total Salesmen: ${salesmen.length}`);
    console.log(`SHYAMLAL in list: ${shyamlal ? 'YES ✅' : 'NO ❌'}`);

    if (salesmen.length > 0) {
        console.log('\n✅ The database query is working correctly.');
        console.log('If the TL still cannot see salesmen in the app:');
        console.log('1. The TL needs to refresh the page or click the refresh button');
        console.log('2. Check browser console for errors');
        console.log('3. Clear browser cache and try again');
    }
}

verifyTLAccess().catch(console.error);
