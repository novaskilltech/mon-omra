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
  const { data: testData, error } = await supabase
    .from('room_assignments')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching room_assignments:', error);
  } else {
    console.log('room_assignments columns/sample:', testData);
  }

  // Let's also check profiles of a group
  const { data: pilgrimsInGroup, error: pError } = await supabase
    .from('profiles')
    .select('*, pilgrims!inner(*)')
    .eq('pilgrims.group_id', 'dc0c9cda-c8a5-4eb2-afa9-83fc8afbe5c7');

  if (pError) {
    console.error('Error fetching group pilgrims:', pError);
  } else {
    console.log('Sample group pilgrims:', pilgrimsInGroup);
  }
}

main().catch(console.error);
