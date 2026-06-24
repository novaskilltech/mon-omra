const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres.tqbcmcddnohnqmcxvgut:Khouribga111*@aws-0-eu-west-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log('Connected to database...');

  console.log('Dropping old constraint...');
  await client.query(`
    ALTER TABLE public.user_documents DROP CONSTRAINT IF EXISTS user_documents_type_check;
  `);

  console.log('Adding new constraint...');
  await client.query(`
    ALTER TABLE public.user_documents ADD CONSTRAINT user_documents_type_check CHECK (type IN ('PASSPORT', 'PHOTO', 'RESIDENCE_PERMIT', 'INVOICE'));
  `);

  console.log('Constraint modified successfully!');

  const { rows: constraints } = await client.query(`
    SELECT conname, pg_get_constraintdef(oid) 
    FROM pg_constraint 
    WHERE conrelid = 'public.user_documents'::regclass;
  `);
  console.log('New constraints on user_documents:', constraints);

  await client.end();
}

main().catch(console.error);
