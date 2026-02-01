
const { createClient } = require('@supabase/supabase-js');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Load env vars
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) envVars[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/"/g, '');
});

const supabase = createClient(envVars.VITE_SUPABASE_URL, envVars.VITE_SUPABASE_ANON_KEY);

async function cleanup() {
    console.log('Starting cleanup of obsolete Team Leaders...');

    // 1. Get valid names from Excel
    const filePath = path.resolve(process.cwd(), 'supabase/Excel/DS Map.xlsx');
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = XLSX.utils.sheet_to_json(sheet);

    // Valid Team Leaders
    const validNames = new Set(
        rawData
            .filter(r => r['TeamLead'])
            .map(r => r['TeamLead'].toString().trim())
    );

    console.log(`Found ${validNames.size} valid TL entries in Excel.`);

    // 2. Get existing TLs
    const { data: dbUsers, error } = await supabase
        .from('users')
        .select('id, name')
        .eq('role', 'team_leader');

    if (error) {
        console.error(error);
        return;
    }

    // 3. Identify obsolete
    const toDelete = dbUsers.filter(u => !validNames.has(u.name.trim()));

    console.log(`Found ${toDelete.length} TLs to delete.`);
    if (toDelete.length > 0) {
        console.log('Deleting:', toDelete.map(u => u.name));

        const ids = toDelete.map(u => u.id);
        const { error: delError } = await supabase
            .from('users')
            .delete()
            .in('id', ids);

        if (delError) console.error('Delete failed:', delError);
        else console.log('Delete successful.');
    } else {
        console.log('No cleanup needed.');
    }
}

cleanup();
