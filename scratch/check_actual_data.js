const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres.tqbcmcddnohnqmcxvgut:Khouribga111*@aws-0-eu-west-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log('Querying database data...');

  const profilesRes = await client.query("SELECT id, full_name, email, role FROM public.profiles;");
  console.log('\n--- PROFILES ---');
  console.table(profilesRes.rows);

  const pilgrimsRes = await client.query("SELECT id, group_id, individual_hotel_info, individual_flight_info FROM public.pilgrims;");
  console.log('\n--- PILGRIMS ---');
  console.table(pilgrimsRes.rows);

  const hotelsRes = await client.query("SELECT id, name, city FROM public.hotels;");
  console.log('\n--- HOTELS ---');
  console.table(hotelsRes.rows);

  const staysRes = await client.query("SELECT * FROM public.group_hotel_stays;");
  console.log('\n--- GROUP HOTEL STAYS ---');
  console.table(staysRes.rows);

  await client.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
