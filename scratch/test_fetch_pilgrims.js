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
  const { data, error } = await supabase
    .from('profiles')
    .select(`
        *,
        pilgrims!inner(
            id,
            group_id,
            individual_flight_info,
            package_price,
            family_head_id,
            groups(name)
        )
    `)
    .eq('role', 'PILGRIM')
    .limit(1);

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Query result structural example:', JSON.stringify(data, null, 2));
  }
}

main().catch(console.error);
