const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres.tqbcmcddnohnqmcxvgut:Khouribga111*@aws-0-eu-west-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log('Connected to database...');

  // 1. Check if pelerin-documents bucket exists in storage.buckets
  const { rows: buckets } = await client.query(`
    SELECT id, name, public FROM storage.buckets;
  `);
  console.log('Existing buckets:', buckets);

  const hasBucket = buckets.some(b => b.name === 'pelerin-documents');
  if (!hasBucket) {
    console.log('Creating pelerin-documents bucket...');
    await client.query(`
      INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
      VALUES ('pelerin-documents', 'pelerin-documents', false, 5242880, NULL)
      ON CONFLICT (id) DO NOTHING;
    `);
  }

  // 2. Re-create policies for user_documents to allow public access (controlled by server actions)
  console.log('Updating user_documents policies...');
  await client.query(`
    DROP POLICY IF EXISTS "Users can view their own documents" ON public.user_documents;
    DROP POLICY IF EXISTS "Users can insert their own documents" ON public.user_documents;
    DROP POLICY IF EXISTS "Users can delete their own documents" ON public.user_documents;

    CREATE POLICY "Allow select for user_documents" ON public.user_documents FOR SELECT USING (true);
    CREATE POLICY "Allow insert for user_documents" ON public.user_documents FOR INSERT WITH CHECK (true);
    CREATE POLICY "Allow delete for user_documents" ON public.user_documents FOR DELETE USING (true);
  `);

  // 3. Create policies for storage.objects for pelerin-documents bucket
  console.log('Updating storage.objects policies...');
  await client.query(`
    DROP POLICY IF EXISTS "Allow public access to pelerin-documents" ON storage.objects;
    DROP POLICY IF EXISTS "Allow select on pelerin-documents" ON storage.objects;
    DROP POLICY IF EXISTS "Allow insert on pelerin-documents" ON storage.objects;
    DROP POLICY IF EXISTS "Allow delete on pelerin-documents" ON storage.objects;
    
    CREATE POLICY "Allow select on pelerin-documents" ON storage.objects FOR SELECT USING (bucket_id = 'pelerin-documents');
    CREATE POLICY "Allow insert on pelerin-documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'pelerin-documents');
    CREATE POLICY "Allow delete on pelerin-documents" ON storage.objects FOR DELETE USING (bucket_id = 'pelerin-documents');
    CREATE POLICY "Allow update on pelerin-documents" ON storage.objects FOR UPDATE USING (bucket_id = 'pelerin-documents');
  `);

  console.log('Done!');
  await client.end();
}

main().catch(console.error);
