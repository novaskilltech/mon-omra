const { Client } = require('pg');

const connectionString = "postgresql://postgres.tqbcmcddnohnqmcxvgut:Khouribga111*@aws-0-eu-west-1.pooler.supabase.com:6543/postgres";

async function main() {
    const client = new Client({ connectionString });
    await client.connect();

    try {
        console.log("=== CHECKING GROUPS ===");
        const groupsRes = await client.query(`SELECT id, name FROM public.groups;`);
        console.log("Groups:", groupsRes.rows);

        console.log("=== CHECKING GROUP HOTEL STAYS ===");
        const staysRes = await client.query(`
            SELECT s.id, s.group_id, s.hotel_id, h.name as hotel_name, h.city 
            FROM public.group_hotel_stays s
            JOIN public.hotels h ON s.hotel_id = h.id;
        `);
        console.log("Group Hotel Stays:", staysRes.rows);

        console.log("=== CHECKING HOTELS ===");
        const hotelsRes = await client.query(`SELECT id, name, city FROM public.hotels;`);
        console.log("Hotels:", hotelsRes.rows);

    } catch (err) {
        console.error("Error executing query:", err);
    } finally {
        await client.end();
    }
}

main();
