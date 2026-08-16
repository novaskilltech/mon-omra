'use client';

import Link from 'next/link';
import { ArrowLeft, Plane, Sparkles } from 'lucide-react';
import ThemeSelector from '@/components/ThemeSelector';

interface Airport {
    name: string;
    code: string;
    description: string;
}

interface CountryGroup {
    country: string;
    flag: string;
    code: string;
    airports: Airport[];
}

const COUNTRIES_AIRPORTS: CountryGroup[] = [
    {
        country: "France",
        flag: "🇫🇷",
        code: "fr",
        airports: [
            { name: "Paris", code: "PARIS", description: "CDG / ORY / BVA" },
            { name: "Marseille", code: "MARSEILLE", description: "MRS" },
            { name: "Lyon", code: "LYON", description: "LYS" },
            { name: "Nice", code: "NICE", description: "NCE" },
            { name: "Mulhouse", code: "MULHOUSE", description: "EAP / BSL / MLH" }
        ]
    },
    {
        country: "Belgique",
        flag: "🇧🇪",
        code: "be",
        airports: [
            { name: "Bruxelles", code: "BRUXELLES", description: "BRU" },
            { name: "Charleroi", code: "CHARLEROI", description: "CRL" }
        ]
    },
    {
        country: "Suisse",
        flag: "🇨🇭",
        code: "ch",
        airports: [
            { name: "Genève", code: "GENEVE", description: "GVA" },
            { name: "Zurich", code: "ZURICH", description: "ZRH" }
        ]
    },
    {
        country: "Espagne",
        flag: "🇪🇸",
        code: "es",
        airports: [
            { name: "Barcelone", code: "BARCELONE", description: "BCN" },
            { name: "Madrid", code: "MADRID", description: "MAD" },
            { name: "Malaga", code: "MALAGA", description: "AGP" }
        ]
    },
    {
        country: "Italie",
        flag: "🇮🇹",
        code: "it",
        airports: [
            { name: "Milan", code: "MILAN", description: "MXP" },
            { name: "Rome", code: "ROME", description: "FCO" }
        ]
    },
    {
        country: "Allemagne",
        flag: "🇩🇪",
        code: "de",
        airports: [
            { name: "Cologne", code: "COLOGNE", description: "CGN" }
        ]
    },
    {
        country: "Maroc",
        flag: "🇲🇦",
        code: "ma",
        airports: [
            { name: "Casablanca", code: "CASABLANCA", description: "CMN" }
        ]
    },
    {
        country: "Tunisie",
        flag: "🇹🇳",
        code: "tn",
        airports: [
            { name: "Tunis", code: "TUNIS", description: "TUN" }
        ]
    },
    {
        country: "Algérie",
        flag: "🇩🇿",
        code: "dz",
        airports: [
            { name: "Alger", code: "ALGER", description: "ALG" }
        ]
    },
    {
        country: "Égypte",
        flag: "🇪🇬",
        code: "eg",
        airports: [
            { name: "Le Caire", code: "LE CAIRE", description: "CAI" }
        ]
    }
];

export default function DepartPage() {
    return (
        <main className="min-h-screen text-main selection:bg-emerald-500/30 font-inter relative overflow-x-hidden pb-20">
            {/* Background Glows */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[140px] rounded-full" />
                <div className="absolute top-[30%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[140px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-emerald-500/5 blur-[140px] rounded-full" />
            </div>

            {/* Float Theme Selector */}
            <div className="fixed bottom-6 right-6 z-50">
                <ThemeSelector />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
                {/* Header Navbar */}
                <nav className="relative z-50 flex justify-between items-center py-6 border-b border-white/5 mb-12">
                    <Link href="/" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-dim hover:text-emerald-500 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Retour à l'accueil
                    </Link>
                    <div className="text-xl font-black tracking-tighter uppercase">
                        OMRA<span className="text-emerald-500">YANAIR</span>
                    </div>
                </nav>

                {/* Hero Section */}
                <header className="text-center max-w-3xl mx-auto mb-16 space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">
                        <Sparkles className="w-3.5 h-3.5" />
                        Sélection de l'aéroport de départ
                    </div>
                    
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tighter uppercase leading-none">
                        Choisissez votre <span className="text-[#D8AA4D]">ville de départ</span>
                    </h1>

                    <p className="text-sm text-dim max-w-xl mx-auto leading-relaxed">
                        Sélectionnez votre aéroport pour afficher les dates de séjours Omra disponibles et tarifs associés.
                    </p>
                </header>

                {/* Countries and Bento Airport Grid */}
                <div className="space-y-12">
                    {COUNTRIES_AIRPORTS.map((group) => (
                        <section key={group.country} className="space-y-6">
                            <div className="flex items-center gap-3 border-b border-white/5 pb-2">
                                <img 
                                    src={`/flags/${group.code.toLowerCase()}.svg`} 
                                    alt={`Drapeau ${group.country}`} 
                                    className="w-6 h-4 object-cover rounded shadow-sm border border-white/10"
                                />
                                <h2 className="text-lg font-black uppercase tracking-wider text-main">
                                    {group.country}
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {group.airports.map((airport) => (
                                    <Link
                                        key={airport.code}
                                        href={`/depart/${airport.code.toLowerCase()}`}
                                        className="glass p-6 rounded-3xl border border-white/10 hover:border-emerald-500/30 bg-gradient-to-br from-white/[0.02] to-transparent flex justify-between items-center group hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] transition-all duration-300"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                                                <Plane className="w-5 h-5 rotate-45" />
                                            </div>
                                            <div className="text-left">
                                                <h3 className="text-base font-black uppercase tracking-tight text-main">
                                                    {airport.name}
                                                </h3>
                                                <p className="text-[10px] text-dim font-medium uppercase tracking-wider mt-0.5">
                                                    {airport.description}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-dim group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-all">
                                            <ArrowLeft className="w-4 h-4 rotate-180" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </main>
    );
}
