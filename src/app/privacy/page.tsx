'use client';

import Link from 'next/link';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen p-8 md:p-24 selection:bg-emerald-500/30">
            <div className="max-w-3xl mx-auto">
                <Link href="/" className="text-emerald-600 dark:text-emerald-500 font-black uppercase tracking-widest text-[10px] mb-12 inline-block">← Retour à l'accueil</Link>

                <h1 className="text-5xl font-black uppercase tracking-tighter mb-12 text-main">Politique de <span className="text-emerald-500">Confidentialité</span></h1>

                <div className="space-y-12 text-sub leading-relaxed font-light">
                    <section>
                        <h2 className="text-xl font-black text-main mb-4 uppercase tracking-widest">1. Introduction</h2>
                        <p className="opacity-80">
                            Chez OMRAYANAIR (édité par OMRAYANAIR LLC), nous accordons une importance capitale à la protection de vos données personnelles.
                            Cette politique de confidentialité vous informe sur la manière dont nous collectons, utilisons et protégeons vos informations
                            conformément au Règlement Général sur la Protection des Données (RGPD).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-main mb-4 uppercase tracking-widest">2. Données Collectées</h2>
                        <p className="opacity-80">Nous collectons les données strictement nécessaires au bon déroulement de votre voyage :</p>
                        <ul className="list-disc pl-6 mt-4 space-y-2 opacity-80">
                            <li>Identité (Nom, Prénom, Passeport) pour les réservations de vols et hôtels.</li>
                            <li>Coordonnées (Email, Téléphone) pour les notifications et l'assistance.</li>
                            <li>Données de santé (uniquement si vous nous les déclarez pour assistance spécifique).</li>
                            <li>Données de paiement (traitées par Stripe ou prestataire tiers certifié PCI-DSS).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-main mb-4 uppercase tracking-widest">3. Finalité du Traitement</h2>
                        <p className="opacity-80">Vos données sont utilisées exclusivement pour :</p>
                        <ul className="list-disc pl-6 mt-4 space-y-2 opacity-80">
                            <li>L'organisation logistique de votre voyage Omra.</li>
                            <li>La communication d'urgence et l'assistance sur le terrain.</li>
                            <li>La conformité légale et comptable (conservation des factures pendant 5 ans).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-main mb-4 uppercase tracking-widest">4. Vos Droits (RGPD)</h2>
                        <p className="opacity-80">
                            Vous disposez d'un droit d'accès, de rectification, de suppression (droit à l'oubli) et de portage de vos données.
                            Vous pouvez exercer ces droits directement depuis votre Dashboard dans l'onglet "Confidentialité" ou en contactant
                            notre DPO à <strong className="text-emerald-600 dark:text-emerald-500">dpo@omrayanair.com</strong>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-main mb-4 uppercase tracking-widest">5. Conservation</h2>
                        <p className="opacity-80">
                            Les données opérationnelles sont supprimées 12 mois après votre retour, sauf obligations légales (données comptables conservées 5 ans).
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
