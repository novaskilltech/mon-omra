'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
    Calendar, Plane, Star, MapPin, ExternalLink, Check, ChevronUp, ChevronDown, 
    ArrowLeft, Loader2, ShieldCheck, X, CheckCircle, AlertCircle, Sparkles, GraduationCap, ArrowRight
} from 'lucide-react';
import { getPublicActiveGroups, requestRegistration } from '@/lib/actions/concierge';
import { calculateAdjustedGroupPrice } from '@/lib/actions/flights';

// Mock details same as homepage
const MOCK_PREMIUM_DETAILS = {
    makkahHotel: {
        name: "Makkah by Millennium / Elaf Kinwan / Le Voco",
        stars: 5,
        distance: "Sélection d'hôtels 5★ ou Confort selon disponibilité",
        mapsUrl: "https://maps.google.com",
        image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80"
    },
    madinahHotel: {
        name: "Zahra Taiba / Zaha Al Madina / Zaha Al Munawara",
        stars: 4,
        distance: "Sélection d'hôtels Confort à proximité immédiate du Haram",
        mapsUrl: "https://maps.google.com",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80"
    },
    prices: { quadruple: 1490, triple: 1690, double: 1890, solo: 2490 },
    inclusions: [
        "Vols aller-retour directs sur compagnie régulière",
        "Hébergement en hôtels 5★ (Normes locales)",
        "Visa officiel Omra ou Tourisme avec assurance",
        "Transferts internes en bus VIP climatisé",
        "Accompagnement religieux et technique francophone",
        "Visites guidées (Ziyarat) à Makkah et Madinah"
    ]
};

function getDurationDays(groupName: string): number {
    const normalized = groupName.toLowerCase();
    const matchNights = normalized.match(/(\d+)\s*nuit/);
    if (matchNights) {
        return parseInt(matchNights[1], 10);
    }
    if (normalized.includes("une semaine") || normalized.includes("1 semaine") || normalized.includes(" 7 nuits") || normalized.includes(" 8 nuits")) {
        return 7;
    }
    if (normalized.includes("deux semaines") || normalized.includes("2 semaines") || normalized.includes("14 nuits") || normalized.includes("15 nuits")) {
        return 14;
    }
    return 14;
}

export default function DepartAirportPage() {
    const params = useParams();
    const router = useRouter();
    const airportParam = typeof params.airport === 'string' ? params.airport.toUpperCase() : '';

    const [loading, setLoading] = useState(true);
    const [groups, setGroups] = useState<any[]>([]);
    const [selectedGroupId, setSelectedGroupId] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'rates' | 'hotels' | 'inclusions'>('rates');

    // Registration Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGroupForInquiry, setSelectedGroupForInquiry] = useState<any>(null);
    const [omraForm, setOmraForm] = useState({
        firstName: '',
        familyName: '',
        gender: 'M' as 'M' | 'F',
        email: '',
        phone: '',
        message: '',
        isFormerClient: false,
        wantsLoyaltyBenefits: false
    });
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Formulaire d'absence de vol (ouverture de ligne / rappel)
    const [noFlightForm, setNoFlightForm] = useState({
        firstName: '',
        familyName: '',
        email: '',
        phone: '',
        message: ''
    });
    const [noFlightSubmitting, setNoFlightSubmitting] = useState(false);
    const [noFlightSuccess, setNoFlightSuccess] = useState(false);
    const [noFlightError, setNoFlightError] = useState<string | null>(null);

    const handleNoFlightSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setNoFlightError(null);
        setNoFlightSubmitting(true);
        try {
            const res = await requestRegistration({
                email: noFlightForm.email,
                firstName: noFlightForm.firstName,
                familyName: noFlightForm.familyName,
                phone: noFlightForm.phone,
                message: `[Demande Ouverture Ligne/Rappel Aéroport : ${airportParam}] - ${noFlightForm.message}`,
                gender: 'M'
            });
            if (res.error) {
                setNoFlightError(res.error);
            } else {
                setNoFlightSuccess(true);
            }
        } catch (err: any) {
            setNoFlightError(err.message || "Une erreur est survenue.");
        } finally {
            setNoFlightSubmitting(false);
        }
    };

    useEffect(() => {
        async function loadGroups() {
            try {
                const res = await getPublicActiveGroups();
                if (res.success && res.groups) {
                    const mapped = res.groups.map((g: any) => {
                        let airport = "PARIS";
                        const lowerName = g.name.toLowerCase();
                        if (lowerName.includes("lyon") || lowerName.includes("lys")) {
                            airport = "LYON";
                        } else if (lowerName.includes("marseille") || lowerName.includes("mrs")) {
                            airport = "MARSEILLE";
                        } else if (lowerName.includes("bruxelles") || lowerName.includes("bru") || lowerName.includes("brussels")) {
                            airport = "BRUXELLES";
                        } else if (lowerName.includes("charleroi") || lowerName.includes("crl")) {
                            airport = "CHARLEROI";
                        } else if (lowerName.includes("barcelone") || lowerName.includes("bcn") || lowerName.includes("barcelona")) {
                            airport = "BARCELONE";
                        } else if (lowerName.includes("madrid") || lowerName.includes("mad")) {
                            airport = "MADRID";
                        } else if (lowerName.includes("milan") || lowerName.includes("mxp")) {
                            airport = "MILAN";
                        } else if (lowerName.includes("rome") || lowerName.includes("fco")) {
                            airport = "ROME";
                        } else if (lowerName.includes("cologne") || lowerName.includes("cgn")) {
                            airport = "COLOGNE";
                        } else if (lowerName.includes("malaga") || lowerName.includes("agp")) {
                            airport = "MALAGA";
                        } else if (lowerName.includes("nice") || lowerName.includes("nce")) {
                            airport = "NICE";
                        } else if (lowerName.includes("casablanca") || lowerName.includes("cmn")) {
                            airport = "CASABLANCA";
                        } else if (lowerName.includes("tunis") || lowerName.includes("tun")) {
                            airport = "TUNIS";
                        } else if (lowerName.includes("alger") || lowerName.includes("alg")) {
                            airport = "ALGER";
                        } else if (lowerName.includes("caire") || lowerName.includes("cai") || lowerName.includes("cairo")) {
                            airport = "LE CAIRE";
                        } else if (lowerName.includes("zurich") || lowerName.includes("zrh")) {
                            airport = "ZURICH";
                        } else if (lowerName.includes("genève") || lowerName.includes("geneve") || lowerName.includes("gva")) {
                            airport = "GENEVE";
                        } else if (lowerName.includes("mulhouse") || lowerName.includes("mlh") || lowerName.includes("bsl") || lowerName.includes("eap")) {
                            airport = "MULHOUSE";
                        } else if (lowerName.includes("toulouse") || lowerName.includes("tls")) {
                            airport = "TOULOUSE";
                        } else if (lowerName.includes("cdg") || lowerName.includes("ory") || lowerName.includes("bva") || lowerName.includes("paris")) {
                            airport = "PARIS";
                        }
                        return { ...g, airport };
                    });

                    // Filter only for current airport and future departure dates
                    const todayStr = new Date().toISOString().split('T')[0];
                    const filtered = mapped.filter((g: any) => {
                        if (g.airport !== airportParam) return false;
                        const depDate = g.departure_date || g.date;
                        if (!depDate) return true;
                        const depDateStr = depDate.split('T')[0];
                        return depDateStr >= todayStr;
                    });
                    
                    // Display pre-calculated prices from the database (Cron Job synchronised)
                    const withAdjustedPrices = filtered.map((g: any) => {
                        const originalPrice = g.price ? Number(g.price) : 990;
                        const durationDays = getDurationDays(g.name);
                        return {
                            ...g,
                            price: originalPrice,
                            originalPrice: originalPrice,
                            durationDays,
                            ticketPrice: 0,
                            appliedFormula: `${durationDays} Nuits (Tarif synchronisé)`,
                            isPriceAdjusted: true
                        };
                    });
                    setGroups(withAdjustedPrices);
                }
            } catch (err) {
                console.error("Error loading groups:", err);
            } finally {
                setLoading(false);
            }
        }
        if (airportParam) {
            loadGroups();
        }
    }, [airportParam]);

    const handleOpenModal = (group: any) => {
        setSuccess(false);
        setError(null);
        const isWiser = group.name.toLowerCase().includes('wiser');
        const defaultMessage = isWiser
            ? `Bonjour, je souhaite obtenir un devis personnalisé pour la formule Wiser sur mesure : ${group.name} au départ de ${group.airport}.`
            : `Je souhaite obtenir des renseignements pour la formule : ${group.name} au départ de ${group.airport}.`;
        
        setOmraForm({
            firstName: '',
            familyName: '',
            gender: 'M',
            email: '',
            phone: '',
            message: defaultMessage,
            isFormerClient: false,
            wantsLoyaltyBenefits: false
        });
        setSelectedGroupForInquiry(group);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            const res = await requestRegistration({
                email: omraForm.email,
                firstName: omraForm.firstName,
                familyName: omraForm.familyName,
                gender: omraForm.gender,
                phone: omraForm.phone,
                message: omraForm.message,
                isFormerClient: omraForm.isFormerClient,
                wantsLoyaltyBenefits: omraForm.wantsLoyaltyBenefits,
                desiredGroupId: selectedGroupForInquiry?.id
            });

            if (res.error) {
                setError(res.error);
            } else {
                setSuccess(true);
            }
        } catch (err: any) {
            setError(err.message || "Une erreur est survenue.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen text-main selection:bg-emerald-500/30 font-inter relative overflow-x-hidden pb-20">
            {/* Background Glows */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[140px] rounded-full" />
                <div className="absolute top-[30%] right-[-10%] w-[40%] h-[40%] bg-amber-500/10 blur-[140px] rounded-full" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
                
                {/* Navbar Header */}
                <nav className="relative z-50 flex justify-between items-center py-6 border-b border-white/5 mb-12">
                    <div className="flex items-center gap-3">
                        <Image src="/app-logo.png" alt="OMRAYANAIR Logo" width={36} height={36} className="rounded-xl object-contain shadow-md border border-white/10" />
                        <div className="text-2xl font-black tracking-tighter uppercase">
                            OMRA<span className="text-emerald-500">YANAIR</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <a href="/la-voix-du-pelerin/" target="_blank" rel="noreferrer" className="text-[10px] font-black uppercase tracking-widest text-[#a855f7] hover:text-purple-400 transition-colors">
                            La Voix du Pèlerin
                        </a>
                        <Link href="/" className="text-xs font-black uppercase tracking-widest text-dim hover:text-main flex items-center gap-1.5 transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Retour
                        </Link>
                    </div>
                </nav>

                {/* Title */}
                <header className="mb-10">
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase px-3 py-1 rounded-full tracking-wider">
                        Départs de l'aéroport
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight mt-3">
                        Vols depuis {airportParam}
                    </h1>
                    <p className="text-xs text-dim mt-2">
                        Retrouvez toutes les dates de séjours Omra disponibles avec départ de l'aéroport de {airportParam}. Cliquez sur une date pour consulter les détails et réserver.
                    </p>
                </header>

                {loading ? (
                    <div className="glass p-12 rounded-[2rem] border border-white/5 text-center text-dim text-sm">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-500 mb-4" />
                        Chargement des dates de voyage...
                    </div>
                ) : groups.length === 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start text-left">
                        {/* Information Message */}
                        <div className="glass p-8 sm:p-12 rounded-[2rem] border border-white/10 space-y-6">
                            <span className="bg-amber-500/20 text-[#F2CE79] border border-amber-500/30 text-[9px] font-black uppercase px-3 py-1 rounded-full tracking-wider">
                                Aucun vol programmé
                            </span>
                            <h2 className="text-2xl font-black uppercase tracking-tight text-main">
                                Aucun départ de {airportParam}
                            </h2>
                            <p className="text-xs text-dim leading-relaxed">
                                Il n'y a pas de séjours Omra officiellement planifiés avec un départ de l'aéroport de <strong>{airportParam}</strong> pour le moment.
                            </p>
                            <p className="text-xs text-dim leading-relaxed">
                                Cependant, vous pouvez formuler une demande d'ouverture de ligne ou être recontacté en priorité par nos conseillers dès qu'une formule correspondante sera disponible.
                            </p>
                            <div className="pt-4">
                                <Link href="/depart" className="inline-flex items-center gap-2 bg-white/5 border border-white/10 hover:border-emerald-500/30 text-main px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                                    <ArrowLeft className="w-4 h-4" /> Voir les autres aéroports
                                </Link>
                            </div>
                        </div>

                        {/* Inquiry Form */}
                        <div className="glass p-8 sm:p-12 rounded-[2rem] border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent">
                            <h3 className="text-lg font-black uppercase tracking-tighter text-main mb-2">
                                Demande d'ouverture / Rappel
                            </h3>
                            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-6">
                                Aéroport : {airportParam}
                            </p>

                            {noFlightSuccess ? (
                                <div className="space-y-6 py-8 text-center">
                                    <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                                        <CheckCircle className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-base font-black uppercase tracking-tighter text-main">Demande Transmise !</h4>
                                        <p className="text-xs text-dim leading-relaxed max-w-sm mx-auto">
                                            Votre demande de rappel et d'ouverture de ligne a été transmise à notre service de conciergerie.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleNoFlightSubmit} className="space-y-4">
                                    {noFlightError && (
                                        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex gap-3 items-center text-xs text-red-400">
                                            <AlertCircle className="w-5 h-5 shrink-0" />
                                            <span>{noFlightError}</span>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black uppercase tracking-wider text-dim ml-1">Prénom</label>
                                            <input
                                                required
                                                type="text"
                                                value={noFlightForm.firstName}
                                                onChange={(e) => setNoFlightForm({ ...noFlightForm, firstName: e.target.value })}
                                                placeholder="Karim"
                                                className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs focus:border-emerald-500/40 outline-none text-main"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black uppercase tracking-wider text-dim ml-1">Nom de famille</label>
                                            <input
                                                required
                                                type="text"
                                                value={noFlightForm.familyName}
                                                onChange={(e) => setNoFlightForm({ ...noFlightForm, familyName: e.target.value })}
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
                                                value={noFlightForm.email}
                                                onChange={(e) => setNoFlightForm({ ...noFlightForm, email: e.target.value })}
                                                placeholder="votre.email@domaine.com"
                                                className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs focus:border-emerald-500/40 outline-none text-main"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black uppercase tracking-wider text-dim ml-1">Téléphone</label>
                                            <input
                                                required
                                                type="tel"
                                                value={noFlightForm.phone}
                                                onChange={(e) => setNoFlightForm({ ...noFlightForm, phone: e.target.value })}
                                                placeholder="+33 6 12 34 56 78"
                                                className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs focus:border-emerald-500/40 outline-none text-main"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-wider text-dim ml-1">Précisez vos dates idéales ou souhaits</label>
                                        <textarea
                                            value={noFlightForm.message}
                                            onChange={(e) => setNoFlightForm({ ...noFlightForm, message: e.target.value })}
                                            placeholder="Ex: Je souhaite partir pendant les vacances de Décembre avec 3 personnes..."
                                            className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs focus:border-emerald-500/40 outline-none text-main h-20 resize-none"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={noFlightSubmitting}
                                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
                                    >
                                        {noFlightSubmitting ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <>Envoyer ma demande <ArrowRight className="w-4 h-4" /></>}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                ) : (() => {
                    // Group packages by duration (number of nights)
                    const grouped: { [key: number]: any[] } = {};
                    groups.forEach((group) => {
                        const duration = group.durationDays || 14;
                        if (!grouped[duration]) {
                            grouped[duration] = [];
                        }
                        grouped[duration].push(group);
                    });

                    // Sort durations in ascending order
                    const sortedDurations = Object.keys(grouped)
                        .map(Number)
                        .sort((a, b) => a - b);

                    return (
                        <div className="space-y-12">
                            {sortedDurations.map((duration) => (
                                <section key={duration} className="space-y-6 text-left">
                                    <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider">
                                            {duration} Nuits
                                        </span>
                                        <h2 className="text-xl font-black uppercase tracking-tight text-main">
                                            Séjour de {duration} nuits sur place
                                        </h2>
                                    </div>
                                    <div className="space-y-4">
                                        {grouped[duration].map((group) => {
                                            const isExpanded = selectedGroupId === group.id;
                                            const details = MOCK_PREMIUM_DETAILS;
                                            const priceNum = group.price ? Number(group.price) : details.prices.quadruple;
                                            const isWiser = group.name.toLowerCase().includes('wiser');

                                            return (
                                                <div key={group.id} className="glass rounded-[2rem] border border-white/10 overflow-hidden transition-all duration-300">
                                                    {/* Date selection bar */}
                                                    <button
                                                        onClick={() => setSelectedGroupId(isExpanded ? '' : group.id)}
                                                        className="w-full px-6 py-5 sm:px-8 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                                                                <Calendar className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <h3 className="font-black uppercase tracking-tight text-sm text-main">
                                                                    {group.name}
                                                                </h3>
                                                                <p className="text-[10px] text-dim font-bold uppercase tracking-wider mt-1">
                                                                    Départ : {group.departure_date ? new Date(group.departure_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Date à confirmer'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="text-right hidden sm:block">
                                                                <p className="text-[9px] font-black text-dim uppercase tracking-wider">{isWiser ? "Tarif" : "À partir de"}</p>
                                                                <p className="text-base font-black text-emerald-400">{isWiser ? "Sur demande" : `${priceNum.toLocaleString('fr-FR')} €`}</p>
                                                            </div>
                                                            {isExpanded ? <ChevronUp className="w-5 h-5 text-dim" /> : <ChevronDown className="w-5 h-5 text-dim" />}
                                                        </div>
                                                    </button>

                                                    {isExpanded && (
                                                        <div className="border-t border-white/5 animate-in slide-in-from-top duration-300">
                                                            {/* Navigation Tabs */}
                                                            <div className="flex border-b border-white/5 bg-[#050a08]/20 text-[10px] font-black uppercase tracking-widest">
                                                                <button 
                                                                    onClick={() => setActiveTab('rates')}
                                                                    className={`flex-1 py-3 border-r border-white/5 transition-all ${activeTab === 'rates' ? 'bg-white/[0.05] text-emerald-400 border-b-2 border-b-emerald-500' : 'text-dim hover:text-main'}`}
                                                                >
                                                                    Tarifs & Chambres
                                                                </button>
                                                                <button 
                                                                    onClick={() => setActiveTab('hotels')}
                                                                    className={`flex-1 py-3 border-r border-white/5 transition-all ${activeTab === 'hotels' ? 'bg-white/[0.05] text-emerald-400 border-b-2 border-b-emerald-500' : 'text-dim hover:text-main'}`}
                                                                >
                                                                    Hôtels & Localisation
                                                                </button>
                                                                <button 
                                                                    onClick={() => setActiveTab('inclusions')}
                                                                    className={`flex-1 py-3 transition-all ${activeTab === 'inclusions' ? 'bg-white/[0.05] text-emerald-400 border-b-2 border-b-emerald-500' : 'text-dim hover:text-main'}`}
                                                                >
                                                                    Prestations
                                                                </button>
                                                            </div>

                                                            <div className="p-6 sm:p-8">
                                                                 {activeTab === 'rates' && (() => {
                                                                      if (isWiser) {
                                                                          return (
                                                                              <div className="p-8 text-center bg-white/[0.01] border border-white/5 rounded-2xl w-full">
                                                                                  <p className="text-xs text-dim leading-relaxed">
                                                                                      Cette formule "Wiser" est proposée sur mesure. Les tarifs de ce séjour sont disponibles sur demande.
                                                                                      Veuillez cliquer sur <strong>"Demander un devis"</strong> ci-dessous pour obtenir une offre personnalisée selon vos dates et vos préférences.
                                                                                  </p>
                                                                              </div>
                                                                          );
                                                                      }
                                                                      const days = group.durationDays || 10;
                                                                      const extraDays = Math.max(0, days - 10);
                                                                      
                                                                      const quadPrice = priceNum;
                                                                      const triplePrice = quadPrice + 100 + (extraDays * 5);
                                                                      const doublePrice = quadPrice + 200 + (extraDays * 10);
                                                                      const singlePrice = quadPrice + 600 + (extraDays * 20);

                                                                      return (
                                                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex justify-between items-center">
                                                                                  <div>
                                                                                      <p className="text-[9px] font-black uppercase text-dim tracking-wider">Chambre Quadruple</p>
                                                                                      <p className="text-xs text-main font-bold">4 personnes</p>
                                                                                  </div>
                                                                                  <p className="text-base font-black text-main">{quadPrice.toLocaleString('fr-FR')} €</p>
                                                                              </div>
                                                                              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex justify-between items-center">
                                                                                  <div>
                                                                                      <p className="text-[9px] font-black uppercase text-dim tracking-wider">Chambre Triple</p>
                                                                                      <p className="text-xs text-main font-bold">3 personnes</p>
                                                                                  </div>
                                                                                  <p className="text-base font-black text-main">{triplePrice.toLocaleString('fr-FR')} €</p>
                                                                              </div>
                                                                              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex justify-between items-center">
                                                                                  <div>
                                                                                      <p className="text-[9px] font-black uppercase text-dim tracking-wider">Chambre Double</p>
                                                                                      <p className="text-xs text-main font-bold">2 personnes</p>
                                                                                  </div>
                                                                                  <p className="text-base font-black text-main">{doublePrice.toLocaleString('fr-FR')} €</p>
                                                                              </div>
                                                                              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex justify-between items-center">
                                                                                  <div>
                                                                                      <p className="text-[9px] font-black uppercase text-dim tracking-wider">Chambre Single</p>
                                                                                      <p className="text-xs text-main font-bold">1 personne</p>
                                                                                  </div>
                                                                                  <p className="text-base font-black text-main">{singlePrice.toLocaleString('fr-FR')} €</p>
                                                                              </div>
                                                                          </div>
                                                                      );
                                                                  })()}

                                                                {activeTab === 'hotels' && (
                                                                    <div className="space-y-8">
                                                                        {/* Section Makkah */}
                                                                        <div className="space-y-4">
                                                                            <h4 className="text-left text-xs font-black uppercase tracking-widest text-[#D8AA4D] border-b border-white/5 pb-2">
                                                                                🕋 Hôtels Partenaires à Makkah (5★)
                                                                            </h4>
                                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                                {[
                                                                                    {
                                                                                        name: "Makkah Hotel (Millennium)",
                                                                                        stars: 5,
                                                                                        distance: "Devant l'esplanade du Haram (0m)",
                                                                                        mapsUrl: "https://maps.app.goo.gl/uXmHn1nQ8nJzWJLy7",
                                                                                        image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80"
                                                                                    },
                                                                                    {
                                                                                        name: "Elaf Kinda Hotel",
                                                                                        stars: 5,
                                                                                        distance: "Face à la cour du Haram (très proche)",
                                                                                        mapsUrl: "https://maps.app.goo.gl/YV5qE4X7C2W1w8fJA",
                                                                                        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80"
                                                                                    },
                                                                                    {
                                                                                        name: "Voco Makkah (IHG)",
                                                                                        stars: 5,
                                                                                        distance: "Zone Kudai - Navette VIP 24h/24 directe Haram",
                                                                                        mapsUrl: "https://maps.app.goo.gl/LzY22CgTNVxV1N3T7",
                                                                                        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80"
                                                                                    }
                                                                                ].map((h, idx) => (
                                                                                    <div key={idx} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3 text-left">
                                                                                        <div className="relative h-28 w-full rounded-xl overflow-hidden bg-white/10">
                                                                                            <Image src={h.image} alt={h.name} fill className="object-cover" />
                                                                                            <span className="absolute top-2 left-2 bg-[#020302]/70 text-amber-400 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5">
                                                                                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {h.stars}★
                                                                                            </span>
                                                                                        </div>
                                                                                        <div>
                                                                                            <h5 className="font-black uppercase tracking-tight text-[11px] text-main truncate">{h.name}</h5>
                                                                                            <p className="text-[9px] text-dim flex items-center gap-1 mt-1 font-medium">
                                                                                                <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                                                                                                <span className="truncate">{h.distance}</span>
                                                                                            </p>
                                                                                        </div>
                                                                                        <a 
                                                                                            href={h.mapsUrl} 
                                                                                            target="_blank" 
                                                                                            rel="noopener noreferrer" 
                                                                                            className="inline-flex items-center gap-1 bg-white/5 hover:bg-white/10 text-main border border-white/10 rounded-xl px-4 py-2 text-[9px] font-black uppercase tracking-wider transition-all w-full justify-center"
                                                                                        >
                                                                                            Localiser sur Maps <ExternalLink className="w-3 h-3" />
                                                                                        </a>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>

                                                                        {/* Section Madinah */}
                                                                        <div className="space-y-4">
                                                                            <h4 className="text-left text-xs font-black uppercase tracking-widest text-[#D8AA4D] border-b border-white/5 pb-2">
                                                                                🕌 Hôtels Partenaires à Madinah (4★)
                                                                            </h4>
                                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                                {[
                                                                                    {
                                                                                        name: "Zahra Taiba / Al Rawda",
                                                                                        stars: 4,
                                                                                        distance: "Zone Centrale - 150m de la cour du Haram",
                                                                                        mapsUrl: "https://maps.app.goo.gl/Qe2V61iYwV7aB9Kz9",
                                                                                        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80"
                                                                                    },
                                                                                    {
                                                                                        name: "Zaha Al Madina",
                                                                                        stars: 4,
                                                                                        distance: "Zone Centrale Nord - Proximité immédiate Haram",
                                                                                        mapsUrl: "https://maps.app.goo.gl/kX7pD69W16A6y4yM6",
                                                                                        image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80"
                                                                                    },
                                                                                    {
                                                                                        name: "Zaha Al Munawara",
                                                                                        stars: 4,
                                                                                        distance: "Zone Centrale - Accès rapide Haram",
                                                                                        mapsUrl: "https://maps.app.goo.gl/kX7pD69W16A6y4yM6",
                                                                                        image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80"
                                                                                    }
                                                                                ].map((h, idx) => (
                                                                                    <div key={idx} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3 text-left">
                                                                                        <div className="relative h-28 w-full rounded-xl overflow-hidden bg-white/10">
                                                                                            <Image src={h.image} alt={h.name} fill className="object-cover" />
                                                                                            <span className="absolute top-2 left-2 bg-[#020302]/70 text-amber-400 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5">
                                                                                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {h.stars}★
                                                                                            </span>
                                                                                        </div>
                                                                                        <div>
                                                                                            <h5 className="font-black uppercase tracking-tight text-[11px] text-main truncate">{h.name}</h5>
                                                                                            <p className="text-[9px] text-dim flex items-center gap-1 mt-1 font-medium">
                                                                                                <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                                                                                                <span className="truncate">{h.distance}</span>
                                                                                            </p>
                                                                                        </div>
                                                                                        <a 
                                                                                            href={h.mapsUrl} 
                                                                                            target="_blank" 
                                                                                            rel="noopener noreferrer" 
                                                                                            className="inline-flex items-center gap-1 bg-white/5 hover:bg-white/10 text-main border border-white/10 rounded-xl px-4 py-2 text-[9px] font-black uppercase tracking-wider transition-all w-full justify-center"
                                                                                        >
                                                                                            Localiser sur Maps <ExternalLink className="w-3 h-3" />
                                                                                        </a>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {activeTab === 'inclusions' && (
                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                                                                        {details.inclusions.map((inc, i) => (
                                                                            <div key={i} className="flex gap-2.5 items-start p-3.5 bg-white/[0.01] border border-white/5 rounded-2xl">
                                                                                <div className="w-5 h-5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                                                                                    <Check className="w-3.5 h-3.5" />
                                                                                </div>
                                                                                <span className="text-[10px] text-dim font-medium leading-relaxed">{inc}</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="p-6 border-t border-white/5 bg-[#050a08]/30 flex flex-col sm:flex-row justify-between items-center gap-4">
                                                                 <div className="text-left space-y-1">
                                                                     <p className="text-[10px] font-black uppercase tracking-wider text-dim flex items-center gap-1.5">
                                                                         <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                                                         Réservation réglementée & Voyage conforme
                                                                     </p>
                                                                     {!isWiser && group.isPriceAdjusted && (
                                                                         <p className="text-[9px] text-amber-400 font-bold uppercase tracking-wider">
                                                                             ⚠ Tarif ajusté en temps réel selon les vols disponibles
                                                                         </p>
                                                                     )}
                                                                     <p className="text-[9px] text-dim italic">
                                                                         {isWiser 
                                                                             ? "* Cette formule nécessite une étude tarifaire personnalisée selon les dates choisies."
                                                                             : "* Les tarifs des vols fluctuant quotidiennement, le prix final du séjour est à vérifier auprès de nos services au moment de la réservation."
                                                                         }
                                                                     </p>
                                                                 </div>
                                                                <button 
                                                                    onClick={() => handleOpenModal(group)}
                                                                    className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 w-full sm:w-auto justify-center cursor-pointer"
                                                                >
                                                                    {isWiser ? "Demander un devis" : "Réserver cette date"} <ArrowRight className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}

                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            ))}
                        </div>
                    );
                })()}
            </div>

            {/* RESERVATION FORM MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-[#020302]/90 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                    <div className="glass w-full max-w-2xl rounded-[2.5rem] border border-emerald-500/20 overflow-hidden flex flex-col max-h-[90vh]">
                        <header className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-[#050a08]/30 shrink-0">
                            <div className="text-left">
                                <h3 className="text-lg font-black uppercase tracking-tighter text-main">
                                    Renseignements Séjour Omra
                                </h3>
                                <p className="text-[9px] font-black uppercase tracking-wider text-emerald-400 mt-1">
                                    Formule : {selectedGroupForInquiry?.name}
                                </p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                                <X className="w-5 h-5 text-dim hover:text-main" />
                            </button>
                        </header>

                        {success ? (
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
                                <button onClick={() => setIsModalOpen(false)} className="w-full max-w-xs mx-auto bg-emerald-500 text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px]">
                                    Fermer
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="p-8 space-y-4 overflow-y-auto text-left">
                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex gap-3 items-center text-xs text-red-400">
                                        <AlertCircle className="w-5 h-5 shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}

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

                                <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase tracking-wider text-dim ml-1">Message ou souhaits particuliers</label>
                                    <textarea
                                        value={omraForm.message}
                                        onChange={(e) => setOmraForm({ ...omraForm, message: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs focus:border-emerald-500/40 outline-none text-main h-24 resize-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
                                >
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <>Envoyer la demande <ArrowRight className="w-4 h-4" /></>}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}
