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
  console.log("1. Fetching all groups...");
  const { data: groups } = await supabase.from('groups').select('id, name');
  console.log("Groups:", groups);

  console.log("\n2. Fetching all pilgrims...");
  const { data: profiles, error: pError } = await supabase
    .from('profiles')
    .select('id, full_name, role');
  if (pError) console.error("Profiles error:", pError);
  console.log("Profiles in DB:", profiles);

  const { data: pilgrims, error: pilgrimError } = await supabase
    .from('pilgrims')
    .select('*');
  if (pilgrimError) console.error("Pilgrims fetch error:", pilgrimError);
  console.log("Pilgrims in DB:", pilgrims);

  if (pilgrims && pilgrims.length > 0 && groups && groups.length > 0) {
    const firstPilgrim = pilgrims[0];
    const targetGroup = groups[0];
    console.log(`\n3. Trying to update pilgrim ${firstPilgrim.id} to group ${targetGroup.id} (${targetGroup.name})...`);
    
    const { data: updateData, error: updateError } = await supabase
      .from('pilgrims')
      .update({ group_id: targetGroup.id })
      .eq('id', firstPilgrim.id)
      .select();

    if (updateError) {
      console.error("Update failed:", updateError);
    } else {
      console.log("Update succeeded:", updateData);
    }
  }
}

main().catch(console.error);
