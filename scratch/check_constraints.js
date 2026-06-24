const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres.tqbcmcddnohnqmcxvgut:Khouribga111*@aws-0-eu-west-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log('Connected to database...');

  // Get constraints on user_documents
  const { rows: constraints } = await client.query(`
    SELECT conname, pg_get_constraintdef(oid) 
    FROM pg_constraint 
    WHERE conrelid = 'public.user_documents'::regclass;
  `);
  console.log('Constraints on user_documents:', constraints);

  await client.end();
}

main().catch(console.error);
