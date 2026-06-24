const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres.tqbcmcddnohnqmcxvgut:Khouribga111*@aws-0-eu-west-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log('Connected to database...');

  // 1. Get policies on user_documents
  const { rows: docPolicies } = await client.query(`
    SELECT tablename, policyname, permissive, roles, cmd, qual, with_check 
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_documents';
  `);
  console.log('\n--- User Documents Policies ---');
  console.log(JSON.stringify(docPolicies, null, 2));

  // 2. Get policies on storage.objects
  const { rows: storagePolicies } = await client.query(`
    SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
    FROM pg_policies 
    WHERE tablename = 'objects';
  `);
  console.log('\n--- Storage Objects Policies ---');
  console.log(JSON.stringify(storagePolicies, null, 2));

  await client.end();
}

main().catch(console.error);
