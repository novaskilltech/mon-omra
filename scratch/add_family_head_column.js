const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres.tqbcmcddnohnqmcxvgut:Khouribga111*@aws-0-eu-west-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log('Adding family_head_id column to public.pilgrims...');
  await client.query(`
    ALTER TABLE public.pilgrims ADD COLUMN IF NOT EXISTS family_head_id UUID REFERENCES public.pilgrims(id) ON DELETE SET NULL;
  `);
  console.log('Successfully added family_head_id column!');
  await client.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
