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

const hotelsToSeed = [
  // Makkah
  { name: 'M Makkah by Millennium', city: 'MAKKAH' },
  { name: 'Abraj Al Misk', city: 'MAKKAH' },
  { name: 'Elaf Qinwan', city: 'MAKKAH' },
  { name: 'Voco Makkah', city: 'MAKKAH' },
  
  // Madinah
  { name: 'Zaha Taiba', city: 'MADINAH' },
  { name: 'Zaha Al Madina', city: 'MADINAH' },
  { name: 'Zaha Al Mounawara', city: 'MADINAH' }
];

async function main() {
  console.log('Seeding hotels table with official hotels (creating auth user if needed)...');

  // Let's try to sign in or sign up a dummy agency user to get a valid auth.users ID
  const email = 'agencyadminseed@gmail.com';
  const password = 'SuperSecurePassword123!';

  let userId;

  // Try signing up
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password
  });

  if (signUpError) {
    console.log('SignUp error (user might already exist):', signUpError.message);
    // Try signing in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (signInError) {
      console.error('SignIn error:', signInError.message);
      process.exit(1);
    } else {
      userId = signInData.user.id;
      console.log('Signed in successfully. User ID:', userId);
    }
  } else {
    userId = signUpData.user?.id;
    console.log('Signed up successfully. User ID:', userId);
  }

  if (!userId) {
    console.error('Failed to retrieve user ID');
    process.exit(1);
  }

  // Also make sure this user is present in profiles table as an admin or super admin
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (!existingProfile) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        full_name: 'Agency Admin',
        family_name: 'Admin',
        gender: 'M',
        role: 'SUPER_ADMIN',
        visa_status: 'APPROVED',
        checkin_done: false,
        email: email
      });
    if (profileError) {
      console.error('Error creating profile for admin:', profileError);
    } else {
      console.log('Profile created for agency admin');
    }
  }

  for (const hotel of hotelsToSeed) {
    // Check if hotel exists
    const { data: existing } = await supabase
      .from('hotels')
      .select('id')
      .eq('name', hotel.name)
      .eq('city', hotel.city)
      .maybeSingle();
      
    if (existing) {
      console.log(`Hotel "${hotel.name}" in ${hotel.city} already exists.`);
    } else {
      const { data: inserted, error } = await supabase
        .from('hotels')
        .insert({
          name: hotel.name,
          city: hotel.city,
          agency_id: userId
        })
        .select();
        
      if (error) {
        console.error(`Error inserting "${hotel.name}":`, error);
      } else {
        console.log(`Successfully inserted "${hotel.name}" in ${hotel.city}:`, inserted[0]?.id);
      }
    }
  }
}

main().catch(console.error);
