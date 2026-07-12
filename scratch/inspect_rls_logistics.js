const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres.tqbcmcddnohnqmcxvgut:Khouribga111*@aws-0-eu-west-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log('Connected to database...');

  const { rows } = await client.query(`
    SELECT relname, relrowsecurity, relforcerowsecurity 
    FROM pg_class 
    JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace 
    WHERE nspname = 'public' AND relname IN ('flights', 'flight_segments', 'hotels', 'rooms', 'room_assignments');
  `);
  console.log('\n--- RLS Status ---');
  console.log(rows);

  await client.end();
}

main().catch(console.error);
