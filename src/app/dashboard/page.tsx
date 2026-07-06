import { Compass, Calendar, Hotel, Plane, FileText, AlertCircle, CheckCircle2, HelpCircle, Users, Shield, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import nextDynamic from 'next/dynamic';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { getPilgrimDashboardData } from '@/lib/actions/logistics';
import { checkFeedbackStatus } from '@/lib/actions/feedback';
import Countdown from '@/components/Countdown';

export const dynamic = 'force-dynamic';

const DownloadJournalButton = nextDynamic(
    () => import('../backoffice/groups/[id]/_components/DownloadJournalButton'),
    { ssr: false }
);

const PermissionConsent = nextDynamic(
    () => import('./_components/PermissionConsent'),
    { ssr: false }
);

import { isAdminAuthenticated } from '@/lib/actions/auth';
import ChecklistEditor from './_components/ChecklistEditor';

export default async function Dashboard({ searchParams }: { searchParams: { pilgrimId?: string } }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const pilgrimCookieId = cookies().get('pilgrim_id')?.value;

    const isAdmin = await isAdminAuthenticated();
    const currentPilgrimId = pilgrimCookieId || user?.id || 'demo-pilgrim-id';

    let targetPilgrimId = currentPilgrimId;
    let isPreview = isAdmin && !!searchParams?.pilgrimId;
    let isFamilyPreview = false;

    // Check if logged in user is family head
    let isCurrentUserHead = false;
    if (currentPilgrimId && currentPilgrimId !== 'demo-pilgrim-id') {
        const { data: currentPilgrim } = await supabase
            .from('pilgrims')
            .select('id, family_head_id')
            .eq('id', currentPilgrimId)
            .maybeSingle();
        if (currentPilgrim && (!currentPilgrim.family_head_id || currentPilgrim.family_head_id === currentPilgrim.id)) {
            isCurrentUserHead = true;
        }
    }

    if (searchParams?.pilgrimId && !isAdmin) {
        // Authenticate family head check
        const { data: requestedPilgrim } = await supabase
            .from('pilgrims')
            .select('id, family_head_id')
            .eq('id', searchParams.pilgrimId)
            .maybeSingle();
            
        if (requestedPilgrim) {
            const requestedHeadId = requestedPilgrim.family_head_id || requestedPilgrim.id;

            // They must share the same family folder and the current logged-in user must be the head
            if (currentPilgrimId === requestedHeadId && isCurrentUserHead) {
                targetPilgrimId = searchParams.pilgrimId;
                isFamilyPreview = true;
            }
        }
    } else if (isPreview) {
        targetPilgrimId = searchParams.pilgrimId!;
    }
    
    // Rapatriement des données réelles ou de démo via l'action
    const data = await getPilgrimDashboardData(targetPilgrimId, (isPreview || isFamilyPreview) ? undefined : (user?.email || undefined));
    const feedbackStatus = await checkFeedbackStatus(targetPilgrimId, (isPreview || isFamilyPreview) ? undefined : (user?.email || undefined));

    // Calcul du pourcentage de préparation pour l'UI
    const completedTasksCount = data.checklist.filter(item => item.ok).length;
    const completionPercentage = Math.round((completedTasksCount / data.checklist.length) * 100);

    return (
        <div className="min-h-screen">
            {isPreview && (
                <div className="bg-amber-500/15 border-b border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-[0.2em] py-3.5 px-6 text-center flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    <span>Aperçu Administrateur : Vous visualisez le tableau de bord de {data.pilgrimName}</span>
                </div>
            )}
            {isFamilyPreview && (
                <div className="bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] py-3.5 px-6 text-center flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        <span>Espace Famille : Vous visualisez le dossier de {data.pilgrimName}</span>
                    </div>
                    <Link href="/dashboard" className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-lg text-[9px] font-black border border-emerald-500/20 uppercase tracking-widest transition-all">
                        Retour à mon dossier
                    </Link>
                </div>
            )}
            <PermissionConsent />
            {/* Header */}
            <nav className="glass px-6 py-4 flex justify-between items-center sticky top-0 z-50 border-emerald-500/5">
                <div className="flex items-center gap-2.5">
                    <Image src="/app-logo.png" alt="OMRAYANAIR Logo" width={28} height={28} className="rounded-lg object-contain" />
                    <div className="text-xl font-black tracking-tighter text-main uppercase">
                        OMRA<span className="text-emerald-500">YANAIR</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-bold text-emerald-600 dark:text-emerald-400">
                        {data.pilgrimName.charAt(0).toUpperCase()}
                    </div>
                </div>
            </nav>

            <div className="max-w-5xl mx-auto p-6 space-y-8">
                {/* Welcome Section Card matching user request screenshot */}
                <header className="relative overflow-hidden rounded-[2.5rem] border border-amber-500/20 glass p-8 md:p-12 text-center shadow-lg">
                    {/* Glowing gold arch shape framing the entire container */}
                    <div className="absolute inset-0 pointer-events-none opacity-40 z-0">
                        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full">
                            {/* Pointed Islamic Arch (Ogive) spanning from bottom-left to bottom-right */}
                            <path d="M 0,100 L 0,40 C 0,15 20,5 50,2 C 80,5 100,15 100,40 L 100,100" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" vectorEffect="non-scaling-stroke"/>
                            <path d="M 3,100 L 3,42 C 3,18 22,8 50,5 C 78,8 97,18 97,42 L 97,100" stroke="#D4AF37" strokeWidth="0.75" strokeDasharray="3 3" strokeLinecap="round" vectorEffect="non-scaling-stroke"/>
                        </svg>
                    </div>

                    <div className="relative z-10 flex flex-col items-center">
                        {/* Centered Kaaba logo */}
                        <div className="relative w-24 h-24 mb-4 rounded-3xl overflow-hidden bg-black/25 border border-amber-500/25 flex items-center justify-center p-3 shadow-inner">
                            <Image 
                                src="/app-logo.png" 
                                alt="Kaaba Logo" 
                                width={80} 
                                height={80} 
                                className="object-contain"
                            />
                        </div>

                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500/90 mb-1">
                            Je pars vers
                        </span>
                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white mb-6">
                            {data.arrivalCity} <span className="text-amber-500">{data.arrivalAirport}</span>
                        </h2>

                        <div className="w-full max-w-md mx-auto bg-black/35 backdrop-blur-md rounded-2xl border border-emerald-500/10 p-5 mt-2 shadow-lg">
                            <p className="text-[11px] font-black uppercase tracking-widest text-emerald-400/70 mb-3">
                                Salam, {data.pilgrimName.split(' ')[0]} • Départ dans
                            </p>
                            <Countdown departureDateIso={data.departureDateIso} />
                        </div>
                    </div>
                </header>

                {/* Feedback Invitation Banner */}
                {feedbackStatus && feedbackStatus.ready && !feedbackStatus.hasSubmitted && (
                    <div className="bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent p-6 rounded-[2rem] border border-emerald-500/20 shadow-md flex flex-col md:flex-row items-center justify-between gap-4 animate-pulse-subtle">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-500/20 rounded-full border border-emerald-500/30 text-emerald-500">
                                <Compass className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-main text-base">Votre Omra est terminée, donnez votre avis ! 🕋</h3>
                                <p className="text-dim text-[11px] font-medium leading-relaxed max-w-xl m-0">
                                    Aidez-nous à améliorer l'accompagnement des prochains pèlerins en évaluant vos vols, vos hébergements et le service des guides.
                                </p>
                            </div>
                        </div>
                        <Link href="/dashboard/feedback" className="w-full md:w-auto text-center bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-widest px-6 py-4 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-102">
                            Évaluer mon séjour
                        </Link>
                    </div>
                )}

                {/* Visa Availability Banner */}
                {(data as any).visaStatus === 'APPROVED' && (data as any).visaUrl && (
                    <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent p-6 rounded-[2rem] border border-emerald-500/10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-emerald-500">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-main text-base">Votre Visa Omra est disponible ! 🕋</h3>
                                <p className="text-dim text-[11px] font-medium leading-relaxed max-w-xl m-0">
                                    Votre visa a été approuvé et émis par les autorités. Vous pouvez le télécharger dès maintenant pour votre voyage.
                                </p>
                            </div>
                        </div>
                        <a 
                            href={(data as any).visaUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-full md:w-auto text-center bg-emerald-500 hover:bg-emerald-600 text-white dark:text-[#050605] font-black text-xs uppercase tracking-widest px-6 py-4 rounded-2xl shadow-lg shadow-emerald-500/10 transition-all hover:scale-102"
                        >
                            Télécharger mon Visa
                        </a>
                    </div>
                )}

                {/* Main Status Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Next Flight Card */}
                    <div className="md:col-span-2 glass p-8 rounded-[2.5rem] relative overflow-hidden group border-emerald-500/5 shadow-sm">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Plane className="w-24 h-24 rotate-45 text-emerald-500" />
                        </div>
                        <div className="relative z-10">
                            <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold tracking-[0.2em] px-3 py-1.5 rounded-full border border-emerald-500/10 mb-4 inline-block uppercase">
                                PROCHAIN VOL
                            </span>
                            <div className="flex flex-col sm:flex-row gap-4 mb-10">
                                <Link href={`/dashboard/documents?pilgrimId=${targetPilgrimId}`} className="glass py-4 px-8 rounded-2xl font-bold text-[11px] uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-500/10 transition-all text-main shadow-sm">
                                    Mes Documents
                                </Link>
                                <DownloadJournalButton groupName={data.groupName || "Groupe Ramadan A"} groupId={data.groupId || "1"} pilgrimName={data.pilgrimName} pilgrimId={targetPilgrimId} />
                            </div>
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <p className="text-4xl font-black text-main uppercase">{data.departureAirport}</p>
                                    <p className="text-dim text-[11px] uppercase tracking-[0.1em] font-semibold">{data.departureCity}</p>
                                </div>
                                <div className="flex-1 px-8 flex items-center gap-2">
                                    <div className="h-[2px] flex-1 bg-emerald-500/10 dark:bg-emerald-500/20 relative">
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 glass p-2 rounded-full border border-emerald-500/20 shadow-xl">
                                            <Plane className="w-3 h-3 text-emerald-500" />
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-4xl font-black text-main uppercase">{data.arrivalAirport}</p>
                                    <p className="text-dim text-[11px] uppercase tracking-[0.1em] font-semibold">{data.arrivalCity}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-[11px] font-bold uppercase tracking-widest">
                                <div className="bg-emerald-500/5 p-5 rounded-2xl border border-emerald-500/10">
                                    <p className="text-dim mb-1 opacity-70">Date de départ</p>
                                    <p className="text-main">{data.departureDate}</p>
                                </div>
                                <div className="bg-emerald-500/5 p-5 rounded-2xl border border-emerald-500/10">
                                    <p className="text-dim mb-1 opacity-70">Heure locale</p>
                                    <p className="text-main">{data.departureTime}</p>
                                </div>
                                <div className="bg-emerald-500/5 p-5 rounded-2xl border border-emerald-500/10">
                                    <p className="text-dim mb-1 opacity-70">Compagnie</p>
                                    <p className="text-main">{data.carrier}</p>
                                </div>
                                <div className="bg-emerald-500/5 p-5 rounded-2xl border border-emerald-500/10">
                                    <p className="text-dim mb-1 opacity-70">Référence (PNR)</p>
                                    <p className="text-main font-mono font-black text-emerald-500">{((data as any).pnr) || '-'}</p>
                                </div>
                                <div className="bg-emerald-500/5 p-5 rounded-2xl border border-emerald-500/10 col-span-2 md:col-span-1">
                                    <p className="text-dim mb-1 opacity-70">Bagages Autorisés</p>
                                    <p className="text-emerald-500 font-black normal-case">{(data as any).baggage_policy || "2 x 23kg inclus"}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Preparation Checklist */}
                    <ChecklistEditor initialChecklist={data.checklist} pilgrimId={targetPilgrimId} />
                </div>

                {/* Shop Teaser Banner */}
                <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-6 rounded-[2rem] border border-amber-500/10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 text-left">
                        <div className="p-3 bg-amber-500/10 rounded-full border border-amber-500/20 text-amber-500">
                            <ShoppingBag className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                            <span className="bg-amber-500/20 text-amber-400 text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-md border border-amber-500/20 mb-1.5 inline-block">
                                ÉDITION LIMITÉE & SOUVENIRS
                            </span>
                            <h3 className="font-bold text-main text-base uppercase">Boutique de Cadeaux & Miels d'Exception 🍯</h3>
                            <p className="text-dim text-[11px] font-medium leading-relaxed max-w-xl m-0 mt-1">
                                Une boutique de produits naturels et miels rares de Terre Sainte (Jujubier sauvage, huile de nigelle d'Éthiopie, henné de Médine) ouvrira très prochainement.
                            </p>
                        </div>
                    </div>
                    <span className="w-full md:w-auto text-center bg-amber-500/10 border border-amber-500/20 text-amber-500 font-bold text-[10px] uppercase tracking-widest px-6 py-3.5 rounded-2xl whitespace-nowrap">
                        Ouverture Bientôt
                    </span>
                </div>

                {/* Family Members Section */}
                {(data as any).familyMembers && (data as any).familyMembers.length > 0 && (
                    <section className="space-y-4">
                        <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3 text-main">
                            <Users className="w-6 h-6 text-emerald-500" />
                            Ma Famille / Co-voyageurs ({(data as any).familyMembers.length})
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {(data as any).familyMembers.map((member: any) => (
                                <div key={member.id} className="glass p-6 rounded-3xl border border-white/5 bg-white/[0.01] flex flex-col justify-between">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-bold text-emerald-500">
                                            {member.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-main text-sm line-clamp-1">{member.name}</h4>
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-dim">
                                                {member.is_head ? "Chef de Famille" : "Co-voyageur"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Checklist summary */}
                                    <div className="space-y-2.5 pt-2 border-t border-white/5">
                                        {[
                                            { label: "Visa", status: member.visa_status, ok: member.visa_ok },
                                            { label: "Paiement", status: member.payment_status, ok: member.payment_ok },
                                            { label: "Enregistrement", status: member.checkin_status, ok: member.checkin_ok }
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                                                <span className="text-dim">{item.label}</span>
                                                <span className={`px-2 py-0.5 rounded-md flex items-center gap-1 ${item.ok ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                                                    <span className={`w-1 h-1 rounded-full ${item.ok ? 'bg-emerald-400' : 'bg-amber-500'}`} />
                                                    {item.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Action to switch dashboard */}
                                    {isCurrentUserHead && (
                                        <div className="mt-4 pt-3 border-t border-white/5">
                                            {member.id === targetPilgrimId ? (
                                                <span className="w-full text-center block bg-emerald-500/10 text-emerald-500 border border-emerald-500/10 font-bold text-[9px] uppercase tracking-widest py-2.5 rounded-xl">
                                                    Dossier Actif
                                                </span>
                                            ) : (
                                                <Link 
                                                    href={`/dashboard?pilgrimId=${member.id}`}
                                                    className="w-full text-center block bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 font-bold text-[9px] uppercase tracking-widest py-2.5 rounded-xl transition-all"
                                                >
                                                    Accéder au dossier
                                                </Link>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Quick Links */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[
                        { icon: Hotel, title: "Hôtels", color: "text-blue-600 dark:text-blue-400", href: "/dashboard/hotels" },
                        { icon: Calendar, title: "Programme", color: "text-purple-600 dark:text-purple-400", href: "/dashboard/program" },
                        { icon: Compass, title: "Rites", color: "text-emerald-600 dark:text-emerald-500", href: "/dashboard/rites" },
                        { icon: Shield, title: "Badge ID", color: "text-amber-500 dark:text-amber-400", href: "/dashboard/badge" },
                        { icon: HelpCircle, title: "Aide", color: "text-blue-600 dark:text-blue-500", href: "/dashboard/help" },
                        { icon: AlertCircle, title: "Urgence", color: "text-red-600 dark:text-red-500", href: "/dashboard/assistance" }
                    ].map((item, i) => (
                        <Link key={i} href={item.href} className="glass p-6 rounded-[2rem] hover:bg-emerald-500/5 transition-all text-center group border-emerald-500/5 shadow-sm">
                            <item.icon className={`w-8 h-8 mx-auto mb-3 ${item.color.split(' ')[0]} ${item.color.split(' ')[1] || ''} group-hover:scale-110 transition-transform`} />
                            <span className="font-bold text-[10px] uppercase tracking-[0.1em] text-dim group-hover:text-main transition-colors">{item.title}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
