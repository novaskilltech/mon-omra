const { Client } = require('pg');

const connectionString = "postgresql://postgres.tqbcmcddnohnqmcxvgut:Khouribga111*@aws-0-eu-west-1.pooler.supabase.com:6543/postgres";

async function main() {
    const client = new Client({ connectionString });
    await client.connect();

    try {
        console.log("=== CHECKING PILGRIMS FAMILY RELATIONSHIPS ===");
        
        const res = await client.query(`
            SELECT pr.id, pr.full_name, pr.role, pi.family_head_id, pi.group_id
            FROM public.profiles pr
            LEFT JOIN public.pilgrims pi ON pr.id = pi.id
            WHERE pr.role = 'PILGRIM'
        `);
        console.log("All Pilgrims in DB:");
        console.table(res.rows);

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

main();
