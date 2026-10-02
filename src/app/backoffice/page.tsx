'use client';

import { useState, useEffect } from 'react';
import { Users, TrendingUp, Bell, Package, CheckCircle2, Plane, Hotel, Star, ShieldCheck, ArrowRight, Loader2, ShoppingBag } from 'lucide-react';
import FinanceSummary from './_components/FinanceSummary';
import DownloadReportButton from './_components/DownloadReportButton';
import Link from 'next/link';
import { getBackofficeDashboardStats } from '@/lib/actions/concierge';

const iconMap: { [key: string]: any } = {
    Users: Users,
    Star: Star,
    ShieldCheck: ShieldCheck,
    Bell: Bell,
};

export default function BackofficeDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const data = await getBackofficeDashboardStats();
                setStats(data);
            } catch (err) {
                console.error("Error loading dashboard data:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    // Real zero fallbacks (no fake mock data)
    const kpis = stats?.kpis?.map((k: any) => ({
        ...k,
        icon: iconMap[k.iconName] || Bell
    })) || [
        { label: 'Pèlerins Actifs', value: '0', trend: '0 inscrit', icon: Users, color: 'text-emerald-600 dark:text-emerald-400' },
        { label: 'Satisfaction', value: 'N/A', trend: 'Aucun avis', icon: Star, color: 'text-amber-600 dark:text-amber-400' },
        { label: 'Visas Validés', value: '0%', trend: '0/0', icon: ShieldCheck, color: 'text-blue-600 dark:text-blue-400' },
        { label: 'Alertes', value: '0', alert: false, icon: Bell, color: 'text-red-600 dark:text-red-400' },
    ];

    const logistics = stats?.logistics || [
        { label: 'Vols Assignés', val: 0, color: 'bg-blue-500' },
        { label: 'Rooming List', val: 0, color: 'bg-amber-500' },
        { label: 'Kits Départ', val: 0, color: 'bg-emerald-500' },
    ];

    const activities = stats?.activities || [];

    return (
        <div className="space-y-10 font-inter">
            {/* Welcome Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter text-main">Tableau de <span className="text-emerald-500">Bord</span></h1>
                    <p className="text-dim text-sm mt-1 italic">Synthèse des opérations spirituelles et financières.</p>
                </div>
                <div className="flex gap-2 items-center">
                    {loading && <Loader2 className="w-5 h-5 text-emerald-500 animate-spin mr-2" />}
                    <button className="px-6 py-3 bg-emerald-500 text-white dark:text-[#050a08] rounded-2xl font-black uppercase tracking-widest text-[10px] hover:shadow-lg hover:shadow-emerald-500/20 transition-all">
                        Exporter Rapport
                    </button>
                </div>
            </header>

            {/* Top Bento Row: KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="glass p-6 rounded-[2rem] border-emerald-500/5 animate-pulse space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10" />
                                <div className="h-5 w-14 bg-white/10 rounded-full" />
                            </div>
                            <div className="space-y-2">
                                <div className="h-3 w-24 bg-white/10 rounded-full" />
                                <div className="h-8 w-16 bg-white/10 rounded-xl" />
                            </div>
                        </div>
                    ))
                ) : (
                    kpis.map((k: any, i: number) => (
                        <div key={i} className="glass group p-6 rounded-[2rem] border-emerald-500/5 hover:border-emerald-500/20 transition-all cursor-default relative overflow-hidden hover-3d">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <k.icon className={`w-12 h-12 ${k.color.split(' ')[0]}`} />
                            </div>
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className={`p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 ${k.color}`}>
                                    <k.icon className="w-5 h-5" />
                                </div>
                                <span className={`text-[10px] font-black px-2 py-1 rounded-full border ${k.alert ? 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'}`}>
                                    {k.trend || '0'}
                                </span>
                            </div>
                            <p className="text-[10px] uppercase font-black tracking-[0.2em] text-dim mb-1">{k.label}</p>
                            <p className="text-3xl font-black tracking-tighter text-main">{k.value}</p>
                        </div>
                    ))
                )}
            </div>

            {/* Middle Bento Row: Finance & Logistics */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7">
                    <FinanceSummary data={stats?.finance} loading={loading} />
                </div>

                <div className="lg:col-span-5 glass p-8 rounded-[2.5rem] flex flex-col justify-between border-emerald-500/5 hover-3d">
                    <div>
                        <h3 className="text-lg font-black uppercase tracking-tighter mb-6 flex items-center gap-2 text-main">
                            <Plane className="w-5 h-5 text-emerald-500" />
                            État Logistique
                        </h3>
                        {loading ? (
                            <div className="space-y-6 animate-pulse">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between">
                                            <div className="h-3 w-28 bg-white/10 rounded-full" />
                                            <div className="h-3 w-8 bg-white/10 rounded-full" />
                                        </div>
                                        <div className="h-2 w-full bg-white/5 rounded-full" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {logistics.map((item: any, i: number) => (
                                    <div key={i}>
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                                            <span className="text-dim">{item.label}</span>
                                            <span className="text-main">{item.val}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-emerald-500/5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                                                style={{ width: `${item.val}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <Link href="/backoffice/logistics/flights" className="mt-8 flex items-center justify-between p-4 bg-emerald-500/5 rounded-2xl hover:bg-emerald-500/10 transition-all group">
                        <span className="text-[10px] font-black uppercase tracking-widest text-main">Gérer la logistique</span>
                        <ArrowRight className="w-4 h-4 text-emerald-500 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>

            {/* Bottom Grid: Activity & Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass p-8 rounded-[3rem] border-emerald-500/5 hover-3d">
                    <h3 className="text-xl font-black uppercase tracking-tighter mb-8 text-main">Flux d'activités</h3>
                    {loading ? (
                        <div className="space-y-6 animate-pulse">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex gap-4 items-center">
                                    <div className="w-[2px] h-12 bg-white/10" />
                                    <div className="space-y-2 flex-1">
                                        <div className="h-3 w-3/4 bg-white/10 rounded-full" />
                                        <div className="h-2 w-1/3 bg-white/5 rounded-full" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : activities.length === 0 ? (
                        <div className="py-8 text-center text-dim text-xs italic">
                            Aucune activité récente enregistrée pour le moment.
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {activities.map((a: any, i: number) => (
                                <div key={i} className="flex gap-4 group">
                                    <div className="w-[2px] bg-emerald-500/10 group-hover:bg-emerald-500/50 transition-colors py-8" />
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="text-sm font-bold text-main">{a.msg}</p>
                                            <span className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-500/5 text-dim font-black uppercase">{a.type}</span>
                                        </div>
                                        <p className="text-xs text-dim">{a.subgroup} • {a.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <Link
                        href="/backoffice/groups"
                        className="glass flex flex-col items-center justify-center gap-4 p-8 rounded-[2.5rem] hover:bg-emerald-500/5 group transition-all border-emerald-500/5 hover-3d"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Users className="w-6 h-6 text-emerald-500" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-main">Nouveau Groupe</span>
                    </Link>

                    <Link
                        href="/backoffice/notifications"
                        className="glass flex flex-col items-center justify-center gap-4 p-8 rounded-[2.5rem] hover:bg-emerald-500/5 group transition-all border-emerald-500/5 hover-3d"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Bell className="w-6 h-6 text-emerald-500" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-main">Broadcast</span>
                    </Link>

                    <DownloadReportButton stats={stats} />

                    <Link
                        href="/backoffice/shop"
                        className="glass flex flex-col items-center justify-center gap-4 p-8 rounded-[2.5rem] hover:bg-emerald-500/5 group transition-all border-emerald-500/5 hover-3d"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <ShoppingBag className="w-6 h-6 text-emerald-500" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-main">Gérer Boutique</span>
                    </Link>

                    <Link
                        href="/backoffice/settings"
                        className="glass flex flex-col items-center justify-center gap-4 p-8 rounded-[2.5rem] hover:bg-emerald-500/5 group transition-all border-emerald-500/5 hover-3d"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Star className="w-6 h-6 text-emerald-500" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-main">Config Agence</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
