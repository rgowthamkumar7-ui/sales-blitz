
const { createClient } = require('@supabase/supabase-js');
const XLSX = require('xlsx');
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

async function debugAslamSync() {
    console.log('--- DEBUG SYNC FOR ASLAM ---');

    // 1. Get ASLAM ID
    const { data: aslam } = await supabase.from('users').select('id, name').eq('name', '395 ASLAM').single();
    console.log(`ASLAM ID: ${aslam.id}`);

    // 2. Read Excel for his salesmen
    const filePath = path.resolve(process.cwd(), 'supabase/Excel/DS Map.xlsx');
    const workbook = XLSX.readFile(filePath);
    const rawData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

    const omRow = rawData.find(r => r['SalesMan'] === 'OM PRAKASH 1');
    console.log(`Excel says OM belongs to: "${omRow['TeamLead']}"`);

    // 3. Attempt update manually
    const { data: omDB } = await supabase.from('users').select('*').eq('name', 'OM PRAKASH 1').maybeSingle();
    console.log(`DB says OM belongs to (ID): ${omDB.team_leader_id}`);

    if (omDB.team_leader_id !== aslam.id) {
        console.log(`Updating OM PRAKASH 1 to ASLAM (${aslam.id})...`);
        const { error } = await supabase.from('users').update({ team_leader_id: aslam.id }).eq('id', omDB.id);
        if (error) {
            console.error('Update FAILED:', error.message);
        } else {
            console.log('Update reported SUCCESS.');
        }
    } else {
        console.log('DB ALREADY CORRECT for OM PRAKASH 1.');
    }

    // 4. Verify immediately
    const { data: verify } = await supabase.from('users').select('*').eq('id', omDB.id).single();
    console.log(`VERIFICATION AFTER UPDATE: TL_ID in DB is now ${verify.team_leader_id}`);
}

debugAslamSync();
