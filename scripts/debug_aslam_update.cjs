
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

async function debugUpdate() {
    console.log('DEBUGGING UPDATE FOR ASLAM...');

    // Load Mappings just to be safe (simplified)
    const { data: existingDistributors } = await supabase.from('distributors').select('id, wd_code');
    const dbWdMap = new Map((existingDistributors || []).map(d => [d.wd_code, d.id]));

    const { data: existingTLs } = await supabase.from('users').select('id, name').eq('role', 'team_leader');
    const dbTlMap = new Map((existingTLs || []).map(u => [u.name, u.id]));

    // Read Excel
    const filePath = path.resolve(process.cwd(), 'supabase/Excel/DS Map.xlsx');
    const workbook = XLSX.readFile(filePath);
    const rawData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

    // Filter for ASLAM
    const rows = rawData
        .filter(r => r['TeamLead'] && r['TeamLead'].includes('ASLAM'))
        .map(r => ({
            dsName: r['SalesMan'],
            tlName: r['TeamLead'],
            wdCode: r['WD Code']
        }));

    console.log(`Found ${rows.length} rows for ASLAM.`);

    for (const row of rows) {
        console.log(`Processing: DS=${row.dsName}, TL=${row.tlName}, WD=${row.wdCode}`);

        const wdId = dbWdMap.get(row.wdCode);
        const tlId = dbTlMap.get(row.tlName);

        if (!wdId) console.error(`ERROR: WD ${row.wdCode} NOT FOUND IN DB!`);
        if (!tlId) console.error(`ERROR: TL ${row.tlName} NOT FOUND IN DB!`);

        if (wdId && tlId) {
            // Check Salesman
            const { data: existingDS } = await supabase.from('users').select('*').eq('name', row.dsName).maybeSingle();
            if (existingDS) {
                console.log(`DS ${row.dsName} exists. TL_ID in DB: ${existingDS.team_leader_id}. Expected: ${tlId}`);
                if (existingDS.team_leader_id !== tlId) {
                    console.log('MISMATCH! Attempting repair...');
                    const { error } = await supabase.from('users').update({ team_leader_id: tlId, distributor_id: wdId }).eq('id', existingDS.id);
                    if (error) console.error('Repair failed:', error);
                    else console.log('Repaired.');
                }
            } else {
                console.log(`DS ${row.dsName} MISSING in DB! Attempting insert...`);
                // Insert logic...
            }
        }
    }
}

debugUpdate();
