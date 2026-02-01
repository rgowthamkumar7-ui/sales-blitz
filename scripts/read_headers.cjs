
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const filePath = path.resolve(process.cwd(), 'supabase/Excel/DS Map.xlsx');

try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Raw array of arrays
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    if (rows.length > 0) {
        const headers = rows[0];
        fs.writeFileSync('headers.json', JSON.stringify(headers, null, 2));
        console.log('Headers written to headers.json');
    } else {
        console.log('File is empty.');
    }

} catch (e) {
    console.error(e);
}
