
const { createClient } = require('@supabase/supabase-js');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Load env vars manually
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};

envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim().replace(/"/g, '');
        envVars[key] = value;
    }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateDataMapping() {
    console.log('Starting data mapping update...');

    // 1. Load Manager Mappings from DB
    console.log('Loading existing section -> manager mappings...');
    const { data: existingDistributors, error: distError } = await supabase
        .from('distributors')
        .select('section, ae_id, id');

    if (distError) {
        console.error('Error fetching distributors:', distError);
        return;
    }

    const { data: managerDistributors, error: mdError } = await supabase
        .from('manager_distributors')
        .select('manager_id, distributor_id');

    if (mdError) {
        console.error('Error fetching manager_distributors:', mdError);
        return;
    }

    // Map: Section -> { ae_id: string, am_ids: Set<string> }
    const sectionMap = new Map();

    existingDistributors.forEach(d => {
        if (!d.section) return;

        if (!sectionMap.has(d.section)) {
            sectionMap.set(d.section, { ae_id: null, am_ids: new Set() });
        }
        const entry = sectionMap.get(d.section);
        if (d.ae_id) entry.ae_id = d.ae_id;
        const linkedManagers = managerDistributors.filter(md => md.distributor_id === d.id);
        linkedManagers.forEach(md => entry.am_ids.add(md.manager_id));
    });

    // 2. Read Excel
    const filePath = path.resolve(process.cwd(), 'supabase/Excel/DS Map.xlsx');
    console.log(`Reading Excel file: ${filePath}`);
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = XLSX.utils.sheet_to_json(sheet);

    // Headers: "Section", "WD Code", "TeamLead", "SalesMan", "Total Number of outlets"
    const rows = rawData
        .filter(r => r['SalesMan'])
        .map(r => {
            return {
                section: r['Section'],
                wdCode: r['WD Code'],
                wdName: r['WD Name'] || r['WD Code'],
                tlName: r['TeamLead'],
                dsName: r['SalesMan'],
                mappedOutlets: parseInt(r['Total Number of outlets'] || '0')
            };
        });

    console.log(`Processing ${rows.length} valid salesman rows...`);

    // 3. Process Hierarchies
    const uniqueWDs = new Map();
    const uniqueTLs = new Map();
    const salesmen = [];

    rows.forEach(row => {
        if (row.wdCode) {
            let aeId = null;
            let amIds = [];
            if (row.section && sectionMap.has(row.section)) {
                const entry = sectionMap.get(row.section);
                aeId = entry.ae_id;
                amIds = Array.from(entry.am_ids);
            }

            if (!uniqueWDs.has(row.wdCode)) {
                uniqueWDs.set(row.wdCode, {
                    name: row.wdName,
                    code: row.wdCode,
                    section: row.section,
                    ae_id: aeId,
                    am_ids: amIds
                });
            }
        }

        if (row.tlName && row.wdCode) {
            uniqueTLs.set(row.tlName, { name: row.tlName, wdCode: row.wdCode });
        }

        salesmen.push({
            name: row.dsName,
            tlName: row.tlName,
            wdCode: row.wdCode,
            mappedOutlets: row.mappedOutlets
        });
    });

    console.log(`Unique WDs: ${uniqueWDs.size}, Unique TLs: ${uniqueTLs.size}, Salesmen: ${salesmen.length}`);

    console.log('--- UPSERT DISTRIBUTORS START ---');
    // --- UPSERT DISTRIBUTORS ---
    console.log('Upserting Distributors...');
    const wdMap = new Map();

    for (const [code, data] of uniqueWDs) {
        const { data: existing } = await supabase.from('distributors').select('id').eq('wd_code', code).maybeSingle();
        let distId;
        if (existing) {
            distId = existing.id;
            await supabase.from('distributors').update({ name: data.name, section: data.section, ae_id: data.ae_id }).eq('id', distId);
        } else {
            const { data: newRec, error: insertError } = await supabase.from('distributors').insert({ wd_code: code, name: data.name, section: data.section, ae_id: data.ae_id }).select('id').single();

            if (insertError || !newRec) {
                console.error(`Failed to create WD ${code}:`, insertError);
                continue;
            }
            distId = newRec.id;
        }
        wdMap.set(code, distId);

        if (data.am_ids && data.am_ids.length > 0) {
            await supabase.from('manager_distributors').delete().eq('distributor_id', distId);
            const links = data.am_ids.map(mid => ({ manager_id: mid, distributor_id: distId }));
            await supabase.from('manager_distributors').insert(links);
        }
    }
    console.log('--- UPSERT DISTRIBUTORS END ---');

    console.log('--- UPSERT TEAM LEADERS START ---');
    // --- UPSERT TEAM LEADERS ---
    console.log('Upserting Team Leaders...');
    const tlMap = new Map();

    for (const [name, data] of uniqueTLs) {
        try {
            const distId = wdMap.get(data.wdCode);
            if (!distId) {
                console.warn(`Skipping TL ${name}: WD ${data.wdCode} not found in map.`);
                continue;
            }

            const { data: existingUser } = await supabase.from('users').select('id').eq('name', name).eq('role', 'team_leader').maybeSingle();
            let tlId;
            if (existingUser) {
                tlId = existingUser.id;
                await supabase.from('users').update({ distributor_id: distId }).eq('id', tlId);
            } else {
                // Using random phone to avoid unique constraints if any
                const phone = '9' + Math.floor(100000000 + Math.random() * 900000000);
                const { data: newUser, error: insertError } = await supabase.from('users').insert({ name: name, role: 'team_leader', distributor_id: distId, phone: phone }).select('id').single();

                if (insertError || !newUser) {
                    console.error(`Failed to create TL ${name}:`, insertError);
                    continue;
                }
                tlId = newUser.id;
            }
            tlMap.set(name, tlId);
        } catch (tlError) {
            console.error(`Exception processing TL ${name}:`, tlError);
        }
    }
    console.log('--- UPSERT TEAM LEADERS END ---');

    console.log('--- UPSERT SALESMEN START ---');
    // --- CLEANUP & UPSERT SALESMEN ---
    console.log('Resetting all Salesman outlet counts to 0...');
    await supabase.from('users').update({ total_mapped_outlets: 0 }).eq('role', 'salesman');

    console.log(`Upserting ${salesmen.length} Salesman entries...`);

    const aggregatedSalesmen = new Map();
    salesmen.forEach(s => {
        if (!aggregatedSalesmen.has(s.name)) {
            aggregatedSalesmen.set(s.name, { name: s.name, tlName: s.tlName, wdCode: s.wdCode, totalOutlets: 0 });
        }
        const entry = aggregatedSalesmen.get(s.name);
        entry.totalOutlets += (s.mappedOutlets || 0);
        entry.tlName = s.tlName;
        entry.wdCode = s.wdCode;
    });

    console.log(`Aggregated into ${aggregatedSalesmen.size} Unique Salesmen.`);
    let createdCount = 0;
    let updatedCount = 0;

    for (const [name, s] of aggregatedSalesmen) {
        try {
            const distId = wdMap.get(s.wdCode);
            const tlId = tlMap.get(s.tlName);

            if (!distId || !tlId) {
                console.warn(`Skipping Salesman ${s.name}: Missing WD/TL`);
                continue;
            }

            const { data: existingDS } = await supabase.from('users').select('id').eq('name', s.name).eq('role', 'salesman').maybeSingle();

            if (existingDS) {
                await supabase.from('users').update({
                    distributor_id: distId,
                    team_leader_id: tlId,
                    total_mapped_outlets: s.totalOutlets
                }).eq('id', existingDS.id);
                updatedCount++;
            } else {
                // Unique phone to avoid potential constraint issues
                const phone = '8' + Math.floor(100000000 + Math.random() * 900000000);
                const { error: insertError } = await supabase.from('users').insert({
                    name: s.name.trim(),
                    role: 'salesman',
                    distributor_id: distId,
                    team_leader_id: tlId,
                    total_mapped_outlets: s.totalOutlets,
                    phone: phone
                });

                if (insertError) {
                    console.error(`Failed to insert ${s.name}:`, insertError);
                } else {
                    createdCount++;
                }
            }
        } catch (e) {
            console.error(`Exception for ${name}:`, e);
        }
    }

    console.log(`Update complete! Created: ${createdCount}, Updated: ${updatedCount}`);
}

updateDataMapping().catch(err => {
    console.error('FATAL ERROR:', err.message);
    console.error(err.stack);
    process.exit(1);
});
