'use client';
import { Users, Plane, Hotel, LayoutDashboard, Settings, Bell, LogOut } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { logoutAdmin } from '@/lib/actions/auth';

export default function BackofficeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-main transition-colors duration-300">
            {/* Sidebar */}
            <aside className="w-64 border-r border-emerald-500/10 dark:border-white/5 bg-emerald-500/[0.02] dark:bg-[#050a08] p-6 hidden lg:block backdrop-blur-3xl">
                <div className="mb-12 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <Image src="/logo.png" alt="OMRAYANAIR Logo" width={28} height={28} className="rounded-lg object-contain" />
                        <span className="text-lg font-black tracking-tighter text-main uppercase">
                            OMRA<span className="text-amber-500">YANAIR</span>
                        </span>
                    </div>
                    <span className="text-[10px] text-dim tracking-widest uppercase font-black opacity-40">Back-Office</span>
                </div>

                <nav className="space-y-2">
                    {[
                        { icon: LayoutDashboard, label: 'Dashboard', href: '/backoffice' },
                        { icon: Users, label: 'Conciergerie', href: '/backoffice/concierge' },
                        { icon: Users, label: 'Groupes', href: '/backoffice/groups' },
                        { icon: Plane, label: 'Vols', href: '/backoffice/logistics/flights' },
                        { icon: Hotel, label: 'Hôtels', href: '/backoffice/logistics/hotels' },
                        { icon: Bell, label: 'Notifications', href: '/backoffice/notifications' },
                        { icon: Settings, label: 'Paramètres', href: '/backoffice/settings' },
                    ].map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-emerald-500/10 dark:hover:bg-white/5 transition-all text-dim hover:text-emerald-600 dark:hover:text-emerald-400 group"
                        >
                            <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                            <span className="text-sm font-black uppercase tracking-tight">{item.label}</span>
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1">
                <header className="h-20 border-b border-emerald-500/10 dark:border-white/5 glass px-8 flex items-center justify-between sticky top-0 z-40 shadow-sm">
                    <div className="text-[10px] uppercase font-black tracking-widest text-dim">
                        Agence : <span className="text-emerald-600 dark:text-emerald-500">OMRA-JET LLC</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <button 
                            onClick={() => logoutAdmin()}
                            className="p-3 hover:bg-red-500/5 dark:hover:bg-red-500/10 rounded-2xl transition-all border border-transparent hover:border-red-500/10 group"
                            title="Déconnexion"
                        >
                            <LogOut className="w-5 h-5 text-dim group-hover:text-red-500 transition-colors" />
                        </button>
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 dark:bg-white/10 border border-emerald-500/10 dark:border-white/5 flex items-center justify-center font-black text-emerald-600 dark:text-emerald-400 text-xs">
                            JD
                        </div>
                    </div>
                </header>
                <div className="h-[calc(100vh-5rem)] overflow-y-auto custom-scrollbar">
                    {children}
                </div>
            </main>
        </div>
    );
}
