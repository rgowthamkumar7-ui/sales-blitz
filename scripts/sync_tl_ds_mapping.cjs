const XLSX = require('xlsx');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncTLDSMapping() {
    console.log('=== Starting TL-DS Mapping Sync ===\n');

    // Read the Excel file
    const excelPath = path.join(__dirname, '../supabase/Excel/tl new list.xlsx');
    const workbook = XLSX.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    console.log(`Found ${data.length} rows in Excel file\n`);

    // Get all existing users from database
    const { data: allUsers, error: usersError } = await supabase
        .from('users')
        .select('id, name, role, team_leader_id, distributor_id');

    if (usersError) {
        console.error('Error fetching users:', usersError);
        return;
    }

    console.log(`Found ${allUsers.length} users in database\n`);

    // Create lookup maps
    const tlMap = new Map();
    const dsMap = new Map();
    const distributorMap = new Map();

    allUsers.forEach(user => {
        if (user.role === 'team_leader') {
            tlMap.set(user.id, user);
            tlMap.set(user.name.toUpperCase(), user);
        } else if (user.role === 'salesman') {
            dsMap.set(user.id, user);
            dsMap.set(user.name.toUpperCase(), user);
        } else if (user.role === 'distributor') {
            distributorMap.set(user.id, user);
            distributorMap.set(user.name.toUpperCase(), user);
        }
    });

    console.log(`TLs in DB: ${Array.from(tlMap.values()).filter(u => typeof u === 'object').length}`);
    console.log(`DSs in DB: ${Array.from(dsMap.values()).filter(u => typeof u === 'object').length}`);
    console.log(`Distributors in DB: ${Array.from(distributorMap.values()).filter(u => typeof u === 'object').length}\n`);

    // Process each row
    const updates = [];
    const notFound = {
        tls: new Set(),
        dss: new Set(),
        distributors: new Set()
    };

    for (const row of data) {
        const tlId = row['TL Id'];
        const tlName = row['TL Name'];
        const dsId = row['DS Id'];
        const dsName = row['DS Name'];
        const wdCode = row['WD Code'];

        // Find TL
        let tl = tlMap.get(tlId);
        if (!tl && tlName) {
            tl = tlMap.get(tlName.toUpperCase());
        }

        // Find DS
        let ds = dsMap.get(dsId);
        if (!ds && dsName) {
            ds = dsMap.get(dsName.toUpperCase());
        }

        // Find Distributor by WD Code
        let distributor = null;
        if (wdCode) {
            distributor = Array.from(distributorMap.values())
                .filter(u => typeof u === 'object')
                .find(u => u.name && u.name.includes(wdCode));
        }

        if (!tl) {
            notFound.tls.add(`${tlName} (ID: ${tlId})`);
            continue;
        }

        if (!ds) {
            notFound.dss.add(`${dsName} (ID: ${dsId})`);
            continue;
        }

        // Prepare update
        const update = {
            dsId: ds.id,
            dsName: ds.name,
            currentTlId: ds.team_leader_id,
            currentDistributorId: ds.distributor_id,
            newTlId: tl.id,
            newTlName: tl.name,
            newDistributorId: distributor ? distributor.id : ds.distributor_id,
            newDistributorName: distributor ? distributor.name : 'UNCHANGED'
        };

        updates.push(update);
    }

    // Display summary
    console.log('=== Mapping Summary ===\n');
    console.log(`Total updates to process: ${updates.length}\n`);

    if (notFound.tls.size > 0) {
        console.log('⚠️  TLs not found in database:');
        notFound.tls.forEach(tl => console.log(`  - ${tl}`));
        console.log();
    }

    if (notFound.dss.size > 0) {
        console.log('⚠️  DSs not found in database:');
        notFound.dss.forEach(ds => console.log(`  - ${ds}`));
        console.log();
    }

    // Group updates by TL
    const updatesByTL = {};
    updates.forEach(update => {
        if (!updatesByTL[update.newTlName]) {
            updatesByTL[update.newTlName] = [];
        }
        updatesByTL[update.newTlName].push(update);
    });

    console.log('=== Updates by TL ===\n');
    Object.keys(updatesByTL).sort().forEach(tlName => {
        const tlUpdates = updatesByTL[tlName];
        console.log(`${tlName} (${tlUpdates.length} salesmen):`);
        tlUpdates.forEach(u => {
            const tlChange = u.currentTlId !== u.newTlId ? '🔄' : '✓';
            const distChange = u.currentDistributorId !== u.newDistributorId ? '🔄' : '✓';
            console.log(`  ${tlChange} ${u.dsName} - TL: ${u.currentTlId || 'NULL'} → ${u.newTlId}, Dist: ${distChange}`);
        });
        console.log();
    });

    // Ask for confirmation
    console.log('=== Ready to Update Database ===');
    console.log(`This will update ${updates.length} salesmen records.\n`);

    // Perform updates
    let successCount = 0;
    let errorCount = 0;

    for (const update of updates) {
        const { error } = await supabase
            .from('users')
            .update({
                team_leader_id: update.newTlId,
                distributor_id: update.newDistributorId
            })
            .eq('id', update.dsId);

        if (error) {
            console.error(`❌ Error updating ${update.dsName}:`, error.message);
            errorCount++;
        } else {
            successCount++;
        }
    }

    console.log('\n=== Update Complete ===');
    console.log(`✅ Successfully updated: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);

    // Verify the updates
    console.log('\n=== Verification ===');
    const { data: updatedUsers, error: verifyError } = await supabase
        .from('users')
        .select('id, name, role, team_leader_id, distributor_id')
        .eq('role', 'salesman');

    if (verifyError) {
        console.error('Error verifying updates:', verifyError);
        return;
    }

    // Check for salesmen without TL
    const withoutTL = updatedUsers.filter(u => !u.team_leader_id);
    if (withoutTL.length > 0) {
        console.log(`\n⚠️  ${withoutTL.length} salesmen still without TL:`);
        withoutTL.forEach(u => console.log(`  - ${u.name} (ID: ${u.id})`));
    } else {
        console.log('\n✅ All salesmen have TL assigned!');
    }

    // Group by TL to show final mapping
    const finalMapping = {};
    updatedUsers.forEach(ds => {
        if (ds.team_leader_id) {
            if (!finalMapping[ds.team_leader_id]) {
                const tl = tlMap.get(ds.team_leader_id);
                finalMapping[ds.team_leader_id] = {
                    tlName: tl ? tl.name : `TL ID ${ds.team_leader_id}`,
                    salesmen: []
                };
            }
            finalMapping[ds.team_leader_id].salesmen.push(ds.name);
        }
    });

    console.log('\n=== Final TL-DS Mapping ===');
    Object.values(finalMapping).sort((a, b) => a.tlName.localeCompare(b.tlName)).forEach(mapping => {
        console.log(`\n${mapping.tlName} (${mapping.salesmen.length} salesmen):`);
        console.log(`  ${mapping.salesmen.join(', ')}`);
    });
}

syncTLDSMapping().catch(console.error);
