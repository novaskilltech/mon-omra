const { Client } = require('pg');

const passwords = ["Khouribga111*", "postgres", "admin", ""];
const connectionStrings = passwords.map(pw => `postgresql://postgres:${pw}@localhost:5432/postgres`);

async function testConnections() {
    for (const connectionString of connectionStrings) {
        const client = new Client({ connectionString });
        try {
            await client.connect();
            console.log(`SUCCESS connected with: ${connectionString}`);
            
            // Search profiles for SIMAKA
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
            
            await client.end();
            return;
        } catch (err) {
            console.log(`Failed with: ${connectionString} - ${err.message}`);
        }
    }
}

testConnections();
