const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log('Searching for salah.lamkhannet@gmail.com in the profiles table...');
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role')
    .eq('email', 'salah.lamkhannet@gmail.com');
    
  if (error) {
    console.error('Error querying profiles:', error);
    return;
  }
  
  if (profiles.length === 0) {
    console.log('No profiles found with this email.');
    return;
  }
  
  console.log(`Found ${profiles.length} profiles:`);
  for (const p of profiles) {
    console.log(`- ID: ${p.id}, Name: ${p.full_name}, Role: ${p.role}`);
    
    // Let's replace the email with null or a dummy email like 'pelerin@exemple.com'
    const newEmail = `pelerin.cleaned-${p.id.slice(0, 4)}@exemple.com`;
    console.log(`Updating email of ${p.full_name} to ${newEmail}...`);
    
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ email: newEmail })
      .eq('id', p.id);
      
    if (updateError) {
      console.error(`Error updating profile ${p.id}:`, updateError);
    } else {
      console.log(`Successfully updated profile ${p.id}`);
    }
  }
}

run();
