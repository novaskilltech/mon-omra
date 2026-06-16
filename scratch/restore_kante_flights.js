const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const kanteIds = [
  '75330326-4778-4064-be5b-a467fb20a566', // FATOUMATA KANTE
  'a22bcbd7-d55a-45bd-8ed0-b378b1373029', // MAMOU KANTE
  '1007dc8a-3858-4a86-93d7-8448b13f3f13'  // FOUNE KANTE
];

const flightInfo = {
  flights: [
    {
      airline: "Turkish Airlines",
      flight_number: "TK1822",
      departure_airport: "CDG",
      arrival_airport: "IST",
      departure_time: "2026-07-15T11:40:00Z",
      arrival_time: "2026-07-15T16:15:00Z"
    },
    {
      airline: "Turkish Airlines",
      flight_number: "TK96",
      departure_airport: "IST",
      arrival_airport: "JED",
      departure_time: "2026-07-15T18:30:00Z",
      arrival_time: "2026-07-15T22:15:00Z"
    },
    {
      airline: "Turkish Airlines",
      flight_number: "TK97",
      departure_airport: "JED",
      arrival_airport: "IST",
      departure_time: "2026-07-28T06:40:00Z",
      arrival_time: "2026-07-28T10:25:00Z"
    },
    {
      airline: "Turkish Airlines",
      flight_number: "TK1827",
      departure_airport: "IST",
      arrival_airport: "CDG",
      departure_time: "2026-07-28T13:00:00Z",
      arrival_time: "2026-07-28T15:45:00Z"
    }
  ],
  baggage_policy: "Soute: 20kg | Cabine: 8kg | Sac: 3kg"
};

async function run() {
  console.log('Restoring flights for Kante family members...');
  
  for (const id of kanteIds) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', id)
      .single();
      
    console.log(`Updating ${profile?.full_name || id}...`);
    
    const { error } = await supabase
      .from('pilgrims')
      .update({
        individual_flight_info: flightInfo
      })
      .eq('id', id);
      
    if (error) {
      console.error(`Error updating ${id}:`, error);
    } else {
      console.log(`Successfully restored flights for ${profile?.full_name || id}`);
    }
  }
}

run();
