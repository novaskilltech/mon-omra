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
  console.log('Testing inserting a profile with NULL email...');
  const fakeUserId = '00000000-0000-0000-0000-' + Math.floor(100000000000 + Math.random() * 900000000000);
  
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: fakeUserId,
      full_name: 'Test Pilgrim Null Email',
      family_name: 'Pilgrim',
      gender: 'M',
      role: 'PILGRIM',
      visa_status: 'PENDING',
      checkin_done: false,
      email: null // we test if null is allowed
    })
    .select();

  if (error) {
    console.error('Insert failed:', error);
  } else {
    console.log('Insert succeeded! Profile created:', data);
    
    // Clean up
    await supabase.from('profiles').delete().eq('id', fakeUserId);
    console.log('Cleaned up test profile');
  }
}

main().catch(console.error);
