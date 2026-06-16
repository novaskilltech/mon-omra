const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log('Searching for family Kante...');
  
  // Fetch profiles matching Kante
  const { data: profiles, error: pError } = await supabase
    .from('profiles')
    .select('*')
    .or('full_name.ilike.%kante%,family_name.ilike.%kante%');
    
  if (pError) {
    console.error('Error profiles:', pError);
    return;
  }
  
  console.log(`Found ${profiles.length} profiles:`);
  for (const p of profiles) {
    console.log(`- ID: ${p.id}, Name: ${p.full_name}, Role: ${p.role}`);
    
    // Fetch pilgrim details
    const { data: pilgrim, error: pilgrimErr } = await supabase
      .from('pilgrims')
      .select('*')
      .eq('id', p.id)
      .maybeSingle();
      
    if (pilgrimErr) {
      console.error(`  Error pilgrim record for ${p.id}:`, pilgrimErr);
    } else if (pilgrim) {
      console.log(`  Group ID: ${pilgrim.group_id}`);
      console.log(`  Flight Info:`, JSON.stringify(pilgrim.individual_flight_info, null, 2));
      console.log(`  Hotel Info:`, JSON.stringify(pilgrim.individual_hotel_info, null, 2));
    } else {
      console.log('  No pilgrim record found');
    }
  }
}

run();
