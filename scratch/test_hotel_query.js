const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.substring(1, value.length - 1);
    }
    env[key] = value;
  }
});

// Use the ANON key (which is used on client side)
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function main() {
  const pilgrimId = 'a22bcbd7-d55a-45bd-8ed0-b378b1373029'; // MAMOU KANTE
  
  // 1. Fetch pilgrim
  const { data: pilgrim, error: pError } = await supabase
    .from('pilgrims')
    .select('group_id, individual_hotel_info')
    .eq('id', pilgrimId)
    .single();

  if (pError) {
    console.error('Error fetching pilgrim:', pError);
    return;
  }

  console.log('Pilgrim data:', pilgrim);

  // 2. Fetch specific hotels
  const indHotels = pilgrim.individual_hotel_info;
  if (indHotels) {
    const hotelIds = [indHotels.makkah_hotel_id, indHotels.madinah_hotel_id].filter(Boolean);
    console.log('Querying hotel IDs:', hotelIds);
    
    const { data: specificHotels, error: hError } = await supabase
      .from('hotels')
      .select('*')
      .in('id', hotelIds);

    if (hError) {
      console.error('Error fetching specific hotels:', hError);
    } else {
      console.log('Specific hotels found:', specificHotels);
    }
  }

  // 3. Fetch group stays
  if (pilgrim.group_id) {
    const { data: groupStays, error: sError } = await supabase
      .from('group_hotel_stays')
      .select('*, hotels(*)')
      .eq('group_id', pilgrim.group_id);

    if (sError) {
      console.error('Error fetching group stays:', sError);
    } else {
      console.log('Group stays found:', groupStays);
    }
  }
}

main().catch(console.error);
