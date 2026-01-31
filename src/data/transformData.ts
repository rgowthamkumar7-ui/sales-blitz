/**
 * Data Transformation Script
 * Reads excel-data.json and generates proper mock data structures
 */

import { User, Distributor } from '@/types';

// Raw data type from Excel
interface ExcelRow {
    Section: string;
    'WD Code': string;
    'WD Name': string;
    AM2: string;
    AM1: string;
    'AE Name': string;
    'TL Name': string;
    'DS Name': string;
}

// Function to generate a unique ID
const generateId = (prefix: string, index: number): string => {
    return `${prefix}-${index.toString().padStart(4, '0')}`;
};

// Transform Excel data to app data structures
export function transformExcelData(excelData: ExcelRow[]) {
    const distributorMap = new Map<string, Distributor>();
    const tlMap = new Map<string, User>();
    const dsMap = new Map<string, User>();
    const managerMap = new Map<string, User>();
    const aeWdMap = new Map<string, Set<string>>(); // AE name -> WD IDs

    let distIndex = 1;
    let tlIndex = 1;
    let dsIndex = 1;
    let mgrIndex = 1;

    excelData.forEach(row => {
        // Create/get Distributor
        const wdCode = row['WD Code'];
        if (!distributorMap.has(wdCode)) {
            distributorMap.set(wdCode, {
                id: generateId('wd', distIndex++),
                wdCode: wdCode,
                name: row['WD Name'],
                section: row.Section,
                aeId: undefined // Will be set after AE is created
            });
        }

        // Track AE to WD mapping
        const aeName = row['AE Name'];
        if (!aeWdMap.has(aeName)) {
            aeWdMap.set(aeName, new Set());
        }
        aeWdMap.get(aeName)!.add(wdCode);

        // Create AM2 (if not exists)
        const am2Name = row.AM2;
        if (am2Name && !managerMap.has(`AM2-${am2Name}`)) {
            managerMap.set(`AM2-${am2Name}`, {
                id: generateId('mgr', mgrIndex++),
                name: am2Name,
                role: 'manager',
                managerLevel: 'AM2'
            });
        }

        // Create AM1 (if not exists)
        const am1Name = row.AM1;
        if (am1Name && !managerMap.has(`AM1-${am1Name}`)) {
            managerMap.set(`AM1-${am1Name}`, {
                id: generateId('mgr', mgrIndex++),
                name: am1Name,
                role: 'manager',
                managerLevel: 'AM1'
            });
        }

        // Create AE (if not exists)
        if (aeName && !managerMap.has(`AE-${aeName}`)) {
            managerMap.set(`AE-${aeName}`, {
                id: generateId('mgr', mgrIndex++),
                name: aeName,
                role: 'manager',
                managerLevel: 'AE',
                distributorIds: [] // Will be populated later
            });
        }

        // Create TL (unique by name + WD combination to handle duplicates)
        const tlName = row['TL Name'];
        const tlKey = `${tlName}-${wdCode}`;
        if (!tlMap.has(tlKey)) {
            const distributor = distributorMap.get(wdCode)!;
            tlMap.set(tlKey, {
                id: generateId('tl', tlIndex++),
                name: tlName,
                role: 'team_leader',
                distributorId: distributor.id
            });
        }

        // Create DS (unique by name + TL combination)
        const dsName = row['DS Name'];
        const dsKey = `${dsName}-${tlKey}`;
        if (!dsMap.has(dsKey)) {
            const tl = tlMap.get(tlKey)!;
            const distributor = distributorMap.get(wdCode)!;
            dsMap.set(dsKey, {
                id: generateId('ds', dsIndex++),
                name: dsName,
                role: 'salesman',
                teamLeaderId: tl.id,
                distributorId: distributor.id,
                totalMappedOutlets: Math.floor(Math.random() * 50) + 20 // Random 20-70
            });
        }
    });

    // Update AE distributorIds
    managerMap.forEach((manager, key) => {
        if (key.startsWith('AE-')) {
            const aeName = key.replace('AE-', '');
            const wdCodes = aeWdMap.get(aeName);
            if (wdCodes) {
                manager.distributorIds = Array.from(wdCodes).map(code => {
                    const dist = distributorMap.get(code);
                    return dist ? dist.id : '';
                }).filter(Boolean);
            }
        }
    });

    // Update distributor aeId
    distributorMap.forEach((dist, wdCode) => {
        // Find the AE for this WD
        managerMap.forEach((manager, key) => {
            if (key.startsWith('AE-') && manager.distributorIds?.includes(dist.id)) {
                dist.aeId = manager.id;
            }
        });
    });

    return {
        distributors: Array.from(distributorMap.values()),
        teamLeaders: Array.from(tlMap.values()),
        salesmen: Array.from(dsMap.values()),
        managers: Array.from(managerMap.values()),
        allUsers: [
            ...Array.from(managerMap.values()),
            ...Array.from(tlMap.values()),
            ...Array.from(dsMap.values())
        ]
    };
}
