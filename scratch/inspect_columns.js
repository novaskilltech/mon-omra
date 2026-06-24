const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres.tqbcmcddnohnqmcxvgut:Khouribga111*@aws-0-eu-west-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log('Connected to database...');

  const { rows: columns } = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'pilgrims';
  `);
  console.log('Columns in pilgrims table:', columns);

  await client.end();
}

main().catch(console.error);
