const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres.tqbcmcddnohnqmcxvgut:Khouribga111*@aws-0-eu-west-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log('Connected to database to run migrations...');

  // 1. Drop existing conflicting tables/views if necessary to avoid FK conflicts
  console.log('Dropping conflicting tables if any...');
  await client.query(`
    DROP TABLE IF EXISTS public.room_assignments CASCADE;
    DROP TABLE IF EXISTS public.group_activities CASCADE;
    DROP TABLE IF EXISTS public.group_hotel_stays CASCADE;
    DROP TABLE IF EXISTS public.group_logistics CASCADE;
    DROP TABLE IF EXISTS public.pilgrims CASCADE;
    DROP TABLE IF EXISTS public.groups CASCADE;
    DROP TABLE IF EXISTS public.profiles CASCADE;
  `);

  // 2. Create public.profiles table
  console.log('Creating public.profiles table...');
  await client.query(`
    CREATE TABLE public.profiles (
      id UUID PRIMARY KEY, -- References auth.users(id) or generated for mock
      email TEXT UNIQUE,
      full_name TEXT,
      family_name TEXT,
      gender VARCHAR(1) CHECK (gender IN ('M', 'F')),
      role VARCHAR(20) DEFAULT 'PILGRIM' CHECK (role IN ('PILGRIM', 'AGENCY_ADMIN', 'SUPER_ADMIN')),
      visa_status VARCHAR(20) DEFAULT 'PENDING' CHECK (visa_status IN ('PENDING', 'APPROVED', 'REJECTED')),
      visa_url TEXT,
      checkin_done BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
  `);

  // 3. Create public.groups table
  console.log('Creating public.groups table...');
  await client.query(`
    CREATE TABLE public.groups (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      agency_id UUID NOT NULL,
      name TEXT NOT NULL,
      departure_date DATE NOT NULL,
      status VARCHAR(20) DEFAULT 'En préparation' CHECK (status IN ('En préparation', 'Complet', 'Brouillon')),
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `);

  // 4. Create public.pilgrims table
  console.log('Creating public.pilgrims table...');
  await client.query(`
    CREATE TABLE public.pilgrims (
      id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
      group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL
    );
  `);

  // 5. Recreate dependencies (from rooming/logistics)
  console.log('Recreating rooming and logistics dependencies...');
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.room_assignments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      room_id UUID,
      pilgrim_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, 
      group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `);

  // 6. Create RLS bypass/rules if needed, enable RLS
  await client.query(`
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.pilgrims ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Public profiles are visible by everyone" ON public.profiles;
    CREATE POLICY "Public profiles are visible by everyone" ON public.profiles FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
    CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (true);

    DROP POLICY IF EXISTS "Agency can manage groups" ON public.groups;
    CREATE POLICY "Agency can manage groups" ON public.groups FOR ALL USING (true);

    DROP POLICY IF EXISTS "Agency can manage pilgrims" ON public.pilgrims;
    CREATE POLICY "Agency can manage pilgrims" ON public.pilgrims FOR ALL USING (true);
  `);

  console.log('Database migrated successfully!');
  await client.end();
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
