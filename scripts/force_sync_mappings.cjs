
const { createClient } = require('@supabase/supabase-js');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Load env
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) envVars[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/"/g, '');
});

const supabase = createClient(envVars.VITE_SUPABASE_URL, envVars.VITE_SUPABASE_ANON_KEY);

async function forceSync() {
    console.log('--- STARTING FORCE SYNC OF ALL MAPPINGS ---');

    // 1. Load WDs and TLs from DB
    console.log('Loading Distributors and Team Leaders from DB...');
    const { data: dbDistributors } = await supabase.from('distributors').select('id, wd_code');
    const { data: dbTLs } = await supabase.from('users').select('id, name').eq('role', 'team_leader');

    const wdMap = new Map((dbDistributors || []).map(d => [d.wd_code.trim(), d.id]));
    const tlMap = new Map((dbTLs || []).map(u => [u.name.trim(), u.id]));

    console.log(`Loaded ${wdMap.size} WDs and ${tlMap.size} TLs from DB.`);

    // 2. Read Excel
    const filePath = path.resolve(process.cwd(), 'supabase/Excel/DS Map.xlsx');
    console.log(`Reading Excel: ${filePath}`);
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = XLSX.utils.sheet_to_json(sheet);

    // Filter for salesmen rows
    const rows = rawData
        .filter(r => r['SalesMan'])
        .map(r => ({
            dsName: r['SalesMan'].toString().trim(),
            tlName: r['TeamLead'] ? r['TeamLead'].toString().trim() : null,
            wdCode: r['WD Code'] ? r['WD Code'].toString().trim() : null
        }));

    console.log(`Found ${rows.length} salesman entries in Excel.`);

    // 3. Update mappings
    let updatedCount = 0;
    let failedCount = 0;
    let noChangeCount = 0;

    for (const row of rows) {
        const { dsName, tlName, wdCode } = row;

        if (!tlName || !wdCode) {
            console.warn(`[SKIP] Missing TL or WD for DS: "${dsName}"`);
            failedCount++;
            continue;
        }

        const targetWdId = wdMap.get(wdCode);
        const targetTlId = tlMap.get(tlName);

        if (!targetWdId || !targetTlId) {
            console.error(`[ERROR] DB Missing reference for DS: "${dsName}". WD Found: ${!!targetWdId} (${wdCode}), TL Found: ${!!targetTlId} (${tlName})`);
            failedCount++;
            continue;
        }

        // Find DS in DB
        const { data: existingDS } = await supabase
            .from('users')
            .select('id, team_leader_id, distributor_id')
            .eq('name', dsName)
            .eq('role', 'salesman')
            .maybeSingle();

        if (!existingDS) {
            console.warn(`[SKIP] DS not found in DB: "${dsName}"`);
            failedCount++;
            continue;
        }

        if (existingDS.team_leader_id !== targetTlId || existingDS.distributor_id !== targetWdId) {
            console.log(`[UPDATE] Correcting mapping for DS: "${dsName}" -> TL: "${tlName}", WD: "${wdCode}"`);
            const { error: updateError } = await supabase
                .from('users')
                .update({
                    team_leader_id: targetTlId,
                    distributor_id: targetWdId
                })
                .eq('id', existingDS.id);

            if (updateError) {
                console.error(`[ERROR] Failed to update "${dsName}":`, updateError.message);
                failedCount++;
            } else {
                updatedCount++;
            }
        } else {
            noChangeCount++;
        }
    }

    console.log('--- SYNC SUMMARY ---');
    console.log(`Updated: ${updatedCount}`);
    console.log(`Correct Already: ${noChangeCount}`);
    console.log(`Failed/Skipped: ${failedCount}`);
    console.log('--- SYNC COMPLETE ---');
}

forceSync().catch(console.error);
