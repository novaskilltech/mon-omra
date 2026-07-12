const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function main() {
    const connectionString = "postgresql://postgres.tqbcmcddnohnqmcxvgut:Khouribga111*@aws-0-eu-west-1.pooler.supabase.com:6543/postgres";
    const client = new Client({ connectionString });
    await client.connect();

    try {
        const sql = `
            ALTER TABLE public.departure_requests 
            ADD COLUMN IF NOT EXISTS past_trips_details TEXT,
            ADD COLUMN IF NOT EXISTS loyalty_reward VARCHAR(50);
        `;
        console.log("Running Alter Table migration...");
        await client.query(sql);
        console.log("Migration completed successfully!");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await client.end();
    }
}

main();
