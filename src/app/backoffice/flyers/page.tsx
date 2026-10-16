'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
    getAllFlyersAdmin, 
    createFlyerAction, 
    toggleFlyerActiveAction, 
    deleteFlyerAction
} from '@/lib/actions/flyers';
import { extractFlyerInfoFromText, FlyerOffer } from '@/lib/utils/flyers';

import { getFlyerWhatsAppUrl } from '@/lib/utils/phone';
import { 
    Sparkles, 
    Plus, 
    Trash2, 
    Eye, 
    EyeOff, 
    ExternalLink, 
    MessageSquare, 
    Plane, 
    Calendar, 
    Tag, 
    Wand2, 
    Check, 
    X, 
    Loader2,
    Layers,
    Share2
} from 'lucide-react';

export default function BackofficeFlyersPage() {
    const [flyers, setFlyers] = useState<FlyerOffer[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // AI Assist Text
    const [rawAiText, setRawAiText] = useState('');
    const [isAiExtracted, setIsAiExtracted] = useState(false);

    // Form fields
    const [formData, setFormData] = useState({
        title: '',
        airport: '',
        dates: '',
        price: '',
        imageUrl: '/flyers/flyer-lyon-decembre.svg',
        badge: 'OFFRE FLASH',
        description: ''
    });

    const loadFlyers = async () => {
        setLoading(true);
        try {
            const list = await getAllFlyersAdmin();
            setFlyers(list);
        } catch (err: any) {
            console.error("Error loading admin flyers:", err);
            setErrorMsg(err.message || "Erreur de chargement des flyers.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFlyers();
    }, []);

    // AI Extraction Assist
    const handleAiExtract = () => {
        if (!rawAiText.trim()) return;
        const extracted = extractFlyerInfoFromText(rawAiText);
        setFormData(prev => ({
            ...prev,
            title: extracted.title || prev.title,
            airport: extracted.airport || prev.airport,
            dates: extracted.dates || prev.dates,
            price: extracted.price || prev.price
        }));
        setIsAiExtracted(true);
        setTimeout(() => setIsAiExtracted(false), 3000);
    };

    const handleToggleActive = async (id: string) => {
        setActionLoading(true);
        try {
            await toggleFlyerActiveAction(id);
            setFlyers(prev => prev.map(f => f.id === id ? { ...f, isActive: !f.isActive } : f));
        } catch (err: any) {
            alert(err.message || "Erreur lors du changement de statut");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Êtes-vous certain de vouloir supprimer ce flyer ?")) return;
        setActionLoading(true);
        try {
            await deleteFlyerAction(id);
            setFlyers(prev => prev.filter(f => f.id !== id));
        } catch (err: any) {
            alert(err.message || "Erreur lors de la suppression");
        } finally {
            setActionLoading(false);
        }
    };

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        setSuccessMsg(null);

        if (!formData.title || !formData.airport || !formData.dates || !formData.price || !formData.imageUrl) {
            setErrorMsg("Veuillez renseigner tous les champs obligatoires.");
            return;
        }

        setActionLoading(true);
        try {
            const res = await createFlyerAction(formData);
            if (res.error) {
                setErrorMsg(res.error);
            } else if (res.flyer) {
                setFlyers(prev => [res.flyer!, ...prev]);
                setSuccessMsg("Flyer publié avec succès dans le Carrousel 3D !");
                setIsCreateModalOpen(false);
                setFormData({
                    title: '',
                    airport: '',
                    dates: '',
                    price: '',
                    imageUrl: '/flyers/flyer-lyon-decembre.svg',
                    badge: 'OFFRE FLASH',
                    description: ''
                });
                setRawAiText('');
            }
        } catch (err: any) {
            setErrorMsg(err.message || "Une erreur est survenue lors de l'enregistrement.");
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in text-white pb-16">
            
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-black uppercase tracking-wider border border-amber-500/30 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            Format Stories / TikTok 9:16
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mt-2">
                        Gestion des Flyers 3D &amp; Offres
                    </h1>
                    <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
                        Publiez vos flyers publicitaires 9:16 pour le carrousel 3D cubique. Chaque flyer dispose d&apos;une OpenGraph Card pour afficher une vignette automatique sur WhatsApp.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/"
                        target="_blank"
                        className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold uppercase tracking-wider border border-white/10 transition-colors flex items-center gap-1.5"
                    >
                        <ExternalLink className="w-4 h-4" />
                        <span>Voir le Carrousel 3D</span>
                    </Link>

                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Ajouter un Flyer</span>
                    </button>
                </div>
            </div>

            {/* Notification messages */}
            {successMsg && (
                <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
                    <Check className="w-4 h-4" />
                    <span>{successMsg}</span>
                </div>
            )}
            {errorMsg && (
                <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
                    <X className="w-4 h-4" />
                    <span>{errorMsg}</span>
                </div>
            )}

            {/* Flyers Grid */}
            {loading ? (
                <div className="p-12 text-center text-zinc-400 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
                    <span className="text-xs font-bold uppercase tracking-wider">Chargement des flyers...</span>
                </div>
            ) : flyers.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-zinc-900/40 border border-white/5 space-y-3">
                    <Layers className="w-10 h-10 text-zinc-600 mx-auto" />
                    <p className="text-sm font-bold text-zinc-300">Aucun flyer promotionnel actif.</p>
                    <p className="text-xs text-zinc-500">Ajoutez un premier flyer au format 9:16 pour illuminer votre page d&apos;accueil.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {flyers.map((flyer) => {
                        const whatsappTestUrl = getFlyerWhatsAppUrl(flyer);

                        return (
                            <div
                                key={flyer.id}
                                className={`rounded-3xl border-2 transition-all overflow-hidden flex flex-col justify-between ${
                                    flyer.isActive 
                                        ? 'border-amber-400/40 bg-zinc-950 shadow-xl shadow-black/40' 
                                        : 'border-white/5 bg-zinc-900/40 opacity-60'
                                }`}
                            >
                                {/* Top Preview & Thumbnail */}
                                <div className="p-5 space-y-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                                flyer.isActive
                                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                                    : 'bg-zinc-800 text-zinc-500 border-white/10'
                                            }`}>
                                                {flyer.isActive ? 'En Ligne (3D)' : 'Masqué'}
                                            </span>
                                            {flyer.badge && (
                                                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-500/30">
                                                    {flyer.badge}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                            <button
                                                onClick={() => handleToggleActive(flyer.id)}
                                                disabled={actionLoading}
                                                title={flyer.isActive ? 'Masquer du carrousel' : 'Activer dans le carrousel'}
                                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                                            >
                                                {flyer.isActive ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4 text-zinc-500" />}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(flyer.id)}
                                                disabled={actionLoading}
                                                title="Supprimer ce flyer"
                                                className="p-1.5 rounded-lg bg-white/5 hover:bg-red-950/50 text-zinc-400 hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Middle: 9:16 Aspect ratio miniature */}
                                    <div className="flex gap-4 items-center">
                                        <div className="relative w-24 h-40 rounded-2xl overflow-hidden border border-white/15 bg-black shrink-0">
                                            <Image
                                                src={flyer.imageUrl}
                                                alt={flyer.title}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>

                                        <div className="space-y-1.5 flex-1 min-w-0">
                                            <h3 className="text-sm font-black text-white uppercase tracking-tight line-clamp-2">
                                                {flyer.title}
                                            </h3>

                                            <div className="text-xs text-amber-300 font-semibold flex items-center gap-1.5">
                                                <Plane className="w-3.5 h-3.5 shrink-0" />
                                                <span className="truncate">{flyer.airport}</span>
                                            </div>

                                            <div className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 shrink-0" />
                                                <span className="truncate">{flyer.dates}</span>
                                            </div>

                                            <div className="text-sm font-black text-white pt-1">
                                                {flyer.price}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer actions */}
                                <div className="p-4 bg-white/5 border-t border-white/5 flex items-center justify-between gap-2 text-xs">
                                    <Link
                                        href={`/offres/${flyer.id}`}
                                        target="_blank"
                                        className="text-zinc-400 hover:text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
                                    >
                                        <span>Page &amp; Carte OG</span>
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </Link>

                                    <a
                                        href={whatsappTestUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3 py-1.5 rounded-lg bg-emerald-600/80 hover:bg-emerald-500 text-white font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all"
                                    >
                                        <MessageSquare className="w-3.5 h-3.5" />
                                        <span>Tester WhatsApp</span>
                                    </a>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* MODAL AJOUT NOUVEAU FLYER & ASSISTANT IA */}
            {isCreateModalOpen && (
                <div 
                    role="dialog"
                    aria-modal="true"
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
                >
                    <div className="relative w-full max-w-2xl bg-zinc-950 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-left overflow-hidden max-h-[90vh] overflow-y-auto">
                        
                        {/* Close button */}
                        <button
                            onClick={() => setIsCreateModalOpen(false)}
                            className="absolute top-5 right-5 p-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border border-white/10"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="space-y-1 mb-6">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">
                                Nouveau Format 9:16 Story / TikTok
                            </span>
                            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                                Publier un Flyer dans le Carrousel 3D
                            </h2>
                        </div>

                        {/* SECTION 1: ASSISTANT EXTRACTION IA / OCR */}
                        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-3 mb-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
                                    <Wand2 className="w-4 h-4 text-amber-400" />
                                    <span>Assistant IA : Extraction Automatique des Données</span>
                                </div>
                                {isAiExtracted && (
                                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 animate-fade-in">
                                        <Check className="w-3 h-3" /> Informations extraites !
                                    </span>
                                )}
                            </div>

                            <p className="text-xs text-zinc-400 leading-relaxed">
                                Collez ci-dessous le texte ou descriptif de votre flyer. L&apos;IA en extraira automatiquement l&apos;Aéroport, les Dates, le Tarif et le Titre pour pré-remplir le formulaire.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-2">
                                <textarea
                                    value={rawAiText}
                                    onChange={(e) => setRawAiText(e.target.value)}
                                    placeholder="Exemple : OMRA CONFORT DÉCEMBRE - Vol direct Lyon Saint-Exupéry du 08 au 15 décembre - Hôtel 4★ - Tarif : 1290 €..."
                                    rows={2}
                                    className="flex-1 px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"
                                />
                                <button
                                    type="button"
                                    onClick={handleAiExtract}
                                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider shrink-0 transition-all shadow-md flex items-center justify-center gap-1.5"
                                >
                                    <Wand2 className="w-3.5 h-3.5" />
                                    <span>Extraire</span>
                                </button>
                            </div>
                        </div>

                        {/* SECTION 2: FORMULAIRE DE PUBLICATION */}
                        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="font-bold text-zinc-300 block">Titre de la formule *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Ex: OMRA CONFORT 4★ DÉCEMBRE"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-amber-400 text-xs"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="font-bold text-zinc-300 block">Aéroport de départ *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.airport}
                                        onChange={(e) => setFormData({ ...formData, airport: e.target.value })}
                                        placeholder="Ex: Lyon Saint-Exupéry (LYS)"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-amber-400 text-xs"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="font-bold text-zinc-300 block">Dates du séjour *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.dates}
                                        onChange={(e) => setFormData({ ...formData, dates: e.target.value })}
                                        placeholder="Ex: 08 au 15 Décembre 2026"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-amber-400 text-xs"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="font-bold text-zinc-300 block">Tarif indicatif par personne *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        placeholder="Ex: 1 290 €"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-amber-400 text-xs"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="font-bold text-zinc-300 block">Chemin ou URL de l&apos;image (Ratio 9:16) *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.imageUrl}
                                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                        placeholder="/flyers/mon-flyer.svg ou https://..."
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-amber-400 text-xs"
                                    />
                                    <span className="text-[10px] text-zinc-500">Utilisez un format vertical (1080x1920 ou 9:16).</span>
                                </div>

                                <div className="space-y-1">
                                    <label className="font-bold text-zinc-300 block">Badge visuel</label>
                                    <input
                                        type="text"
                                        value={formData.badge}
                                        onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                                        placeholder="Ex: OFFRE FLASH, PLACES LIMITÉES"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-amber-400 text-xs"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="font-bold text-zinc-300 block">Descriptif de la formule (optionnel)</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={2}
                                    placeholder="Ex: Vols directs, hôtel 4★ face Haram, petit-déjeuner et transferts VIP inclus..."
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-amber-400 text-xs"
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white font-bold text-xs uppercase tracking-wider transition-colors"
                                >
                                    Annuler
                                </button>

                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
                                >
                                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    <span>Publier dans le Carrousel 3D</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
