const { Client } = require('pg');

const connectionString = "postgresql://postgres.tqbcmcddnohnqmcxvgut:Khouribga111*@aws-0-eu-west-1.pooler.supabase.com:6543/postgres";

async function main() {
    const client = new Client({ connectionString });
    await client.connect();

    try {
        console.log("=== COLUMNS OF ROOM_ASSIGNMENTS TABLE ===");
        const columnsRes = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'room_assignments';
        `);
        console.log("Room Assignments Columns:", columnsRes.rows);

        console.log("=== ROOM_ASSIGNMENTS DATA SAMPLE ===");
        const dataRes = await client.query(`SELECT * FROM public.room_assignments LIMIT 5;`);
        console.log("Room Assignments Sample:", dataRes.rows);

    } catch (err) {
        console.error("Error executing query:", err);
    } finally {
        await client.end();
    }
}

main();
