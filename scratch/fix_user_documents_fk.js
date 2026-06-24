const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres.tqbcmcddnohnqmcxvgut:Khouribga111*@aws-0-eu-west-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log('Connected to database...');

  console.log('Altering user_documents_user_id_fkey constraint...');
  await client.query(`
    ALTER TABLE public.user_documents
    DROP CONSTRAINT IF EXISTS user_documents_user_id_fkey;

    ALTER TABLE public.user_documents
    ADD CONSTRAINT user_documents_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  `);

  console.log('Verifying constraints...');
  const { rows: constraints } = await client.query(`
    SELECT conname, pg_get_constraintdef(oid) 
    FROM pg_constraint 
    WHERE conrelid = 'public.user_documents'::regclass;
  `);
  console.log(constraints);

  await client.end();
}

main().catch(console.error);
