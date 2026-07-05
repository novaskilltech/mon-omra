import { Compass, ShieldCheck, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { resolvePilgrimIdByEmail } from '@/lib/actions/logistics';
import DocumentsClient from './_components/DocumentsClient';

export const dynamic = 'force-dynamic';

export default async function DocumentsPage({ searchParams }: { searchParams: { pilgrimId?: string } }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const pilgrimCookieId = cookies().get('pilgrim_id')?.value;

    const resolvedId = pilgrimCookieId || (user ? await resolvePilgrimIdByEmail(user.id, user.email || undefined) : undefined);

    if (!resolvedId) {
        redirect('/login');
    }

    // 1. Fetch pilgrim to find family head
    const { data: pilgrim } = await supabase
        .from('pilgrims')
        .select('family_head_id')
        .eq('id', resolvedId)
        .single();

    const familyHeadId = pilgrim?.family_head_id || resolvedId;

    // 2. Fetch all pilgrims in the same family folder
    const { data: rawPilgrims } = await supabase
        .from('pilgrims')
        .select('id')
        .or(`id.eq.${familyHeadId},family_head_id.eq.${familyHeadId}`);

    const pilgrimIds = rawPilgrims?.map(p => p.id) || [resolvedId];

    // 3. Fetch profiles for all family members
    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', pilgrimIds);

    // 4. Fetch all documents for all family members
    const { data: allDocuments } = await supabase
        .from('user_documents')
        .select('*')
        .in('user_id', pilgrimIds);

    const { getDocumentUrl } = await import('@/lib/actions/documents');
    const docsWithUrls = await Promise.all((allDocuments || []).map(async (doc: any) => {
        if (doc.type === 'INVOICE') {
            const signedUrl = await getDocumentUrl(doc.storage_path);
            return { ...doc, url: signedUrl };
        }
        return doc;
    }));

    // 5. Construct travelers array (sorted: self first)
    const travelers = (profiles || [])
        .map(p => ({
            id: p.id,
            name: p.id === resolvedId ? `${p.full_name} (Vous)` : p.full_name || 'Co-voyageur',
            documents: docsWithUrls.filter((d: any) => d.user_id === p.id)
        }))
        .sort((a, b) => {
            if (a.id === resolvedId) return -1;
            if (b.id === resolvedId) return 1;
            return 0;
        });

    return (
        <div className="min-h-screen pb-12">
            {/* Header */}
            <nav className="glass px-6 py-4 flex items-center gap-4 sticky top-0 z-50 border-emerald-500/5">
                <Link href="/dashboard" className="p-2 hover:bg-emerald-500/10 rounded-full transition-colors">
                    <ChevronLeft className="w-6 h-6 text-main" />
                </Link>
                <div className="text-xl font-bold tracking-tighter text-main">
                    MES <span className="text-emerald-500">DOCUMENTS</span>
                </div>
            </nav>

            <div className="max-w-3xl mx-auto p-6 space-y-8">
                <header className="py-6 border-b border-emerald-500/5">
                    <h1 className="text-3xl font-bold mb-2 text-main uppercase tracking-tighter">Votre Dossier</h1>
                    <p className="text-sub italic font-medium">
                        Veuillez charger ces documents pour permettre l'émission de votre visa et l'organisation de votre voyage.
                    </p>
                </header>

                <DocumentsClient travelers={travelers} initialActiveTab={searchParams?.pilgrimId || resolvedId} />
            </div>
        </div>
    );
}
