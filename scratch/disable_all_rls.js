const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres.tqbcmcddnohnqmcxvgut:Khouribga111*@aws-0-eu-west-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

const tables = [
  'agency_settings',
  'rooms',
  'room_assignments',
  'hotels',
  'user_documents',
  'ritual_progress',
  'group_activities',
  'notifications',
  'payments',
  'assistance_requests',
  'flights',
  'flight_segments',
  'group_logistics',
  'group_hotel_stays',
  'registration_requests',
  'profiles',
  'groups',
  'pilgrims'
];

async function main() {
  await client.connect();
  console.log('Connected to disable RLS on all tables...');

  for (const table of tables) {
    try {
      console.log(`Disabling RLS on table: ${table}...`);
      await client.query(`ALTER TABLE public.${table} DISABLE ROW LEVEL SECURITY;`);
    } catch (err) {
      console.error(`Failed to disable RLS on table: ${table}`, err.message);
    }
  }

  console.log('All Row Level Security policies have been bypassed/disabled successfully!');
  await client.end();
}

main().catch(err => {
  console.error('Error disabling RLS:', err);
  process.exit(1);
});
