
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) envVars[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/"/g, '');
});

const supabase = createClient(envVars.VITE_SUPABASE_URL, envVars.VITE_SUPABASE_ANON_KEY);

async function checkDuplicates() {
    const { data: users } = await supabase.from('users').select('id, name, role').ilike('name', '%ASLAM%');
    console.log('All users matching ASLAM:');
    users.forEach(u => {
        console.log(`- ID: ${u.id}, Name: "${u.name}", Role: ${u.role}`);
    });
}
checkDuplicates();
