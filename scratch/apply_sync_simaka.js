const { Client } = require('pg');

const connectionString = "postgresql://postgres.tqbcmcddnohnqmcxvgut:Khouribga111*@aws-0-eu-west-1.pooler.supabase.com:6543/postgres";

async function main() {
    const client = new Client({ connectionString });
    await client.connect();

    try {
        console.log("=== SYNCING FLIGHTS, HOTELS, BAGGAGE FOR SIMAKA LINKED PILGRIMS ===");
        
        // 1. Get Fatoumata Simaka's source of truth data
        const sourceRes = await client.query(`
            SELECT individual_flight_info, individual_hotel_info
            FROM pilgrims
            WHERE id = '75330326-4778-4064-be5b-a467fb20a566'
        `);

        if (sourceRes.rows.length === 0) {
            console.error("Fatoumata Simaka profile not found!");
            return;
        }

        const { individual_flight_info, individual_hotel_info } = sourceRes.rows[0];
        console.log("Source Flight Info:", JSON.stringify(individual_flight_info));
        console.log("Source Hotel Info:", JSON.stringify(individual_hotel_info));

        // 2. Update all pilgrims who have family_head_id = Fatoumata Simaka's ID
        const updateRes = await client.query(`
            UPDATE pilgrims
            SET 
                individual_flight_info = $1,
                individual_hotel_info = $2
            WHERE family_head_id = '75330326-4778-4064-be5b-a467fb20a566'
            RETURNING id
        `, [JSON.stringify(individual_flight_info), JSON.stringify(individual_hotel_info)]);

        console.log(`Updated ${updateRes.rowCount} linked pilgrim records.`);
        
        // 3. Verify
        const verifyRes = await client.query(`
            SELECT p.id, pr.full_name, p.individual_flight_info, p.individual_hotel_info
            FROM pilgrims p
            JOIN profiles pr ON p.id = pr.id
            WHERE p.family_head_id = '75330326-4778-4064-be5b-a467fb20a566'
               OR p.id = '75330326-4778-4064-be5b-a467fb20a566'
        `);

        console.log("\n=== VERIFICATION AFTER UPDATE ===");
        for (const row of verifyRes.rows) {
            console.log(`Name: ${row.full_name}`);
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
