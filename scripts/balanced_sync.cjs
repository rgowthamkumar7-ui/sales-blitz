
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

async function balancedSync() {
    console.log('--- STARTING BALANCED DATA SYNC ---');

    // 1. Read Excel
    const filePath = path.resolve(process.cwd(), 'supabase/Excel/DS Map.xlsx');
    const workbook = XLSX.readFile(filePath);
    const rawData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

    // 2. Aggregate Data
    const dsData = {}; // name -> { outlets: 0, mappings: Set<string> }
    const tlNames = new Set();
    const wdCodes = new Set();

    rawData.forEach(r => {
        const dsName = r['SalesMan'] ? r['SalesMan'].toString().trim() : null;
        const tlName = r['TeamLead'] ? r['TeamLead'].toString().trim() : null;
        const wdCode = r['WD Code'] ? r['WD Code'].toString().trim() : null;
        const outlets = parseInt(r['Total Number of outlets']) || 0;

        if (!dsName || !tlName || !wdCode) return;

        if (!dsData[dsName]) {
            dsData[dsName] = { outlets: 0, mappings: [] };
        }
        dsData[dsName].outlets += outlets;

        // Save the TL/WD pair for this candidate
        if (!dsData[dsName].mappings.some(m => m.tl === tlName)) {
            dsData[dsName].mappings.push({ tl: tlName, wd: wdCode });
        }

        tlNames.add(tlName);
        wdCodes.add(wdCode);
    });

    console.log(`Unique Salesmen in Excel: ${Object.keys(dsData).length}`);
    console.log(`Unique Team Leaders in Excel: ${tlNames.size}`);

    // 3. Load DB References
    const { data: dbTLs } = await supabase.from('users').select('id, name').eq('role', 'team_leader');
    const { data: dbWDs } = await supabase.from('distributors').select('id, wd_code');

    const tlMap = new Map((dbTLs || []).map(u => [u.name.trim(), u.id]));
    const wdMap = new Map((dbWDs || []).map(d => [d.wd_code.trim(), d.id]));

    // 4. Balanced Assignment Algorithm
    const tlAssignments = {};
    tlNames.forEach(name => tlAssignments[name] = 0);

    const finalAssignment = {}; // dsName -> { tlId, wdId }

    // Phase 1: Assign DS who only have one TL
    Object.entries(dsData).forEach(([dsName, data]) => {
        if (data.mappings.length === 1) {
            const m = data.mappings[0];
            const tlId = tlMap.get(m.tl);
            const wdId = wdMap.get(m.wd);
            if (tlId && wdId) {
                finalAssignment[dsName] = { tlId, wdId, tlName: m.tl };
                tlAssignments[m.tl]++;
            }
        }
    });

    // Phase 2: Assign shared DS to the TL with the fewest assignments so far
    Object.entries(dsData).forEach(([dsName, data]) => {
        if (data.mappings.length > 1) {
            // Sort potential TLs by their current assignment count
            const sortedMappings = [...data.mappings].sort((a, b) => tlAssignments[a.tl] - tlAssignments[b.tl]);

            for (const m of sortedMappings) {
                const tlId = tlMap.get(m.tl);
                const wdId = wdMap.get(m.wd);
                if (tlId && wdId) {
                    finalAssignment[dsName] = { tlId, wdId, tlName: m.tl };
                    tlAssignments[m.tl]++;
                    break;
                }
            }
        }
    });

    // 5. Update Database
    console.log('Writing assignments to database...');
    let updatedCount = 0;

    for (const [dsName, assignment] of Object.entries(finalAssignment)) {
        const outlets = dsData[dsName].outlets;

        // Find DS in DB
        const { data: existing } = await supabase.from('users').select('id').eq('name', dsName).eq('role', 'salesman').maybeSingle();

        if (existing) {
            const { error } = await supabase.from('users').update({
                team_leader_id: assignment.tlId,
                distributor_id: assignment.wdId,
                total_mapped_outlets: outlets,
                updated_at: new Date().toISOString()
            }).eq('id', existing.id);

            if (error) console.error(`Error updating ${dsName}:`, error.message);
            else updatedCount++;
        } else {
            console.log(`[NEW?] DS ${dsName} not found in DB, skipping...`);
        }
    }

    console.log(`--- SYNC COMPLETE ---`);
    console.log(`Total Salesmen Updated: ${updatedCount}`);

    // Check for empty TLs
    Object.entries(tlAssignments).forEach(([name, count]) => {
        if (count === 0) console.warn(`!!! TL "${name}" still has 0 salesmen assigned!`);
        else console.log(`TL "${name}": ${count} salesmen`);
    });
}

balancedSync().catch(err => console.error(err.stack));
