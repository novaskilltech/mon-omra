import { Compass, ShieldCheck, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import DocumentUpload from '@/components/documents/DocumentUpload';
import { createClient } from '@/utils/supabase/server';
import { resolvePilgrimIdByEmail } from '@/lib/actions/logistics';

export default async function DocumentsPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const pilgrimCookieId = cookies().get('pilgrim_id')?.value;

    const resolvedId = pilgrimCookieId || (user ? await resolvePilgrimIdByEmail(user.id, user.email || undefined) : undefined);

    // Fetch existing docs if any
    const { data: documents } = await supabase
        .from('user_documents')
        .select('*')
        .eq('user_id', resolvedId);

    const getDoc = (type: string) => documents?.find(d => d.type === type);

    const docConfigs = [
        {
            type: 'PASSPORT' as const,
            label: 'Passeport',
            description: 'Copie lisible de la page d\'identité. Le passeport doit être valide au moins 6 mois après votre retour.',
            existing: getDoc('PASSPORT')
        },
        {
            type: 'PHOTO' as const,
            label: 'Photo d\'identité',
            description: 'Photo récente sur fond blanc, format passeport (e-photo acceptée).',
            existing: getDoc('PHOTO')
        },
        {
            type: 'RESIDENCE_PERMIT' as const,
            label: 'Titre de Séjour',
            description: 'Uniquement pour les résidents non-européens. Copie recto-verso en cours de validité.',
            existing: getDoc('RESIDENCE_PERMIT')
        }
    ];

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

                <div className="grid gap-6">
                    {docConfigs.map((config, i) => (
                        <DocumentUpload 
                            key={i}
                            type={config.type}
                            label={config.label}
                            description={config.description}
                            existingDoc={config.existing}
                        />
                    ))}
                </div>

                {/* Safety Note */}
                <div className="glass p-8 rounded-[2.5rem] bg-emerald-500/[0.01] border-emerald-500/10 flex gap-6 items-center">
                    <div className="bg-emerald-500/10 p-4 rounded-3xl">
                        <ShieldCheck className="w-8 h-8 text-emerald-500" />
                    </div>
                    <div>
                        <h4 className="text-[11px] font-bold uppercase tracking-[0.1em] text-main mb-1">Sécurité de vos données</h4>
                        <p className="text-[12px] text-dim italic opacity-80 leading-relaxed">
                            Vos documents sont chiffrés et stockés sur des serveurs sécurisés. Seuls les agents habilités de l'agence peuvent les consulter.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
