
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

async function repairAll() {
    console.log('--- REPAIRING ALL MAPPINGS (ROBUST) ---');

    console.log('Loading DB Maps...');
    // Load Distributors
    const { data: existingDistributors } = await supabase.from('distributors').select('id, wd_code');
    const dbWdMap = new Map((existingDistributors || []).map(d => [d.wd_code.trim(), d.id]));

    // Load Team Leaders
    const { data: existingTLs } = await supabase.from('users').select('id, name').eq('role', 'team_leader');
    const dbTlMap = new Map((existingTLs || []).map(u => [u.name.trim(), u.id]));

    // Read Excel
    const filePath = path.resolve(process.cwd(), 'supabase/Excel/DS Map.xlsx');
    const workbook = XLSX.readFile(filePath);
    const rawData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

    // Group by salesman
    const salesmenRows = rawData.filter(r => r['SalesMan']);
    console.log(`Processing ${salesmenRows.length} Excel rows...`);

    let repairedCount = 0;

    for (const row of salesmenRows) {
        const dsName = row['SalesMan'] ? row['SalesMan'].toString().trim() : null;
        const tlName = row['TeamLead'] ? row['TeamLead'].toString().trim() : null;
        const wdCode = row['WD Code'] ? row['WD Code'].toString().trim() : null;

        if (!dsName || !tlName || !wdCode) continue;

        const wdId = dbWdMap.get(wdCode);
        const tlId = dbTlMap.get(tlName);

        if (!wdId || !tlId) {
            console.warn(`Missing Parent for ${dsName}: WD_Found=${!!wdId} TL_Found=${!!tlId} (TL: "${tlName}", WD: "${wdCode}")`);
            continue;
        }

        // Check Salesman in DB
        const { data: existingDS } = await supabase
            .from('users')
            .select('id, team_leader_id, distributor_id')
            .eq('name', dsName)
            .eq('role', 'salesman')
            .maybeSingle();

        if (existingDS) {
            if (existingDS.team_leader_id !== tlId || existingDS.distributor_id !== wdId) {
                console.log(`Mismatch for ${dsName}. Repairing...`);
                //console.log(`Old TL: ${existingDS.team_leader_id}, New TL: ${tlId}`);

                const { error } = await supabase.from('users').update({
                    team_leader_id: tlId,
                    distributor_id: wdId
                }).eq('id', existingDS.id);

                if (error) console.error('Update failed:', error);
                else repairedCount++;
            }
        } else {
            console.warn(`Salesman ${dsName} not found in DB!`);
        }
    }
    console.log(`Repair complete. Repaired ${repairedCount} salesmen.`);
}

repairAll();
