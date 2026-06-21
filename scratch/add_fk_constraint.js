const { Client } = require('pg');

const connectionString = "postgresql://postgres.tqbcmcddnohnqmcxvgut:Khouribga111*@aws-0-eu-west-1.pooler.supabase.com:6543/postgres";

async function main() {
    const client = new Client({ connectionString });
    await client.connect();

    try {
        console.log("=== ADDING FK CONSTRAINT TO ROOM_ASSIGNMENTS ===");
        await client.query(`
            ALTER TABLE public.room_assignments 
            ADD CONSTRAINT fk_room_assignments_room_id 
            FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE CASCADE;
        `);
        console.log("Foreign key constraint added successfully.");
    } catch (err) {
        console.error("Error executing query:", err);
    } finally {
        await client.end();
    }
}

main();
