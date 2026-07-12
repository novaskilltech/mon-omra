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

const anonClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const adminClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  console.log('Running test flights query...');
  const userId = '3e319b07-d010-4478-8438-9cb3762efeb1'; // SUPER_ADMIN profile ID

  console.log('Using Admin Client (Service Role - bypasses RLS):');
  const { data: adminData, error: adminErr } = await adminClient
    .from('flights')
    .select(`
      *,
      flight_segments (*)
    `)
    .eq('agency_id', userId)
    .order('created_at', { ascending: false });

  if (adminErr) console.error('Admin Client Error:', adminErr);
  else console.log('Admin Client Success:', adminData);

  console.log('\nUsing Anon Client:');
  const { data: anonData, error: anonErr } = await anonClient
    .from('flights')
    .select(`
      *,
      flight_segments (*)
    `)
    .eq('agency_id', userId)
    .order('created_at', { ascending: false });

  if (anonErr) console.error('Anon Client Error:', anonErr);
  else console.log('Anon Client Success:', anonData);
}

main().catch(console.error);
