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

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function main() {
  // Try to query some other tables or auth.users if possible
  // Wait, let's get the list of profiles first
  const { data: profiles } = await supabase.from('profiles').select('id');
  console.log('Profiles IDs:', profiles.map(p => p.id));

  // Let's try to insert a hotel with each ID until it succeeds
  for (const p of profiles) {
    console.log(`Trying profile ID ${p.id} as agency_id...`);
    const { data, error } = await supabase
      .from('hotels')
      .insert({
        name: 'Test Temp Hotel ' + Math.random(),
        city: 'MAKKAH',
        agency_id: p.id
      })
      .select();

    if (error) {
      console.log(`Failed for ${p.id}:`, error.message);
    } else {
      console.log(`SUCCESS! Inserted hotel using ${p.id} as agency_id.`);
      // Delete the temp hotel
      await supabase.from('hotels').delete().eq('id', data[0].id);
      break;
    }
  }
}

main().catch(console.error);
