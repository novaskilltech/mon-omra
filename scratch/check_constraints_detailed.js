const { Client } = require('pg');

const connectionString = "postgresql://postgres.tqbcmcddnohnqmcxvgut:Khouribga111*@aws-0-eu-west-1.pooler.supabase.com:6543/postgres";

async function main() {
    const client = new Client({ connectionString });
    await client.connect();

    try {
        console.log("=== CONSTRAINTS OF FLIGHTS ===");
        const res = await client.query(`
            SELECT conname, contype, pg_get_constraintdef(oid) as def
            FROM pg_constraint
            WHERE conrelid = 'flights'::regclass;
        `);
        console.log(res.rows);

        console.log("=== CONSTRAINTS OF FLIGHT_SEGMENTS ===");
        const res2 = await client.query(`
            SELECT conname, contype, pg_get_constraintdef(oid) as def
            FROM pg_constraint
            WHERE conrelid = 'flight_segments'::regclass;
        `);
        console.log(res2.rows);

    } catch (err) {
        console.error("Error executing query:", err);
    } finally {
        await client.end();
    }
}

main();
