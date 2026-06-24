'use client';
import { useState } from 'react';
import { Users, Plane, Hotel, LayoutDashboard, Settings, Bell, LogOut, Menu, X, Star, Route } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { logoutAdmin } from '@/lib/actions/auth';

export default function BackofficeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-main transition-colors duration-300">
            {/* Sidebar Desktop */}
            <aside className="w-64 border-r border-emerald-500/10 dark:border-white/5 bg-emerald-500/[0.02] dark:bg-[#050a08] p-6 hidden lg:block backdrop-blur-3xl shrink-0">
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
                        { icon: Route, label: 'Transferts', href: '/backoffice/logistics/transfers' },
                        { icon: Star, label: 'Avis Pèlerins', href: '/backoffice/feedbacks' },
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

            {/* Sidebar Mobile Drawer */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 flex lg:hidden bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
                    <aside className="w-64 h-full bg-[#050a08] border-r border-white/5 p-6 flex flex-col justify-between animate-in slide-in-from-left duration-300">
                        <div>
                            <div className="mb-12 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Image src="/logo.png" alt="OMRAYANAIR Logo" width={28} height={28} className="rounded-lg object-contain" />
                                    <span className="text-lg font-black tracking-tighter text-main uppercase">
                                        OMRA<span className="text-amber-500">YANAIR</span>
                                    </span>
                                </div>
                                <button 
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 text-dim hover:text-main"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <nav className="space-y-2">
                                {[
                                    { icon: LayoutDashboard, label: 'Dashboard', href: '/backoffice' },
                                    { icon: Users, label: 'Conciergerie', href: '/backoffice/concierge' },
                                    { icon: Users, label: 'Groupes', href: '/backoffice/groups' },
                                    { icon: Plane, label: 'Vols', href: '/backoffice/logistics/flights' },
                                    { icon: Hotel, label: 'Hôtels', href: '/backoffice/logistics/hotels' },
                                    { icon: Route, label: 'Transferts', href: '/backoffice/logistics/transfers' },
                                    { icon: Star, label: 'Avis Pèlerins', href: '/backoffice/feedbacks' },
                                    { icon: Bell, label: 'Notifications', href: '/backoffice/notifications' },
                                    { icon: Settings, label: 'Paramètres', href: '/backoffice/settings' },
                                ].map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-white/5 transition-all text-dim hover:text-emerald-400 group"
                                    >
                                        <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                                        <span className="text-sm font-black uppercase tracking-tight">{item.label}</span>
                                    </Link>
                                ))}
                            </nav>
                        </div>
                        
                        <div className="pt-6 border-t border-white/5">
                            <button 
                                onClick={() => {
                                    logoutAdmin();
                                    setMobileMenuOpen(false);
                                }}
                                className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-red-500/10 text-red-500 transition-all font-bold text-xs uppercase tracking-widest"
                            >
                                <LogOut className="w-5 h-5" />
                                Déconnexion
                            </button>
                        </div>
                    </aside>
                    <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 overflow-x-hidden">
                <header className="h-20 border-b border-emerald-500/10 dark:border-white/5 glass px-8 flex items-center justify-between sticky top-0 z-40 shadow-sm">
                    <div className="flex items-center">
                        <button 
                            onClick={() => setMobileMenuOpen(true)}
                            className="p-2.5 mr-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-xl lg:hidden"
                        >
                            <Menu className="w-4 h-4" />
                        </button>
                        <div className="text-[10px] uppercase font-black tracking-widest text-dim">
                            Agence : <span className="text-emerald-600 dark:text-emerald-500">OMRA-JET LLC</span>
                        </div>
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
