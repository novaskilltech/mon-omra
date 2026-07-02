import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { getPilgrimBadgeData } from '@/lib/actions/logistics';
import BadgeClient from './_components/BadgeClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Mon Badge Pèlerin - Omrayanair',
  description: 'Générez et imprimez votre pass d\'identité et d\'assistance pèlerin.',
};

export default async function PilgrimBadgePage() {
  const supabase = createClient();
  let resolvedId = 'demo-pilgrim-id';
  let userEmail: string | undefined = undefined;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    const pilgrimCookieId = cookies().get('pilgrim_id')?.value;
    
    resolvedId = pilgrimCookieId || user?.id || 'demo-pilgrim-id';
    userEmail = user?.email || undefined;
  } catch (err) {
    console.error("Error retrieving user session for badge page:", err);
  }

  const result = await getPilgrimBadgeData(resolvedId, userEmail);
  const badge = result.badge || {
    fullName: "Salah Lamkhannet",
    phone: "+33 6 12 34 56 78",
    groupName: "Ramadan A",
    makkahHotel: "Hilton Convention Makkah",
    madinahHotel: "Pullman Zamzam Madinah",
    departureDate: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
    returnDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
    photoUrl: null
  };

  return (
    <BadgeClient badge={badge} />
  );
}
