const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres.tqbcmcddnohnqmcxvgut:Khouribga111*@aws-0-eu-west-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log('Connected to database to create missing logistics tables...');
  
  // Enable gen_random_uuid() or uuid_generate_v4()
  await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

  console.log('Creating group_logistics table...');
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.group_logistics (
      group_id UUID PRIMARY KEY REFERENCES public.groups(id) ON DELETE CASCADE,
      flight_departure_id UUID REFERENCES public.flights(id) ON DELETE SET NULL,
      flight_return_id UUID REFERENCES public.flights(id) ON DELETE SET NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);

  console.log('Creating group_hotel_stays table...');
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.group_hotel_stays (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
      hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
      check_in TIMESTAMP WITH TIME ZONE NOT NULL,
      check_out TIMESTAMP WITH TIME ZONE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);

  // Enable RLS for both tables
  await client.query(`
    ALTER TABLE public.group_logistics ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.group_hotel_stays ENABLE ROW LEVEL SECURITY;
  `);

  // Add bypass/public read-write RLS policies
  await client.query(`
    DROP POLICY IF EXISTS "Public group_logistics access" ON public.group_logistics;
    CREATE POLICY "Public group_logistics access" ON public.group_logistics FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public group_hotel_stays access" ON public.group_hotel_stays;
    CREATE POLICY "Public group_hotel_stays access" ON public.group_hotel_stays FOR ALL USING (true) WITH CHECK (true);
  `);

  console.log('Logistics tables created successfully!');
  await client.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
