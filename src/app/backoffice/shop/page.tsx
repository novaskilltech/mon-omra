'use client';

import { useState } from 'react';
import { ShoppingBag, Tag, ExternalLink, Lock, CheckCircle, XCircle, Search, Coffee, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: 'MIEL' | 'PRODUIT_NATUREL' | 'CAFE';
    image_url: string;
    payment_link: string;
    in_stock: boolean;
}

const INITIAL_PRODUCTS: Product[] = [
    {
        id: 'prod-1',
        name: 'Miel de Jujubier du Panjab',
        description: 'Miel d\'exception récolté dans les plaines du Panjab, texture onctueuse et saveur boisée unique, qualité comparable au Sidr du Yémen.',
        price: 39.00,
        category: 'MIEL',
        image_url: '/la-voix-du-pelerin/assets/spiritual_prep.png',
        payment_link: '',
        in_stock: true
    },
    {
        id: 'prod-2',
        name: 'Miel de Jujubier du Cachemire',
        description: 'Récolté au cœur des vallées du Cachemire. Un arôme fleuri, doux et une robe dorée très limpide.',
        price: 45.00,
        category: 'MIEL',
        image_url: '/la-voix-du-pelerin/assets/spiritual_prep.png',
        payment_link: '',
        in_stock: true
    },
    {
        id: 'prod-3',
        name: 'Miel de Jujubier de Peshawar',
        description: 'Miel de Sidr brut sauvage de Peshawar. Très recherché pour ses bienfaits thérapeutiques et sa texture dense.',
        price: 42.00,
        category: 'MIEL',
        image_url: '/la-voix-du-pelerin/assets/spiritual_prep.png',
        payment_link: '',
        in_stock: true
    },
    {
        id: 'prod-4',
        name: 'Miel de Jujubier du Yémen (Sidr Maliky)',
        description: 'Le roi des miels. Récolté dans la région du Hadramout selon des méthodes ancestrales. Pureté et puissance aromatique inégalées.',
        price: 79.00,
        category: 'MIEL',
        image_url: '/la-voix-du-pelerin/assets/spiritual_prep.png',
        payment_link: '',
        in_stock: true
    },
    {
        id: 'prod-5',
        name: 'Miel Immunité (Mélange Thérapeutique)',
        description: 'Synergie active de miel de jujubier, gelée royale fraîche, propolis pure et pollen de palmier.',
        price: 35.00,
        category: 'MIEL',
        image_url: '/la-voix-du-pelerin/assets/spiritual_prep.png',
        payment_link: '',
        in_stock: true
    },
    {
        id: 'prod-6',
        name: 'Miel Fertilité (Mélange Traditionnel)',
        description: 'Mélange traditionnel de miel de Sidr enrichi au pollen de palmier sauvage et ginseng rouge bio.',
        price: 35.00,
        category: 'MIEL',
        image_url: '/la-voix-du-pelerin/assets/spiritual_prep.png',
        payment_link: '',
        in_stock: true
    },
    {
        id: 'prod-7',
        name: 'Miel Booster (Énergie Extrême)',
        description: 'Complexe énergétique naturel : miel de jujubier sauvage, gingembre séché et poudre de nigelle fraîche.',
        price: 30.00,
        category: 'MIEL',
        image_url: '/la-voix-du-pelerin/assets/spiritual_prep.png',
        payment_link: '',
        in_stock: true
    },
    {
        id: 'prod-8',
        name: 'Huile de Nigelle d\'Éthiopie (Habachia)',
        description: 'Huile pure de graine de nigelle, pressée à froid, certifiée 99% de pureté. Idéale pour renforcer les défenses.',
        price: 18.00,
        category: 'PRODUIT_NATUREL',
        image_url: '/la-voix-du-pelerin/assets/spiritual_prep.png',
        payment_link: '',
        in_stock: true
    },
    {
        id: 'prod-9',
        name: 'Graines de Nigelle Sativa',
        description: 'Sachet de graines de nigelle entières d\'Égypte, prêtes à moudre ou à infuser.',
        price: 8.00,
        category: 'PRODUIT_NATUREL',
        image_url: '/la-voix-du-pelerin/assets/spiritual_prep.png',
        payment_link: '',
        in_stock: true
    },
    {
        id: 'prod-10',
        name: 'Henné de Médine Naturel',
        description: 'Poudre de henné pure de Médine, sans additifs, pour les soins des cheveux ou motifs cutanés traditionnels.',
        price: 12.00,
        category: 'PRODUIT_NATUREL',
        image_url: '/la-voix-du-pelerin/assets/spiritual_prep.png',
        payment_link: '',
        in_stock: true
    },
    {
        id: 'prod-11',
        name: 'Café Vert Saoudien Moulu (Aux Épices)',
        description: 'Mélange traditionnel de grains de café vert saoudien torréfiés blond, cardamome et safran de qualité supérieure.',
        price: 22.00,
        category: 'CAFE',
        image_url: '/la-voix-du-pelerin/assets/spiritual_prep.png',
        payment_link: '',
        in_stock: true
    }
];

export default function BackofficeShopPage() {
    const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
    const [filterCategory, setFilterCategory] = useState<string>('ALL');
    const [searchQuery, setSearchQuery] = useState<string>('');

    const handleToggleStock = (id: string) => {
        setProducts(prev => prev.map(p => {
            if (p.id === id) {
                return { ...p, in_stock: !p.in_stock };
            }
            return p;
        }));
    };

    const handleUpdateLink = (id: string, link: string) => {
        setProducts(prev => prev.map(p => {
            if (p.id === id) {
                return { ...p, payment_link: link };
            }
            return p;
        }));
    };

    const filteredProducts = products.filter(p => {
        const matchesCategory = filterCategory === 'ALL' || p.category === filterCategory;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              p.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="min-h-screen text-white p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Back Link */}
                <div className="flex items-center justify-between">
                    <Link href="/backoffice" className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-500 hover:text-emerald-400 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Retour Administration
                    </Link>
                    <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                        Mode Édition Backoffice (Invisible aux Pèlerins)
                    </div>
                </div>

                {/* Header */}
                <header className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">GESTION DE LA BOUTIQUE</span>
                    <h1 className="text-4xl font-black uppercase tracking-tighter">Catalogue Cadeaux & Produits Naturels</h1>
                    <p className="text-sm text-dim leading-relaxed max-w-xl">
                        Configurez ici les produits à proposer à vos pèlerins. Indiquez la disponibilité en stock et greffez vos liens Stripe ou Revolut pour finaliser les ventes.
                    </p>
                </header>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white/[0.02] p-6 rounded-3xl border border-white/5">
                    <div className="flex items-center gap-2 w-full md:max-w-xs bg-black/20 border border-white/10 rounded-2xl px-3.5 py-2.5">
                        <Search className="w-4 h-4 text-dim" />
                        <input 
                            type="text" 
                            placeholder="Rechercher un produit..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none outline-none text-xs text-white placeholder-dim w-full"
                        />
                    </div>

                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                        {[
                            { label: 'Tous', value: 'ALL' },
                            { label: 'Miel', value: 'MIEL' },
                            { label: 'Produits Naturels', value: 'PRODUIT_NATUREL' },
                            { label: 'Café', value: 'CAFE' }
                        ].map((btn) => (
                            <button
                                key={btn.value}
                                onClick={() => setFilterCategory(btn.value)}
                                className={`px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap border ${
                                    filterCategory === btn.value
                                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500'
                                        : 'bg-white/5 border-white/5 text-dim hover:bg-white/10'
                                }`}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                        <div key={product.id} className="glass p-6 rounded-[2rem] border-emerald-500/5 relative flex flex-col justify-between group">
                            <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                    <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg">
                                        {product.category === 'MIEL' ? '🍯 Miel' : product.category === 'CAFE' ? '☕ Café' : '🌱 Naturel'}
                                    </span>
                                    <button 
                                        onClick={() => handleToggleStock(product.id)}
                                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all ${
                                            product.in_stock 
                                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20' 
                                                : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
                                        }`}
                                    >
                                        {product.in_stock ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                        {product.in_stock ? 'En Stock' : 'Épuisé'}
                                    </button>
                                </div>

                                <div>
                                    <h3 className="text-base font-bold text-main uppercase">{product.name}</h3>
                                    <p className="text-[11px] text-dim leading-relaxed mt-2 min-h-[48px]">{product.description}</p>
                                </div>

                                <div className="text-xl font-black text-emerald-500">
                                    {product.price.toFixed(2)} €
                                </div>

                                {/* Stripe / Revolut URL Input */}
                                <div className="space-y-1.5 pt-3 border-t border-white/5">
                                    <label className="block text-[9px] font-bold uppercase tracking-wider text-dim">Lien de paiement (Stripe / Revolut)</label>
                                    <div className="flex items-center gap-2 bg-black/20 border border-white/10 rounded-xl px-3 py-2">
                                        <Lock className="w-3 h-3 text-dim" />
                                        <input 
                                            type="text" 
                                            placeholder="https://buy.stripe.com/..." 
                                            value={product.payment_link}
                                            onChange={(e) => handleUpdateLink(product.id, e.target.value)}
                                            className="bg-transparent border-none outline-none text-[10px] text-white placeholder-dim w-full font-mono"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-white/5">
                                <button 
                                    disabled
                                    className="w-full bg-emerald-500/10 border border-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-[9px] uppercase tracking-widest py-3 rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    Previsualiser Lien
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
