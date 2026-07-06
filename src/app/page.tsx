import Image from 'next/image';
import { Compass, BookOpen, ShieldCheck, Map, ArrowRight, Plane, Hotel, MessageSquare, Heart, Sparkles, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import ThemeSelector from '@/components/ThemeSelector';

export default function Home() {
    return (
        <main className="min-h-screen text-white selection:bg-emerald-500/30">
            {/* Structured Data (JSON-LD) for Search Agents */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "TravelAgency",
                        "name": "OMRAYANAIR",
                        "description": "Plateforme Premium d'accompagnement et de gestion de voyage spirituel pour l'Omra et le Hajj.",
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
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
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


            {/* Hero Section */}
            <header className="relative z-10 pt-20 pb-16 px-6 text-center max-w-5xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-[0.2em] mb-8 animate-fade-in">
                    <Sparkles className="w-3 h-3" />
                    Le futur du voyage spirituel
                </div>
                <h1 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter leading-[0.9] uppercase animate-slide-up">
                    VIVEZ VOTRE <span className="text-emerald-500">OMRA</span><br />
                    EN TOUTE <span className="text-emerald-500">SÉRÉNITÉ</span>.
                </h1>
                <p className="text-lg md:text-xl text-sub mb-12 font-medium max-w-2xl mx-auto opacity-70 leading-relaxed animate-fade-in">
                    Votre compagnon digital, de la préparation au retour, 
                    conçu pour vous permettre de vous concentrer sur l'essentiel : votre foi.
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
                        className="w-full h-auto object-cover transform transition-transform duration-1000 group-hover:scale-105"
                        priority
                    />
                </div>

                <Link href="/login" className="block mt-16 mx-auto max-w-xs group cursor-pointer animate-fade-in">
                    <div className="relative w-48 h-48 mx-auto rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(16,185,129,0.15)] bg-black/20 backdrop-blur-md transition-all duration-500 group-hover:scale-105 group-hover:border-emerald-500/40 group-hover:shadow-[0_0_60px_rgba(16,185,129,0.3)] flex items-center justify-center">
                        <Image 
                            src="/app-logo.png" 
                            alt="OMRAYANAIR Logo Entry" 
                            width={160}
                            height={160}
                            className="object-contain transition-transform duration-500 group-hover:rotate-3 rounded-[1.8rem]"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                    <span className="inline-block mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-dim group-hover:text-emerald-400 transition-colors">
                        Cliquer pour entrer dans l'application
                    </span>
                </Link>
            </header>

            {/* Bento Grid Features */}
            <section id="features" className="relative z-10 py-24 px-6 max-w-7xl mx-auto">
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

            {/* Editorial Platform Section: La Voix du Pèlerin */}
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

            {/* Boutique Section */}
            <section className="relative z-10 py-12 px-6 max-w-7xl mx-auto">
                <div className="glass p-12 md:p-16 rounded-[3rem] border-amber-500/10 flex flex-col lg:flex-row-reverse items-center justify-between gap-12 relative overflow-hidden group shadow-2xl bg-amber-500/[0.01]">
                    <div className="absolute top-[-20%] left-[-10%] w-[350px] h-[350px] bg-amber-500/10 blur-[100px] rounded-full pointer-events-none group-hover:bg-amber-500/15 transition-all duration-700" />
                    
                    <div className="max-w-2xl space-y-6 text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-black uppercase tracking-[0.2em]">
                            <ShoppingBag className="w-3 h-3" />
                            Boutique Exclusive & Produits Sains
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white leading-[1.1]">
                            Découvrez la boutique <span className="text-amber-500">Naturomiel</span>
                        </h2>
                        <p className="text-sub text-sm leading-relaxed opacity-70">
                            Préparez vos souvenirs et cadeaux de la ville bénie du Prophète (صلى الله عليه وسلم). Nous sélectionnons pour nos pèlerins des cadeaux d'exception bénéfiques pour la santé : miels rares de Jujubier sauvage (Sidr Malaki du Yémen, Panjab, Cachemire, Peshawar), dattes Ajwa de Médine premium aux vertus protectrices reconnues, huile de nigelle pure pressée à froid et henné naturel.
                        </p>
                        <div className="flex flex-wrap gap-4 pt-4">
                            <span className="bg-amber-500/10 border border-amber-500/20 text-amber-500 px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                🍯 Boutique Souvenirs & Bien-être — Ouverture Bientôt
                            </span>
                        </div>
                    </div>

                    <div className="relative shrink-0 w-full lg:w-auto flex justify-center">
                        <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-[2.5rem] overflow-hidden border border-amber-500/10 bg-black/30 backdrop-blur-md shadow-2xl group/img">
                            <Image 
                                src="/naturomiel-shop.png" 
                                alt="Produits Naturomiel" 
                                fill
                                className="object-cover group-hover/img:scale-105 transition-transform duration-700" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                            <div className="absolute bottom-6 left-6 right-6 text-left">
                                <Image 
                                    src="/naturomiel-logo.png" 
                                    alt="Naturomiel Logo" 
                                    width={100} 
                                    height={30} 
                                    className="object-contain filter brightness-110 mb-2.5" 
                                />
                                <p className="text-[10px] text-white/70 leading-relaxed font-bold m-0 uppercase tracking-wider">
                                    Miel de Jujubier sauvage, Dattes Ajwa & Huile de Nigelle pure.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Impact Section */}
            <section className="py-24 px-6 text-center max-w-3xl mx-auto">
                <Heart className="w-12 h-12 text-emerald-500 mx-auto mb-8 animate-pulse" />
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-8 leading-tight">
                    Plus qu'une application,<br />un compagnon fidèle.
                </h2>
                <p className="text-sub font-medium opacity-60 italic whitespace-pre-line">
                    "Notre mission est d'effacer les barrières logistiques 
                    pour laisser place à la beauté de votre voyage spirituel."
                </p>
            </section>

            {/* CTA Section */}
            <section className="pb-32 px-6">
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
            <footer className="py-12 border-t border-white/5 px-6">
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
