import { Compass, Calendar, Hotel, Plane, FileText, AlertCircle, CheckCircle2, HelpCircle, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { getPilgrimDashboardData } from '@/lib/actions/logistics';
import Countdown from '@/components/Countdown';

const DownloadJournalButton = dynamic(
    () => import('../backoffice/groups/[id]/_components/DownloadJournalButton'),
    { ssr: false }
);

export default async function Dashboard() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const pilgrimCookieId = cookies().get('pilgrim_id')?.value;
    
    // Rapatriement des données réelles ou de démo via l'action
    const data = await getPilgrimDashboardData(pilgrimCookieId || user?.id || 'demo-pilgrim-id', user?.email || undefined);

    // Calcul du pourcentage de préparation pour l'UI
    const completedTasksCount = data.checklist.filter(item => item.ok).length;
    const completionPercentage = Math.round((completedTasksCount / data.checklist.length) * 100);

    return (
        <div className="min-h-screen">
            {/* Header */}
            <nav className="glass px-6 py-4 flex justify-between items-center sticky top-0 z-50 border-emerald-500/5">
                <div className="flex items-center gap-2.5">
                    <Image src="/logo.png" alt="OMRAYANAIR Logo" width={28} height={28} className="rounded-lg object-contain" />
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
                {/* Welcome Section */}
                <header className="py-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black mb-2 text-main uppercase tracking-tighter">Salam, {data.pilgrimName.split(' ')[0]} 👋</h1>
                        <p className="text-sub font-medium italic m-0">Compte à rebours avant le départ pour la Terre Sainte :</p>
                    </div>
                    <div className="bg-emerald-500/[0.02] p-4 rounded-[2rem] border border-emerald-500/10 shadow-inner flex justify-center md:justify-end">
                        <Countdown departureDateIso={data.departureDateIso} />
                    </div>
                </header>

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
                                <Link href="/dashboard/documents" className="glass py-4 px-8 rounded-2xl font-bold text-[11px] uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-500/10 transition-all text-main shadow-sm">
                                    Mes Documents
                                </Link>
                                <DownloadJournalButton groupName="Groupe Ramadan A" groupId="1" pilgrimName={data.pilgrimName} />
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
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[11px] font-bold uppercase tracking-widest">
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
                                <div className="bg-emerald-500/5 p-5 rounded-2xl border border-emerald-500/10 col-span-2 md:col-span-1">
                                    <p className="text-dim mb-1 opacity-70">Bagages Autorisés</p>
                                    <p className="text-emerald-500 font-black normal-case">{(data as any).baggage_policy || "2 x 23kg inclus"}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Preparation Checklist */}
                    <div className="glass p-8 rounded-[2.5rem] flex flex-col justify-between border-emerald-500/10 bg-emerald-500/[0.02] shadow-sm">
                        <div>
                            <h3 className="text-xs font-bold mb-6 flex items-center gap-2 uppercase tracking-[0.2em] text-main">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                Ma Préparation
                            </h3>
                            <div className="space-y-6">
                                {data.checklist.map((d: any, i: number) => (
                                    <div key={i} className="flex flex-col gap-2">
                                        <div className="flex justify-between items-center text-[11px] font-semibold uppercase tracking-tight">
                                            <span className="text-dim opacity-80">{d.label}</span>
                                            <span className={d.ok ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-amber-600 font-bold"}>{d.status}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full overflow-hidden border border-emerald-500/10">
                                            <div className={`h-full transition-all duration-1000 ${d.ok ? 'w-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'w-1/4 bg-amber-500'}`} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="mt-8 flex items-center gap-4 p-5 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-3xl border border-emerald-500/10 shadow-inner">
                            <div className="text-3xl font-black text-emerald-500 drop-shadow-sm">{completionPercentage}%</div>
                            <div className="text-[10px] font-bold uppercase tracking-widest leading-tight text-dim opacity-80">
                                {completionPercentage === 100 ? "Prêt pour le grand départ insha'Allah" : "Dossier en cours de finalisation"}
                            </div>
                        </div>
                    </div>
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
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Quick Links */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    {[
                        { icon: Hotel, title: "Hôtels", color: "text-blue-600 dark:text-blue-400", href: "/dashboard/hotels" },
                        { icon: Calendar, title: "Programme", color: "text-purple-600 dark:text-purple-400", href: "/dashboard/program" },
                        { icon: Compass, title: "Rites", color: "text-emerald-600 dark:text-emerald-500", href: "/dashboard/rites" },
                        { icon: HelpCircle, title: "Aide", color: "text-blue-600 dark:text-blue-500", href: "/dashboard/help" },
                        { icon: AlertCircle, title: "Urgence", color: "text-red-600 dark:text-red-500", href: "/dashboard/assistance" }
                    ].map((item, i) => (
                        <Link key={i} href={item.href} className="glass p-6 rounded-[2rem] hover:bg-emerald-500/5 transition-all text-center group border-emerald-500/5 shadow-sm">
                            <item.icon className={`w-8 h-8 mx-auto mb-3 ${item.color.split(' ')[0]} ${item.color.split(' ')[1]} group-hover:scale-110 transition-transform`} />
                            <span className="font-bold text-[10px] uppercase tracking-[0.1em] text-dim group-hover:text-main transition-colors">{item.title}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
