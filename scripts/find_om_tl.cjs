
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

async function findOMTL() {
    const { data: om } = await supabase.from('users').select('*').eq('name', 'OM PRAKASH 1').maybeSingle();
    if (om) {
        console.log(`OM PRAKASH 1 ID: ${om.id}`);
        console.log(`OM PRAKASH 1 team_leader_id: ${om.team_leader_id}`);

        if (om.team_leader_id) {
            const { data: tl } = await supabase.from('users').select('*').eq('id', om.team_leader_id).single();
            if (tl) {
                console.log(`Linked TL: "${tl.name}" (ID: ${tl.id}, Role: ${tl.role})`);
            } else {
                console.log('Linked TL NOT FOUND in DB!');
            }
        } else {
            console.log('OM PRAKASH 1 has NO team_leader_id!');
        }
    } else {
        console.log('OM PRAKASH 1 NOT FOUND!');
    }
}
findOMTL();
