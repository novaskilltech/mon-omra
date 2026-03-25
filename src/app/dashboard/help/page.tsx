'use client';

import { Play, FileText, CheckCircle2, Info, ChevronRight, HelpCircle, Smartphone, Luggage, Waves } from 'lucide-react';
import Link from 'next/link';

export default function TutorialsPage() {
    const tutorials = [
        {
            id: 1,
            title: "Enregistrement en ligne",
            duration: "3:45",
            desc: "Comment effectuer votre check-in sur le site de la compagnie aérienne pas-à-pas.",
            icon: Smartphone,
            color: "text-blue-600 dark:text-blue-400",
            bg: "bg-blue-500/10"
        },
        {
            id: 2,
            title: "Gestion des Bagages",
            duration: "2:15",
            desc: "Comprendre les franchises bagages, les liquides et les objets interdits en cabine.",
            icon: Luggage,
            color: "text-amber-600 dark:text-amber-400",
            bg: "bg-amber-500/10"
        },
        {
            id: 3,
            title: "Récupérer Zamzam",
            duration: "1:50",
            desc: "La procédure officielle à l'aéroport de Jeddah pour l'achat et l'enregistrement de l'eau Zamzam.",
            icon: Waves,
            color: "text-emerald-600 dark:text-emerald-500",
            bg: "bg-emerald-500/10"
        },
        {
            id: 4,
            title: "Utilisation de l'App",
            duration: "4:20",
            desc: "Découvez toutes les fonctionnalités de votre compagnon Mon Omra.",
            icon: CheckCircle2,
            color: "text-purple-600 dark:text-purple-400",
            bg: "bg-purple-500/10"
        }
    ];

    return (
        <div className="min-h-screen p-6 animate-in fade-in duration-500">
            <header className="mb-12">
                <Link href="/dashboard" className="text-dim text-[10px] font-black uppercase tracking-widest hover:text-emerald-500 transition-colors mb-4 inline-block">
                    ← Retour au Dashboard
                </Link>
                <h1 className="text-4xl font-black uppercase tracking-tighter text-main">Centre d'<span className="text-blue-500">Aide</span></h1>
                <p className="text-sub text-sm mt-1">Tutoriels et guides pratiques pour un voyage serein.</p>
            </header>

            {/* Hero Tutorial */}
            <div className="glass p-1 rounded-[3rem] border-emerald-500/5 mb-12 overflow-hidden bg-gradient-to-br from-emerald-500/5 to-transparent">
                <div className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-10">
                    <div className="w-full md:w-1/2 aspect-video bg-emerald-500/[0.03] dark:bg-black/40 rounded-[2rem] border border-emerald-500/10 flex items-center justify-center group cursor-pointer relative overflow-hidden shadow-inner">
                        <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform relative z-10">
                            <Play className="w-8 h-8 text-white dark:text-[#050a08] fill-current ml-1" />
                        </div>
                    </div>
                    <div className="w-full md:w-1/2">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-4 block">Vidéo à la une</span>
                        <h2 className="text-3xl font-black uppercase tracking-tighter mb-4 leading-none text-main uppercase">Guide Complet de votre Voyage</h2>
                        <p className="text-sub text-sm leading-relaxed mb-8 font-light italic pr-4">
                            Une présentation de 10 minutes couvrant le départ, l'arrivée, les transferts et les conseils de sécurité essentiels pour votre Omra 2025.
                        </p>
                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-main">
                            <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-emerald-500" /> 12 Pages PDF</span>
                            <span className="flex items-center gap-2 text-dim">|</span>
                            <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-500">Regarder maintenant</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Dossiers */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                {[
                    { title: "La Préparation Ultime", category: "Logistique", href: "/guides/preparation", icon: Luggage, color: "text-emerald-500" },
                    { title: "Le Voyage du Cœur", category: "Spiritualité", href: "/guides/spiritualite", icon: CheckCircle2, color: "text-[#d97706] dark:text-[#fbbf24]" },
                    { title: "Vivre sur Place", category: "Santé & Astuces", href: "/guides/sante-securite", icon: Info, color: "text-blue-500" },
                ].map((d, i) => (
                    <Link key={i} href={d.href} className="glass p-8 rounded-[2.5rem] border-emerald-500/5 hover:bg-emerald-500/5 transition-all group shadow-sm">
                        <d.icon className={`w-10 h-10 ${d.color} mb-6 group-hover:scale-110 transition-transform`} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-dim mb-2 block">{d.category}</span>
                        <h3 className="text-xl font-black uppercase tracking-tighter leading-tight text-main">{d.title}</h3>
                        <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-[#fbbf24]">
                            Lire le dossier <ChevronRight className="w-3 h-3" />
                        </div>
                    </Link>
                ))}
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-black uppercase tracking-tighter ml-4 flex items-center gap-2 text-main">
                    <HelpCircle className="w-5 h-5 text-blue-500" />
                    Tutoriels Vidéo
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tutorials.map((t) => (
                        <div key={t.id} className="glass p-6 rounded-[2.5rem] border-emerald-500/5 flex items-center gap-6 group hover:border-emerald-500/10 transition-all shadow-sm">
                            <div className={`w-16 h-16 rounded-[1.5rem] ${t.bg} ${t.color.split(' ')[0]} ${t.color.split(' ')[1]} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                                <t.icon className="w-8 h-8" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-black text-main uppercase tracking-tighter text-base">{t.title}</h4>
                                    <span className="text-[10px] font-black text-dim">{t.duration}</span>
                                </div>
                                <p className="text-xs text-sub leading-relaxed pr-4 line-clamp-2 font-light">{t.desc}</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-dim group-hover:text-main transition-colors" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Support Footer */}
            <div className="mt-16 p-8 bg-emerald-500/5 rounded-[2.5rem] border border-emerald-500/10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-inner">
                <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/10">
                        <HelpCircle className="w-8 h-8 text-blue-500" />
                    </div>
                    <div>
                        <h4 className="font-black text-main uppercase tracking-tighter">Besoin d'aide ?</h4>
                        <p className="text-xs text-sub font-light">Notre équipe support est disponible 24/7 pour vos questions non-critiques.</p>
                    </div>
                </div>
                <button className="px-8 py-4 bg-emerald-500/5 dark:bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-main hover:bg-emerald-500/10 transition-all border border-emerald-500/10">
                    Ouvrir la FAQ complète
                </button>
            </div>
        </div>
    );
}
