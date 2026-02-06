const XLSX = require('xlsx');
const path = require('path');

// Read the Excel file
const excelPath = path.join(__dirname, '../supabase/Excel/tl new list.xlsx');
const workbook = XLSX.readFile(excelPath);

// Get the first sheet
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Convert to JSON
const data = XLSX.utils.sheet_to_json(worksheet);

console.log('Total rows:', data.length);
console.log('\n=== First few rows ===');
console.log(JSON.stringify(data.slice(0, 5), null, 2));

console.log('\n=== Column Headers ===');
if (data.length > 0) {
    console.log(Object.keys(data[0]));
}

// Group by TL
const tlMapping = {};
data.forEach(row => {
    const tlName = row['TL Name'] || row['TL name'] || row['Team Leader'] || row['TL'];
    const dsName = row['DS Name'] || row['DS name'] || row['Salesman'] || row['DS'];
    const wdName = row['WD Name'] || row['WD name'] || row['Distributor'] || row['WD'];

    if (tlName) {
        if (!tlMapping[tlName]) {
            tlMapping[tlName] = {
                distributors: new Set(),
                salesmen: []
            };
        }

        if (dsName) {
            tlMapping[tlName].salesmen.push(dsName);
        }

        if (wdName) {
            tlMapping[tlName].distributors.add(wdName);
        }
    }
});

console.log('\n=== TL to DS Mapping Summary ===');
Object.keys(tlMapping).sort().forEach(tl => {
    const mapping = tlMapping[tl];
    console.log(`\n${tl}:`);
    console.log(`  Distributors: ${Array.from(mapping.distributors).join(', ')}`);
    console.log(`  Salesmen (${mapping.salesmen.length}): ${mapping.salesmen.join(', ')}`);
});

console.log('\n=== Statistics ===');
console.log(`Total TLs: ${Object.keys(tlMapping).length}`);
console.log(`Total unique DS entries: ${data.length}`);
