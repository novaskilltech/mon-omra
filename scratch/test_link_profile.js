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
  console.log('Testing updating a profile ID to see if ON UPDATE CASCADE is set...');
  
  // Get first pilgrim profile
  const { data: profiles, error: fetchErr } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('role', 'PILGRIM')
    .limit(1);

  if (fetchErr || !profiles || profiles.length === 0) {
    console.error('No pilgrim profile found:', fetchErr);
    process.exit(1);
  }

  const oldId = profiles[0].id;
  const tempId = '00000000-0000-0000-0000-' + Math.floor(100000000000 + Math.random() * 900000000000);
  console.log(`Attempting to update profile ID from ${oldId} to ${tempId}...`);

  const { data, error } = await supabase
    .from('profiles')
    .update({ id: tempId })
    .eq('id', oldId)
    .select();

  if (error) {
    console.error('Update failed:', error.message);
  } else {
    console.log('SUCCESS! Profile ID updated! Restoring old ID...');
    const { error: restoreError } = await supabase
      .from('profiles')
      .update({ id: oldId })
      .eq('id', tempId);
    if (restoreError) {
      console.error('Failed to restore old ID! Manual cleanup needed:', restoreError.message);
    } else {
      console.log('Old ID restored successfully.');
    }
  }
}

main().catch(console.error);
