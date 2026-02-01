
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) envVars[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/"/g, '');
});

const supabase = createClient(envVars.VITE_SUPABASE_URL, envVars.VITE_SUPABASE_ANON_KEY);

async function audit() {
    console.log('--- AUDIT REPORT FOR "ASLAM" ---');

    // 1. Find all potential TLs
    const { data: tls } = await supabase.from('users').select('*').ilike('name', '%ASLAM%');
    console.log(`Found ${tls.length} Users matching "ASLAM":`);

    for (const u of tls) {
        console.log(`User: [${u.id}] Name="${u.name}" Role=${u.role} Phone=${u.phone}`);
        // Count salesmen
        const { count } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('team_leader_id', u.id);
        console.log(`   -> Linked Salesmen Count: ${count}`);
    }

    // 2. Check "OM PRAKASH 1"
    const { data: om } = await supabase.from('users').select('*').eq('name', 'OM PRAKASH 1').maybeSingle();
    if (om) {
        console.log(`\nUser "OM PRAKASH 1":`);
        console.log(`   ID: ${om.id}`);
        console.log(`   TL_ID: ${om.team_leader_id}`);
        console.log(`   Dist_ID: ${om.distributor_id}`);

        // Find who this TL ID belongs to
        if (om.team_leader_id) {
            const { data: linkedTL } = await supabase.from('users').select('name').eq('id', om.team_leader_id).single();
            console.log(`   Points to TL Name: "${linkedTL ? linkedTL.name : 'UNKNOWN'}"`);
        }
    } else {
        console.log('\nUser "OM PRAKASH 1" NOT FOUND.');
    }
}

audit();
