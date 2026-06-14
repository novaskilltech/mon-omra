const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres.tqbcmcddnohnqmcxvgut:Khouribga111*@aws-0-eu-west-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log('Connected to database to add column...');
  
  await client.query(`
    ALTER TABLE public.pilgrims 
    ADD COLUMN IF NOT EXISTS individual_flight_info JSONB DEFAULT NULL;
  `);

  console.log('Column individual_flight_info added to pilgrims successfully!');
  await client.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
