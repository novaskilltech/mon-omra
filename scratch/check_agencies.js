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
  const { data: agencies, error } = await supabase
    .from('agencies')
    .select('*');

  if (error) {
    console.error('Error fetching agencies:', error);
  } else {
    console.log('Agencies found:', agencies);
  }

  // Also query users/profiles
  const { data: profiles, error: pError } = await supabase
    .from('profiles')
    .select('id, full_name, role');
  if (pError) {
    console.error('Error fetching profiles:', pError);
  } else {
    console.log('Profiles found:', profiles);
  }
}

main().catch(console.error);
