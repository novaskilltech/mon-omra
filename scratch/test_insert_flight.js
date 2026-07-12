const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    env[match[1]] = (match[2] || '').replace(/['"]/g, '');
  }
});

const adminClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const userId = '3e319b07-d010-4478-8438-9cb3762efeb1'; // SUPER_ADMIN profile ID

  const flightData = {
    agency_id: userId,
    type: 'ALLER',
    segments: [
      {
        flight_number: 'A3617',
        airline: 'AEGEAN',
        departure_airport: 'CDG',
        arrival_airport: 'JED',
        departure_time: '2026-07-02T14:00:00Z',
        arrival_time: '2026-07-03T02:35:00Z'
      }
    ]
  };

  console.log('Inserting flight parent...');
  const { data: flight, error: flightError } = await adminClient
    .from('flights')
    .insert({
      agency_id: flightData.agency_id,
      type: flightData.type,
    })
    .select()
    .single();

  if (flightError) {
    console.error('Flight insert error:', flightError);
    return;
  }
  console.log('Flight inserted:', flight);

  console.log('Inserting flight segments...');
  const segments = flightData.segments.map((s, index) => ({
    flight_id: flight.id,
    flight_number: s.flight_number,
    airline: s.airline,
    departure_airport: s.departure_airport,
    arrival_airport: s.arrival_airport,
    departure_time: s.departure_time,
    arrival_time: s.arrival_time,
    sequence_order: index,
  }));

  const { data: insertedSegments, error: segmentsError } = await adminClient
    .from('flight_segments')
    .insert(segments)
    .select();

  if (segmentsError) {
    console.error('Segments insert error:', segmentsError);
    // Cleanup parent
    await adminClient.from('flights').delete().eq('id', flight.id);
    return;
  }
  console.log('Segments inserted:', insertedSegments);

  // Success cleanup to keep DB clean
  console.log('Cleaning up test data...');
  await adminClient.from('flights').delete().eq('id', flight.id);
  console.log('Test successful and database cleaned up.');
}

main().catch(console.error);
