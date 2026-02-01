
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

async function globalAudit() {
    console.log('--- GLOBAL MAPPING AUDIT ---');

    // 1. Load Excel
    const filePath = path.resolve(process.cwd(), 'supabase/Excel/DS Map.xlsx');
    const workbook = XLSX.readFile(filePath);
    const rawData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
    const excelRows = rawData.filter(r => r['SalesMan']).map(r => ({
        ds: r['SalesMan'].toString().trim(),
        tl: r['TeamLead'] ? r['TeamLead'].toString().trim() : 'NONE'
    }));

    // 2. Load DB Salesmen with their TL names
    const { data: dbSalesmen } = await supabase.from('users').select(`
        name,
        role,
        team_leader:team_leader_id ( name )
    `).eq('role', 'salesman');

    console.log(`Excel: ${excelRows.length} DS, DB: ${dbSalesmen.length} DS`);

    const dbMap = new Map(dbSalesmen.map(s => [s.name.trim(), s.team_leader ? s.team_leader.name.trim() : 'NONE']));

    let mismatches = 0;
    for (const row of excelRows) {
        const dbTl = dbMap.get(row.ds);
        if (!dbTl) {
            console.log(`[MISSING IN DB] Salesman: "${row.ds}"`);
            mismatches++;
        } else if (dbTl !== row.tl) {
            console.log(`[MISMATCH] Salesman: "${row.ds}" | Excel TL: "${row.tl}" | DB TL: "${dbTl}"`);
            mismatches++;
        }
    }

    console.log(`--- AUDIT COMPLETE: ${mismatches} mismatches found ---`);
}

globalAudit();
