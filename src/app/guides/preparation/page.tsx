'use client';

import Link from 'next/link';
import { Luggage, CheckCircle2, Info, Plane } from 'lucide-react';

export default function PreparationGuide() {
    return (
        <div className="min-h-screen">
            {/* Hero */}
            <div className="h-[50vh] relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-emerald-500/10 dark:bg-emerald-500/10" />
                <div className="relative z-10 text-center px-6">
                    <Link href="/dashboard/help" className="text-emerald-600 dark:text-emerald-500 font-black uppercase tracking-widest text-[10px] mb-6 inline-block bg-white/50 dark:bg-transparent px-3 py-1 rounded-full border border-emerald-500/10 transition-all hover:scale-110">← Retour aux tutoriels</Link>
                    <h1 className="text-6xl font-black uppercase tracking-tighter mb-4 text-main">La Préparation <span className="text-emerald-500">Ultime</span></h1>
                    <p className="text-sub uppercase tracking-[0.3em] text-[10px] font-black opacity-60">Logistique, Bagages & Formalités</p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto py-24 px-6">
                <div className="prose prose-emerald max-w-none space-y-16">
                    <section className="glass p-8 md:p-12 rounded-[3.5rem] border-emerald-500/5 dark:border-white/5 shadow-xl">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                <Luggage className="w-6 h-6 text-emerald-500" />
                            </div>
                            <h2 className="text-3xl font-black uppercase tracking-tighter m-0 text-main">1. L'Art de faire son sac</h2>
                        </div>
                        <p className="text-lg text-sub leading-relaxed font-light mb-8">
                            Partir pour la Omra n'est pas un voyage comme les autres. C’est un périple où le superflu devient un fardeau.
                            La règle d'or : <strong className="font-black text-main text-emerald-600 dark:text-emerald-500">Léger pour l'aller, organisé pour le retour.</strong>
                        </p>
                        <div className="space-y-6">
                            <h3 className="text-main font-black uppercase tracking-widest text-xs m-0">Les Essentiels de l'Ihram</h3>
                            <p className="text-sub text-sm leading-relaxed font-medium opacity-80">
                                Pour vous messieurs, prévoyez au moins deux jeux de serviettes d'Ihram de haute qualité (coton absorbant).
                                N'oubliez pas une ceinture solide pour maintenir l'Ihram et ranger vos documents précieux.
                                Pour vous mesdames, privilégiez des vêtements amples, respirants et opaques. Le blanc n'est pas obligatoire,
                                mais le confort thermique est vital sous 40°C.
                            </p>
                        </div>
                    </section>

                    <section className="space-y-8">
                        <h2 className="text-4xl font-black uppercase tracking-tighter border-l-8 border-emerald-500 pl-8 text-main">2. Formalités & Visas</h2>
                        <p className="text-sub leading-relaxed font-medium">
                            Depuis 2024, le processus de visa a été simplifié avec l'E-Visa. Cependant, la vigilance reste de mise.
                            Assurez-vous que votre passeport a une validité d'au moins 6 mois à la date de retour.
                            Numérisez tous vos documents dans votre espace "Mon Omra". En cas de perte physique, votre Dashboard sera
                            votre bouée de sauvetage.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-blue-500/5 dark:bg-white/5 p-8 rounded-[2rem] border border-blue-500/10 dark:border-white/5 shadow-sm">
                                <Info className="w-8 h-8 text-blue-500 mb-4" />
                                <h4 className="font-black text-main mb-2 uppercase tracking-tighter">Conseil Expert</h4>
                                <p className="text-[11px] text-sub leading-relaxed font-medium opacity-70 italic">Téléchargez l'application officielle "Nusuk" avant votre départ pour réserver votre créneau à la Rawdah de Médine.</p>
                            </div>
                            <div className="bg-emerald-500/5 dark:bg-emerald-500/5 p-8 rounded-[2rem] border border-emerald-500/10 dark:border-emerald-500/10 shadow-sm">
                                <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-4" />
                                <h4 className="font-black text-emerald-600 dark:text-emerald-500 mb-2 uppercase tracking-tighter">Checklist Rapide</h4>
                                <p className="text-[11px] text-sub leading-relaxed font-medium opacity-70 uppercase tracking-widest leading-loose">Certificat de vaccination,<br />Assurance voyage active,<br />Contrat agence signé.</p>
                            </div>
                        </div>
                    </section>

                    <section className="glass p-8 md:p-12 rounded-[3.5rem] border-emerald-500/5 dark:border-white/5 shadow-xl">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                <Plane className="w-6 h-6 text-blue-500" />
                            </div>
                            <h2 className="text-3xl font-black uppercase tracking-tighter m-0 text-main">3. Le Départ : CDG vers JED</h2>
                        </div>
                        <p className="text-sub leading-relaxed font-medium opacity-80">
                            Le voyage dure environ 6h30 depuis Paris. Si vous voyagez avec Saudi Airlines, l'annonce du Miqat se fait
                            environ 30 minutes avant l'atterrissage. Soyez prêt. Nous recommandons de vous mettre en Ihram au départ
                            de Paris ou lors de l'escale pour éviter le stress dans les toilettes exigües de l'avion.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
