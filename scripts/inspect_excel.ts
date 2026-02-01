
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

const filePath = path.resolve(process.cwd(), 'supabase/Excel/DS Map.xlsx');

if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
}

const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// Convert to JSON to see headers and data
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // header: 1 gives array of arrays

console.log(`Sheet Name: ${sheetName}`);
console.log('--- First 5 rows ---');
data.slice(0, 5).forEach((row, index) => {
    console.log(`Row ${index}:`, JSON.stringify(row));
});
