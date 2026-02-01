
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

async function listTLs() {
    const { data: dbTLs } = await supabase.from('users').select('id, name').eq('role', 'team_leader');
    console.log(`Found ${dbTLs.length} TLs in DB:`);
    dbTLs.forEach(tl => console.log(`- ID: ${tl.id}, Name: "${tl.name}"`));
}

listTLs();
