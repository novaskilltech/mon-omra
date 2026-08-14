'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, ArrowLeft, Heart, Compass, Star, MapPin, ExternalLink, Calendar, Flame, ShieldAlert, Sparkles, MessageSquare } from 'lucide-react';
import ThemeSelector from '@/components/ThemeSelector';

export default function BoutiqueExcursionsPage() {
    const products = [
        {
            category: "PRODUITS NATURELS RARES",
            title: "Miel de Sidr Sauvage (Jujubier)",
            desc: "Le miel le plus précieux du monde. Récolté de manière traditionnelle dans les montagnes du Yémen (Hadramawt), Peshawar et Cachemire. Reconnu pour ses propriétés thérapeutiques exceptionnelles.",
            badge: "Best Seller",
            price: "À partir de 39€",
            image: "/features-docs.png", // Fallback images or nice visual blocks
            meta: "100% Brut & Analysé en laboratoire"
        },
        {
            category: "SUPER-ALIMENTS TERRE SAINTE",
            title: "Dattes Ajwa de Médine Premium",
            desc: "Dattes noires charnues à la texture fondante, récoltées exclusivement dans les palmeraies bénies de Médine. Triées à la main pour garantir un calibre d'exception.",
            badge: "Béni & Authentique",
            price: "À partir de 18€ / kg",
            image: "/features-assistance.png",
            meta: "Source d'énergie & Tradition Prophétique"
        },
        {
            category: "BIEN-ÊTRE TRADITIONNEL",
            title: "Huile de Nigelle Habachia Pure",
            desc: "Huile de cumin noir d'Éthiopie de qualité supérieure (Grade A), fraîchement pressée à froid sans aucun traitement chimique pour préserver sa puissance aromatique.",
            badge: "Pressée à froid",
            price: "15€ (100ml)",
            image: "/features-logistics.png",
            meta: "Renforce les défenses naturelles"
        }
    ];

    const services = [
        {
            type: "LOCATION PRIVÉE",
            title: "Chalets Familiaux avec Piscine à Médine",
            desc: "Profitez d'une journée de détente en famille dans nos chalets privatifs sécurisés avec grand jardin, piscine sans vis-à-vis et coin barbecue à seulement 15 minutes du Haram.",
            price: "À partir de 150€ / jour",
            icon: "🏡"
        },
        {
            type: "EXCURSION HISTORIQUE",
            title: "Visite Guidée des Vergers de Taïf",
            desc: "Prenez de la hauteur dans la fraîcheur des montagnes de Taïf. Visitez les distilleries d'eau de rose, découvrez les marchés de fruits locaux et dégustez un thé à la menthe traditionnel.",
            price: "À partir de 65€ / pers.",
            icon: "🏔️"
        },
        {
            type: "DÉCOUVERTE & SHOPPING",
            title: "Souk Al Balad historique à Djeddah",
            desc: "Explorez les ruelles classées à l'UNESCO, admirez l'architecture en bois corallien, et profitez d'une session shopping accompagnée pour vos souvenirs traditionnels.",
            price: "À partir de 45€ / pers.",
            icon: "🕌"
        }
    ];

    return (
        <main className="min-h-screen text-main bg-main selection:bg-amber-500/30 font-inter pb-20 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[40%] bg-amber-500/5 blur-[140px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[40%] bg-emerald-500/5 blur-[140px] rounded-full pointer-events-none" />

            {/* Float Theme Selector */}
            <div className="fixed bottom-6 right-6 z-50">
                <ThemeSelector />
            </div>

            <div className="max-w-7xl mx-auto px-6 pt-10 text-left">
                {/* Back Button */}
                <Link 
                    href="/" 
                    className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-dim hover:text-[#D8AA4D] transition-colors mb-8 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Retour à l'accueil
                </Link>

                {/* Page Title */}
                <div className="space-y-4 mb-16 max-w-3xl">
                    <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-black uppercase px-4 py-1.5 rounded-full tracking-[0.2em]">
                        <ShoppingBag className="w-3.5 h-3.5" />
                        Boutique Exclusive & Activités Locales
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter leading-none">
                        Terre Sainte <span className="text-amber-500">Shop</span> & Excursions
                    </h1>
                    <p className="text-sm text-dim font-medium leading-relaxed">
                        Pour sublimer votre pèlerinage ou emporter chez vous un souvenir béni, découvrez nos produits naturels d'exception et nos activités exclusives réservables auprès de votre concierge.
                    </p>

                    <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl max-w-2xl flex gap-3 items-center text-xs text-[#F2CE79]">
                        <Star className="w-5 h-5 shrink-0 animate-pulse text-amber-400" />
                        <span><strong>Service exclusif aux voyageurs :</strong> Toutes les commandes de produits peuvent être livrées directement à votre hôtel à Makkah ou Médine.</span>
                    </div>
                </div>

                {/* Products Grid */}
                <section className="space-y-8 mb-20">
                    <h2 className="text-xl font-black uppercase tracking-wider text-main border-l-4 border-amber-500 pl-4">
                        1. Produits Rares & Naturels
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {products.map((p, idx) => (
                            <div 
                                key={idx} 
                                className="glass p-6 md:p-8 rounded-[2.5rem] border border-white/5 bg-white/[0.01] hover:border-amber-500/30 transition-all flex flex-col justify-between"
                            >
                                <div className="space-y-4">
                                    <div className="flex justify-between items-start">
                                        <span className="text-[8px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                                            {p.category}
                                        </span>
                                        <span className="text-[10px] font-black text-emerald-400">
                                            {p.price}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-black uppercase tracking-tight text-main">{p.title}</h3>
                                    <p className="text-xs text-dim leading-relaxed font-medium">{p.desc}</p>
                                </div>

                                <div className="pt-6 mt-6 border-t border-white/5 space-y-4">
                                    <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400 block">
                                        ✨ {p.meta}
                                    </span>
                                    
                                    <a
                                        href={`https://wa.me/33612345678?text=Bonjour,%20je%20souhaite%20commander%20le%20produit%20:${encodeURIComponent(p.title)}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="w-full bg-[#D8AA4D] hover:bg-[#F2CE79] text-[#050605] py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <MessageSquare className="w-3.5 h-3.5" />
                                        <span>Commander via WhatsApp</span>
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Excursions Grid */}
                <section className="space-y-8">
                    <h2 className="text-xl font-black uppercase tracking-wider text-main border-l-4 border-emerald-500 pl-4">
                        2. Excursions & Activités sur Place
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {services.map((s, idx) => (
                            <div 
                                key={idx} 
                                className="glass p-6 md:p-8 rounded-[2.5rem] border border-white/5 bg-white/[0.01] hover:border-[#10B981]/30 transition-all flex flex-col justify-between"
                            >
                                <div className="space-y-4">
                                    <div className="flex justify-between items-start">
                                        <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                                            {s.type}
                                        </span>
                                        <span className="text-2xl">{s.icon}</span>
                                    </div>
                                    <h3 className="text-lg font-black uppercase tracking-tight text-main">{s.title}</h3>
                                    <p className="text-xs text-dim leading-relaxed font-medium">{s.desc}</p>
                                </div>

                                <div className="pt-6 mt-6 border-t border-white/5 space-y-4">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-dim font-bold">Tarif indicatif :</span>
                                        <span className="text-[#D8AA4D] font-black">{s.price}</span>
                                    </div>
                                    
                                    <a
                                        href={`https://wa.me/33612345678?text=Bonjour,%20je%20souhaite%20reserver%20l%27activite%20:${encodeURIComponent(s.title)}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-white py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <MessageSquare className="w-3.5 h-3.5" />
                                        <span>Réserver via WhatsApp</span>
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}
