require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function run() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Check group_logistics columns
    const { data: logData, error: logErr } = await supabase
        .from('group_logistics')
        .select('*')
        .limit(1);
    console.log("group_logistics row keys:", logData ? Object.keys(logData[0] || {}) : logErr);

    // Check groups columns
    const { data: grpData, error: grpErr } = await supabase
        .from('groups')
        .select('*')
        .limit(1);
    console.log("groups row keys:", grpData ? Object.keys(grpData[0] || {}) : grpErr);
}

run();
