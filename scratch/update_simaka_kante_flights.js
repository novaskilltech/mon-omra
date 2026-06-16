const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const pilgrimIds = [
  '75330326-4778-4064-be5b-a467fb20a566', // FATOUMATA KANTE -> to be renamed to FATOUMATA SIMAKA
  'a22bcbd7-d55a-45bd-8ed0-b378b1373029', // MAMOU KANTE
  '1007dc8a-3858-4a86-93d7-8448b13f3f13', // FOUNE KANTE
  '525c806e-8b64-4d39-b9be-f973e6f3141d'  // FATOUMATA NIAKATE
];

const flightInfo = {
  flights: [
    {
      airline: "AJet",
      flight_number: "VF012",
      departure_airport: "CDG",
      arrival_airport: "SAW",
      departure_time: "2026-07-02T12:35:00",
      arrival_time: "2026-07-02T17:10:00"
    },
    {
      airline: "AJet",
      flight_number: "VF189",
      departure_airport: "SAW",
      arrival_airport: "JED",
      departure_time: "2026-07-02T22:10:00",
      arrival_time: "2026-07-03T02:05:00"
    }
  ],
  baggage_policy: "Soute: 20kg | Cabine: 8kg | Sac: 4kg"
};

async function run() {
  console.log('1. Renaming FATOUMATA KANTE to FATOUMATA SIMAKA...');
  const { data: updatedProfile, error: renameError } = await supabase
    .from('profiles')
    .update({
      full_name: 'FATOUMATA SIMAKA',
      family_name: 'SIMAKA'
    })
    .eq('id', '75330326-4778-4064-be5b-a467fb20a566')
    .select();

  if (renameError) {
    console.error('Error renaming profile:', renameError);
  } else {
    console.log('Successfully renamed to FATOUMATA SIMAKA:', updatedProfile);
  }

  console.log('\n2. Updating flights and baggage policy for the 4 travelers...');
  for (const id of pilgrimIds) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', id)
      .single();

    console.log(`Updating flights for ${profile?.full_name || id}...`);
    
    const { error: updateError } = await supabase
      .from('pilgrims')
      .update({
        individual_flight_info: flightInfo
      })
      .eq('id', id);

    if (updateError) {
      console.error(`Error updating flights for ${id}:`, updateError);
    } else {
      console.log(`Successfully updated flights for ${profile?.full_name || id}`);
    }
  }
}

run();
