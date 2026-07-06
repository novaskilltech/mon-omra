'use client';

import { useState } from 'react';
import { ShoppingBag, Tag, ExternalLink, Lock, CheckCircle, XCircle, Search, Coffee, ArrowLeft, Edit2, Check, X, Image as ImageIcon } from 'lucide-react';
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
    
    // Inline editing states
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editPrice, setEditPrice] = useState<number>(0);
    const [editImage, setEditImage] = useState('');
    const [editPaymentLink, setEditPaymentLink] = useState('');

    const handleToggleStock = (id: string) => {
        setProducts(prev => prev.map(p => {
            if (p.id === id) {
                return { ...p, in_stock: !p.in_stock };
            }
            return p;
        }));
    };

    const startEditing = (p: Product) => {
        setEditingId(p.id);
        setEditName(p.name);
        setEditDescription(p.description);
        setEditPrice(p.price);
        setEditImage(p.image_url);
        setEditPaymentLink(p.payment_link);
    };

    const saveChanges = (id: string) => {
        setProducts(prev => prev.map(p => {
            if (p.id === id) {
                return {
                    ...p,
                    name: editName,
                    description: editDescription,
                    price: editPrice,
                    image_url: editImage,
                    payment_link: editPaymentLink
                };
            }
            return p;
        }));
        setEditingId(null);
    };

    const cancelEditing = () => {
        setEditingId(null);
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
                        Mode Édition Actif
                    </div>
                </div>

                {/* Header */}
                <header className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">BOUTIQUE AGENT</span>
                    <h1 className="text-4xl font-black uppercase tracking-tighter">Catalogue & Tarifs Boutique</h1>
                    <p className="text-sm text-dim leading-relaxed max-w-xl">
                        Modifiez directement les titres, descriptions, prix, photos, stocks et liens de paiement Stripe/Revolut pour chaque produit du catalogue.
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
                    {filteredProducts.map((product) => {
                        const isEditing = editingId === product.id;
                        return (
                            <div key={product.id} className="glass p-6 rounded-[2rem] border-emerald-500/5 relative flex flex-col justify-between group transition-all">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
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

                                    {isEditing ? (
                                        // Edit Form Card
                                        <div className="space-y-3 pt-2">
                                            <div>
                                                <label className="block text-[8px] font-bold uppercase text-dim tracking-wider mb-1">Nom du Produit</label>
                                                <input 
                                                    type="text" 
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="block text-[8px] font-bold uppercase text-dim tracking-wider mb-1">Tarif (€)</label>
                                                    <input 
                                                        type="number" 
                                                        step="0.01"
                                                        value={editPrice}
                                                        onChange={(e) => setEditPrice(parseFloat(e.target.value) || 0)}
                                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[8px] font-bold uppercase text-dim tracking-wider mb-1">Lien Image</label>
                                                    <div className="flex items-center gap-1 bg-black/40 border border-white/10 rounded-xl px-2">
                                                        <ImageIcon className="w-3.5 h-3.5 text-dim shrink-0" />
                                                        <input 
                                                            type="text" 
                                                            value={editImage}
                                                            onChange={(e) => setEditImage(e.target.value)}
                                                            className="w-full bg-transparent border-none py-2 text-[10px] text-white outline-none"
                                                            placeholder="URL de la photo"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-[8px] font-bold uppercase text-dim tracking-wider mb-1">Description</label>
                                                <textarea 
                                                    value={editDescription}
                                                    onChange={(e) => setEditDescription(e.target.value)}
                                                    rows={3}
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500 resize-none"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-[8px] font-bold uppercase text-dim tracking-wider mb-1">Lien Stripe / Revolut</label>
                                                <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-3 py-2">
                                                    <Lock className="w-3 h-3 text-dim" />
                                                    <input 
                                                        type="text" 
                                                        placeholder="https://buy.stripe.com/..." 
                                                        value={editPaymentLink}
                                                        onChange={(e) => setEditPaymentLink(e.target.value)}
                                                        className="bg-transparent border-none outline-none text-[10px] text-white w-full font-mono"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex gap-2 pt-2">
                                                <button 
                                                    onClick={() => saveChanges(product.id)}
                                                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[9px] uppercase tracking-widest py-2.5 rounded-xl flex items-center justify-center gap-1.5"
                                                >
                                                    <Check className="w-3.5 h-3.5" /> Enregistrer
                                                </button>
                                                <button 
                                                    onClick={cancelEditing}
                                                    className="px-3 bg-white/5 hover:bg-white/10 text-dim font-black text-[9px] uppercase tracking-widest py-2.5 rounded-xl flex items-center justify-center"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        // Read-Only Card
                                        <div className="space-y-3">
                                            {product.image_url && (
                                                <div className="w-full h-24 rounded-2xl overflow-hidden border border-white/5 bg-black/20 relative flex items-center justify-center">
                                                    <span className="absolute top-2 right-2 text-xs">📸</span>
                                                    <p className="text-[9px] text-dim truncate max-w-xs">{product.image_url}</p>
                                                </div>
                                            )}

                                            <div>
                                                <div className="flex justify-between items-start gap-2">
                                                    <h3 className="text-base font-bold text-main uppercase">{product.name}</h3>
                                                    <button 
                                                        onClick={() => startEditing(product)}
                                                        className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-dim hover:text-emerald-500 transition-colors shrink-0"
                                                        title="Modifier le produit"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                                <p className="text-[11px] text-dim leading-relaxed mt-2 min-h-[48px]">{product.description}</p>
                                            </div>

                                            <div className="flex justify-between items-center pt-2">
                                                <span className="text-xl font-black text-emerald-500">
                                                    {product.price.toFixed(2)} €
                                                </span>
                                            </div>

                                            {product.payment_link ? (
                                                <div className="text-[9px] text-emerald-400 font-mono truncate max-w-full flex items-center gap-1 pt-2">
                                                    <Lock className="w-3 h-3 text-emerald-500 shrink-0" />
                                                    {product.payment_link}
                                                </div>
                                            ) : (
                                                <div className="text-[9px] text-dim font-mono italic pt-2">
                                                    Aucun lien de paiement lié
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {!isEditing && (
                                    <div className="mt-6 pt-4 border-t border-white/5">
                                        <a 
                                            href={product.payment_link || '#'}
                                            target={product.payment_link ? "_blank" : undefined}
                                            rel="noopener noreferrer"
                                            className={`w-full font-black text-[9px] uppercase tracking-widest py-3 rounded-xl flex items-center justify-center gap-2 border transition-all ${
                                                product.payment_link 
                                                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500' 
                                                    : 'bg-emerald-500/5 border-emerald-500/10 text-emerald-600/50 dark:text-emerald-400/50 cursor-not-allowed'
                                            }`}
                                        >
                                            Tester le Paiement <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
