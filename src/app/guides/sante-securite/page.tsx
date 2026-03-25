'use client';

import Link from 'next/link';
import { ShieldCheck, Snowflake, MapPin, AlertTriangle } from 'lucide-react';

export default function LifeGuide() {
    return (
        <div className="min-h-screen">
            {/* Hero */}
            <div className="h-[50vh] relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-500/10" />
                <div className="relative z-10 text-center px-6">
                    <Link href="/dashboard/help" className="text-blue-600 dark:text-blue-500 font-black uppercase tracking-widest text-[10px] mb-6 inline-block bg-white/50 dark:bg-transparent px-3 py-1 rounded-full border border-blue-500/10 transition-all hover:scale-110">← Retour aux tutoriels</Link>
                    <h1 className="text-6xl font-black uppercase tracking-tighter mb-4 text-main">Vivre sur <span className="text-blue-500">Place</span></h1>
                    <p className="text-sub uppercase tracking-[0.3em] text-[10px] font-black opacity-60">Santé, Sécurité & Astuces Saoudiennes</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto py-24 px-6">
                <div className="prose prose-blue max-w-none space-y-16">
                    <section className="glass p-8 md:p-12 rounded-[3.5rem] border-blue-500/5 dark:border-white/5 shadow-xl">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                <Snowflake className="w-6 h-6 text-blue-500" />
                            </div>
                            <h2 className="text-3xl font-black uppercase tracking-tighter m-0 text-main">1. Maîtriser le Choc Thermique</h2>
                        </div>
                        <p className="text-lg text-sub leading-relaxed font-light mb-8">
                            Le plus grand ennemi du pèlerin n'est pas la fatigue, c'est la climatisation.
                            Le passage de 45°C en extérieur à 18°C dans les centres commerciaux ou les mosquées est brutal.
                        </p>
                        <p className="text-sub leading-relaxed font-medium opacity-80">
                            <strong className="text-blue-600 dark:text-blue-400 font-black uppercase tracking-tighter">Astuce Vital</strong> : Hydratez-vous uniquement avec de l'eau Zamzam à température ambiante (non "Cold").
                            Les fontaines indiquent "Cold" et "Not Cold". Évitez de boire glacé après avoir marché sous le soleil pour
                            prévenir les angines qui pourraient gâcher votre séjour.
                        </p>
                    </section>

                    <section className="space-y-8">
                        <h2 className="text-4xl font-black uppercase tracking-tighter border-l-8 border-blue-500 pl-8 text-main">2. Sécurité & Mobilité</h2>
                        <p className="text-sub leading-relaxed font-medium opacity-80">
                            L'Arabie Saoudite est l'un des pays les plus sûrs au monde, mais la densité de la foule à Makkah impose une vigilance.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-emerald-500/5 dark:bg-white/5 p-8 rounded-[2rem] border border-emerald-500/10 dark:border-white/5 shadow-sm transition-all hover:bg-emerald-500/10">
                                <MapPin className="w-8 h-8 text-emerald-500 mb-6" />
                                <h4 className="font-black text-main mb-2 uppercase tracking-tighter">Transport</h4>
                                <p className="text-[11px] text-sub leading-relaxed font-medium opacity-70">Utilisez des applications comme Uber ou Careem pour vos déplacements personnels. Les prix sont fixes et les chauffeurs tracés.</p>
                            </div>
                            <div className="bg-blue-500/5 dark:bg-white/5 p-8 rounded-[2rem] border border-blue-500/10 dark:border-white/5 shadow-sm transition-all hover:bg-blue-500/10">
                                <ShieldCheck className="w-8 h-8 text-blue-500 mb-6" />
                                <h4 className="font-black text-main mb-2 uppercase tracking-tighter">Santé</h4>
                                <p className="text-[11px] text-sub leading-relaxed font-medium opacity-70">Gardez toujours sur vous votre carte d'assurance fournie par l'agence. En cas d'hospitalisation, les hôpitaux saoudiens sont d'une excellence mondiale.</p>
                            </div>
                        </div>
                    </section>

                    <section className="glass p-8 md:p-12 rounded-[3.5rem] border-red-500/5 dark:border-white/5 border-red-500/20 bg-red-500/[0.02] shadow-xl">
                        <div className="flex items-center gap-4 mb-4">
                            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-500" />
                            <h3 className="text-xl font-black uppercase tracking-tighter m-0 text-main">Alerte Pieds</h3>
                        </div>
                        <p className="text-sm text-sub leading-relaxed italic font-medium opacity-80">
                            Vous allez marcher entre 10 et 15km par jour. Ne portez jamais de chaussures neuves.
                            Utilisez des sandales déjà "formées" à vos pieds. Prévoyez de la crème anti-frottement
                            et des pansements spécifiques pour les ampoules.
                        </p>
                    </section>

                    <section className="space-y-8">
                        <h2 className="text-4xl font-black uppercase tracking-tighter text-main">3. Communication & Argent</h2>
                        <p className="text-sub leading-relaxed font-medium opacity-80">
                            Optez pour une carte SIM locale (STC, Mobily ou Zain) dès l'aéroport. Le Wi-Fi des hôtels est souvent saturé.
                            Côté argent, la carte bancaire est acceptée partout, mais gardez quelques Riyals (SAR) pour les petites
                            aumônes et les marchés traditionnels.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
