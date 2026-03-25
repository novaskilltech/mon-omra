'use client';

import Link from 'next/link';
import { Compass, Heart, Sunrise, BookOpen } from 'lucide-react';

export default function SpiritualGuide() {
    return (
        <div className="min-h-screen">
            {/* Hero */}
            <div className="h-[50vh] relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-amber-500/10 dark:bg-amber-500/10" />
                <div className="relative z-10 text-center px-6">
                    <Link href="/dashboard/help" className="text-amber-600 dark:text-amber-500 font-black uppercase tracking-widest text-[10px] mb-6 inline-block bg-white/50 dark:bg-transparent px-3 py-1 rounded-full border border-amber-500/10 transition-all hover:scale-110">← Retour aux tutoriels</Link>
                    <h1 className="text-6xl font-black uppercase tracking-tighter mb-4 text-main">Le Voyage du <span className="text-amber-500 dark:text-[#fbbf24]">Cœur</span></h1>
                    <p className="text-sub uppercase tracking-[0.3em] text-[10px] font-black opacity-60">Spiritualité, Patience & Rites Profonds</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto py-24 px-6">
                <div className="prose prose-amber max-w-none space-y-16">
                    <section className="glass p-8 md:p-12 rounded-[3.5rem] border-amber-500/5 dark:border-white/5 shadow-xl">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                <Heart className="w-6 h-6 text-amber-500 dark:text-[#fbbf24]" />
                            </div>
                            <h2 className="text-3xl font-black uppercase tracking-tighter m-0 text-main">1. L'Intention (An-Niyyah)</h2>
                        </div>
                        <p className="text-lg text-sub leading-relaxed font-light mb-8">
                            La Omra ne commence pas à l'aéroport, elle commence dans le secret de votre cœur.
                            L'intention est le moteur de votre voyage. Sans elle, le pèlerinage n'est qu'un voyage touristique.
                        </p>
                        <p className="text-sub text-sm leading-relaxed font-medium opacity-80">
                            Demandez-vous : "Pourquoi je pars ?". Pour se rapprocher du Créateur, pour effacer ses péchés, pour changer de vie ?
                            Renouvelez cette intention chaque matin à La Mecque et Médine. C’est elle qui transformera la fatigue en récompense
                            et la chaleur en lumière.
                        </p>
                    </section>

                    <section className="space-y-8">
                        <h2 className="text-4xl font-black uppercase tracking-tighter border-l-8 border-amber-500 pl-8 text-main">2. La Psychologie du Pèlerin</h2>
                        <p className="text-sub leading-relaxed font-black uppercase tracking-widest text-xs opacity-60">
                            "Soyez patient avec les autres, car Allah est patient avec vous."
                        </p>
                        <p className="text-sub leading-relaxed font-medium opacity-80">
                            Vous allez rencontrer des milliers de personnes de cultures différentes. La foule peut être oppressante.
                            C’est ici que votre caractère est testé. Le prophète (psl) nous enseigne le <strong className="text-amber-600 dark:text-amber-400 font-black">Sabr (la patience)</strong>.
                            Ne vous énervez pas pour une file d'attente ou une bousculade. Considérez chaque difficulté comme un moyen
                            d'élever votre degré spirituel.
                        </p>
                    </section>

                    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="glass p-8 rounded-[2.5rem] border-amber-500/5 dark:border-white/5 hover:bg-amber-500/5 transition-all shadow-sm">
                            <Sunrise className="w-8 h-8 text-emerald-500 mb-6" />
                            <h4 className="font-black mb-4 uppercase tracking-widest text-[10px] text-main">Les Heures Bénies</h4>
                            <p className="text-[11px] text-sub leading-relaxed font-medium opacity-70 italic">Le moment le plus propice à l'invocation personnelle est le dernier tiers de la nuit, Face à la Kaaba, avant le Fajr.</p>
                        </div>
                        <div className="glass p-8 rounded-[2.5rem] border-blue-500/5 dark:border-white/5 hover:bg-blue-500/5 transition-all shadow-sm">
                            <BookOpen className="w-8 h-8 text-blue-500 mb-6" />
                            <h4 className="font-black mb-4 uppercase tracking-widest text-[10px] text-main">Médine la Lumineuse</h4>
                            <p className="text-[11px] text-sub leading-relaxed font-medium opacity-70 italic">Médine est le lieu du repos de l'âme. Profitez de ce temps pour étudier la vie du Prophète (psl) sur les lieux mêmes de son histoire.</p>
                        </div>
                    </section>

                    <section className="glass p-8 md:p-12 rounded-[3.5rem] border-amber-500/5 dark:border-white/5 bg-gradient-to-br from-amber-500/[0.05] to-transparent shadow-xl">
                        <h2 className="text-3xl font-black uppercase tracking-tighter mb-8 text-main">3. Le Retour : Garder la trace</h2>
                        <p className="text-sub leading-relaxed font-medium opacity-80">
                            La vraie Omra commence au retour. Comment maintenir cette ferveur ? Fixez-vous un seul petit changement
                            durable (une prière de plus, un meilleur comportement, une sadaqa régulière). Ne cherchez pas la perfection,
                            cherchez la constance.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
