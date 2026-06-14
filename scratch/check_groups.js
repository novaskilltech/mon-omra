const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres.tqbcmcddnohnqmcxvgut:Khouribga111*@aws-0-eu-west-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log('Connected!');
  
  const columnsRes = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'profiles';
  `);
  console.log('--- PROFILES COLUMNS ---');
  console.log(columnsRes.rows.map(r => `${r.column_name}: ${r.data_type}`));

  await client.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
