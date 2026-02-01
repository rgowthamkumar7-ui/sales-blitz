
const XLSX = require('xlsx');
const path = require('path');

const filePath = path.resolve(process.cwd(), 'supabase/Excel/DS Map.xlsx');
const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rawData = XLSX.utils.sheet_to_json(sheet);

const dsName = "OM PRAKASH 1";
const row = rawData.find(r => r['SalesMan'] && r['SalesMan'].toString().trim() === dsName);

if (row) {
    console.log(`Excel Data for "${dsName}":`);
    console.log(`   SalesMan: "${row['SalesMan']}"`);
    console.log(`   TeamLead: "${row['TeamLead']}"`);
    console.log(`   WD Code:  "${row['WD Code']}"`);
} else {
    console.log(`DS "${dsName}" not found in Excel!`);
}
