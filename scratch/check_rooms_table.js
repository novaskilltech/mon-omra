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
  const { data: hotels, error: hError } = await supabase.from('hotels').select('*');
  console.log("Hotels:", hotels);

  const { data: rooms, error: rError } = await supabase.from('rooms').select('*').limit(5);
  console.log("Rooms sample:", rooms, rError);

  const { data: assignments, error: aError } = await supabase.from('room_assignments').select('*').limit(5);
  console.log("Assignments sample:", assignments, aError);
}

main().catch(console.error);
