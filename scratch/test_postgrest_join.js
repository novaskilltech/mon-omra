const { createClient } = require('@supabase/supabase-js');

// Read env variables or connection config
const supabaseUrl = "https://tqbcmcddnohnqmcxvgut.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxYmNtY2Rkbm9obnFtY3h2Z3V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NzAyOTMsImV4cCI6MjA5MzE0NjI5M30.fLQ1NIk1sTV_vj87MOMWXVvEIuDfNVgynIjK9DSYzW0";

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, pilgrims!inner(group_id, individual_hotel_info)')
            .limit(2);
        
        console.log("Error:", error);
        console.log("Data sample:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }
}

main();
