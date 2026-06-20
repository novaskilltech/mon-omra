const { Client } = require('pg');

// Using IPv6 address directly
const connectionString = "postgresql://postgres:Khouribga111*@[2a05:d018:cb7:ae00:c765:42f7:dd57:dd45]:5432/postgres";

async function main() {
    const client = new Client({ connectionString });
    await client.connect();

    try {
        // 1. Search profiles for SIMAKA
        const res = await client.query("SELECT id, full_name, role FROM profiles WHERE full_name ILIKE '%SIMAKA%'");
        console.log("=== PROFILES FOUND ===");
        for (const p of res.rows) {
            console.log(`ID: ${p.id} | Name: ${p.full_name} | Role: ${p.role}`);
            
            // Check pilgrim details
            const pilRes = await client.query("SELECT group_id, family_head_id, individual_flight_info, individual_hotel_info, package_price FROM pilgrims WHERE id = $1", [p.id]);
            if (pilRes.rows.length > 0) {
                const pil = pilRes.rows[0];
                console.log(`  Group ID: ${pil.group_id}`);
                console.log(`  Family Head ID: ${pil.family_head_id}`);
                console.log(`  Flight Info:`, JSON.stringify(pil.individual_flight_info));
                console.log(`  Hotel Info:`, JSON.stringify(pil.individual_hotel_info));
                console.log(`  Package Price: ${pil.package_price}`);
            }
        }
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

main();
