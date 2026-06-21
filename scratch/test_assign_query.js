const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://tqbcmcddnohnqmcxvgut.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxYmNtY2Rkbm9obnFtY3h2Z3V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NzAyOTMsImV4cCI6MjA5MzE0NjI5M30.fLQ1NIk1sTV_vj87MOMWXVvEIuDfNVgynIjK9DSYzW0";

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const roomId = 'de1fc4d3-de9c-4c23-8888-a0a54e36643c'; // One of the Zaha Taiba rooms from database query
    try {
        const { data: room, error: rError } = await supabase
            .from('rooms')
            .select(`
                *,
                room_assignments (
                    pilgrim_id,
                    profiles (*)
                )
            `)
            .eq('id', roomId)
            .single();

        console.log("rError:", rError);
        console.log("room data:", room);
    } catch (e) {
        console.error(e);
    }
}

main();
