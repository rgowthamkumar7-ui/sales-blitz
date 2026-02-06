const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function deepDebug() {
    console.log('=== DEEP DEBUG: 96 NAZIR(OPL) 1 → SHYAMLAL ===\n');

    // 1. Find all users named NAZIR
    console.log('1. Searching for all NAZIR users...');
    const { data: nazirUsers, error: nazirError } = await supabase
        .from('users')
        .select('*')
        .ilike('name', '%NAZIR%');

    if (nazirError) {
        console.error('Error:', nazirError);
        return;
    }

    console.log(`Found ${nazirUsers.length} users with NAZIR in name:\n`);
    nazirUsers.forEach(u => {
        console.log(`  - ${u.name} (${u.role})`);
        console.log(`    ID: ${u.id}`);
        console.log(`    Phone: ${u.phone || 'NULL'}`);
        console.log();
    });

    // 2. Find the exact TL
    const tl = nazirUsers.find(u => u.name === '96 NAZIR(OPL) 1' && u.role === 'team_leader');

    if (!tl) {
        console.log('❌ TL "96 NAZIR(OPL) 1" not found!');
        console.log('Available TL names:');
        nazirUsers.filter(u => u.role === 'team_leader').forEach(u => {
            console.log(`  - "${u.name}"`);
        });
        return;
    }

    console.log(`✅ Found TL: ${tl.name}`);
    console.log(`   ID: ${tl.id}\n`);

    // 3. Find all SHYAMLAL users
    console.log('2. Searching for all SHYAMLAL users...');
    const { data: shyamlalUsers, error: shyamlalError } = await supabase
        .from('users')
        .select('*')
        .ilike('name', '%SHYAMLAL%');

    if (shyamlalError) {
        console.error('Error:', shyamlalError);
        return;
    }

    console.log(`Found ${shyamlalUsers.length} users with SHYAMLAL in name:\n`);
    shyamlalUsers.forEach(u => {
        console.log(`  - ${u.name} (${u.role})`);
        console.log(`    ID: ${u.id}`);
        console.log(`    Team Leader ID: ${u.team_leader_id}`);
        console.log(`    Matches TL: ${u.team_leader_id === tl.id ? '✅ YES' : '❌ NO'}`);
        console.log();
    });

    // 4. Get ALL salesmen for this TL
    console.log('3. Getting ALL salesmen for this TL...');
    const { data: allSalesmen, error: allError } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'salesman')
        .eq('team_leader_id', tl.id);

    if (allError) {
        console.error('Error:', allError);
        return;
    }

    console.log(`Query returned ${allSalesmen.length} salesmen:\n`);
    allSalesmen.forEach((s, i) => {
        const isShyamlal = s.name.toUpperCase().includes('SHYAMLAL');
        console.log(`${i + 1}. ${s.name} ${isShyamlal ? '⭐ THIS IS SHYAMLAL' : ''}`);
        console.log(`   ID: ${s.id}`);
        console.log(`   Team Leader ID: ${s.team_leader_id}`);
    });

    // 5. Check if SHYAMLAL is in the list
    const shyamlalInList = allSalesmen.find(s => s.name === 'SHYAMLAL');

    console.log('\n=== RESULT ===');
    if (shyamlalInList) {
        console.log('✅ SHYAMLAL IS IN THE SALESMEN LIST');
        console.log('   The database query is working correctly.');
        console.log('   The issue must be in the frontend.');
    } else {
        console.log('❌ SHYAMLAL IS NOT IN THE SALESMEN LIST');
        console.log('   Checking why...\n');

        const shyamlal = shyamlalUsers.find(u => u.role === 'salesman');
        if (shyamlal) {
            console.log('   SHYAMLAL exists in database:');
            console.log(`   - Name: "${shyamlal.name}"`);
            console.log(`   - Role: ${shyamlal.role}`);
            console.log(`   - Team Leader ID: ${shyamlal.team_leader_id}`);
            console.log(`   - Expected TL ID: ${tl.id}`);
            console.log(`   - IDs Match: ${shyamlal.team_leader_id === tl.id ? 'YES' : 'NO'}`);

            if (shyamlal.team_leader_id !== tl.id) {
                console.log('\n   ❌ PROBLEM: SHYAMLAL has wrong team_leader_id!');
                console.log('   Need to update it.');
            }
        }
    }

    // 6. Check for duplicate or similar names
    console.log('\n4. Checking for name variations...');
    const { data: allUsers, error: allUsersError } = await supabase
        .from('users')
        .select('name, role, team_leader_id')
        .eq('role', 'salesman')
        .or(`name.ilike.%shyam%,name.ilike.%lal%`);

    if (!allUsersError && allUsers.length > 0) {
        console.log(`Found ${allUsers.length} salesmen with similar names:`);
        allUsers.forEach(u => {
            console.log(`  - ${u.name} (TL: ${u.team_leader_id})`);
        });
    }
}

deepDebug().catch(console.error);
