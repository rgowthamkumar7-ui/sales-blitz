
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const filePath = path.resolve(process.cwd(), 'supabase/Excel/DS Map.xlsx');

if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
}

try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert to JSON with header: 1 to get raw array of arrays
    const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    console.log(`Sheet Name: ${sheetName}`);
    if (rawRows.length > 0) {
        console.log('--- Headers (Row 0) ---');
        rawRows[0].forEach((header, i) => {
            console.log(`Index ${i}: ${header}`);
        });
    }
} catch (error) {
    console.error('Error reading file:', error);
}
