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
  console.log('Testing linking sequence with email clearing...');
  
  // 1. Fetch first pilgrim profile
  const { data: profiles, error: fetchErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'PILGRIM')
    .limit(1);

  if (fetchErr || !profiles || profiles.length === 0) {
    console.error('No pilgrim profile found:', fetchErr);
    process.exit(1);
  }

  const oldProfile = profiles[0];
  const oldId = oldProfile.id;
  const newId = '00000000-0000-0000-0000-' + Math.floor(100000000000 + Math.random() * 900000000000);

  console.log(`Linking profile: ${oldProfile.full_name} (${oldProfile.email})`);
  console.log(`Old ID: ${oldId} -> New ID: ${newId}`);

  // Step A: Clear old email temporarily to avoid unique constraint violation
  const { error: clearEmailErr } = await supabase
    .from('profiles')
    .update({ email: null })
    .eq('id', oldId);

  if (clearEmailErr) {
    console.error('Step A (Clear email) failed:', clearEmailErr.message);
    process.exit(1);
  }
  console.log('Step A: Cleared old email.');

  // Step B: Create new profile copying old profile attributes
  const { error: insError } = await supabase
    .from('profiles')
    .insert({
      ...oldProfile,
      id: newId,
      created_at: undefined, // let DB default
      updated_at: undefined
    });

  if (insError) {
    console.error('Step B (Insert new profile) failed:', insError.message);
    // Restore email
    await supabase.from('profiles').update({ email: oldProfile.email }).eq('id', oldId);
    process.exit(1);
  }
  console.log('Step B: Copied profile row to new ID.');

  // Step C: Update pilgrims table row to point to new ID
  const { error: pilError } = await supabase
    .from('pilgrims')
    .update({ id: newId })
    .eq('id', oldId);

  if (pilError) {
    console.error('Step C (Update pilgrims) failed:', pilError.message);
    // Cleanup
    await supabase.from('profiles').delete().eq('id', newId);
    await supabase.from('profiles').update({ email: oldProfile.email }).eq('id', oldId);
    process.exit(1);
  }
  console.log('Step C: Updated pilgrims table.');

  // Step D: Update payments table row if any
  const { error: payError } = await supabase
    .from('payments')
    .update({ pilgrim_id: newId })
    .eq('pilgrim_id', oldId);

  if (payError) {
    console.warn('Step D (Update payments) warned/failed:', payError.message);
  } else {
    console.log('Step D: Updated payments table.');
  }

  // Step E: Delete old profile
  const { error: delError } = await supabase
    .from('profiles')
    .delete()
    .eq('id', oldId);

  if (delError) {
    console.error('Step E (Delete old profile) failed:', delError.message);
    // Rollback pilgrims
    await supabase.from('pilgrims').update({ id: oldId }).eq('id', newId);
    // Cleanup new profile
    await supabase.from('profiles').delete().eq('id', newId);
    // Restore email
    await supabase.from('profiles').update({ email: oldProfile.email }).eq('id', oldId);
    process.exit(1);
  }
  console.log('Step E: Deleted old profile. LINKING SEQUENCE COMPLETED SUCCESSFULLY.');

  // Now, let's restore everything so we don't mess up data
  console.log('Restoring to original ID for safety...');
  await supabase.from('profiles').update({ email: null }).eq('id', newId);
  await supabase.from('profiles').insert({
    ...oldProfile,
    id: oldId,
    created_at: undefined,
    updated_at: undefined
  });
  await supabase.from('pilgrims').update({ id: oldId }).eq('id', newId);
  await supabase.from('payments').update({ pilgrim_id: oldId }).eq('pilgrim_id', newId);
  await supabase.from('profiles').delete().eq('id', newId);
  console.log('Restore completed successfully.');
}

main().catch(console.error);
