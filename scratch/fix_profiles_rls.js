const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres.tqbcmcddnohnqmcxvgut:Khouribga111*@aws-0-eu-west-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log('Connected to fix profiles RLS...');

  // Drop specific select/update policies and create a generic ALL policy for profiles
  await client.query(`
    DROP POLICY IF EXISTS "Public profiles are visible by everyone" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Anyone can insert profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Anyone can manage profiles" ON public.profiles;
    
    CREATE POLICY "Anyone can manage profiles" 
    ON public.profiles 
    FOR ALL 
    USING (true) 
    WITH CHECK (true);
  `);

  console.log('Profiles RLS policy updated successfully!');
  await client.end();
}

main().catch(err => {
  console.error('Failed to update RLS policy:', err);
  process.exit(1);
});
