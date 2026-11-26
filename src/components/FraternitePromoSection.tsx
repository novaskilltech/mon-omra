'use client';

import { useState, useMemo, useRef } from 'react';
import {
    Plane,
    Hotel,
    Calendar,
    Users,
    Globe,
    CheckCircle2,
    AlertCircle,
    Loader2,
    ChevronDown,
    ChevronUp,
    Search,
    Luggage,
    HelpCircle,
    MessageCircle,
    Sparkles,
    ArrowRight,
    ShieldCheck,
} from 'lucide-react';
import {
    FRATERNITE_AIRLINES,
    FRATERNITE_DEPARTURES,
    FRATERNITE_PROGRAM_STEPS,
    FRATERNITE_INCLUDED_TILES,
    FRATERNITE_FAQS,
    FRATERNITE_ROOM_OPTIONS,
    FRATERNITE_WHATSAPP_DISPLAY,
    type FraterniteRoomType,
    type FraterniteDeparture,
    calculateFraterniteQuote,
    filterFraterniteDepartures,
    getFraterniteCountries,
    getVisaRuleLabel,
    isPaidHoldBaggage,
    formatEur,
} from '@/lib/data/fraternite2027';
import { submitFraternitePromoRequest } from '@/lib/actions/concierge';

export default function FraternitePromoSection() {
    const formSectionRef = useRef<HTMLDivElement | null>(null);
    const flightsExplorerRef = useRef<HTMLDivElement | null>(null);

    // Accordions (Option B : programme + formulaire visibles immédiatement, explorateur 23 vols & détails en accordéon fluide)
    const [showFlightsExplorer, setShowFlightsExplorer] = useState(false);
    const [showDetailsAndFaq, setShowDetailsAndFaq] = useState(false);

    // Flights filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [countryFilter, setCountryFilter] = useState('');

    // Form state
    const [airportIata, setAirportIata] = useState<string>(FRATERNITE_DEPARTURES[0].iata);
    const [roomType, setRoomType] = useState<FraterniteRoomType>('QUADRUPLE');
    const [pilgrimsCount, setPilgrimsCount] = useState<number>(1);
    const [breakfast, setBreakfast] = useState<boolean>(false);
    const [extraBaggage, setExtraBaggage] = useState<boolean>(false);
    const [gender, setGender] = useState<'M' | 'F'>('M');
    const [firstName, setFirstName] = useState('');
    const [familyName, setFamilyName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [nationality, setNationality] = useState('');
    const [visaSituation, setVisaSituation] = useState<'À vérifier / à obtenir' | 'Visa déjà détenu'>('À vérifier / à obtenir');
    const [remarks, setRemarks] = useState('');
    const [consent, setConsent] = useState(false);
    const [websiteHoneypot, setWebsiteHoneypot] = useState('');

    // Submission state
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submittedWhatsAppUrl, setSubmittedWhatsAppUrl] = useState<string | null>(null);

    const countries = useMemo(() => getFraterniteCountries(), []);

    const filteredDepartures = useMemo(
        () => filterFraterniteDepartures(searchQuery, countryFilter),
        [searchQuery, countryFilter]
    );

    const quote = useMemo(
        () =>
            calculateFraterniteQuote({
                airportIata,
                roomType,
                pilgrimsCount,
                breakfast,
            }),
        [airportIata, roomType, pilgrimsCount, breakfast]
    );

    const handleSelectAirportFromCard = (iata: string) => {
        setAirportIata(iata);
        const dep = FRATERNITE_DEPARTURES.find((d) => d.iata === iata);
        if (dep && !isPaidHoldBaggage(dep)) {
            setExtraBaggage(false);
        }
        setSubmittedWhatsAppUrl(null);
        setSubmitError(null);
        formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleAirportSelectChange = (nextIata: string) => {
        setAirportIata(nextIata);
        const dep = FRATERNITE_DEPARTURES.find((d) => d.iata === nextIata);
        if (dep && !isPaidHoldBaggage(dep)) {
            setExtraBaggage(false);
        }
    };

    const scrollToForm = () => {
        formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const openAndScrollToFlights = () => {
        setShowFlightsExplorer(true);
        setTimeout(() => {
            flightsExplorerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 80);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);

        if (!consent) {
            setSubmitError('Veuillez cocher la case d’acceptation pour envoyer votre demande.');
            return;
        }

        setSubmitting(true);
        try {
            const res = await submitFraternitePromoRequest({
                airportIata,
                roomType,
                pilgrimsCount: Number(pilgrimsCount),
                breakfast,
                extraBaggage: quote.paidHoldBaggage ? extraBaggage : false,
                gender,
                firstName,
                familyName,
                phone,
                email,
                nationality,
                visaSituation,
                remarks,
                consent: true,
                website: websiteHoneypot,
            });

            if (res.error || !res.whatsappUrl) {
                setSubmitError(res.error || "Impossible d'envoyer votre demande. Veuillez vérifier vos informations.");
                return;
            }

            setSubmittedWhatsAppUrl(res.whatsappUrl);

            // Ouverture WhatsApp pré-rempli (compatible mobile & desktop)
            const popup = window.open(res.whatsappUrl, '_blank', 'noopener,noreferrer');
            if (!popup) {
                window.location.href = res.whatsappUrl;
            }
        } catch (err: any) {
            setSubmitError(err?.message || "Une erreur inattendue est survenue.");
        } finally {
            setSubmitting(false);
        }
    };

    const renderRouteBlock = (d: FraterniteDeparture, isReturn: boolean) => {
        const title = isReturn ? 'Retour · 10 février' : 'Aller · 27 janvier';
        const fromCode = isReturn ? 'JED' : d.iata;
        const toCode = isReturn ? d.iata : 'JED';
        const depTime = isReturn ? d.returnDep : d.outboundDep;
        const arrTime = isReturn ? d.returnArr : d.outboundArr;
        const layover = isReturn ? d.returnLayover : d.outboundLayover;
        const duration = isReturn ? d.returnDuration : d.outboundDuration;

        return (
            <div className="border-l-2 border-amber-400/80 pl-3 py-1 my-2 text-left">
                <span className="block text-[11px] font-black uppercase tracking-wider text-amber-300">
                    {title}
                </span>
                <span className="block text-xs font-bold text-white mt-0.5">
                    {fromCode} {depTime} → {toCode} {arrTime}
                </span>
                <span className="block text-[11px] text-emerald-100/80">
                    {d.stopover === 'Direct' ? 'Vol direct' : `Escale ${d.stopover} : ${layover}`} · Durée {duration}
                </span>
            </div>
        );
    };

    return (
        <section
            id="offre-fraternite-2027"
            aria-label="Offre Promotionnelle — L'Omra de la Fraternité Musulmane 2027"
            className="mb-14 w-full max-w-6xl mx-auto space-y-6"
        >
            {/* 1. HERO PROMOTIONNEL VEDETTE */}
            <div className="glass rounded-[2.5rem] sm:rounded-[3rem] border-2 border-amber-400/60 bg-gradient-to-br from-emerald-950/90 via-[#073B20]/90 to-[#041F10]/95 text-white overflow-hidden shadow-[0_25px_70px_-15px_rgba(245,158,11,0.35)] relative">
                {/* Ambient glows */}
                <div className="absolute -top-20 -right-20 w-96 h-96 bg-amber-400/20 blur-3xl rounded-full pointer-events-none" />
                <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-emerald-400/15 blur-3xl rounded-full pointer-events-none" />

                <div className="p-6 sm:p-10 lg:p-12 relative z-10">
                    {/* Top Ribbon & Status */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/20 border border-amber-300/60 text-[#FDE68A] text-[10px] sm:text-xs font-black uppercase tracking-[0.18em] shadow-lg">
                            <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                            <span>OFFRE PROMOTIONNELLE • CHAABANE &amp; DÉBUT RAMADAN 1448</span>
                        </div>

                        <span className="bg-emerald-500/25 text-emerald-200 border border-emerald-400/40 text-[10px] font-black uppercase px-3.5 py-1.5 rounded-full tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                            Préinscriptions Ouvertes • 3 Continents
                        </span>
                    </div>

                    {/* Hero Grid: Text + Kaaba SVG */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        <div className="lg:col-span-8 space-y-4 text-left">
                            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.02]">
                                L’Islam n’a pas{' '}
                                <span className="haramain-title-3d">de frontières.</span>
                            </h2>

                            <p className="text-lg sm:text-2xl font-extrabold text-amber-200 tracking-tight">
                                L’Omra de la Fraternité Musulmane
                            </p>

                            <p className="text-sm sm:text-base text-emerald-50/90 leading-relaxed max-w-2xl">
                                Trois continents, treize pays, des origines différentes, une seule Oumma. Retrouvons-nous dans une même adoration, le partage et la fraternité.
                            </p>

                            <div className="flex flex-wrap items-center gap-3 pt-1">
                                <span className="haramain-pill px-4 py-2 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider inline-flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-amber-400" />
                                    Du 27 janvier au 10 février 2027
                                </span>
                                <span className="px-4 py-2 rounded-xl bg-white/10 border border-white/15 text-xs font-bold text-amber-100 inline-flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-emerald-300" />
                                    13 pays • 23 aéroports de départ
                                </span>
                            </div>

                            {/* Price & CTAs */}
                            <div className="pt-4 space-y-4 border-t border-white/10">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-200/80 block">
                                        Tarif promotionnel d’appel
                                    </span>
                                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mt-1">
                                        <div className="text-3xl sm:text-4xl font-black text-[#FDE68A] tracking-tight leading-none whitespace-nowrap">
                                            À partir de 1&nbsp;195&nbsp;€
                                        </div>
                                        <span className="text-xs sm:text-sm text-emerald-100/85 font-medium whitespace-nowrap">
                                            • Par personne en chambre quadruple
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={scrollToForm}
                                        className="btn-3d-gold px-6 py-3.5 rounded-2xl text-amber-950 font-black text-xs sm:text-sm uppercase tracking-wider inline-flex items-center justify-center gap-2.5 cursor-pointer"
                                    >
                                        <span>Choisir mon départ et m’inscrire</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={openAndScrollToFlights}
                                        className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-amber-300/40 text-white font-bold text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-all cursor-pointer"
                                    >
                                        <Plane className="w-4 h-4 text-amber-300" />
                                        <span>Voir les 23 aéroports</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Stylized Kaaba Illustration from official promo */}
                        <div className="lg:col-span-4 flex justify-center">
                            <svg
                                viewBox="0 0 360 360"
                                role="img"
                                aria-label="Illustration stylisée de la Kaaba"
                                className="w-full max-w-[230px] sm:max-w-[280px] drop-shadow-[0_15px_35px_rgba(0,0,0,0.45)]"
                            >
                                <circle cx="180" cy="180" r="166" fill="none" stroke="#e9c881" strokeOpacity="0.65" />
                                <circle cx="180" cy="180" r="152" fill="none" stroke="#e9c881" strokeOpacity="0.35" />
                                <path d="M235 40a33 33 0 1 0 32 49 33 33 0 0 1-32-49" fill="#e9c881" />
                                <g fill="#b3c2aa">
                                    <path d="M38 265h25V130l-12-25-13 25zM297 265h25V130l-12-25-13 25z" />
                                </g>
                                <path d="M91 156 208 132 278 170 278 272 161 300 91 259Z" fill="#121b1d" />
                                <path d="M91 156 208 132 278 170 161 195Z" fill="#344141" />
                                <path d="M91 156 161 195 161 300 91 259Z" fill="#202c2d" />
                                <path d="M91 179 161 219 278 193 278 208 161 234 91 194Z" fill="#dfb969" />
                                <path d="M208 244 245 235 245 280 208 289Z" fill="#cba34b" />
                                <path d="M35 308Q180 286 325 308" fill="none" stroke="#e9c881" strokeWidth="2" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* 4 Key Facts Bar */}
                <div className="bg-black/35 border-t border-amber-400/30 px-6 py-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center relative z-10">
                    <div>
                        <strong className="block text-xl sm:text-2xl font-black text-[#FDE68A]">23</strong>
                        <span className="text-xs text-emerald-100/90 font-medium">aéroports</span>
                    </div>
                    <div>
                        <strong className="block text-xl sm:text-2xl font-black text-[#FDE68A]">2 Omras</strong>
                        <span className="text-xs text-emerald-100/90 font-medium">Chaabane puis Ramadan*</span>
                    </div>
                    <div>
                        <strong className="block text-xl sm:text-2xl font-black text-[#FDE68A]">2 Joumouaa</strong>
                        <span className="text-xs text-emerald-100/90 font-medium">Makkah et Médine</span>
                    </div>
                    <div>
                        <strong className="block text-xl sm:text-2xl font-black text-[#FDE68A]">14 nuits</strong>
                        <span className="text-xs text-emerald-100/90 font-medium">réservées à l’hôtel</span>
                    </div>
                </div>
            </div>

            {/* 2. LE PROGRAMME (3 ÉTAPES — DIRECTEMENT VISIBLE) */}
            <div className="glass rounded-[2.25rem] p-6 sm:p-8 border border-amber-400/30 space-y-5 text-left">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                    <div>
                        <span className="text-[11px] font-black uppercase tracking-[0.18em] text-[#D8AA4D] block">
                            Le programme
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-main mt-1">
                            Deux Omras, deux moments bénis
                        </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-sub max-w-xl">
                        Des pèlerins du monde entier réunis dans un même groupe. Partage des chambres selon la formule et dans le respect des règles d’hébergement.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {FRATERNITE_PROGRAM_STEPS.map((item) => (
                        <article
                            key={item.step}
                            className="rounded-2xl p-5 bg-black/20 border border-amber-400/25 hover:border-amber-400/60 transition-all flex flex-col justify-between space-y-3"
                        >
                            <div className="space-y-2">
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                    <span className="text-[11px] font-black uppercase tracking-widest text-[#D8AA4D]">
                                        {item.step}
                                    </span>
                                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                                        {item.nightsBadge}
                                    </span>
                                </div>
                                <p className="text-sm font-extrabold text-main">{item.dates}</p>
                                <h4 className="text-base font-black text-[#F2CE79] flex items-center gap-2">
                                    <Hotel className="w-4 h-4 shrink-0 text-amber-400" />
                                    <span>{item.hotel}</span>
                                </h4>
                            </div>
                            <p className="text-xs text-sub leading-relaxed">{item.description}</p>
                        </article>
                    ))}
                </div>

                <p className="text-[11px] text-dim leading-relaxed">
                    * Ramadan prévu le 8 février 2027, sous réserve de l’observation lunaire. Les 14 nuits correspondent aux réservations hôtelières ; selon les horaires de vol, l’arrivée effective est le 28 janvier et le départ hôtel peut intervenir le 9 février au soir.
                </p>
            </div>

            {/* 3. ACCORDÉONS OPTION B : EXPLORATEUR DES 23 AÉROPORTS + FORMULE COMPLÈTE / BAGAGES / FAQ */}
            <div ref={flightsExplorerRef} className="grid grid-cols-1 gap-4">
                {/* Accordéon A : Les 23 Aéroports */}
                <div className="glass rounded-[2rem] border border-emerald-500/30 overflow-hidden">
                    <button
                        type="button"
                        onClick={() => setShowFlightsExplorer((prev) => !prev)}
                        aria-expanded={showFlightsExplorer}
                        className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left hover:bg-white/5 transition-colors cursor-pointer"
                    >
                        <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
                                <Plane className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#D8AA4D] block">
                                    Europe · Afrique · Amérique du Nord
                                </span>
                                <span className="text-base sm:text-lg font-black text-main block">
                                    Comparer les 23 aéroports, compagnies, horaires &amp; tarifs
                                </span>
                                <span className="text-xs text-dim block mt-0.5">
                                    France, Belgique (Bruxelles 1&nbsp;295&nbsp;€, Charleroi 1&nbsp;195&nbsp;€), Espagne, Italie, Maroc, Algérie, Tunisie, Sénégal, Côte d’Ivoire, Canada, USA, UK, Pays-Bas
                                </span>
                            </div>
                        </div>

                        <div className="px-3.5 py-2 rounded-xl bg-amber-400/15 border border-amber-400/40 text-[#F2CE79] text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shrink-0">
                            <span className="hidden sm:inline">{showFlightsExplorer ? 'Replier' : 'Explorer'}</span>
                            {showFlightsExplorer ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                    </button>

                    {showFlightsExplorer && (
                        <div className="px-6 pb-6 pt-2 border-t border-white/10 space-y-5 text-left animate-fade-in">
                            <p className="text-xs sm:text-sm text-sub">
                                Aller le 27 janvier, retour de Djeddah le 10 février 2027. Tarifs par personne en chambre quadruple. Horaires locaux, sous réserve de modification.
                            </p>

                            {/* Search & Country Filter */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="sm:col-span-2 relative">
                                    <Search className="w-4 h-4 text-dim absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <input
                                        type="search"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        aria-label="Chercher un aéroport"
                                        placeholder="Rechercher une ville, un code IATA ou une compagnie..."
                                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/25 border border-white/15 text-sm text-main placeholder:text-dim focus:border-amber-400 outline-none"
                                    />
                                </div>
                                <select
                                    value={countryFilter}
                                    onChange={(e) => setCountryFilter(e.target.value)}
                                    aria-label="Filtrer par pays"
                                    className="w-full px-4 py-3 rounded-xl bg-black/25 border border-white/15 text-sm text-main focus:border-amber-400 outline-none"
                                >
                                    <option value="" className="bg-[#062E17] text-white">
                                        Tous les pays (13)
                                    </option>
                                    {countries.map((c) => (
                                        <option key={c} value={c} className="bg-[#062E17] text-white">
                                            {c}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Flights Grid */}
                            {filteredDepartures.length === 0 ? (
                                <p className="text-sm text-dim py-6 text-center">Aucun départ ne correspond à votre recherche.</p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                                    {filteredDepartures.map((d) => {
                                        const airline = FRATERNITE_AIRLINES[d.airlineCode];
                                        const soutePayante = isPaidHoldBaggage(d);
                                        const isSelected = d.iata === airportIata;

                                        return (
                                            <article
                                                key={d.iata}
                                                className={`rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                                                    isSelected
                                                        ? 'bg-emerald-900/50 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.2)]'
                                                        : 'bg-black/25 border-white/10 hover:border-amber-400/50'
                                                }`}
                                            >
                                                <div>
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div>
                                                            <span className="text-[10px] font-black uppercase tracking-wider text-dim block">
                                                                {d.country}
                                                            </span>
                                                            <h4 className="text-base font-black text-main">
                                                                {d.city} ({d.iata})
                                                            </h4>
                                                        </div>
                                                        <span className="text-lg font-black text-[#FDE68A] whitespace-nowrap">
                                                            {formatEur(d.basePriceEur)}
                                                        </span>
                                                    </div>

                                                    <div className="text-xs font-bold text-emerald-300 mt-1">
                                                        {airline.name} · {d.stopover === 'Direct' ? 'Vol Direct' : `1 escale (${d.stopover})`}
                                                    </div>

                                                    <div className="text-[11px] text-dim mt-1">
                                                        {getVisaRuleLabel(d.iata)}
                                                        {soutePayante ? ' · Soute payante' : ''}
                                                    </div>

                                                    {d.specialNote && (
                                                        <p className="text-[11px] text-amber-300/90 mt-1.5 bg-amber-500/10 border border-amber-400/25 rounded-lg px-2.5 py-1.5">
                                                            ⚠️ {d.specialNote}
                                                        </p>
                                                    )}

                                                    <details className="mt-2.5 text-xs group">
                                                        <summary className="cursor-pointer font-bold text-[#F2CE79] hover:underline select-none">
                                                            Horaires et bagages
                                                        </summary>
                                                        <div className="mt-2 p-3 rounded-xl bg-[#052914]/90 text-white border border-white/10">
                                                            {renderRouteBlock(d, false)}
                                                            {renderRouteBlock(d, true)}
                                                            <p className="text-[11px] text-amber-100/90 mt-2 pt-2 border-t border-white/10">
                                                                🧳 {airline.baggageAllowance}
                                                            </p>
                                                        </div>
                                                    </details>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => handleSelectAirportFromCard(d.iata)}
                                                    className="mt-4 w-full py-2.5 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 hover:text-[#041F10] border border-emerald-400/40 text-emerald-200 text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                                                >
                                                    Choisir ce départ →
                                                </button>
                                            </article>
                                        );
                                    })}
                                </div>
                            )}

                            <p className="text-[11px] text-dim">
                                +1 : arrivée le lendemain. Pour Nice, les conditions de correspondance restent à vérifier (alerte sur la recherche initiale).
                            </p>
                        </div>
                    )}
                </div>

                {/* Accordéon B : Formule Complète (8 tuiles), Bagages (8 compagnies) & FAQ */}
                <div className="glass rounded-[2rem] border border-amber-400/30 overflow-hidden">
                    <button
                        type="button"
                        onClick={() => setShowDetailsAndFaq((prev) => !prev)}
                        aria-expanded={showDetailsAndFaq}
                        className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left hover:bg-white/5 transition-colors cursor-pointer"
                    >
                        <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-[#F2CE79] shrink-0">
                                <Luggage className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#D8AA4D] block">
                                    Prestations &amp; Informations Pratiques
                                </span>
                                <span className="text-base sm:text-lg font-black text-main block">
                                    Formule complète (8 inclus), franchises bagages &amp; FAQ
                                </span>
                                <span className="text-xs text-dim block mt-0.5">
                                    Vols A/R, 14 nuits hôtels, transferts, visites Médine, visa selon passeport &amp; accompagnement Omrayanair
                                </span>
                            </div>
                        </div>

                        <div className="px-3.5 py-2 rounded-xl bg-amber-400/15 border border-amber-400/40 text-[#F2CE79] text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shrink-0">
                            <span className="hidden sm:inline">{showDetailsAndFaq ? 'Replier' : 'Détails'}</span>
                            {showDetailsAndFaq ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                    </button>

                    {showDetailsAndFaq && (
                        <div className="px-6 pb-6 pt-2 border-t border-white/10 space-y-6 text-left animate-fade-in">
                            {/* 8 Included Tiles */}
                            <div>
                                <h4 className="text-sm font-black uppercase tracking-wider text-[#F2CE79] mb-3 flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                    Ce que comprend la formule complète
                                </h4>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {FRATERNITE_INCLUDED_TILES.map((tile) => (
                                        <div
                                            key={tile.title}
                                            className="p-3.5 rounded-xl bg-black/25 border border-white/10"
                                        >
                                            <strong className="block text-xs font-black text-main">{tile.title}</strong>
                                            <span className="text-[11px] text-dim mt-0.5 block">{tile.subtitle}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 8 Airlines Baggage */}
                            <div>
                                <h4 className="text-sm font-black uppercase tracking-wider text-[#F2CE79] mb-3 flex items-center gap-2">
                                    <Luggage className="w-4 h-4 text-amber-400" />
                                    Bagages aller-retour par compagnie
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {Object.values(FRATERNITE_AIRLINES).map((airline) => (
                                        <div
                                            key={airline.code}
                                            className="p-3.5 rounded-xl bg-black/25 border border-white/10 text-xs"
                                        >
                                            <strong className="text-main font-black">{airline.name}</strong>
                                            <p className="text-sub mt-1">{airline.baggageAllowance}</p>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[11px] text-dim mt-3">
                                    Franchises prévues à confirmer sur le billet. Soute payante : Marseille, Bruxelles, Charleroi, Nice et Londres. Casablanca sans visa ; Tunis avec visa ; autres destinations selon éligibilité et confirmation.
                                </p>
                            </div>

                            {/* FAQ */}
                            <div>
                                <h4 className="text-sm font-black uppercase tracking-wider text-[#F2CE79] mb-3 flex items-center gap-2">
                                    <HelpCircle className="w-4 h-4 text-emerald-400" />
                                    Questions fréquentes
                                </h4>
                                <div className="space-y-2.5">
                                    {FRATERNITE_FAQS.map((faq) => (
                                        <details
                                            key={faq.question}
                                            className="p-3.5 rounded-xl bg-black/25 border border-white/10 text-xs"
                                        >
                                            <summary className="cursor-pointer font-black text-main">
                                                {faq.question}
                                            </summary>
                                            <p className="text-sub mt-2 leading-relaxed">{faq.answer}</p>
                                        </details>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 4. FORMULAIRE DE PRÉINSCRIPTION & DEVIS INDICATIF EN TEMPS RÉEL */}
            <div
                id="inscription-fraternite"
                ref={formSectionRef}
                className="glass rounded-[2.5rem] p-6 sm:p-8 lg:p-10 border-2 border-amber-400/50 space-y-6 text-left scroll-mt-6"
            >
                <div>
                    <span className="text-[11px] font-black uppercase tracking-[0.18em] text-[#D8AA4D] block">
                        Préinscription • Sans paiement en ligne
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-main mt-1">
                        Rejoignez la fraternité sans frontières
                    </h3>
                    <p className="text-xs sm:text-sm text-sub mt-1 max-w-3xl">
                        Remplissez le formulaire ci-dessous et consultez votre tarif indicatif en direct : votre demande est immédiatement enregistrée dans notre Backoffice Conciergerie puis prête à être envoyée sur WhatsApp.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left Column: Fields */}
                    <div className="lg:col-span-7 rounded-3xl p-5 sm:p-6 bg-black/20 border border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Honeypot anti-spam */}
                        <input
                            type="text"
                            name="website"
                            value={websiteHoneypot}
                            onChange={(e) => setWebsiteHoneypot(e.target.value)}
                            tabIndex={-1}
                            autoComplete="off"
                            aria-hidden="true"
                            className="hidden"
                        />

                        {submitError && (
                            <div className="sm:col-span-2 p-3.5 rounded-xl bg-red-500/15 border border-red-400/40 text-red-200 text-xs font-semibold flex items-center gap-2.5">
                                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                                <span>{submitError}</span>
                            </div>
                        )}

                        <div className="sm:col-span-2 space-y-1.5">
                            <label htmlFor="frat-airport" className="text-xs font-black uppercase tracking-wider text-main block">
                                Aéroport de départ *
                            </label>
                            <select
                                id="frat-airport"
                                required
                                value={airportIata}
                                onChange={(e) => handleAirportSelectChange(e.target.value)}
                                className="w-full p-3.5 rounded-xl bg-[#052914] border border-amber-400/40 text-xs sm:text-sm font-bold text-white focus:border-amber-300 outline-none"
                            >
                                {FRATERNITE_DEPARTURES.map((d) => (
                                    <option key={d.iata} value={d.iata} className="bg-[#052914] text-white">
                                        {d.city} ({d.iata}) — {FRATERNITE_AIRLINES[d.airlineCode].name} — {formatEur(d.basePriceEur)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="frat-room" className="text-xs font-black uppercase tracking-wider text-main block">
                                Type de chambre
                            </label>
                            <select
                                id="frat-room"
                                value={roomType}
                                onChange={(e) => setRoomType(e.target.value as FraterniteRoomType)}
                                className="w-full p-3.5 rounded-xl bg-[#052914] border border-white/15 text-xs sm:text-sm text-white focus:border-amber-400 outline-none"
                            >
                                {(Object.keys(FRATERNITE_ROOM_OPTIONS) as FraterniteRoomType[]).map((key) => (
                                    <option key={key} value={key} className="bg-[#052914] text-white">
                                        {FRATERNITE_ROOM_OPTIONS[key].label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="frat-count" className="text-xs font-black uppercase tracking-wider text-main block">
                                Nombre de pèlerins *
                            </label>
                            <input
                                id="frat-count"
                                type="number"
                                min={1}
                                max={30}
                                step={1}
                                required
                                value={pilgrimsCount}
                                onChange={(e) => setPilgrimsCount(Number(e.target.value))}
                                className="w-full p-3.5 rounded-xl bg-black/30 border border-white/15 text-xs sm:text-sm text-main focus:border-amber-400 outline-none"
                            />
                        </div>

                        {/* Options Petit-déjeuner & Soute */}
                        <div className="sm:col-span-2 space-y-2.5 pt-1">
                            <label className="flex items-start gap-2.5 cursor-pointer text-xs sm:text-sm font-semibold text-main">
                                <input
                                    type="checkbox"
                                    checked={breakfast}
                                    onChange={(e) => setBreakfast(e.target.checked)}
                                    className="w-4 h-4 mt-0.5 rounded accent-emerald-500 cursor-pointer shrink-0"
                                />
                                <span>Petit-déjeuner (+150 € / personne)</span>
                            </label>

                            {quote.paidHoldBaggage && (
                                <label className="flex items-start gap-2.5 cursor-pointer text-xs sm:text-sm font-semibold text-amber-300 bg-amber-500/10 border border-amber-400/30 p-3 rounded-xl">
                                    <input
                                        type="checkbox"
                                        checked={extraBaggage}
                                        onChange={(e) => setExtraBaggage(e.target.checked)}
                                        className="w-4 h-4 mt-0.5 rounded accent-amber-400 cursor-pointer shrink-0"
                                    />
                                    <span>Demander un bagage en soute (tarif compagnie à confirmer)</span>
                                </label>
                            )}
                        </div>

                        {/* Civilité / Genre */}
                        <div className="sm:col-span-2 space-y-1.5">
                            <span className="text-xs font-black uppercase tracking-wider text-main block">
                                Genre du responsable de dossier *
                            </span>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setGender('M')}
                                    className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border transition-all cursor-pointer ${
                                        gender === 'M'
                                            ? 'bg-emerald-500 text-[#041F10] border-emerald-400'
                                            : 'bg-black/20 text-sub border-white/15 hover:border-white/30'
                                    }`}
                                >
                                    Homme
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setGender('F')}
                                    className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border transition-all cursor-pointer ${
                                        gender === 'F'
                                            ? 'bg-emerald-500 text-[#041F10] border-emerald-400'
                                            : 'bg-black/20 text-sub border-white/15 hover:border-white/30'
                                    }`}
                                >
                                    Femme
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="frat-first" className="text-xs font-black uppercase tracking-wider text-main block">
                                Prénom *
                            </label>
                            <input
                                id="frat-first"
                                type="text"
                                autoComplete="given-name"
                                maxLength={80}
                                required
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="Votre prénom"
                                className="w-full p-3.5 rounded-xl bg-black/30 border border-white/15 text-xs sm:text-sm text-main focus:border-amber-400 outline-none"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="frat-last" className="text-xs font-black uppercase tracking-wider text-main block">
                                Nom *
                            </label>
                            <input
                                id="frat-last"
                                type="text"
                                autoComplete="family-name"
                                maxLength={80}
                                required
                                value={familyName}
                                onChange={(e) => setFamilyName(e.target.value)}
                                placeholder="Votre nom"
                                className="w-full p-3.5 rounded-xl bg-black/30 border border-white/15 text-xs sm:text-sm text-main focus:border-amber-400 outline-none"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="frat-phone" className="text-xs font-black uppercase tracking-wider text-main block">
                                Téléphone / WhatsApp *
                            </label>
                            <input
                                id="frat-phone"
                                type="tel"
                                autoComplete="tel"
                                maxLength={40}
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+33 6 12 34 56 78"
                                className="w-full p-3.5 rounded-xl bg-black/30 border border-white/15 text-xs sm:text-sm text-main focus:border-amber-400 outline-none"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="frat-email" className="text-xs font-black uppercase tracking-wider text-main block">
                                E-mail (facultatif)
                            </label>
                            <input
                                id="frat-email"
                                type="email"
                                autoComplete="email"
                                maxLength={120}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="votre.email@domaine.com"
                                className="w-full p-3.5 rounded-xl bg-black/30 border border-white/15 text-xs sm:text-sm text-main focus:border-amber-400 outline-none"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="frat-nationality" className="text-xs font-black uppercase tracking-wider text-main block">
                                Nationalité du passeport *
                            </label>
                            <input
                                id="frat-nationality"
                                type="text"
                                maxLength={80}
                                required
                                value={nationality}
                                onChange={(e) => setNationality(e.target.value)}
                                placeholder="Ex : Française, Belge, Marocaine..."
                                className="w-full p-3.5 rounded-xl bg-black/30 border border-white/15 text-xs sm:text-sm text-main focus:border-amber-400 outline-none"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="frat-visa" className="text-xs font-black uppercase tracking-wider text-main block">
                                Situation du visa
                            </label>
                            <select
                                id="frat-visa"
                                value={visaSituation}
                                onChange={(e) => setVisaSituation(e.target.value as 'À vérifier / à obtenir' | 'Visa déjà détenu')}
                                className="w-full p-3.5 rounded-xl bg-[#052914] border border-white/15 text-xs sm:text-sm text-white focus:border-amber-400 outline-none"
                            >
                                <option value="À vérifier / à obtenir" className="bg-[#052914] text-white">
                                    À vérifier / à obtenir
                                </option>
                                <option value="Visa déjà détenu" className="bg-[#052914] text-white">
                                    Visa déjà détenu
                                </option>
                            </select>
                        </div>

                        <div className="sm:col-span-2 space-y-1.5">
                            <label htmlFor="frat-remarks" className="text-xs font-black uppercase tracking-wider text-main block">
                                Précisions (facultatif)
                            </label>
                            <textarea
                                id="frat-remarks"
                                rows={3}
                                maxLength={500}
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                placeholder="Composition du groupe, liens familiaux, demandes particulières…"
                                className="w-full p-3.5 rounded-xl bg-black/30 border border-white/15 text-xs sm:text-sm text-main focus:border-amber-400 outline-none resize-none"
                            />
                        </div>

                        <div className="sm:col-span-2 pt-1">
                            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-sub leading-relaxed">
                                <input
                                    type="checkbox"
                                    required
                                    checked={consent}
                                    onChange={(e) => setConsent(e.target.checked)}
                                    className="w-4 h-4 mt-0.5 rounded accent-emerald-500 cursor-pointer shrink-0"
                                />
                                <span>
                                    J’accepte que mes informations soient enregistrées par la Conciergerie Omrayanair et transmises via WhatsApp pour traiter ma demande. Je comprends qu’il ne s’agit pas d’une réservation confirmée.
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Right Column: Sticky Live Summary & Submit */}
                    <aside className="lg:col-span-5 rounded-3xl p-6 bg-gradient-to-b from-[#084423] to-[#041F10] border-2 border-amber-400/50 text-white shadow-2xl lg:sticky lg:top-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <h4 className="text-lg font-black uppercase tracking-wider text-[#FDE68A]">
                                Votre formule
                            </h4>
                            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/40">
                                {quote.departure.country}
                            </span>
                        </div>

                        <div>
                            <strong className="text-base font-black text-white block">
                                {quote.departure.city} ({quote.departure.iata}) · {quote.airline.name}
                            </strong>
                            {renderRouteBlock(quote.departure, false)}
                            {renderRouteBlock(quote.departure, true)}
                            <p className="text-[11px] text-emerald-100/85 mt-2 leading-relaxed">
                                🧳 {quote.airline.baggageAllowance}
                                <br />
                                🛂 {quote.visaRule}
                            </p>
                            {quote.departure.specialNote && (
                                <p className="text-[11px] text-amber-200 bg-amber-500/15 border border-amber-400/30 rounded-xl p-2.5 mt-2">
                                    ⚠️ {quote.departure.specialNote}
                                </p>
                            )}
                        </div>

                        <div aria-live="polite" className="p-4 rounded-2xl bg-black/30 border border-amber-400/30 space-y-3">
                            <div>
                                <span className="text-xs text-emerald-100/80 block">Tarif indicatif par personne</span>
                                <strong className="text-3xl font-black text-[#FDE68A] leading-tight block whitespace-nowrap">
                                    {formatEur(quote.perPersonEur)}
                                </strong>
                            </div>

                            <div className="pt-2 border-t border-white/10">
                                <span className="text-xs text-emerald-100/80 block">
                                    Total estimé du groupe ({quote.validCount ? `${quote.pilgrimsCount} pèlerin${quote.pilgrimsCount > 1 ? 's' : ''}` : '—'})
                                </span>
                                <strong className="text-3xl font-black text-emerald-300 leading-tight block whitespace-nowrap">
                                    {quote.validCount ? formatEur(quote.totalEur) : '—'}
                                </strong>
                            </div>
                        </div>

                        <p className="text-[11px] text-emerald-100/75 leading-relaxed">
                            Hors suppléments non chiffrés (visa ou soute si non inclus). Prix et disponibilité à confirmer par l’équipe Omrayanair.
                        </p>

                        {submittedWhatsAppUrl ? (
                            <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 space-y-3">
                                <div className="flex items-start gap-2.5">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" />
                                    <div className="text-xs text-white leading-relaxed">
                                        <strong className="block text-emerald-200 font-black uppercase">
                                            Demande enregistrée au Backoffice !
                                        </strong>
                                        Votre récapitulatif est prêt sur WhatsApp. Si la fenêtre ne s’est pas ouverte automatiquement, cliquez ci-dessous :
                                    </div>
                                </div>
                                <a
                                    href={submittedWhatsAppUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-3d-gold w-full py-3.5 px-4 rounded-2xl text-amber-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 text-center"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    <span>Ouvrir WhatsApp et Envoyer ↗</span>
                                </a>
                            </div>
                        ) : (
                            <button
                                type="submit"
                                disabled={submitting}
                                className="btn-3d-gold w-full py-4 px-5 rounded-2xl text-amber-950 font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 disabled:opacity-60 cursor-pointer"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Enregistrement en cours...</span>
                                    </>
                                ) : (
                                    <>
                                        <MessageCircle className="w-4 h-4" />
                                        <span>Envoyer ma demande sur WhatsApp ↗</span>
                                    </>
                                )}
                            </button>
                        )}

                        <p className="text-[11px] text-emerald-100/75 text-center">
                            WhatsApp Conciergerie : <strong className="text-amber-200">{FRATERNITE_WHATSAPP_DISPLAY}</strong> · Il faudra ensuite appuyer sur Envoyer dans WhatsApp.
                        </p>
                    </aside>
                </form>
            </div>
        </section>
    );
}
