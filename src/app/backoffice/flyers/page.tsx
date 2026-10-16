'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
    getAllFlyersAdmin, 
    createFlyerAction, 
    toggleFlyerActiveAction, 
    deleteFlyerAction,
    analyzeFlyerImageWithAiAction
} from '@/lib/actions/flyers';
import { FlyerOffer } from '@/lib/utils/flyers';
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
    UploadCloud,
    Image as ImageIcon,
    RefreshCw,
    CheckCircle2
} from 'lucide-react';

export default function BackofficeFlyersPage() {
    const [flyers, setFlyers] = useState<FlyerOffer[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // AI Vision Upload & Analysis
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isAiExtracted, setIsAiExtracted] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Form fields
    const [formData, setFormData] = useState({
        title: '',
        airport: '',
        dates: '',
        price: '',
        imageUrl: '',
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

    // Ouvrir le modal d'ajout et réinitialiser
    const handleOpenCreateModal = () => {
        setFormData({
            title: '',
            airport: '',
            dates: '',
            price: '',
            imageUrl: '',
            badge: 'OFFRE FLASH',
            description: ''
        });
        setFilePreview(null);
        setIsAnalyzing(false);
        setIsAiExtracted(false);
        setErrorMsg(null);
        setIsCreateModalOpen(true);
    };

    // Traitement du fichier image sélectionné (Upload + IA Vision Gemini 3.8 Flash)
    const handleFileSelected = async (file: File) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setErrorMsg("Le fichier sélectionné doit être une image (PNG, JPG, WebP).");
            return;
        }

        // Aperçu local immédiat
        const previewUrl = URL.createObjectURL(file);
        setFilePreview(previewUrl);
        setIsAnalyzing(true);
        setErrorMsg(null);

        try {
            const uploadData = new FormData();
            uploadData.append('file', file);
            
            // Appel Server Action IA Vision
            const res = await analyzeFlyerImageWithAiAction(uploadData);

            if (res.success && res.extracted) {
                setFormData(prev => ({
                    ...prev,
                    imageUrl: res.imageUrl || prev.imageUrl || previewUrl,
                    title: res.extracted?.title || prev.title,
                    airport: res.extracted?.airport || prev.airport,
                    dates: res.extracted?.dates || prev.dates,
                    price: res.extracted?.price || prev.price,
                    badge: res.extracted?.badge || prev.badge,
                    description: res.extracted?.description || prev.description
                }));
                setIsAiExtracted(true);
                setTimeout(() => setIsAiExtracted(false), 5000);
            } else if (res.error) {
                setErrorMsg(res.error);
            }
        } catch (err: any) {
            console.error("Erreur d'analyse vision IA:", err);
            setErrorMsg("L'analyse IA de l'image a rencontré un problème. Vous pouvez compléter les champs manuellement.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Gestion du Drag and Drop
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelected(e.dataTransfer.files[0]);
        }
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

        const targetImageUrl = formData.imageUrl || filePreview;
        if (!formData.title || !formData.airport || !formData.dates || !formData.price || !targetImageUrl) {
            setErrorMsg("Veuillez téléverser un flyer et renseigner les champs obligatoires (Titre, Aéroport, Dates, Tarif).");
            return;
        }

        setActionLoading(true);
        try {
            const res = await createFlyerAction({
                ...formData,
                imageUrl: targetImageUrl
            });

            if (res.error) {
                setErrorMsg(res.error);
            } else if (res.flyer) {
                setFlyers(prev => [res.flyer!, ...prev]);
                setSuccessMsg("Flyer publié avec succès dans le Carrousel 3D !");
                setIsCreateModalOpen(false);
            }
        } catch (err: any) {
            setErrorMsg(err.message || "Une erreur est survenue lors de l'enregistrement.");
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in text-white pb-16">
            
            {/* En-tête de la page */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-black uppercase tracking-wider border border-amber-500/30 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            Format Stories / TikTok 9:16
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
                            Vision IA Gemini 3.8 Flash
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mt-2">
                        Gestion des Flyers 3D &amp; Offres
                    </h1>
                    <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
                        Importez vos flyers publicitaires 9:16 (réalisés sur Canva ou Photoshop). L&apos;IA Vision en extrait automatiquement l&apos;aéroport, les dates et le prix pour le carrousel 3D et WhatsApp.
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
                        onClick={handleOpenCreateModal}
                        className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Ajouter un Flyer</span>
                    </button>
                </div>
            </div>

            {/* Messages de statut */}
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

            {/* Grille des Flyers */}
            {loading ? (
                <div className="p-12 text-center text-zinc-400 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
                    <span className="text-xs font-bold uppercase tracking-wider">Chargement des flyers...</span>
                </div>
            ) : flyers.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-zinc-900/40 border border-white/5 space-y-3">
                    <Layers className="w-10 h-10 text-zinc-600 mx-auto" />
                    <p className="text-sm font-bold text-zinc-300">Aucun flyer promotionnel actif.</p>
                    <p className="text-xs text-zinc-500">Ajoutez un premier flyer au format 9:16 pour alimenter votre carrousel 3D.</p>
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
                                {/* Haut : Miniature et métadonnées */}
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

                                    {/* Miniature Ratio 9:16 */}
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

                                {/* Actions au pied */}
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

            {/* MODALE AJOUT FLYER : UPLOAD DIRECT + EXTRACTION IA VISION */}
            {isCreateModalOpen && (
                <div 
                    role="dialog"
                    aria-modal="true"
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
                >
                    <div className="relative w-full max-w-4xl bg-zinc-950 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-left overflow-hidden max-h-[92vh] overflow-y-auto">
                        
                        {/* Bouton fermeture */}
                        <button
                            onClick={() => setIsCreateModalOpen(false)}
                            className="absolute top-5 right-5 p-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border border-white/10 z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="space-y-1 mb-6">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5" />
                                Format 9:16 Story / TikTok / WhatsApp
                            </span>
                            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                                Importer un Flyer &amp; Extraction IA Multimodale
                            </h2>
                            <p className="text-xs text-zinc-400">
                                Téléversez le flyer déjà conçu (Canva, Photoshop). Notre IA Vision lit le visuel et pré-remplit les critères de réservation.
                            </p>
                        </div>

                        {/* INPUT FILE CACHÉ */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png, image/jpeg, image/webp"
                            className="hidden"
                            onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    handleFileSelected(e.target.files[0]);
                                }
                            }}
                        />

                        {/* CORPS DE LA MODALE : 2 COLONNES (GAUCHE : PREVIEW 9:16 / DROITE : CHAMPS AUTO-REMPLIS) */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                            
                            {/* COLONNE GAUCHE (5/12) : ZONE DE DROP / APERÇU 9:16 */}
                            <div className="md:col-span-5 space-y-3">
                                <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
                                    <span>Visuel du Flyer</span>
                                    {filePreview && (
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 underline"
                                        >
                                            <RefreshCw className="w-3 h-3" />
                                            Changer
                                        </button>
                                    )}
                                </div>

                                {!filePreview ? (
                                    /* DROPZONE VIDE */
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        onDragEnter={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDragOver={handleDrag}
                                        onDrop={handleDrop}
                                        className={`w-full aspect-[9/16] rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-6 text-center cursor-pointer ${
                                            dragActive
                                                ? 'border-amber-400 bg-amber-500/10 scale-[1.01]'
                                                : 'border-white/20 bg-zinc-900/60 hover:border-amber-400/60 hover:bg-zinc-900'
                                        }`}
                                    >
                                        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 shadow-inner">
                                            <UploadCloud className="w-7 h-7" />
                                        </div>
                                        <span className="text-xs font-black text-white uppercase tracking-wider mb-1">
                                            Glissez votre flyer ici
                                        </span>
                                        <span className="text-[11px] text-zinc-400 mb-3">
                                            ou cliquez pour parcourir
                                        </span>
                                        <div className="px-2.5 py-1 rounded-full bg-black/50 border border-white/10 text-[9px] font-mono text-zinc-400 uppercase tracking-wider">
                                            Ratio 9:16 (PNG, JPG, WebP)
                                        </div>
                                    </div>
                                ) : (
                                    /* APERÇU FLYER 9:16 AVEC SCANNER IA EN COURS */
                                    <div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden border-2 border-amber-400/50 bg-black shadow-2xl">
                                        <Image
                                            src={filePreview}
                                            alt="Flyer téléversé"
                                            fill
                                            className="object-cover"
                                        />

                                        {/* OVERLAY SCANNER IA PENDANT L'ANALYSE */}
                                        {isAnalyzing && (
                                            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center space-y-3 animate-fade-in">
                                                {/* Laser beam */}
                                                <div className="absolute inset-x-0 top-1/3 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_20px_#f59e0b] animate-pulse" />
                                                
                                                <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
                                                <div className="space-y-1">
                                                    <span className="text-xs font-black uppercase tracking-wider text-amber-300 block">
                                                        Vision IA Gemini 3.8 Flash
                                                    </span>
                                                    <p className="text-[11px] text-zinc-300 max-w-[200px] leading-relaxed">
                                                        Lecture du visuel, extraction du départ, des dates, du tarif et du titre...
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* BANDEAU SUCCÈS EXTRACTION */}
                                        {!isAnalyzing && isAiExtracted && (
                                            <div className="absolute top-3 inset-x-3 p-2 rounded-xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg animate-fade-in backdrop-blur-sm">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                                <span>Flyer analysé avec succès !</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* COLONNE DROITE (7/12) : FORMULAIRE ET DONNÉES EXTRAITES */}
                            <div className="md:col-span-7 space-y-4">
                                {isAiExtracted && (
                                    <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-amber-300 text-xs flex items-start gap-2.5 animate-fade-in">
                                        <Wand2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                                        <div className="space-y-0.5">
                                            <span className="font-bold text-amber-200 block">Données extraites automatiquement par l&apos;IA</span>
                                            <p className="text-[11px] text-zinc-400">
                                                Les informations ci-dessous ont été détectées directement sur le flyer. Vous pouvez les ajuster avant de publier.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
                                    <div className="space-y-1">
                                        <label className="font-bold text-zinc-300 block">Titre de la formule *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="Ex: OMRA CONFORT 4★ DÉCEMBRE"
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-amber-400 text-xs font-semibold"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="font-bold text-zinc-300 block flex items-center gap-1.5">
                                                <Plane className="w-3.5 h-3.5 text-amber-400" />
                                                Aéroport de départ *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.airport}
                                                onChange={(e) => setFormData({ ...formData, airport: e.target.value })}
                                                placeholder="Ex: Lyon Saint-Exupéry (LYS)"
                                                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-amber-400 text-xs font-medium"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="font-bold text-zinc-300 block flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                                                Dates du séjour *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.dates}
                                                onChange={(e) => setFormData({ ...formData, dates: e.target.value })}
                                                placeholder="Ex: 08 au 15 Décembre 2026"
                                                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-amber-400 text-xs font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="font-bold text-zinc-300 block flex items-center gap-1.5">
                                                <Tag className="w-3.5 h-3.5 text-amber-400" />
                                                Tarif par personne *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                placeholder="Ex: 1 290 €"
                                                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-amber-400 text-xs font-black text-amber-300"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="font-bold text-zinc-300 block">Badge d&apos;accroche</label>
                                            <input
                                                type="text"
                                                value={formData.badge}
                                                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                                                placeholder="Ex: OFFRE FLASH, PLACES LIMITÉES"
                                                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-amber-400 text-xs font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="font-bold text-zinc-300 block">Prestations / Descriptif (optionnel)</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            rows={2}
                                            placeholder="Ex: Vols directs avec bagage 23kg, hôtel 4★ face Haram, petit-déjeuner et transferts VIP inclus..."
                                            className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-amber-400 text-xs"
                                        />
                                    </div>

                                    {/* URL IMAGE (Masquable ou lecture seule) */}
                                    <div className="space-y-1 pt-1">
                                        <label className="font-bold text-zinc-400 block text-[11px]">
                                            Fichier image associé
                                        </label>
                                        <input
                                            type="text"
                                            readOnly
                                            value={formData.imageUrl || (filePreview ? "Image téléversée en attente" : "")}
                                            placeholder="Téléversez un flyer via la zone à gauche"
                                            className="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-white/5 text-zinc-400 text-[11px] font-mono select-all focus:outline-none"
                                        />
                                    </div>

                                    {/* Boutons d'action */}
                                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                                        <button
                                            type="button"
                                            onClick={() => setIsCreateModalOpen(false)}
                                            className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white font-bold text-xs uppercase tracking-wider transition-colors"
                                        >
                                            Annuler
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={actionLoading || isAnalyzing || (!formData.imageUrl && !filePreview)}
                                            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-95"
                                        >
                                            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                            <span>Publier dans le Carrousel 3D</span>
                                        </button>
                                    </div>
                                </form>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
