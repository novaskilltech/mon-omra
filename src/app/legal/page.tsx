'use client';

import Link from 'next/link';

export default function LegalPage() {
    return (
        <div className="min-h-screen p-8 md:p-24 selection:bg-amber-500/30">
            <div className="max-w-3xl mx-auto">
                <Link href="/" className="text-amber-600 dark:text-[#fbbf24] font-black uppercase tracking-widest text-[10px] mb-12 inline-block">← Retour à l'accueil</Link>

                <h1 className="text-5xl font-black uppercase tracking-tighter mb-12 text-main">Mentions <span className="text-amber-500 dark:text-[#fbbf24]">Légales</span></h1>

                <div className="space-y-12 text-sub leading-relaxed font-light">
                    <section>
                        <h2 className="text-xl font-black text-main mb-4 uppercase tracking-widest">1. Éditeur du Site</h2>
                        <p className="opacity-80">
                            Le site Mon Omra est édité par la société <strong className="font-black text-main">OMRAYANAIR LLC</strong>.<br />
                            Forme juridique : LLC (Limited Liability Company).<br />
                            Siège social : 123 Spirit Avenue, Suite 500, Dubai, UAE.<br />
                            Immatriculation : UAE-DIFC-2025-001.<br />
                            Directeur de la publication : Sarah Ben Ali.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-main mb-4 uppercase tracking-widest">2. Hébergement</h2>
                        <p className="opacity-80">
                            Le site est hébergé par <strong className="font-black text-main text-emerald-600 dark:text-emerald-400">Vercel Inc.</strong><br />
                            Adresse : 440 N Barranca Ave #4133 Covina, CA 91723.<br />
                            Site web : https://vercel.com
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-main mb-4 uppercase tracking-widest">3. Propriété Intellectuelle</h2>
                        <p className="opacity-80">
                            L'intégralité du site (textes, graphismes, logos, icônes, animations) est la propriété exclusive de OMRAYANAIR LLC.
                            Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site,
                            quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-main mb-4 uppercase tracking-widest">4. Responsabilité</h2>
                        <p className="opacity-80">
                            OMRAYANAIR LLC s'efforce de fournir sur le site des informations aussi précises que possible. Toutefois, elle ne pourra
                            être tenue responsable des omissions, des inexactitudes et des carences dans la mise à jour, qu'elles soient de son fait
                            ou du fait des tiers partenaires qui lui fournissent ces informations.
                        </p>
                    </section>
                </div>

                <footer className="mt-24 pt-12 border-t border-emerald-500/10 dark:border-white/5 text-[10px] uppercase tracking-widest text-dim font-black">
                    Dernière mise à jour : 12 Mars 2025
                </footer>
            </div>
        </div>
    );
}
