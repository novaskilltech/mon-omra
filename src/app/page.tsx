import Image from 'next/image';
import { Compass, BookOpen, ShieldCheck, Map, ArrowRight, Plane, Hotel, MessageSquare, Heart, Sparkles, ShoppingBag, ShieldAlert, Star } from 'lucide-react';
import Link from 'next/link';
import ThemeSelector from '@/components/ThemeSelector';

export default function Home() {
    return (
        <main className="min-h-screen text-white selection:bg-emerald-500/30 font-inter">
            {/* Structured Data (JSON-LD) for Search Agents */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "TravelAgency",
                        "name": "OMRAYANAIR",
                        "description": "Plateforme Premium d'accompagnement et de voyage spirituel pour l'Omra et le Hajj.",
                        "url": "https://omrayanair.vercel.app",
                        "logo": "https://omrayanair.vercel.app/logo.png",
                        "image": "https://omrayanair.vercel.app/og-image.png",
                        "address": {
                            "@type": "PostalAddress",
                            "addressCountry": "FR"
                        },
                        "serviceType": ["Pèlerinage Omra", "Pèlerinage Hajj", "Accompagnement Spirituel", "Gestion Logistique"]
                    })
                }}
            />

            {/* Background Glows */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full" />
            </div>

            {/* Navbar */}
            <nav className="relative z-50 flex justify-between items-center px-6 py-6 max-w-7xl mx-auto flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <Image src="/app-logo.png" alt="OMRAYANAIR Logo" width={36} height={36} className="rounded-xl object-contain shadow-md border border-white/10" />
                    <div className="text-2xl font-black tracking-tighter uppercase">
                        OMRA<span className="text-emerald-500">YANAIR</span>
                    </div>
                </div>
                
                <div className="order-3 md:order-2">
                    <ThemeSelector />
                </div>

                <div className="flex items-center gap-6 order-2 md:order-3">
                    <Link href="/login" className="text-[10px] font-black uppercase tracking-[0.2em] text-dim hover:text-emerald-500 transition-colors hidden sm:block">
                        Connexion
                    </Link>
                    <Link href="/login" className="bg-emerald-500 text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                        S'enregistrer
                    </Link>
                </div>
            </nav>

            {/* 1. Hero Section (Attention) */}
            <header className="relative z-10 pt-20 pb-16 px-6 text-center max-w-5xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-[0.2em] mb-8 animate-fade-in">
                    <Sparkles className="w-3 h-3" />
                    Le futur du voyage spirituel
                </div>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 tracking-tighter leading-[0.95] uppercase animate-slide-up">
                    NE LAISSEZ PAS LA LOGISTIQUE<br />
                    VOLER VOTRE <span className="text-emerald-500">CONCENTRATION SPIRITUELLE</span>.
                </h1>
                <p className="text-base md:text-lg text-sub mb-12 font-medium max-w-3xl mx-auto opacity-75 leading-relaxed animate-fade-in">
                    Découvrez le premier compagnon digital qui gère vos vols, vos hôtels, vos rituels et vos excursions, pour vous laisser vous concentrer sur l'unique essentiel : votre foi.
                </p>
                <div className="flex flex-col sm:flex-row gap-5 justify-center items-center animate-fade-in">
                    <Link href="/login" className="bg-emerald-500 text-white px-10 py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-emerald-400 transition-all shadow-[0_5px_30px_rgba(16,185,129,0.3)] flex items-center gap-3 group">
                        Commencer mon voyage
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link href="#features" className="glass px-10 py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] text-white hover:bg-white/5 transition-all">
                        Découvrir les fonctions
                    </Link>
                </div>

                <div className="mt-20 w-full max-w-4xl mx-auto rounded-[3rem] overflow-hidden border border-emerald-500/20 shadow-[0_0_80px_rgba(16,185,129,0.15)] relative animate-fade-in group">
                    <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    <Image 
                        src="/pilgrim-mockup.png" 
                        alt="Pèlerin en Ihram utilisant l'application OMRAYANAIR" 
                        width={1200}
                        height={800}
                        className="w-full h-auto object-cover transform transition-transform duration-1000 group-hover:scale-103"
                        priority
                    />
                </div>
            </header>

            {/* 2. Le Problème (Empathie) */}
            <section className="relative z-10 py-20 px-6 max-w-5xl mx-auto text-center">
                <div className="glass p-10 md:p-16 rounded-[3rem] border-red-500/10 bg-red-500/[0.01] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/5 blur-[80px] rounded-full pointer-events-none" />
                    <div className="max-w-3xl mx-auto space-y-6">
                        <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mx-auto mb-4">
                            <ShieldAlert className="w-6 h-6 animate-pulse" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white">
                            Préparer son Omra ne devrait pas être une source d'angoisse
                        </h2>
                        <p className="text-sub text-xs md:text-sm leading-relaxed opacity-75 font-medium max-w-2xl mx-auto">
                            Peur d'oublier un document officiel à l'aéroport, de se tromper dans l'ordre des rituels du Tawaf, ou de passer des heures à chercher un transfert fiable en pleine nuit sous 45°C... Nous croyons fermement que votre esprit devrait être entièrement libéré de ces tracas matériels pour vous dédier à l'essentiel.
                        </p>
                    </div>
                </div>
            </section>

            {/* 3. Le Plan en 3 Étapes (Clarté) */}
            <section className="relative z-10 py-16 px-6 max-w-7xl mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">MÉTHODOLOGIE SIMPLIFIÉE</span>
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white leading-none">
                        Votre Voyage Sacré en <span className="text-emerald-500">3 Étapes</span>
                    </h2>
                    <p className="text-sub text-xs opacity-75 font-medium leading-relaxed">
                        Notre processus est conçu pour vous offrir un accompagnement limpide et sans frictions.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            num: "01",
                            title: "Créez votre accès personnel",
                            desc: "Enregistrez-vous en quelques clics. Renseignez vos souhaits de départ et accédez directement à votre tableau de bord interactif."
                        },
                        {
                            num: "02",
                            title: "Laissez-vous guider",
                            desc: "Vos documents officiels (visas, vols) sont sécurisés et accessibles hors-ligne. Votre guide audio interactif vous accompagne pas à pas."
                        },
                        {
                            num: "03",
                            title: "Vivez l'instant présent",
                            desc: "Profitez de nos services exclusifs sur place (Taïf, chalets privés) et d'un support SOS 24h/7j pour tout imprévu logistique."
                        }
                    ].map((step, idx) => (
                        <div key={idx} className="glass p-8 rounded-[2.5rem] border-emerald-500/5 relative overflow-hidden group hover:border-emerald-500/20 transition-all">
                            <span className="text-6xl md:text-7xl font-black text-emerald-500/10 group-hover:text-emerald-500/20 transition-colors absolute top-4 right-6 pointer-events-none">
                                {step.num}
                            </span>
                            <div className="space-y-4 pt-6">
                                <h3 className="text-lg font-black uppercase tracking-tighter text-white">{step.title}</h3>
                                <p className="text-xs text-dim leading-relaxed font-medium">{step.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 4. Bento Grid Features (Intérêt) */}
            <section id="features" className="relative z-10 py-20 px-6 max-w-7xl mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">FONCTIONNALITÉS CLÉS</span>
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white leading-none">
                        Une application <span className="text-emerald-500">tout-en-un</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-full">
                    {/* Feature 1: Ritual Guide */}
                    <div className="md:col-span-2 md:row-span-2 glass p-10 rounded-[2.5rem] border-emerald-500/10 flex flex-col justify-between group overflow-hidden relative min-h-[500px]">
                        <div className="absolute inset-0 z-0 opacity-20 group-hover:opacity-30 group-hover:scale-105 transition-all duration-700">
                            <Image 
                                src="/features-guide.png" 
                                alt="Guide Interactif des Rituels" 
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                        </div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-8">
                                <Map className="w-6 h-6" />
                            </div>
                            <h3 className="text-3xl font-black mb-4 uppercase tracking-tighter">Guide Interactif <br />des Rituels</h3>
                            <p className="text-sub text-sm leading-relaxed max-w-xs opacity-80 font-medium">
                                Suivez chaque étape de l'Omra avec des guides vocaux, des invocations en arabe/français et un suivi de progression en temps réel.
                            </p>
                        </div>
                        <div className="relative z-10 mt-12 space-y-3">
                            {[
                                { label: "Ihram & Intention", ok: true },
                                { label: "Tawaf (7 tours)", ok: false },
                                { label: "Sa'i entre Safa & Marwa", ok: false }
                            ].map((step, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 backdrop-blur-md">
                                    <div className={`w-4 h-4 rounded-full border ${step.ok ? 'bg-emerald-500 border-emerald-500' : 'border-white/20'}`} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">{step.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Feature 2: Documents */}
                    <div className="md:col-span-2 glass p-10 rounded-[2.5rem] border-emerald-500/10 flex items-center justify-between group overflow-hidden relative min-h-[220px]">
                        <div className="max-w-[55%] z-10">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 mb-6">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-black mb-2 uppercase tracking-tighter">Vos Documents en Sécurité</h3>
                            <p className="text-sub text-[11px] leading-relaxed opacity-70 font-medium">
                                Passeport, Visa, Billets d'avion... Accédez à tous vos documents officiels de voyage en toute sécurité, même sans connexion internet.
                            </p>
                        </div>
                        <div className="relative w-32 h-32 md:w-36 md:h-36 shrink-0 overflow-hidden rounded-2xl border border-white/10 shadow-2xl z-10 bg-black/40">
                            <Image 
                                src="/features-docs.png" 
                                alt="Documents Sécurisés" 
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                    </div>

                    {/* Feature 3: Logistics */}
                    <div className="glass p-8 rounded-[2.5rem] border-emerald-500/10 hover:border-emerald-500/30 transition-all flex flex-col justify-between group overflow-hidden relative min-h-[220px]">
                        <div className="absolute inset-0 z-0 opacity-15 group-hover:opacity-25 group-hover:scale-105 transition-all duration-700">
                            <Image 
                                src="/features-logistics.png" 
                                alt="Logistique" 
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                        </div>
                        <div className="relative z-10">
                            <Plane className="w-8 h-8 text-emerald-500 mb-4" />
                            <h3 className="text-lg font-black uppercase tracking-tighter mb-2">Logistique</h3>
                            <p className="text-[10px] leading-relaxed opacity-70 font-medium max-w-[170px]">Horaires de vols, réservations d'hôtels et transferts mis à jour en direct.</p>
                        </div>
                        <div className="relative z-10 pt-4 border-t border-white/5 mt-4">
                            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Hôtel 5★ Makkah</span>
                        </div>
                    </div>

                    {/* Feature 4: Support */}
                    <div className="glass p-8 rounded-[2.5rem] border-emerald-500/10 bg-emerald-500/5 flex flex-col justify-between group cursor-pointer hover:bg-emerald-500/10 transition-all overflow-hidden relative min-h-[220px]">
                        <div className="absolute inset-0 z-0 opacity-15 group-hover:opacity-25 group-hover:scale-105 transition-all duration-700">
                            <Image 
                                src="/features-assistance.png" 
                                alt="Assistance" 
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                        </div>
                        <div className="relative z-10">
                            <MessageSquare className="w-8 h-8 text-emerald-500 mb-4 group-hover:scale-110 transition-transform" />
                            <h3 className="text-lg font-black uppercase tracking-tighter mb-2">Assistance 24/7</h3>
                            <p className="text-[10px] leading-relaxed opacity-70 font-medium max-w-[170px]">Un doute ? Un besoin imminent ? Votre guide spirituel ou logistique est à portée de main.</p>
                        </div>
                        <div className="relative z-10 bg-emerald-500 text-white text-[9px] font-black uppercase p-2 rounded-xl text-center tracking-widest">
                            SOS GUIDE
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Editorial Platform Section (Désir) */}
            <section className="relative z-10 py-12 px-6 max-w-7xl mx-auto">
                <div className="glass p-12 md:p-16 rounded-[3rem] border-emerald-500/10 flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden group shadow-2xl">
                    <div className="absolute top-[-20%] right-[-10%] w-[350px] h-[350px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none group-hover:bg-emerald-500/15 transition-all duration-700" />
                    
                    <div className="max-w-2xl space-y-6 text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-[0.2em]">
                            <BookOpen className="w-3 h-3" />
                            Plateforme Éditoriale & Témoignages
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white leading-[1.1]">
                            Découvrez <span className="text-emerald-500">La Voix du Pèlerin</span>
                        </h2>
                        <p className="text-sub text-sm leading-relaxed opacity-70">
                            Préparez votre voyage sacré en toute confiance grâce à nos fiches éditoriales rédigées par des guides spirituels. Lisez également les récits et témoignages authentiques partagés par nos pèlerins pour vous inspirer et vous guider.
                        </p>
                        <div className="flex flex-wrap gap-4 pt-4">
                            <a 
                                href="/la-voix-du-pelerin/" 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-102 flex items-center gap-2.5 shadow-[0_5px_20px_rgba(16,185,129,0.2)]"
                            >
                                Explorer le Guide & Témoignages <ArrowRight className="w-3.5 h-3.5" />
                            </a>
                        </div>
                    </div>

                    <div className="relative shrink-0 w-full lg:w-auto flex justify-center">
                        <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-[2.5rem] overflow-hidden border border-white/10 bg-black/30 backdrop-blur-md flex items-center justify-center p-8 shadow-2xl group/blogimg">
                            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent" />
                            <div className="text-center space-y-4">
                                <Image 
                                    src="/la-voix-du-pelerin-logo.png" 
                                    alt="La Voix du Pèlerin Logo" 
                                    width={145} 
                                    height={145} 
                                    className="object-contain hover:scale-105 transition-transform mx-auto filter drop-shadow-[0_10px_15px_rgba(16,185,129,0.15)] rounded-full" 
                                />
                                <h3 className="font-black text-main text-xs uppercase tracking-widest text-emerald-400">Le Média Spirituel</h3>
                                <p className="text-[9px] text-dim max-w-xs mx-auto leading-relaxed">
                                    Conseils précieux, fiches pratiques et récits croisés pour éclairer votre parcours sacré.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. Boutique & Services sur Place Section (Désir+) */}
            <section className="relative z-10 py-12 px-6 max-w-7xl mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-black uppercase tracking-[0.2em]">
                        <ShoppingBag className="w-3 h-3" />
                        Boutique Exclusive & Activités locales
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white leading-none">
                        Boutique & <span className="text-amber-500">Services sur place</span>
                    </h2>
                    <p className="text-sub text-xs opacity-75 font-medium leading-relaxed">
                        Commandez des produits naturels d'exception ou agrémentez votre pèlerinage avec nos excursions et locations de chalets privés à la Mecque et Médine.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Naturomiel Card */}
                    <div className="glass p-10 md:p-12 rounded-[3rem] border-amber-500/10 flex flex-col justify-between gap-8 relative overflow-hidden group shadow-xl bg-amber-500/[0.01]">
                        <div className="absolute top-[-20%] left-[-10%] w-[250px] h-[250px] bg-amber-500/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-amber-500/15 transition-all duration-700" />
                        
                        <div className="space-y-6 text-left relative z-10">
                            <span className="bg-amber-500/20 text-amber-400 text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-md border border-amber-500/20 mb-1.5 inline-block">
                                PRODUITS NATURELS & SOUVENIRS
                            </span>
                            <h3 className="text-2xl font-black uppercase tracking-tighter text-white">
                                Naturomiel <span className="text-amber-500">Boutique</span>
                            </h3>
                            <p className="text-sub text-xs leading-relaxed opacity-75">
                                Ramenez chez vous les bienfaits de la Terre Sainte : miels rares de Jujubier sauvage (Sidr du Yémen, Peshawar, Cachemire), dattes Ajwa de Médine de qualité supérieure et huile de nigelle d'Éthiopie pure pressée à froid.
                            </p>
                        </div>

                        <div className="relative w-full h-48 md:h-60 rounded-2xl overflow-hidden border border-amber-500/10 bg-black/30 shadow-2xl group/img shrink-0">
                            <Image 
                                src="/naturomiel-shop.png" 
                                alt="Produits Naturomiel" 
                                fill
                                className="object-cover group-hover/img:scale-102 transition-transform duration-700" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                            <div className="absolute bottom-6 left-6 right-6 text-left">
                                <Image 
                                    src="/naturomiel-logo.png" 
                                    alt="Naturomiel Logo" 
                                    width={100} 
                                    height={30} 
                                    className="object-contain filter brightness-110 mb-2" 
                                />
                                <p className="text-[9px] text-white/70 font-bold m-0 uppercase tracking-wider leading-relaxed">
                                    Miel de Jujubier sauvage, Dattes Ajwa & Nigelle Habachia.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Excursions & Services Card */}
                    <div className="glass p-10 md:p-12 rounded-[3rem] border-emerald-500/10 flex flex-col justify-between gap-8 relative overflow-hidden group shadow-xl bg-emerald-500/[0.01]">
                        <div className="absolute top-[-20%] right-[-10%] w-[250px] h-[250px] bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-emerald-500/15 transition-all duration-700" />
                        
                        <div className="space-y-6 text-left relative z-10">
                            <span className="bg-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-md border border-emerald-500/20 mb-1.5 inline-block">
                                ACTIVITÉS & LOCATIONS SUR PLACE
                            </span>
                            <h3 className="text-2xl font-black uppercase tracking-tighter text-white">
                                Excursions & <span className="text-emerald-500">Chalets</span>
                            </h3>
                            <p className="text-sub text-xs leading-relaxed opacity-75">
                                Vivez des moments uniques : visite guidée de la ville de Taïf, excursion shopping au Souk Al Balad de Djeddah, pique-nique nocturne couscous au pied du Mont Uhud et location à la journée de chalets familiaux avec piscine à Médine.
                            </p>
                        </div>

                        <div className="relative w-full h-48 md:h-60 rounded-2xl overflow-hidden border border-emerald-500/10 bg-black/30 shadow-2xl group/img shrink-0">
                            <Image 
                                src="/madinah-services.png" 
                                alt="Services et Chalets en Arabie" 
                                fill
                                className="object-cover group-hover/img:scale-102 transition-transform duration-700" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                            <div className="absolute bottom-6 left-6 right-6 text-left">
                                <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">
                                    <Compass className="w-3.5 h-3.5 animate-spin-slow" /> Médine • La Mecque • Djeddah
                                </div>
                                <p className="text-[9px] text-white/70 font-bold m-0 uppercase tracking-wider leading-relaxed">
                                    Sorties historiques, pique-nique sous les étoiles & chalets privés.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 7. Loyalty Club Section (Désir++) */}
            <section className="relative z-10 py-16 px-6 max-w-7xl mx-auto">
                <div className="glass p-12 md:p-16 rounded-[3rem] border-emerald-500/15 flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden group shadow-2xl bg-emerald-500/[0.02]">
                    <div className="absolute top-[-20%] right-[-10%] w-[350px] h-[350px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none group-hover:bg-emerald-500/15 transition-all duration-700" />
                    
                    <div className="max-w-2xl space-y-6 text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-[0.2em]">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            FIDÉLISATION CLIENTS & VOYAGEURS RÉCURRENTS
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white leading-none">
                            Club de Fidélité <span className="text-emerald-500">Omrayanair</span>
                        </h2>
                        <p className="text-sub text-xs leading-relaxed opacity-75">
                            Parce que votre fidélité mérite le meilleur, nous récompensons les pèlerins déjà partis avec nous. Pour chaque nouvelle réservation, bénéficiez de cadeaux exclusifs d'une valeur maximale de 100 € :
                        </p>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold uppercase tracking-wider text-main pt-2">
                            <li className="flex items-center gap-2.5 bg-white/5 border border-white/5 p-4 rounded-2xl">
                                <span className="text-emerald-400 text-base">🎒</span>
                                <div className="leading-tight">
                                    <p className="text-[10px] text-main">Bagage retour offert</p>
                                    <p className="text-[8px] text-dim font-medium normal-case">En soute sur vols Transavia</p>
                                </div>
                            </li>
                            <li className="flex items-center gap-2.5 bg-white/5 border border-white/5 p-4 rounded-2xl">
                                <span className="text-emerald-400 text-base">🍳</span>
                                <div className="leading-tight">
                                    <p className="text-[10px] text-main">Petit-Déjeuner Offert</p>
                                    <p className="text-[8px] text-dim font-medium normal-case">À La Mecque (séjours de 10j ou moins)</p>
                                </div>
                            </li>
                            <li className="flex items-center gap-2.5 bg-white/5 border border-white/5 p-4 rounded-2xl">
                                <span className="text-emerald-400 text-base">🛂</span>
                                <div className="leading-tight">
                                    <p className="text-[10px] text-main">Visa Enfant Offert</p>
                                    <p className="text-[8px] text-dim font-medium normal-case">Pour les -16 ans en vacances scolaires</p>
                                </div>
                            </li>
                            <li className="flex items-center gap-2.5 bg-white/5 border border-white/5 p-4 rounded-2xl">
                                <span className="text-emerald-400 text-base">🏷️</span>
                                <div className="leading-tight">
                                    <p className="text-[10px] text-main">Remise immédiate</p>
                                    <p className="text-[8px] text-dim font-medium normal-case">75 € déduits directement de votre forfait</p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div className="relative shrink-0 w-full lg:w-auto flex justify-center">
                        <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-[2.5rem] overflow-hidden border border-emerald-500/20 bg-black/30 backdrop-blur-md shadow-2xl group/loyimg flex items-center justify-center p-4">
                            <Image 
                                src="/loyalty-club.png" 
                                alt="Carte de fidélité Club Omrayanair" 
                                fill
                                className="object-cover group-hover/loyimg:scale-102 transition-transform duration-700" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                            <div className="absolute bottom-6 left-6 right-6 text-left z-10 pointer-events-none">
                                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Membre Privilège</p>
                                <p className="text-[8px] text-white/50 leading-relaxed font-bold uppercase tracking-wider">
                                    Accédez aux remises & avantages exclusifs à chaque voyage.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 8. Témoignages (Preuve Sociale) */}
            <section className="relative z-10 py-16 px-6 max-w-7xl mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">TÉMOIGNAGES CLIENTS</span>
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white leading-none">
                        Ils racontent leur <span className="text-emerald-500">sérénité</span>
                    </h2>
                    <p className="text-sub text-xs opacity-75 font-medium leading-relaxed">
                        Découvrez les retours authentiques de pèlerins ayant utilisé notre compagnon digital.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        {
                            name: "Sofiane K.",
                            city: "Paris",
                            text: "Un outil indispensable pour mon premier voyage. Ne pas avoir à chercher mes papiers à chaque guichet et pouvoir suivre le rituel audio pas à pas au Tawaf m'a permis de vivre une dévotion totale sans stress.",
                            rating: 5
                        },
                        {
                            name: "Nadia B.",
                            city: "Lyon",
                            text: "Nous sommes repartis pour la seconde fois avec eux et le Club Fidélité nous a offert le bagage retour gratuit ainsi que les petits-déjeuners. Une formule qui respecte vraiment les voyageurs réguliers !",
                            rating: 5
                        },
                        {
                            name: "Ibrahim M.",
                            city: "Bruxelles",
                            text: "La visite guidée de Taïf réservée directement depuis l'application via WhatsApp était magnifique. L'assistance SOS m'a aussi rassuré lorsque mon transfert d'hôtel avait 10 minutes de retard à Médine.",
                            rating: 5
                        }
                    ].map((testi, idx) => (
                        <div key={idx} className="glass p-8 rounded-[2.5rem] border-white/5 flex flex-col justify-between relative overflow-hidden group">
                            <div className="space-y-4">
                                <div className="flex gap-1">
                                    {[...Array(testi.rating)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                                    ))}
                                </div>
                                <p className="text-xs text-dim leading-relaxed font-medium italic">
                                    "{testi.text}"
                                </p>
                            </div>
                            <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between">
                                <span className="text-xs font-black uppercase tracking-wider text-white">{testi.name}</span>
                                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">{testi.city}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 9. Impact Section */}
            <section className="py-24 px-6 text-center max-w-3xl mx-auto relative z-10">
                <Heart className="w-12 h-12 text-emerald-500 mx-auto mb-8 animate-pulse" />
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-8 leading-tight">
                    Plus qu'une application,<br />un compagnon fidèle.
                </h2>
                <p className="text-sub font-medium opacity-60 italic whitespace-pre-line text-sm leading-relaxed">
                    "Notre mission est d'effacer les barrières logistiques 
                    pour laisser place à la beauté de votre voyage spirituel."
                </p>
            </section>

            {/* 10. CTA Section */}
            <section className="pb-32 px-6 relative z-10">
                <div className="max-w-5xl mx-auto bg-gradient-to-br from-emerald-600 to-emerald-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-[0_20px_50px_rgba(16,185,129,0.4)]">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <div className="absolute top-10 left-10 w-32 h-32 border-4 border-white rounded-full" />
                        <div className="absolute bottom-10 right-10 w-64 h-64 border-2 border-white/50 rounded-full" />
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter uppercase relative z-10">
                        PRÊT POUR LE GRAND DÉPART ?
                    </h2>
                    <Link href="/login" className="inline-block bg-white text-emerald-900 px-12 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:scale-105 transition-all relative z-10">
                        Mon Espace Personnel
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/5 px-6 relative z-10">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3">
                        <Image src="/logo.png" alt="OMRAYANAIR Logo" width={28} height={28} className="rounded-lg object-contain opacity-80" />
                        <div className="text-xl font-black uppercase tracking-tighter">
                            OMRA<span className="text-emerald-500">YANAIR</span>
                        </div>
                    </div>
                    <div className="flex gap-8 text-[9px] font-black uppercase tracking-widest text-dim">
                        <Link href="/privacy" className="hover:text-emerald-500 transition-colors">Confidentialité</Link>
                        <Link href="/legal" className="hover:text-emerald-500 transition-colors">Mentions Légales</Link>
                        <span className="opacity-30">© 2025 OMRAYANAIR</span>
                    </div>
                </div>
            </footer>
        </main>
    );
}
