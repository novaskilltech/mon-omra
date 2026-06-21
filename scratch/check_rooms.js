const { Client } = require('pg');

const connectionString = "postgresql://postgres.tqbcmcddnohnqmcxvgut:Khouribga111*@aws-0-eu-west-1.pooler.supabase.com:6543/postgres";

async function main() {
    const client = new Client({ connectionString });
    await client.connect();

    try {
        console.log("=== CHECKING ZAHA TAIBA HOTEL ID ===");
        const hotelRes = await client.query(`SELECT id, name FROM public.hotels WHERE name LIKE '%Zaha Taiba%';`);
        console.log("Hotel:", hotelRes.rows);

        if (hotelRes.rows.length > 0) {
            const hotelId = hotelRes.rows[0].id;
            console.log(`=== CHECKING ROOMS FOR HOTEL ${hotelId} ===`);
            const roomsRes = await client.query(`SELECT id, hotel_id, type, capacity, room_number FROM public.rooms WHERE hotel_id = $1;`, [hotelId]);
            console.log("Rooms count:", roomsRes.rows.length);
            console.log("Rooms sample:", roomsRes.rows.slice(0, 5));
        }

    } catch (err) {
        console.error("Error executing query:", err);
    } finally {
        await client.end();
    }
}

main();
