
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

async function listAslamDS() {
    const { data: aslam } = await supabase.from('users').select('id').eq('name', '395 ASLAM').single();
    if (aslam) {
        const { data: dss } = await supabase.from('users').select('name, total_mapped_outlets').eq('team_leader_id', aslam.id);
        console.log(`Salesmen for 395 ASLAM (${dss.length}):`);
        dss.forEach(d => console.log(`- ${d.name} (${d.total_mapped_outlets} outlets)`));
    } else {
        console.log('395 ASLAM not found!');
    }
}
listAslamDS();
