require('dotenv').config({ path: '.env.local' });

async function check() {
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/?apikey=${process.env.SUPABASE_SERVICE_ROLE_KEY}`;
    const res = await fetch(url);
    const schema = await res.json();
    if (schema.definitions && schema.definitions.assistance_requests) {
        console.log("assistance_requests properties:", schema.definitions.assistance_requests.properties);
    }
}

check();
