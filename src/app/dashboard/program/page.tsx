import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { getPilgrimProgram } from '@/lib/actions/logistics';
import ProgramClient from './_components/ProgramClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Mon Programme - Omrayanair',
  description: 'Suivez votre itinéraire spirituel et les activités planifiées jour par jour.',
};

export default async function PilgrimProgramPage() {
  const supabase = createClient();
  
  let resolvedId = 'demo-pilgrim-id';
  let userEmail: string | undefined = undefined;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    const pilgrimCookieId = cookies().get('pilgrim_id')?.value;
    
    resolvedId = pilgrimCookieId || user?.id || 'demo-pilgrim-id';
    userEmail = user?.email || undefined;
  } catch (err) {
    console.error("Error retrieving user session for program page:", err);
  }

  // Call the server action to get the dynamic itinerary and spiritual recommendations
  const program = await getPilgrimProgram(resolvedId, userEmail);

  return (
    <ProgramClient initialProgram={program as any} />
  );
}
