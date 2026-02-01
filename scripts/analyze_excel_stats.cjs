
const XLSX = require('xlsx');
const path = require('path');

const filePath = path.resolve(process.cwd(), 'supabase/Excel/DS Map.xlsx');

try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Get all rows as objects
    const rows = XLSX.utils.sheet_to_json(sheet);

    const wdCodes = new Set();
    const teamLeads = new Set();
    const salesmen = new Set();
    let totalOutlets = 0;

    let validRows = 0;

    rows.forEach((row, index) => {
        // Headers identified: "Section", "WD Code", "TeamLead", "SalesMan", "Total Number of outlets"

        const wdCode = row['WD Code'];
        const tl = row['TeamLead'];
        const ds = row['SalesMan'];
        const outlets = row['Total Number of outlets'];

        // Only count rows that have at least a SalesMan (primary entity here)
        if (ds) {
            validRows++;
            salesmen.add(ds);

            if (wdCode) wdCodes.add(wdCode);
            if (tl) teamLeads.add(tl);

            // Handle numeric parsing just in case
            const outletVal = parseInt(outlets);
            if (!isNaN(outletVal)) {
                totalOutlets += outletVal;
            }
        }
    });

    const results = {
        totalRows: rows.length,
        validSalesmanRows: validRows,
        uniqueWDCodes: wdCodes.size,
        uniqueTeamLeads: teamLeads.size,
        uniqueSalesmen: salesmen.size,
        totalOutlets: totalOutlets
    };

    const fs = require('fs');
    fs.writeFileSync('analysis.json', JSON.stringify(results, null, 2));
    console.log('Analysis written to analysis.json');

} catch (error) {
    console.error('Analysis failed:', error);
}
