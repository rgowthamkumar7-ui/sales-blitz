
const XLSX = require('xlsx');
const path = require('path');

const filePath = path.resolve(process.cwd(), 'supabase/Excel/DS Map.xlsx');
const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rawData = XLSX.utils.sheet_to_json(sheet);

console.log('Inspecting rows for TL "ASLAM"...');

const aslamRows = rawData.filter(r => r['TeamLead'] && r['TeamLead'].toString().includes('ASLAM'));

console.log(`Found ${aslamRows.length} rows.`);
aslamRows.forEach((r, i) => {
    console.log(`[${i}] SalesMan: "${r['SalesMan']}", WD Code: "${r['WD Code']}", TeamLead: "${r['TeamLead']}"`);
});
