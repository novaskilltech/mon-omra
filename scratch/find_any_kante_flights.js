const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data: pilgrims, error } = await supabase
    .from('pilgrims')
    .select('id, group_id, individual_flight_info');
    
  if (error) {
    console.error(error);
    return;
  }
  
  console.log(`Checking ${pilgrims.length} pilgrim records...`);
  for (const p of pilgrims) {
    if (p.individual_flight_info) {
      // Fetch profile name
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', p.id)
        .single();
        
      console.log(`Pilgrim ID: ${p.id}, Name: ${profile?.full_name || 'Unknown'}`);
      console.log(`Flight Info:`, JSON.stringify(p.individual_flight_info, null, 2));
    }
  }
}

run();
