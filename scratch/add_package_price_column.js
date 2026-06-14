const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres.tqbcmcddnohnqmcxvgut:Khouribga111*@aws-0-eu-west-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log('Adding package_price column to public.pilgrims...');
  await client.query(`
    ALTER TABLE public.pilgrims ADD COLUMN IF NOT EXISTS package_price NUMERIC DEFAULT 2500;
  `);
  console.log('Successfully added package_price column!');
  await client.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
