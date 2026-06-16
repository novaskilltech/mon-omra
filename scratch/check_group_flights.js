const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log('--- group_logistics ---');
  const { data: logi, error: err1 } = await supabase
    .from('group_logistics')
    .select('*');
  console.log(logi || err1);

  console.log('--- group_hotel_stays ---');
  const { data: stays, error: err2 } = await supabase
    .from('group_hotel_stays')
    .select('*');
  console.log(stays || err2);

  console.log('--- flights & flight_segments ---');
  const { data: flights, error: err3 } = await supabase
    .from('flights')
    .select('*, flight_segments(*)');
  console.log(JSON.stringify(flights, null, 2) || err3);
}

run();
