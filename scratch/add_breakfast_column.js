const { Client } = require('pg');

const connectionString = "postgresql://postgres.tqbcmcddnohnqmcxvgut:Khouribga111*@aws-0-eu-west-1.pooler.supabase.com:6543/postgres";

async function main() {
    const client = new Client({ connectionString });
    await client.connect();

    try {
        console.log("=== ADDING BREAKFAST COLUMN TO ROOMS ===");
        await client.query(`
            ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS has_breakfast BOOLEAN DEFAULT FALSE;
        `);
        console.log("Column has_breakfast added to rooms table (or already exists).");
    } catch (err) {
        console.error("Error executing query:", err);
    } finally {
        await client.end();
    }
}

main();
