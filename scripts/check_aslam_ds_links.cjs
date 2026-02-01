
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

async function checkAslamDS() {
    const names = ['AJAY GUPTA', 'ARUN JAISWAL', 'DILIP AGARWAL', 'JAYPRAKASH', 'KATYA (OPL)', 'OM PRAKASH 1'];
    const { data: dbData } = await supabase.from('users').select('name, team_leader:team_leader_id(name)').in('name', names);

    console.log('Current DB Mappings for Aslam\'s Salesmen:');
    dbData.forEach(d => {
        console.log(`- ${d.name} -> TL: ${d.team_leader ? d.team_leader.name : 'NONE'}`);
    });
}
checkAslamDS();
