const { Client } = require('pg');

const connectionString = "postgresql://postgres.tqbcmcddnohnqmcxvgut:Khouribga111*@aws-0-eu-west-1.pooler.supabase.com:6543/postgres";

async function main() {
    const client = new Client({ connectionString });
    await client.connect();

    try {
        console.log("=== ADDING PHONE COLUMN TO PROFILES ===");
        await client.query(`
            ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
        `);
        console.log("Column phone added to profiles table (or already exists).");
    } catch (err) {
        console.error("Error executing query:", err);
    } finally {
        await client.end();
    }
}

main();
