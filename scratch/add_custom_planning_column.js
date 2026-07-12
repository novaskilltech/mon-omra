process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const regions = [
    'eu-west-3', // Paris
    'eu-west-1', // Ireland
    'eu-central-1', // Frankfurt
    'us-east-1', // N. Virginia
    'us-west-1', // N. California
    'ap-southeast-1' // Singapore
];

async function run() {
    for (const r of regions) {
        const host = `aws-0-${r}.pooler.supabase.com`;
        const connectionString = `postgres://postgres.tqbcmcddnohnqmcxvgut:Khouribga111*@${host}:6543/postgres?sslmode=require`;
        const client = new Client({
            connectionString,
            ssl: {
                rejectUnauthorized: false
            }
        });
        
        try {
            console.log(`Trying region ${r} (${host})...`);
            await client.connect();
            console.log(`Connected successfully to region ${r}! Running query...`);
            await client.query('ALTER TABLE group_logistics ADD COLUMN IF NOT EXISTS custom_planning JSONB;');
            console.log("Column custom_planning JSONB added successfully (or already existed).");
            await client.end();
            return;
        } catch (e) {
            console.log(`Region ${r} failed:`, e.message);
            try { await client.end(); } catch (err) {}
        }
    }
    console.log("All regions failed.");
}

run();
