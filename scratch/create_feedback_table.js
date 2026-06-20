const { Client } = require('pg');

const connectionString = "postgresql://postgres.tqbcmcddnohnqmcxvgut:Khouribga111*@aws-0-eu-west-1.pooler.supabase.com:6543/postgres";

async function main() {
    const client = new Client({ connectionString });
    await client.connect();

    try {
        console.log("=== CREATING PILGRIM FEEDBACKS TABLE ===");
        
        await client.query(`
            CREATE TABLE IF NOT EXISTS public.pilgrim_feedbacks (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                pilgrim_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
                group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL,
                flight_rating INT NOT NULL CHECK (flight_rating BETWEEN 1 AND 5),
                makkah_hotel_rating INT NOT NULL CHECK (makkah_hotel_rating BETWEEN 1 AND 5),
                madinah_hotel_rating INT NOT NULL CHECK (madinah_hotel_rating BETWEEN 1 AND 5),
                guide_rating INT NOT NULL CHECK (guide_rating BETWEEN 1 AND 5),
                overall_rating INT NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
                comment TEXT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
                CONSTRAINT unique_pilgrim_feedback UNIQUE (pilgrim_id)
            );
        `);
        console.log("Table pilgrim_feedbacks created or already exists.");

        // Enable RLS
        await client.query(`ALTER TABLE public.pilgrim_feedbacks ENABLE ROW LEVEL SECURITY;`).catch(err => console.log("RLS already enabled or error:", err.message));

        // Drop existing policies if any
        await client.query(`DROP POLICY IF EXISTS "Pilgrims can insert their own feedback" ON public.pilgrim_feedbacks;`).catch(() => {});
        await client.query(`DROP POLICY IF EXISTS "Pilgrims can view their own feedback" ON public.pilgrim_feedbacks;`).catch(() => {});
        await client.query(`DROP POLICY IF EXISTS "Admins can view all feedbacks" ON public.pilgrim_feedbacks;`).catch(() => {});

        // Create RLS Policies
        await client.query(`
            CREATE POLICY "Pilgrims can insert their own feedback"
            ON public.pilgrim_feedbacks FOR INSERT
            WITH CHECK (auth.uid() = pilgrim_id);
        `);

        await client.query(`
            CREATE POLICY "Pilgrims can view their own feedback"
            ON public.pilgrim_feedbacks FOR SELECT
            USING (auth.uid() = pilgrim_id);
        `);

        await client.query(`
            CREATE POLICY "Admins can view all feedbacks"
            ON public.pilgrim_feedbacks FOR SELECT
            USING (
                EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE id = auth.uid() AND role IN ('ADMIN', 'AGENT', 'ORGANIZER')
                )
            );
        `);
        
        console.log("RLS Policies configured successfully.");

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

main();
