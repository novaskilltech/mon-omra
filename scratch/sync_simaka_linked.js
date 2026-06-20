const { Client } = require('pg');

const connectionString = "postgresql://postgres.tqbcmcddnohnqmcxvgut:Khouribga111*@aws-0-eu-west-1.pooler.supabase.com:6543/postgres";

async function main() {
    const client = new Client({ connectionString });
    await client.connect();

    try {
        console.log("=== CHECKING ALL SIMAKA OR LINKED PILGRIMS ===");
        const res = await client.query(`
            SELECT p.id, pr.full_name, p.family_head_id, p.individual_flight_info, p.individual_hotel_info
            FROM pilgrims p
            JOIN profiles pr ON p.id = pr.id
            WHERE p.family_head_id = '75330326-4778-4064-be5b-a467fb20a566'
               OR pr.full_name ILIKE '%SIMAKA%'
               OR p.id = '75330326-4778-4064-be5b-a467fb20a566'
        `);

        for (const row of res.rows) {
            console.log(`ID: ${row.id}`);
            console.log(`  Name: ${row.full_name}`);
            console.log(`  Family Head ID: ${row.family_head_id}`);
            console.log(`  Flight Info:`, JSON.stringify(row.individual_flight_info));
            console.log(`  Hotel Info:`, JSON.stringify(row.individual_hotel_info));
            console.log("------------------------------------------");
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

main();
