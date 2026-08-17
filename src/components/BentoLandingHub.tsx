'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
    Compass, BookOpen, ShieldCheck, Map, ArrowRight, Plane, Hotel, 
    MessageSquare, Heart, Sparkles, ShoppingBag, ShieldAlert, Star, 
    Calendar, Users, Globe, X, CheckCircle, AlertCircle, Loader2, GraduationCap, Home
} from 'lucide-react';
import { getPublicActiveGroups, requestRegistration } from '@/lib/actions/concierge';
import { createHajjRequestAction } from '@/lib/actions/hajj';

export default function BentoLandingHub() {
    // Modal states
    const [isOmraModalOpen, setIsOmraModalOpen] = useState(false);
    const [isHajjModalOpen, setIsHajjModalOpen] = useState(false);

    // Omra Form Data
    const [groups, setGroups] = useState<any[]>([]);
    const [airports, setAirports] = useState<string[]>([]);
    const [selectedAirport, setSelectedAirport] = useState('');
    const [filteredGroups, setFilteredGroups] = useState<any[]>([]);
    const [wantsCustomDates, setWantsCustomDates] = useState(false);
    const [customDatesInput, setCustomDatesInput] = useState('');
    const [omraForm, setOmraForm] = useState({
        firstName: '',
        familyName: '',
        gender: 'M' as 'M' | 'F',
        email: '',
        phone: '',
        message: 'Je souhaite obtenir des renseignements pour un séjour Omra.',
        isFormerClient: false,
        wantsLoyaltyBenefits: false,
        desiredGroupId: ''
    });
    const [omraSubmitting, setOmraSubmitting] = useState(false);
    const [omraSuccess, setOmraSuccess] = useState(false);
    const [omraError, setOmraError] = useState<string | null>(null);

    // Hajj Form Data
    const [hajjForm, setHajjForm] = useState({
        firstName: '',
        familyName: '',
        nationality: '',
        phone: '',
        email: '',
        address: '',
        peopleCount: 1,
        hajjYear: 2027
    });
    const [hajjSubmitting, setHajjSubmitting] = useState(false);
    const [hajjSuccess, setHajjSuccess] = useState(false);
    const [hajjError, setHajjError] = useState<string | null>(null);

    // Load active Omra groups
    useEffect(() => {
        async function loadGroups() {
            try {
                const res = await getPublicActiveGroups();
                if (res.success && res.groups) {
                    const mapped = res.groups.map((g: any) => {
                        let airport = "AUTRE";
                        const lowerName = g.name.toLowerCase();
                        if (lowerName.includes("paris") || lowerName.includes("cdg") || lowerName.includes("ory")) {
                            airport = "PARIS";
                        } else if (lowerName.includes("lyon") || lowerName.includes("lys")) {
                            airport = "LYON";
                        } else if (lowerName.includes("marseille") || lowerName.includes("mrs")) {
                            airport = "MARSEILLE";
                        } else if (lowerName.includes("bruxelles") || lowerName.includes("bru") || lowerName.includes("brussels")) {
                            airport = "BRUXELLES";
                        } else if (lowerName.includes("nice") || lowerName.includes("nce")) {
                            airport = "NICE";
                        } else if (lowerName.includes("toulouse") || lowerName.includes("tls")) {
                            airport = "TOULOUSE";
                        } else if (lowerName.includes("nantes") || lowerName.includes("nte")) {
                            airport = "NANTES";
                        }
                        return { ...g, airport };
                    });
                    setGroups(mapped);

                    const uniqueAirports = Array.from(new Set(mapped.map((g: any) => g.airport))) as string[];
                    setAirports(uniqueAirports.filter(Boolean).sort());
                }
            } catch (err) {
                console.error("Error loading groups:", err);
            }
        }
        loadGroups();
    }, []);

    // Filter groups when airport selection changes
    useEffect(() => {
        if (selectedAirport) {
            const filtered = groups
                .filter((g: any) => g.airport === selectedAirport)
                .sort((a: any, b: any) => new Date(a.departure_date).getTime() - new Date(b.departure_date).getTime());
            setFilteredGroups(filtered);
        } else {
            setFilteredGroups([]);
        }
    }, [selectedAirport, groups]);

    const handleOpenOmraModal = () => {
        setOmraSuccess(false);
        setOmraError(null);
        setSelectedAirport('');
        setWantsCustomDates(false);
        setCustomDatesInput('');
        setOmraForm({
            firstName: '',
            familyName: '',
            gender: 'M',
            email: '',
            phone: '',
            message: "Je souhaite obtenir des renseignements pour une prochaine Omra.",
            isFormerClient: false,
            wantsLoyaltyBenefits: false,
            desiredGroupId: ''
        });
        setIsOmraModalOpen(true);
    };

    const handleOmraSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setOmraError(null);
        setOmraSubmitting(true);

        try {
            const finalMessage = wantsCustomDates && customDatesInput
                ? `[Dates & Aéroport souhaités : ${customDatesInput}] - ${omraForm.message}`
                : omraForm.message;

            const res = await requestRegistration({
                email: omraForm.email,
                firstName: omraForm.firstName,
                familyName: omraForm.familyName,
                gender: omraForm.gender,
                phone: omraForm.phone,
                message: finalMessage,
                isFormerClient: omraForm.isFormerClient,
                wantsLoyaltyBenefits: omraForm.wantsLoyaltyBenefits,
                desiredGroupId: (!wantsCustomDates && omraForm.desiredGroupId) ? omraForm.desiredGroupId : undefined
            });

            if (res.error) {
                setOmraError(res.error);
            } else {
                setOmraSuccess(true);
            }
        } catch (err: any) {
            setOmraError(err.message || "Une erreur est survenue lors de l'envoi.");
        } finally {
            setOmraSubmitting(false);
        }
    };

    const handleOpenHajjModal = () => {
        setHajjSuccess(false);
        setHajjError(null);
        setHajjForm({
            firstName: '',
            familyName: '',
            nationality: '',
            phone: '',
            email: '',
            address: '',
            peopleCount: 1,
            hajjYear: 2027
        });
        setIsHajjModalOpen(true);
    };

    const handleHajjSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setHajjError(null);
        setHajjSubmitting(true);

        try {
            const res = await createHajjRequestAction({
                firstName: hajjForm.firstName,
                familyName: hajjForm.familyName,
                nationality: hajjForm.nationality,
                phone: hajjForm.phone,
                email: hajjForm.email,
                address: hajjForm.address,
                peopleCount: Number(hajjForm.peopleCount),
                hajjYear: Number(hajjForm.hajjYear)
            });

            if (res.error) {
                setHajjError(res.error);
            } else {
                setHajjSuccess(true);
            }
        } catch (err: any) {
            setHajjError(err.message || "Une erreur est survenue lors de l'envoi.");
        } finally {
            setHajjSubmitting(false);
        }
    };

    return (
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-20">
            {/* Header Navbar */}
            <nav className="relative z-50 flex justify-between items-center py-6 flex-wrap gap-4 border-b border-white/5 mb-8">
                <div className="flex items-center gap-3">
                    <Image src="/app-logo.png" alt="OMRAYANAIR Logo" width={36} height={36} className="rounded-xl object-contain shadow-md border border-white/10" />
                    <div className="text-2xl font-black tracking-tighter uppercase">
                        OMRA<span className="text-emerald-500">YANAIR</span>
                    </div>
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                    <Link href="/la-methode" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D8AA4D] hover:text-[#F2CE79] transition-colors flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5" />
                        Formation Conciergerie
                    </Link>
                    <Link href="/login" className="text-[10px] font-black uppercase tracking-[0.2em] text-dim hover:text-emerald-500 transition-colors hidden sm:block">
                        Connexion
                    </Link>
                    <Link href="/login" className="bg-emerald-500 text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                        S'enregistrer
                    </Link>
                </div>
            </nav>

            {/* Hero Banner Header (Compact Above The Fold) */}
            <header className="text-center max-w-4xl mx-auto mb-12 space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] animate-fade-in">
                    <Sparkles className="w-3.5 h-3.5" />
                    Le Portail Spirituel & Conciergerie Autonome
                </div>
                
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter leading-[0.95] uppercase">
                    TOUTE VOTRE EXPÉRIENCE <span className="text-emerald-500">SPIRITUELLE</span> EN UN SEUL LIEU.
                </h1>

                <p className="text-xs sm:text-sm text-sub font-medium max-w-2xl mx-auto opacity-80 leading-relaxed">
                    Sélectionnez votre univers ci-dessous pour réserver votre Omra, vous pré-inscrire au Hajj 2027+, vous former ou accéder à votre espace personnalisé.
                </p>
            </header>

            {/* BENTO GRID (Tout visible d'un coup de d'œil) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                
                {/* Bento 1: Omra & Départs Prochains */}
                <Link 
                    href="/depart"
                    className="glass p-8 rounded-[2.5rem] border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent hover:border-emerald-500/50 transition-all duration-300 cursor-pointer group relative overflow-hidden flex flex-col justify-between min-h-[260px] shadow-lg hover:shadow-[0_0_40px_rgba(16,185,129,0.2)] text-left"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none group-hover:bg-emerald-500/20 transition-all" />
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                                <Plane className="w-6 h-6" />
                            </div>
                            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-black uppercase px-3 py-1 rounded-full tracking-wider">
                                Séjours Organisés
                            </span>
                        </div>
                        <h2 className="text-2xl font-black uppercase tracking-tight text-main group-hover:text-emerald-400 transition-colors">
                            Séjours OMRA
                        </h2>
                        <p className="text-xs text-dim font-medium mt-2 leading-relaxed">
                            Formules tout-compris, vols directs & hôtels 5★ au pied du Haram. Cliquez pour choisir votre aéroport.
                        </p>
                    </div>

                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Choisir mon aéroport de départ</span>
                        <div className="p-2.5 bg-emerald-500 text-white rounded-xl group-hover:translate-x-1 transition-transform">
                            <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>
                </Link>

                {/* Bento 2: Grand Pèlerinage HAJJ 2027+ */}
                <div 
                    onClick={handleOpenHajjModal}
                    className="glass p-8 rounded-[2.5rem] border border-amber-500/25 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent hover:border-amber-500/50 transition-all duration-300 cursor-pointer group relative overflow-hidden flex flex-col justify-between min-h-[260px] shadow-lg hover:shadow-[0_0_40px_rgba(216,170,77,0.2)]"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full pointer-events-none group-hover:bg-amber-500/20 transition-all" />
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-[#D8AA4D] group-hover:scale-110 transition-transform">
                                <Compass className="w-6 h-6" />
                            </div>
                            <span className="bg-amber-500/20 text-[#F2CE79] border border-amber-500/30 text-[9px] font-black uppercase px-3 py-1 rounded-full tracking-wider">
                                Hajj 2027 / 2028+
                            </span>
                        </div>
                        <h2 className="text-2xl font-black uppercase tracking-tight text-main group-hover:text-[#D8AA4D] transition-colors">
                            Grand HAJJ
                        </h2>
                        <p className="text-xs text-dim font-medium mt-2 leading-relaxed">
                            Pré-inscrivez-vous en priorité pour les prochaines sessions officielles du Hajj (dès 2027).
                        </p>
                    </div>

                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#D8AA4D]">Formulaire de pré-inscription</span>
                        <div className="p-2.5 bg-[#D8AA4D] text-[#050605] rounded-xl group-hover:translate-x-1 transition-transform">
                            <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                {/* Bento 3: Formation Conciergerie (Anciennement La Méthode) */}
                <Link 
                    href="/la-methode"
                    className="glass p-8 rounded-[2.5rem] border border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent hover:border-blue-500/50 transition-all duration-300 group relative overflow-hidden flex flex-col justify-between min-h-[260px] shadow-lg hover:shadow-[0_0_40px_rgba(59,130,246,0.2)]"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full pointer-events-none group-hover:bg-blue-500/20 transition-all" />
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[9px] font-black uppercase px-3 py-1 rounded-full tracking-wider">
                                Business & Agence
                            </span>
                        </div>
                        <h2 className="text-2xl font-black uppercase tracking-tight text-main group-hover:text-blue-400 transition-colors">
                            Formation Conciergerie
                        </h2>
                        <p className="text-xs text-dim font-medium mt-2 leading-relaxed">
                            Apprenez à lancer et piloter votre propre agence ou conciergerie Omra autonome grâce à notre méthode éprouvée.
                        </p>
                    </div>

                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Découvrir le programme</span>
                        <div className="p-2.5 bg-blue-500 text-white rounded-xl group-hover:translate-x-1 transition-transform">
                            <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>
                </Link>

                {/* Bento 4: La Voix du Pèlerin (Le Média Spirituel) */}
                <a 
                    href="/la-voix-du-pelerin/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass p-8 rounded-[2.5rem] border border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent hover:border-purple-500/50 transition-all duration-300 group relative overflow-hidden flex flex-col justify-between min-h-[240px] shadow-lg hover:shadow-[0_0_40px_rgba(168,85,247,0.2)]"
                >
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[9px] font-black uppercase px-3 py-1 rounded-full tracking-wider">
                                Média Spirituel
                            </span>
                        </div>
                        <h2 className="text-xl font-black uppercase tracking-tight text-main group-hover:text-purple-400 transition-colors">
                            La Voix du Pèlerin
                        </h2>
                        <p className="text-xs text-dim font-medium mt-1.5 leading-relaxed">
                            Récits authentiques, fiches de préparation aux rituels & articles d'inspiration par nos guides.
                        </p>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">Lire le média</span>
                        <div className="p-2 bg-purple-500 text-white rounded-xl group-hover:translate-x-1 transition-transform">
                            <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                    </div>
                </a>

                {/* Bento 5: Boutique & Services sur place */}
                <Link 
                    href="/boutique-excursions"
                    className="glass p-8 rounded-[2.5rem] border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent hover:border-amber-500/50 transition-all duration-300 group relative overflow-hidden flex flex-col justify-between min-h-[240px] shadow-lg hover:shadow-[0_0_40px_rgba(216,170,77,0.15)]"
                >
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-[#D8AA4D] group-hover:scale-110 transition-transform">
                                <ShoppingBag className="w-6 h-6" />
                            </div>
                            <span className="bg-amber-500/20 text-[#F2CE79] border border-amber-500/30 text-[9px] font-black uppercase px-3 py-1 rounded-full tracking-wider">
                                Produits & Chalets
                            </span>
                        </div>
                        <h2 className="text-xl font-black uppercase tracking-tight text-main group-hover:text-[#D8AA4D] transition-colors">
                            Boutique & Excursions
                        </h2>
                        <p className="text-xs text-dim font-medium mt-1.5 leading-relaxed">
                            Miels rares du Yémen, dattes Ajwa de Médine, excursions à Taïf et chalets privés.
                        </p>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#D8AA4D]">Voir les produits</span>
                        <div className="p-2 bg-[#D8AA4D] text-[#050605] rounded-xl group-hover:translate-x-1 transition-transform">
                            <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                    </div>
                </Link>

                {/* Bento 6: Espace Pèlerin & Guide Rituels */}
                <Link 
                    href="/demo-pelerin"
                    className="glass p-8 rounded-[2.5rem] border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent hover:border-emerald-500/50 transition-all duration-300 group relative overflow-hidden flex flex-col justify-between min-h-[240px] shadow-lg hover:shadow-[0_0_40px_rgba(16,185,129,0.15)]"
                >
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                                <Map className="w-6 h-6" />
                            </div>
                            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-black uppercase px-3 py-1 rounded-full tracking-wider">
                                App Mobile & Web
                            </span>
                        </div>
                        <h2 className="text-xl font-black uppercase tracking-tight text-main group-hover:text-emerald-400 transition-colors">
                            Compagnon Pèlerin
                        </h2>
                        <p className="text-xs text-dim font-medium mt-1.5 leading-relaxed">
                            Guide étape par étape du Tawaf/Sa'i, suivi de vol, visas et coffre-fort hors-ligne.
                        </p>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Accéder à mon espace</span>
                        <div className="p-2 bg-emerald-500 text-white rounded-xl group-hover:translate-x-1 transition-transform">
                            <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                    </div>
                </Link>

            </div>

            {/* Section Professionnels / Agences */}
            <div className="mt-20 max-w-4xl mx-auto glass p-8 sm:p-10 rounded-[2.5rem] border border-white/5 bg-white/[0.01] text-left space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none" />
                <div className="space-y-2">
                    <span className="text-[9px] font-black uppercase tracking-[0.25em] text-emerald-400">Espace Professionnels</span>
                    <h4 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-main leading-tight">Vous êtes un professionnel du voyage ou une agence d'Omra ?</h4>
                    <p className="text-xs text-dim leading-relaxed max-w-2xl font-medium">
                        Notre application de conciergerie et de gestion autonome vous intéresse ? Découvrez comment vous pouvez utiliser cette plateforme sous licence SaaS pour moderniser l'accompagnement de vos groupes de pèlerins sur place, centraliser vos informations et offrir une expérience VIP numérique de pointe.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                    <a
                        href="https://wa.me/33612345678?text=Bonjour,%20je%20suis%20un%20professionnel%20et%20je%20souhaite%20obtenir%20une%20demonstration%20de%20la%20plateforme%20OMRAYANAIR."
                        target="_blank"
                        rel="noreferrer"
                        className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 justify-center shadow-lg shadow-emerald-500/10 cursor-pointer"
                    >
                        <span>Discuter sur WhatsApp</span>
                    </a>
                    <Link
                        href="/contact?subject=Agency"
                        className="bg-white/5 hover:bg-white/10 text-main border border-white/10 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center cursor-pointer"
                    >
                        Demander une démo (Formulaire)
                    </Link>
                </div>
            </div>

            {/* Footer complet */}
            <footer className="mt-20 pt-10 border-t border-white/5 text-center text-xs text-dim font-medium space-y-4">
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-[9px] font-black uppercase tracking-widest text-dim">
                    <Link href="/qui-sommes-nous" className="hover:text-emerald-400 transition-colors">Qui sommes-nous</Link>
                    <Link href="/contact" className="hover:text-emerald-400 transition-colors">Contact</Link>
                    <Link href="/privacy" className="hover:text-emerald-400 transition-colors">RGPD & Confidentialité</Link>
                    <Link href="/cgv" className="hover:text-emerald-400 transition-colors">Conditions Générales de Vente</Link>
                    <Link href="/legal" className="hover:text-emerald-400 transition-colors">Mentions Légales</Link>
                </div>
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-[9px] font-black uppercase tracking-widest text-dim/60 pt-2 border-t border-white/[0.02] max-w-xl mx-auto">
                    <Link href="/la-methode" className="hover:text-emerald-400 transition-colors">Formation Conciergerie</Link>
                    <a href="/la-voix-du-pelerin/" target="_blank" rel="noreferrer" className="hover:text-purple-400 transition-colors">La Voix du Pèlerin</a>
                    <Link href="/login" className="hover:text-amber-400 transition-colors">Accès Client</Link>
                </div>
                <p className="pt-4 text-[10px] text-dim/80">© 2026 OMRAYANAIR — La plateforme souveraine de voyage spirituel et conciergerie autonome.</p>
            </footer>

            {/* MODAL OMRA INQUIRY */}
            {isOmraModalOpen && (
                <div className="fixed inset-0 bg-[#020302]/90 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                    <div className="glass w-full max-w-2xl rounded-[2.5rem] border border-emerald-500/20 overflow-hidden flex flex-col max-h-[90vh]">
                        <header className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-[#050a08]/30 shrink-0">
                            <div className="text-left">
                                <h3 className="text-lg font-black uppercase tracking-tighter text-main">
                                    Renseignements Séjour Omra
                                </h3>
                                <p className="text-[9px] font-black uppercase tracking-wider text-emerald-400 mt-1">
                                    Choisissez votre aéroport et votre date de départ
                                </p>
                            </div>
                            <button onClick={() => setIsOmraModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                                <X className="w-5 h-5 text-dim hover:text-main" />
                            </button>
                        </header>

                        {omraSuccess ? (
                            <div className="p-8 text-center space-y-6 overflow-y-auto">
                                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-xl font-black uppercase tracking-tighter text-main">Demande Transmise !</h4>
                                    <p className="text-xs text-dim leading-relaxed max-w-md mx-auto">
                                        Merci pour votre intérêt. Notre équipe de conciergerie étudie votre demande et vous recontactera rapidement.
                                    </p>
                                </div>
                                <button onClick={() => setIsOmraModalOpen(false)} className="w-full max-w-xs mx-auto bg-emerald-500 text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px]">
                                    Fermer
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleOmraSubmit} className="p-8 space-y-4 overflow-y-auto text-left">
                                {omraError && (
                                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex gap-3 items-center text-xs text-red-400">
                                        <AlertCircle className="w-5 h-5 shrink-0" />
                                        <span>{omraError}</span>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    {!wantsCustomDates ? (
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black uppercase tracking-wider text-dim ml-1">Choisir un départ disponible</label>
                                            <select
                                                required={!wantsCustomDates}
                                                value={omraForm.desiredGroupId}
                                                onChange={(e) => setOmraForm({ ...omraForm, desiredGroupId: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs focus:border-emerald-500/40 outline-none text-main"
                                            >
                                                <option value="" className="bg-[#0c120f] text-dim">-- Sélectionner une date de voyage --</option>
                                                {[...groups].sort((a: any, b: any) => new Date(a.departure_date).getTime() - new Date(b.departure_date).getTime()).map((grp) => (
                                                    <option key={grp.id} value={grp.id} className="bg-[#0c120f] text-main">
                                                        {new Date(grp.departure_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} — Départ {grp.airport || 'Même Ville'} ({grp.name}) {grp.price ? `— ${Number(grp.price).toLocaleString('fr-FR')} €` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    ) : (
                                        <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-300">
                                            <label className="text-[9px] font-black uppercase tracking-wider text-[#D8AA4D] ml-1">Vos souhaits de dates & aéroport de départ</label>
                                            <input
                                                required={wantsCustomDates}
                                                type="text"
                                                value={customDatesInput}
                                                onChange={(e) => setCustomDatesInput(e.target.value)}
                                                placeholder="Ex: départ fin octobre 2026 depuis Nice pour 10 jours"
                                                className="w-full bg-white/5 border border-amber-500/20 p-4 rounded-xl text-xs focus:border-[#D8AA4D]/50 outline-none text-main"
                                            />
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                                        <input
                                            type="checkbox"
                                            id="wantsCustomDates"
                                            checked={wantsCustomDates}
                                            onChange={(e) => {
                                                setWantsCustomDates(e.target.checked);
                                                if (e.target.checked) {
                                                    setOmraForm({ ...omraForm, desiredGroupId: '' });
                                                }
                                            }}
                                            className="w-4 h-4 rounded border-white/10 accent-emerald-500 cursor-pointer"
                                        />
                                        <label htmlFor="wantsCustomDates" className="text-[10px] font-bold uppercase tracking-wider text-dim cursor-pointer select-none">
                                            Je ne trouve pas mes dates / Souhait de dates personnalisées
                                        </label>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-wider text-dim ml-1">Prénom</label>
                                        <input
                                            required
                                            type="text"
                                            value={omraForm.firstName}
                                            onChange={(e) => setOmraForm({ ...omraForm, firstName: e.target.value })}
                                            placeholder="Karim"
                                            className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs focus:border-emerald-500/40 outline-none text-main"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-wider text-dim ml-1">Nom de famille</label>
                                        <input
                                            required
                                            type="text"
                                            value={omraForm.familyName}
                                            onChange={(e) => setOmraForm({ ...omraForm, familyName: e.target.value })}
                                            placeholder="El-Amrani"
                                            className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs focus:border-emerald-500/40 outline-none text-main"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-wider text-dim ml-1">Adresse E-mail</label>
                                        <input
                                            required
                                            type="email"
                                            value={omraForm.email}
                                            onChange={(e) => setOmraForm({ ...omraForm, email: e.target.value })}
                                            placeholder="votre.email@domaine.com"
                                            className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs focus:border-emerald-500/40 outline-none text-main"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-wider text-dim ml-1">Téléphone</label>
                                        <input
                                            required
                                            type="tel"
                                            value={omraForm.phone}
                                            onChange={(e) => setOmraForm({ ...omraForm, phone: e.target.value })}
                                            placeholder="+33 6 12 34 56 78"
                                            className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs focus:border-emerald-500/40 outline-none text-main"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={omraSubmitting}
                                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
                                >
                                    {omraSubmitting ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <>Envoyer la demande <ArrowRight className="w-4 h-4" /></>}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* MODAL HAJJ INQUIRY */}
            {isHajjModalOpen && (
                <div className="fixed inset-0 bg-[#020302]/90 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                    <div className="glass w-full max-w-2xl rounded-[2.5rem] border border-amber-500/25 overflow-hidden flex flex-col max-h-[90vh]">
                        <header className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-[#050a08]/30 shrink-0">
                            <div className="text-left">
                                <h3 className="text-lg font-black uppercase tracking-tighter text-main">
                                    Pré-Inscription Grand HAJJ
                                </h3>
                                <p className="text-[9px] font-black uppercase tracking-wider text-[#D8AA4D] mt-1">
                                    Sessions 2027, 2028, 2029 & 2030+
                                </p>
                            </div>
                            <button onClick={() => setIsHajjModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                                <X className="w-5 h-5 text-dim hover:text-main" />
                            </button>
                        </header>

                        {hajjSuccess ? (
                            <div className="p-8 text-center space-y-6 overflow-y-auto">
                                <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto border border-amber-500/20 text-[#D8AA4D]">
                                    <CheckCircle className="w-8 h-8" />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-xl font-black uppercase tracking-tighter text-main">Demande Hajj Enregistrée !</h4>
                                    <p className="text-xs text-dim leading-relaxed max-w-md mx-auto">
                                        Votre pré-inscription pour le Hajj {hajjForm.hajjYear} ({hajjForm.peopleCount} pers.) a bien été enregistrée. Notre conciergerie vous contactera en priorité dès l'ouverture des quotas.
                                    </p>
                                </div>
                                <button onClick={() => setIsHajjModalOpen(false)} className="w-full max-w-xs mx-auto bg-[#D8AA4D] text-[#050605] py-4 rounded-xl font-black uppercase tracking-widest text-[10px]">
                                    Fermer
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleHajjSubmit} className="p-8 space-y-4 overflow-y-auto text-left">
                                {hajjError && (
                                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex gap-3 items-center text-xs text-red-400">
                                        <AlertCircle className="w-5 h-5 shrink-0" />
                                        <span>{hajjError}</span>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-wider text-dim ml-1">Année souhaitée</label>
                                        <select
                                            required
                                            value={hajjForm.hajjYear}
                                            onChange={(e) => setHajjForm({ ...hajjForm, hajjYear: Number(e.target.value) })}
                                            className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs focus:border-[#D8AA4D]/50 outline-none text-main"
                                        >
                                            <option value={2027} className="bg-[#0b0e0c] text-main">Hajj 2027</option>
                                            <option value={2028} className="bg-[#0b0e0c] text-main">Hajj 2028</option>
                                            <option value={2029} className="bg-[#0b0e0c] text-main">Hajj 2029</option>
                                            <option value={2030} className="bg-[#0b0e0c] text-main">Hajj 2030+</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-wider text-dim ml-1">Nombre de personnes</label>
                                        <select
                                            required
                                            value={hajjForm.peopleCount}
                                            onChange={(e) => setHajjForm({ ...hajjForm, peopleCount: Number(e.target.value) })}
                                            className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs focus:border-[#D8AA4D]/50 outline-none text-main"
                                        >
                                            <option value={1} className="bg-[#0b0e0c] text-main">1 Personne</option>
                                            <option value={2} className="bg-[#0b0e0c] text-main">2 Personnes</option>
                                            <option value={3} className="bg-[#0b0e0c] text-main">3 Personnes</option>
                                            <option value={4} className="bg-[#0b0e0c] text-main">4 Personnes</option>
                                            <option value={5} className="bg-[#0b0e0c] text-main">5 Personnes et +</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-wider text-dim ml-1">Prénom</label>
                                        <input
                                            required
                                            type="text"
                                            value={hajjForm.firstName}
                                            onChange={(e) => setHajjForm({ ...hajjForm, firstName: e.target.value })}
                                            placeholder="Mohamed"
                                            className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs focus:border-[#D8AA4D]/50 outline-none text-main"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-wider text-dim ml-1">Nom de famille</label>
                                        <input
                                            required
                                            type="text"
                                            value={hajjForm.familyName}
                                            onChange={(e) => setHajjForm({ ...hajjForm, familyName: e.target.value })}
                                            placeholder="Benali"
                                            className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs focus:border-[#D8AA4D]/50 outline-none text-main"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-wider text-dim ml-1">Nationalité</label>
                                        <input
                                            required
                                            type="text"
                                            value={hajjForm.nationality}
                                            onChange={(e) => setHajjForm({ ...hajjForm, nationality: e.target.value })}
                                            placeholder="Française, Algérienne..."
                                            className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs focus:border-[#D8AA4D]/50 outline-none text-main"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-wider text-dim ml-1">Téléphone</label>
                                        <input
                                            required
                                            type="tel"
                                            value={hajjForm.phone}
                                            onChange={(e) => setHajjForm({ ...hajjForm, phone: e.target.value })}
                                            placeholder="+33 6 12 34 56 78"
                                            className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs focus:border-[#D8AA4D]/50 outline-none text-main"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-wider text-dim ml-1">E-mail</label>
                                        <input
                                            required
                                            type="email"
                                            value={hajjForm.email}
                                            onChange={(e) => setHajjForm({ ...hajjForm, email: e.target.value })}
                                            placeholder="votre.email@domaine.com"
                                            className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs focus:border-[#D8AA4D]/50 outline-none text-main"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-wider text-dim ml-1">Adresse physique</label>
                                        <input
                                            required
                                            type="text"
                                            value={hajjForm.address}
                                            onChange={(e) => setHajjForm({ ...hajjForm, address: e.target.value })}
                                            placeholder="12 Avenue des Champs-Élysées, Paris"
                                            className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs focus:border-[#D8AA4D]/50 outline-none text-main"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={hajjSubmitting}
                                    className="w-full bg-[#D8AA4D] hover:bg-[#F2CE79] text-[#050605] py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
                                >
                                    {hajjSubmitting ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <>Valider la pré-inscription Hajj <ArrowRight className="w-4 h-4" /></>}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
