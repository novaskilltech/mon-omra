'use client';

import Link from 'next/link';
import { ArrowLeft, Sparkles, Compass, Heart, Award, Shield } from 'lucide-react';
import ThemeSelector from '@/components/ThemeSelector';

export default function QuiSommesNousPage() {
    return (
        <main className="min-h-screen text-main bg-main selection:bg-emerald-500/30 font-inter pb-20 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[40%] bg-emerald-500/5 blur-[140px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[40%] bg-amber-500/5 blur-[140px] rounded-full pointer-events-none" />

            <div className="fixed bottom-6 right-6 z-50">
                <ThemeSelector />
            </div>

            <div className="max-w-4xl mx-auto px-6 pt-10 text-left">
                {/* Back Button */}
                <Link 
                    href="/" 
                    className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-dim hover:text-emerald-400 transition-colors mb-8 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Retour à l'accueil
                </Link>

                {/* Header */}
                <header className="space-y-4 mb-12">
                    <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase px-4 py-1.5 rounded-full tracking-[0.2em]">
                        <Sparkles className="w-3.5 h-3.5" />
                        Notre Vision & Engagement
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter leading-none">
                        Qui <span className="text-emerald-500">sommes-nous</span> ?
                    </h1>
                    <p className="text-sm text-dim leading-relaxed font-medium max-w-2xl">
                        OMRAYANAIR est né de la volonté de réinventer l'expérience du voyage spirituel. Nous fusionnons rigueur religieuse, logistique d'excellence et technologie moderne pour offrir à chaque pèlerin un voyage serein et connecté.
                    </p>
                </header>

                {/* Content */}
                <div className="space-y-12 text-sm text-dim/90 leading-relaxed font-medium">
                    <section className="space-y-4">
                        <h2 className="text-lg font-black uppercase tracking-wider text-main flex items-center gap-2">
                            <Compass className="w-5 h-5 text-emerald-400" />
                            Notre Mission
                        </h2>
                        <p>
                            Faciliter et sublimer l'accomplissement des rites de l'Omra et du Hajj. En tant que plateforme de conciergerie et de services numériques, nous accompagnons les pèlerins et les agences organisatrices pour éliminer toutes les frictions logistiques, administratives et de communication.
                        </p>
                    </section>

                    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="glass p-6 rounded-[2rem] border border-white/5 space-y-3">
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                                <Heart className="w-4 h-4" />
                            </div>
                            <h3 className="font-bold text-main uppercase text-xs">Spiritualité Connectée</h3>
                            <p className="text-xs text-dim">
                                Des outils adaptés (suivi en temps réel, guides des rites, assistance directe) pour se concentrer uniquement sur l'essentiel : sa foi.
                            </p>
                        </div>
                        <div className="glass p-6 rounded-[2rem] border border-white/5 space-y-3">
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                                <Award className="w-4 h-4" />
                            </div>
                            <h3 className="font-bold text-main uppercase text-xs">Rigueur & Qualité</h3>
                            <p className="text-xs text-dim">
                                Une sélection méticuleuse de nos hôtels partenaires, transporteurs et guides francophones certifiés sur place.
                            </p>
                        </div>
                        <div className="glass p-6 rounded-[2rem] border border-white/5 space-y-3">
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                                <Shield className="w-4 h-4" />
                            </div>
                            <h3 className="font-bold text-main uppercase text-xs">Transparence</h3>
                            <p className="text-xs text-dim">
                                Aucun frais caché, des tarifs calculés au plus juste selon le marché des vols et de l'hôtellerie en Arabie Saoudite.
                            </p>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-lg font-black uppercase tracking-wider text-main">Pour les Professionnels</h2>
                        <p>
                            OMRAYANAIR propose également sa technologie de conciergerie autonome sous forme de licence (SaaS) aux agences de voyages spécialisées désireuses de moderniser l'accompagnement de leurs groupes sur place. Contactez notre équipe commerciale pour une démonstration.
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}
