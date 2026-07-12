'use client';

import { useState, Suspense } from 'react';
import { ShoppingBag, ArrowLeft, ExternalLink, MapPin, Compass } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: 'MIEL' | 'PRODUIT_NATUREL' | 'CAFE' | 'SERVICE';
    image_url: string;
    payment_link: string;
    in_stock: boolean;
}

const PRODUCTS: Product[] = [
    {
        id: 'prod-1',
        name: 'Miel de Jujubier du Panjab',
        description: 'Miel d\'exception récolté dans les plaines du Panjab, texture onctueuse et saveur boisée unique, qualité comparable au Sidr du Yémen.',
        price: 35.00,
        category: 'MIEL',
        image_url: '🍯',
        payment_link: 'https://buy.stripe.com/test_14o7tAgG089J03S5kk',
        in_stock: true
    },
    {
        id: 'prod-4',
        name: 'Miel de Jujubier du Yémen (Sidr Malaki)',
        description: 'Le roi des miels. Récolté dans la noble région du Hadramout au Yémen selon des méthodes ancestrales. Texture onctueuse, goût boisé et propriétés curatives incomparables.',
        price: 49.00,
        category: 'MIEL',
        image_url: '🍯',
        payment_link: 'https://buy.stripe.com/test_14o7tAgG089J03S5kk',
        in_stock: true
    },
    {
        id: 'prod-8',
        name: 'Huile de Nigelle d\'Éthiopie (Habachia)',
        description: 'Huile pure de graine de nigelle, pressée à froid, certifiée 99% de pureté. Idéale pour renforcer les défenses et purifier le corps.',
        price: 18.00,
        category: 'PRODUIT_NATUREL',
        image_url: '🌱',
        payment_link: 'https://buy.stripe.com/test_14o7tAgG089J03S5kk',
        in_stock: true
    },
    {
        id: 'prod-12',
        name: 'Dattes Ajwa de Médine Premium',
        description: 'Dattes Ajwa authentiques de la ville bénie du Prophète (صلى الله عليه وسلم), cultivées selon la tradition prophétique. Reconnues pour leur goût exquis et leurs vertus protectrices.',
        price: 19.00,
        category: 'PRODUIT_NATUREL',
        image_url: '🌴',
        payment_link: 'https://buy.stripe.com/test_14o7tAgG089J03S5kk',
        in_stock: true
    }
];

interface OnSiteService {
    id: string;
    name: string;
    description: string;
    price: string;
    city: 'LA MECQUE' | 'MÉDINE' | 'DJEDDAH';
    type: 'EXCURSION' | 'LOCATION';
    icon: string;
    whatsappMessage: string;
}

const SERVICES: OnSiteService[] = [
    {
        id: 'srv-taif',
        name: 'Escapade & Visite de la ville de Taïf',
        description: 'Ascension en téléphérique, visite des distilleries artisanales d\'eau de rose, panorama sur le massif montagneux et déjeuner traditionnel inclus.',
        price: '80 € / personne',
        city: 'LA MECQUE',
        type: 'EXCURSION',
        icon: '⛰️',
        whatsappMessage: 'Bonjour, je souhaite réserver l\'excursion à Taïf pour ma famille.'
    },
    {
        id: 'srv-djeddah',
        name: 'Shopping au Souk Al Balad (Djeddah)',
        description: 'Journée shopping complète dans le célèbre quartier historique classé UNESCO. Accompagnement pour l\'achat d\'épices, de tissus et de souvenirs.',
        price: '45 € / personne',
        city: 'DJEDDAH',
        type: 'EXCURSION',
        icon: '🛍️',
        whatsappMessage: 'Bonjour, je souhaite réserver l\'excursion Shopping à Djeddah.'
    },
    {
        id: 'srv-uhud',
        name: 'Pique-nique sous les étoiles au Mont Uhud',
        description: 'Sortie nocturne mémorable au pied de la montagne historique de Uhud. Dîner convivial autour d\'un couscous traditionnel fait maison.',
        price: '30 € / personne',
        city: 'MÉDINE',
        type: 'EXCURSION',
        icon: '⛺',
        whatsappMessage: 'Bonjour, je souhaite réserver le pique-nique nocturne au Mont Uhud.'
    },
    {
        id: 'srv-chalet',
        name: 'Location de Chalet / Villa avec Piscine',
        description: 'Détente complète à la journée dans une villa/chalet privé avec piscine à Médine. Parfait pour se ressourcer en famille en toute intimité.',
        price: 'Sur devis (Dès 150 €)',
        city: 'MÉDINE',
        type: 'LOCATION',
        icon: '🏊',
        whatsappMessage: 'Bonjour, je souhaite louer un chalet avec piscine à la journée à Médine.'
    }
];

export default function ShopClient() {
    return (
        <Suspense fallback={<div className="min-h-screen text-white p-8 text-center flex items-center justify-center font-bold uppercase tracking-widest text-xs">Chargement de la boutique...</div>}>
            <ShopContent />
        </Suspense>
    );
}

function ShopContent() {
    const searchParams = useSearchParams();
    const pilgrimId = searchParams.get('pilgrimId') || '';
    const [activeTab, setActiveTab] = useState<'PRODUCTS' | 'SERVICES'>('PRODUCTS');

    return (
        <div className="min-h-screen text-white p-6 md:p-8 font-inter">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header Navigation Bar */}
                <nav className="flex justify-between items-center bg-[#090b0a]/80 backdrop-blur-md border border-white/5 rounded-3xl px-6 py-4 shadow-xl relative z-20">
                    <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 overflow-hidden rounded-xl border border-amber-500/20 bg-black/40 flex items-center justify-center p-1">
                            <Image 
                                src="/terre-sainte-shop-logo.png" 
                                alt="Terre Sainte Shop Logo" 
                                width={32} 
                                height={32} 
                                className="object-contain filter brightness-110"
                            />
                        </div>
                        <div>
                            <span className="text-[9px] font-black uppercase tracking-[0.25em] text-amber-500 block -mb-1">BOUTIQUE OFFICIELLE</span>
                            <span className="text-sm font-black uppercase tracking-tight text-main">Terre Sainte <span className="text-emerald-500">Shop</span></span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="hidden md:inline-block bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
                            Espace Client Privé
                        </span>
                        <Link href={`/dashboard?pilgrimId=${pilgrimId}`} className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-500 hover:text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 px-4 py-2.5 rounded-2xl border border-emerald-500/10 transition-all">
                            <ArrowLeft className="w-4 h-4" /> Dashboard
                        </Link>
                    </div>
                </nav>

                {/* Hero Section Banner */}
                <div className="relative overflow-hidden rounded-[2.5rem] border border-emerald-500/15 bg-gradient-to-br from-[#0c1511]/90 to-[#070b09]/95 p-8 md:p-12 text-left shadow-2xl [transform-style:preserve-3d] [perspective:1000px]">
                    {/* Glowing background circles */}
                    <div className="absolute top-[-30%] right-[-10%] w-[350px] h-[350px] bg-emerald-500/10 blur-[90px] rounded-full pointer-events-none" />
                    <div className="absolute bottom-[-35%] left-[-10%] w-[300px] h-[300px] bg-amber-500/5 blur-[80px] rounded-full pointer-events-none" />
                    
                    {/* Tech grid layout overlay */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.04] z-0 bg-[linear-gradient(rgba(16,185,129,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.15)_1px,transparent_1px)] bg-[size:16px_16px]" />

                    <div className="relative z-10 max-w-2xl space-y-6">
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full inline-block">
                            LES TRÉSORS DE LA TERRE SAINTE 🕋
                        </span>
                        
                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-main leading-none">
                            Rapportez chez vous <br />
                            <span className="bg-gradient-to-r from-amber-400 via-emerald-400 to-emerald-500 bg-clip-text text-transparent">l'Essence du Voyage</span>
                        </h2>
                        
                        <p className="text-dim text-xs leading-relaxed max-w-xl font-medium">
                            Sélection de produits d'exception récoltés ou fabriqués dans les régions sacrées : Miels rares de Jujubier sauvage, Dattes Ajwa royales de Médine et excursions guidées sur mesure à Taïf, Djeddah et au Mont Uhud.
                        </p>

                        <div className="flex flex-wrap gap-4 pt-2">
                            <button 
                                onClick={() => setActiveTab('PRODUCTS')}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-widest px-6 py-4 rounded-2xl shadow-lg transition-all hover:scale-102"
                            >
                                Explorer les Produits
                            </button>
                            <a 
                                href="https://wa.me/3375228090?text=Bonjour,%20je%20souhaite%20obtenir%20des%20informations%20sur%20la%20boutique%20Terre%20Sainte%20Shop."
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white/5 hover:bg-white/10 text-main border border-white/10 font-bold text-xs uppercase tracking-widest px-6 py-4 rounded-2xl transition-all hover:scale-102"
                            >
                                Contacter un Guide (WhatsApp)
                            </a>
                        </div>
                    </div>

                    {/* Animated logo sliding & fading in the background/underneath */}
                    <div 
                        className="absolute bottom-0 right-0 md:right-8 md:bottom-2 pointer-events-none z-0 translate-y-8 opacity-0 filter brightness-110 contrast-125 select-none"
                        style={{
                            width: '280px',
                            height: '280px',
                            animation: 'slideFadeUp 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                            animationDelay: '0.3s',
                        }}
                    >
                        <style>{`
                            @keyframes slideFadeUp {
                                to {
                                    transform: translateY(0);
                                    opacity: 0.12;
                                }
                            }
                        `}</style>
                        <Image 
                            src="/terre-sainte-shop-logo.png" 
                            alt="Watermark Logo" 
                            fill
                            className="object-contain"
                        />
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 border-b border-emerald-500/10 pb-1">
                    <button
                        onClick={() => setActiveTab('PRODUCTS')}
                        className={`pb-3 text-xs font-black uppercase tracking-widest transition-all border-b-2 flex items-center gap-2 ${activeTab === 'PRODUCTS' ? 'border-emerald-500 text-main' : 'border-transparent text-dim hover:text-main'}`}
                    >
                        <ShoppingBag className="w-4 h-4" /> Produits & Souvenirs
                    </button>
                    <button
                        onClick={() => setActiveTab('SERVICES')}
                        className={`pb-3 text-xs font-black uppercase tracking-widest transition-all border-b-2 flex items-center gap-2 ${activeTab === 'SERVICES' ? 'border-emerald-500 text-main' : 'border-transparent text-dim hover:text-main'}`}
                    >
                        <Compass className="w-4 h-4" /> Excursions & Services sur place
                    </button>
                </div>

                {/* Tab Contents */}
                {activeTab === 'PRODUCTS' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {PRODUCTS.map((prod) => (
                            <div key={prod.id} className="glass p-6 rounded-[2.5rem] border-emerald-500/5 flex flex-col justify-between shadow-sm relative group">
                                <div className="space-y-4">
                                    <div className="w-full h-32 rounded-2xl overflow-hidden border border-white/5 bg-black/20 relative flex items-center justify-center text-4xl shadow-inner">
                                        {prod.image_url}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-center">
                                            <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md">
                                                {prod.category === 'MIEL' ? '🍯 Miel' : '🌱 Bien-être'}
                                            </span>
                                            <span className="text-xs font-black text-emerald-500">{prod.price.toFixed(2)} €</span>
                                        </div>
                                        <h3 className="text-sm font-black text-main uppercase tracking-tight pt-1">{prod.name}</h3>
                                        <p className="text-[11px] text-dim leading-relaxed font-medium">{prod.description}</p>
                                    </div>
                                </div>
                                <div className="mt-6 pt-4 border-t border-white/5">
                                    {prod.payment_link ? (
                                        <a
                                            href={prod.payment_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full text-center bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-widest py-3.5 rounded-2xl shadow-lg transition-all hover:scale-102 flex items-center justify-center gap-2"
                                        >
                                            Acheter en ligne <ExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                    ) : (
                                        <span className="w-full text-center block bg-white/5 border border-white/5 text-dim font-bold text-xs uppercase tracking-widest py-3.5 rounded-2xl">
                                            Épuisé
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {SERVICES.map((srv) => (
                            <div key={srv.id} className="glass p-6 rounded-[2.5rem] border-amber-500/10 flex flex-col justify-between shadow-sm relative group">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl shadow-inner shrink-0">
                                                {srv.icon}
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-black text-main uppercase tracking-tight">{srv.name}</h3>
                                                <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-amber-500/80 mt-0.5">
                                                    <MapPin className="w-3 h-3" /> {srv.city}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-dim leading-relaxed font-medium min-h-[40px]">
                                        {srv.description}
                                    </p>
                                    <div className="flex items-center justify-between bg-amber-500/5 border border-amber-500/10 p-3.5 rounded-xl text-xs font-bold uppercase tracking-wider">
                                        <span className="text-dim text-[10px]">Tarif indicatif</span>
                                        <span className="text-amber-500">{srv.price}</span>
                                    </div>
                                </div>
                                <div className="mt-6 pt-4 border-t border-white/5">
                                    <a
                                        href={`https://wa.me/3375228090?text=${encodeURIComponent(srv.whatsappMessage)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full text-center bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-widest py-3.5 rounded-2xl shadow-lg transition-all hover:scale-102 flex items-center justify-center gap-2"
                                    >
                                        Réserver sur WhatsApp
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
