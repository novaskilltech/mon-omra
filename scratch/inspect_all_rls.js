const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres.tqbcmcddnohnqmcxvgut:Khouribga111*@aws-0-eu-west-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log('Connected to inspect database RLS status...');

  const query = `
    SELECT 
      c.relname AS table_name,
      c.relrowsecurity AS rls_enabled,
      c.relforcerowsecurity AS force_rls
    FROM 
      pg_class c
    JOIN 
      pg_namespace n ON n.oid = c.relnamespace
    WHERE 
      n.nspname = 'public' 
      AND c.relkind = 'r'
    ORDER BY table_name;
  `;

  const res = await client.query(query);
  console.log('RLS Status per Table:');
  console.table(res.rows);

  const policyQuery = `
    SELECT 
      schemaname,
      tablename,
      policyname,
      permissive,
      roles,
      cmd,
      qual,
      with_check
    FROM 
      pg_policies
    WHERE 
      schemaname = 'public'
    ORDER BY tablename, policyname;
  `;

  const policyRes = await client.query(policyQuery);
  console.log('Active Policies:');
  console.table(policyRes.rows);

  await client.end();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
