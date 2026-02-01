
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

async function checkEmptyTLs() {
    const { data: tls } = await supabase.from('users').select('id, name').eq('role', 'team_leader');
    console.log(`Checking ${tls.length} TLs...`);

    for (const tl of tls) {
        const { count } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('team_leader_id', tl.id);
        if (count === 0) {
            console.log(`Empty TL: "${tl.name}"`);
        }
    }
}
checkEmptyTLs();
