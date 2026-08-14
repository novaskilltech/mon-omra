'use client';

import Link from 'next/link';
import Image from 'next/image';
import { 
    ArrowLeft, Compass, Plane, Hotel, CheckCircle, Info, Phone, 
    BookOpen, Sparkles, MessageSquare, ShieldAlert, Award, FileText, Play, Check 
} from 'lucide-react';
import ThemeSelector from '@/components/ThemeSelector';

export default function DemoPelerinPage() {
    return (
        <main className="min-h-screen text-main bg-[#030604] selection:bg-emerald-500/30 font-inter pb-20 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[40%] bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[40%] bg-amber-500/5 blur-[140px] rounded-full pointer-events-none" />

            {/* Float Theme Selector */}
            <div className="fixed bottom-6 right-6 z-50">
                <ThemeSelector />
            </div>

            {/* Demo Header Notification Banner */}
            <div className="bg-amber-500/15 border-b border-amber-500/20 py-3 px-6 text-center text-xs text-[#F2CE79] font-medium sticky top-0 z-50 backdrop-blur-md flex flex-wrap items-center justify-center gap-3">
                <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span><strong>MODE DÉMONSTRATION :</strong> Voici un aperçu réel de votre futur compagnon de voyage une fois inscrit chez nous.</span>
                </div>
                <Link href="/login" className="bg-[#D8AA4D] hover:bg-[#F2CE79] text-[#050605] px-4 py-1.5 rounded-full font-black text-[9px] uppercase tracking-widest transition-all">
                    S'inscrire Maintenant
                </Link>
            </div>

            <div className="max-w-7xl mx-auto px-6 pt-10 text-left">
                {/* Back Button */}
                <Link 
                    href="/" 
                    className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-dim hover:text-emerald-500 transition-colors mb-8 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Retour à l'accueil
                </Link>

                {/* Profile Header */}
                <div className="glass p-8 md:p-12 rounded-[2.5rem] border border-white/5 bg-white/[0.01] mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 text-2xl font-black">
                            OB
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-black uppercase tracking-tight text-main">Omar Benali</h1>
                                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[8px] font-black uppercase px-2 py-0.5 rounded">
                                    Dossier Validé
                                </span>
                            </div>
                            <p className="text-xs text-dim font-medium mt-1">
                                Pèlerin Omra Premium • Réf: #OMR-2026-9932
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => alert("Fonctionnalité en démonstration. Votre carnet de voyage PDF officiel sera téléchargeable ici une fois votre inscription validée.")}
                            className="bg-white/5 hover:bg-white/10 text-main border border-white/10 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                        >
                            <FileText className="w-4 h-4 text-emerald-500" />
                            <span>Télécharger Carnet PDF</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Column: Vol & Hébergement */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* 1. Vol & Bagages */}
                        <div className="glass p-8 rounded-[2.5rem] border border-emerald-500/10 bg-white/[0.01] space-y-6">
                            <h2 className="text-lg font-black uppercase tracking-wider text-main flex items-center gap-2 border-b border-white/5 pb-4">
                                <Plane className="w-5 h-5 text-emerald-500" /> 1. Informations de Vol & Bagages
                            </h2>

                            <div className="bg-black/40 border border-white/5 p-6 rounded-2xl space-y-4">
                                <div className="flex justify-between items-center text-xs font-bold">
                                    <span className="text-[#D8AA4D]">VOL ALLER (DIRECT)</span>
                                    <span className="text-emerald-400">TRANSAVIA</span>
                                </div>
                                <div className="grid grid-cols-3 items-center text-center py-2">
                                    <div className="text-left">
                                        <p className="text-xl font-black text-main">CDG</p>
                                        <p className="text-[10px] text-dim uppercase">Paris Charles de Gaulle</p>
                                        <p className="text-xs text-main font-bold mt-1">14h15</p>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-[10px] text-dim uppercase font-bold">Sans escale</span>
                                        <div className="w-full h-[2px] bg-emerald-500/20 relative my-2">
                                            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                        </div>
                                        <span className="text-[9px] text-[#D8AA4D] font-black tracking-wider">Durée : 6h15</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-black text-main">MED</p>
                                        <p className="text-[10px] text-dim uppercase">Médine (Prince Mohammad)</p>
                                        <p className="text-xs text-main font-bold mt-1">20h30</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl space-y-1">
                                    <p className="text-[9px] font-black uppercase tracking-wider text-dim">Politique de Bagages</p>
                                    <p className="text-xs text-main font-black">🎒 Cabine 10kg + Soute 23kg</p>
                                </div>
                                <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl space-y-1">
                                    <p className="text-[9px] font-black uppercase tracking-wider text-[#D8AA4D]">Avantage Fidélité Offert</p>
                                    <p className="text-xs text-emerald-400 font-black">✓ Bagage en soute supplémentaire gratuit</p>
                                </div>
                            </div>
                        </div>

                        {/* 2. Hébergement & Chambre */}
                        <div className="glass p-8 rounded-[2.5rem] border border-emerald-500/10 bg-white/[0.01] space-y-6">
                            <h2 className="text-lg font-black uppercase tracking-wider text-main flex items-center gap-2 border-b border-white/5 pb-4">
                                <Hotel className="w-5 h-5 text-emerald-500" /> 2. Hébergement & Restauration
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-4 text-left">
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-wider text-dim">Hôtel à La Mecque</p>
                                        <p className="text-base font-black text-main uppercase">Swissôtel Al Maqam 5★</p>
                                        <p className="text-[10px] text-dim font-medium">Situé directement dans la tour Abraj Al Bait (Accès direct esplanade du Haram)</p>
                                    </div>
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl text-xs text-emerald-400 font-bold flex items-center gap-2">
                                        <Check className="w-4 h-4 shrink-0" />
                                        <span>Petit-déjeuner inclus (Offert Fidélité)</span>
                                    </div>
                                </div>

                                <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl space-y-3">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-dim">Type de chambre réservée</p>
                                    <div className="text-2xl font-black text-main flex items-center gap-2">
                                        <span>CHAMBRE DOUBLE</span>
                                    </div>
                                    <p className="text-[11px] text-dim font-medium leading-relaxed">
                                        Chambre de standing supérieur partagée pour 2 personnes avec lits séparés et vue sur la ville.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 3. Programme Jour 1 Transavia */}
                        <div className="glass p-8 rounded-[2.5rem] border border-[#D8AA4D]/20 bg-gradient-to-b from-[#0a0f0d] to-transparent space-y-6">
                            <h2 className="text-lg font-black uppercase tracking-wider text-[#D8AA4D] flex items-center gap-2 border-b border-white/5 pb-4">
                                <Compass className="w-5 h-5" /> 3. Programme & Logistique Jour 1
                            </h2>

                            <div className="space-y-6 relative border-l border-emerald-500/20 pl-6 ml-2 text-xs">
                                <div className="relative">
                                    <div className="w-3.5 h-3.5 bg-emerald-500 rounded-full absolute -left-[31px] top-1 border-4 border-[#030604]" />
                                    <h4 className="font-black text-main uppercase">Étape 1: Atterrissage & Accueil</h4>
                                    <p className="text-dim font-medium mt-1 leading-relaxed">
                                        Atterrissage en fin d'après-midi à l'aéroport de Médine ou Djeddah. Pas d'horaires fixes à mémoriser : récupérez vos bagages et dirigez-vous vers le parking. Le chauffeur privé vous attend sur place. Suivez simplement les instructions partagées par le guide sur le groupe WhatsApp de l'agence.
                                    </p>
                                </div>

                                <div className="relative">
                                    <div className="w-3.5 h-3.5 bg-emerald-500 rounded-full absolute -left-[31px] top-1 border-4 border-[#030604]" />
                                    <h4 className="font-black text-main uppercase">Étape 2: Transfert vers l'hôtel</h4>
                                    <p className="text-dim font-medium mt-1 leading-relaxed">
                                        Transfert en véhicule privé climatisé vers l'hôtel Swissôtel de la Mecque. Le trajet est l'occasion d'entrer en état d'Ihram (si transfert depuis Djeddah / Miqat).
                                    </p>
                                </div>

                                <div className="relative">
                                    <div className="w-3.5 h-3.5 bg-emerald-500 rounded-full absolute -left-[31px] top-1 border-4 border-[#030604]" />
                                    <h4 className="font-black text-main uppercase">Étape 3: Check-in & Repos</h4>
                                    <p className="text-dim font-medium mt-1 leading-relaxed">
                                        À l'hôtel, récupérez vos clés de chambre à la réception auprès de notre agent local, déposez vos bagages en chambre et reposez-vous quelques instants.
                                    </p>
                                </div>

                                <div className="relative">
                                    <div className="w-3.5 h-3.5 bg-amber-500 rounded-full absolute -left-[31px] top-1 border-4 border-[#030604]" />
                                    <h4 className="font-black text-[#D8AA4D] uppercase">Étape 4: Rassemblement Omra</h4>
                                    <p className="text-dim font-medium mt-1 leading-relaxed">
                                        Descendez dans le hall d'accueil à l'heure exacte qui vous sera notifiée par votre guide spirituel sur le groupe WhatsApp pour débuter ensemble les rituels sacrés de la Omra.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Audio Rituels Widget & WhatsApp Concierge */}
                    <div className="space-y-6">
                        
                        {/* Audio Guide widget */}
                        <div className="glass p-8 rounded-[2.5rem] border border-purple-500/20 bg-gradient-to-b from-purple-500/[0.03] to-transparent space-y-6">
                            <div className="flex items-center gap-2 justify-between">
                                <h3 className="text-sm font-black uppercase tracking-wider text-purple-400 flex items-center gap-2">
                                    <BookOpen className="w-4.5 h-4.5" /> Guide Vocal des Rituels
                                </h3>
                                <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[8px] font-black uppercase px-2 py-0.5 rounded">
                                    Hors-Ligne
                                </span>
                            </div>

                            <p className="text-xs text-dim leading-relaxed font-medium">
                                Réalisez vos rituels pas à pas en écoutant les audios explicatifs pré-enregistrés de nos guides spirituels agréés.
                            </p>

                            <div className="space-y-3">
                                {[
                                    { step: "Tawaf (7 tours)", dur: "18:40", active: true },
                                    { step: "Sa'i Safa & Marwa", dur: "22:15", active: false }
                                ].map((aud, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <button className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs hover:scale-105 transition-all">
                                                <Play className="w-3 h-3 fill-current ml-0.5" />
                                            </button>
                                            <div className="text-left">
                                                <p className="text-xs font-black text-main">{aud.step}</p>
                                                <p className="text-[9px] text-dim">{aud.dur} • Audio MP3</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* WhatsApp Group widget */}
                        <div className="glass p-8 rounded-[2.5rem] border border-emerald-500/20 bg-gradient-to-b from-emerald-500/[0.03] to-transparent space-y-6">
                            <h3 className="text-sm font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                                <MessageSquare className="w-4.5 h-4.5" /> Groupe WhatsApp Agence
                            </h3>

                            <p className="text-xs text-dim leading-relaxed font-medium">
                                C'est sur ce groupe WhatsApp privé que vous recevrez en temps réel les instructions de votre guide et chauffeur.
                            </p>

                            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex gap-3 items-center text-xs text-emerald-400 font-bold justify-center">
                                <span>Groupe : OMRAYANAIR #CDG-9932</span>
                            </div>

                            <button 
                                onClick={() => alert("En mode démonstration. Le bouton d'accès au groupe de l'agence sera actif dès votre enregistrement validé.")}
                                className="w-full bg-emerald-500 hover:bg-emerald-400 text-white py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Phone className="w-3.5 h-3.5" />
                                <span>Rejoindre le canal WhatsApp</span>
                            </button>
                        </div>

                        {/* SOS Concierge widget */}
                        <div className="glass p-8 rounded-[2.5rem] border border-red-500/20 bg-gradient-to-b from-red-500/[0.02] to-transparent space-y-4">
                            <h3 className="text-sm font-black uppercase tracking-wider text-red-400 flex items-center gap-2">
                                <ShieldAlert className="w-4.5 h-4.5" /> Support SOS 24h/7j
                            </h3>
                            <p className="text-[10px] text-dim leading-relaxed font-medium">
                                Un doute ? Perte de bagage ? Problème d'accès hôtel ? Notre équipe conciergerie est disponible instantanément.
                            </p>
                            <button 
                                onClick={() => alert("Bouton SOS réservé aux voyageurs actifs.")}
                                className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                Urgence Concierge
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
