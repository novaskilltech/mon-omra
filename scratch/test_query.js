const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tqbcmcddnohnqmcxvgut.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxYmNtY2Rkbm9obnFtY3h2Z3V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NzAyOTMsImV4cCI6MjA5MzE0NjI5M30.fLQ1NIk1sTV_vj87MOMWXVvEIuDfNVgynIjK9DSYzW0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const familyHeadId = '11bd4e31-a0e9-486f-898f-2b5ea17cf317';
    
    // Step 1: Query pilgrims table
    const { data: pilgrims, error: pilgrimError } = await supabase
        .from('pilgrims')
        .select('id, family_head_id, package_price')
        .or(`id.eq.${familyHeadId},family_head_id.eq.${familyHeadId}`);

    console.log("Pilgrims Error:", pilgrimError);
    console.log("Pilgrims length:", pilgrims ? pilgrims.length : 0);
    
    if (pilgrims && pilgrims.length > 0) {
        const pilgrimIds = pilgrims.map(p => p.id);
        
        // Step 2: Query profiles for these IDs
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, full_name, visa_status, checkin_done')
            .in('id', pilgrimIds);

        console.log("Profiles Error:", profilesError);
        console.log("Profiles length:", profiles ? profiles.length : 0);
        console.log("Profiles:", JSON.stringify(profiles, null, 2));
    }
}

main();
