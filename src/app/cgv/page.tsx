'use client';

import Link from 'next/link';
import { ArrowLeft, Sparkles, Scale, FileText } from 'lucide-react';
import ThemeSelector from '@/components/ThemeSelector';

export default function CGVPage() {
    return (
        <main className="min-h-screen text-main bg-main selection:bg-[#D8AA4D]/30 font-inter pb-20 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[40%] bg-[#D8AA4D]/5 blur-[140px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[40%] bg-emerald-500/5 blur-[140px] rounded-full pointer-events-none" />

            <div className="fixed bottom-6 right-6 z-50">
                <ThemeSelector />
            </div>

            <div className="max-w-4xl mx-auto px-6 pt-10 text-left">
                {/* Back Button */}
                <Link 
                    href="/" 
                    className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-dim hover:text-amber-500 transition-colors mb-8 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Retour à l'accueil
                </Link>

                {/* Header */}
                <header className="space-y-4 mb-12">
                    <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-black uppercase px-4 py-1.5 rounded-full tracking-[0.2em]">
                        <Scale className="w-3.5 h-3.5" />
                        Cadre Juridique
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter leading-none">
                        Conditions <span className="text-amber-500">Générales</span> de Vente
                    </h1>
                    <p className="text-xs text-dim leading-relaxed font-bold uppercase tracking-wider">
                        Dernière mise à jour : 17 août 2026
                    </p>
                </header>

                {/* Content */}
                <div className="space-y-8 text-xs sm:text-sm text-dim/95 leading-relaxed font-medium">
                    <section className="space-y-3">
                        <h2 className="text-base font-black uppercase tracking-wider text-main flex items-center gap-2">
                            <FileText className="w-4.5 h-4.5 text-amber-500" />
                            1. Objet des prestations
                        </h2>
                        <p>
                            Les présentes Conditions Générales de Vente (CGV) régissent l'utilisation de la plateforme numérique de conciergerie spirituelle OMRAYANAIR ainsi que l'ensemble des services d'assistance et d'accompagnement logistique et numérique proposés sur celle-ci.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-base font-black uppercase tracking-wider text-main">2. Réservation & Devis</h2>
                        <p>
                            Toute demande d'inscription formulée via notre site internet constitue une demande de renseignements. Les tarifs des billets d'avion étant sujets à des fluctuations quotidiennes en temps réel, le prix définitif du séjour ne sera figé et validé qu'au moment de l'émission officielle du devis final et de la signature du contrat individuel de voyage.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-base font-black uppercase tracking-wider text-main">3. Conditions Financières & Modalités</h2>
                        <p>
                            Les règlements s'effectuent selon les modalités précisées sur le devis (acompte à la commande, solde avant le départ). Les prix indiqués sur notre site internet sont exprimés en Euros (€) Toutes Taxes Comprises (TTC). Les modes de paiement acceptés comprennent le virement bancaire et le paiement sécurisé via nos partenaires bancaires agréés.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-base font-black uppercase tracking-wider text-main">4. Rétractation & Annulation</h2>
                        <p>
                            Compte tenu de la nature des prestations (réservations de vols nominatifs fermes et hébergements hôteliers en Arabie Saoudite), le droit de rétractation légal ne s'applique pas aux contrats de vente de prestations de voyage conformément aux dispositions du Code de la Consommation. Les conditions d'annulation ou de modification du fait du client sont détaillées dans le contrat individuel.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-base font-black uppercase tracking-wider text-main">5. Responsabilité & Assurances</h2>
                        <p>
                            OMRAYANAIR met en œuvre tous ses moyens pour assurer la bonne exécution des prestations logistiques. Toutefois, notre responsabilité ne saurait être engagée en cas de force majeure, d'incidents douaniers, de retards de vols aériens ou de modifications réglementaires du Ministère du Hajj et de l'Omra d'Arabie Saoudite. Une assurance multirisque voyage est fortement recommandée pour chaque pèlerin.
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}
