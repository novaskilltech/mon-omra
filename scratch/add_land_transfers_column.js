const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres.tqbcmcddnohnqmcxvgut:Khouribga111*@aws-0-eu-west-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log('Connected to database...');

  console.log('Adding column land_transfers to pilgrims table...');
  const res = await client.query(`
    ALTER TABLE pilgrims 
    ADD COLUMN IF NOT EXISTS land_transfers JSONB DEFAULT '{}'::jsonb;
  `);
  console.log('Migration completed successfully:', res);

  await client.end();
}

main().catch(console.error);
