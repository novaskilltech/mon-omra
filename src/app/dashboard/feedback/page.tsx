'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Star, ArrowLeft, Send, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import { submitFeedbackAction } from '@/lib/actions/feedback';

interface RatingCategory {
    key: 'flight_rating' | 'makkah_hotel_rating' | 'madinah_hotel_rating' | 'guide_rating' | 'overall_rating';
    label: string;
    description: string;
}

const CATEGORIES: RatingCategory[] = [
    { key: 'flight_rating', label: 'Vols & Transports', description: 'Ponctualité, confort à bord et gestion des transferts/escales.' },
    { key: 'makkah_hotel_rating', label: 'Hébergement Makkah', description: 'Proximité du Haram, confort des chambres et propreté.' },
    { key: 'madinah_hotel_rating', label: 'Hébergement Madinah', description: 'Confort de l\'hôtel, services et accueil.' },
    { key: 'guide_rating', label: 'Guides & Accompagnateurs', description: 'Disponibilité, explications des rites et encadrement.' },
    { key: 'overall_rating', label: 'Satisfaction Générale', description: 'Votre appréciation globale sur l\'organisation de votre Omra.' },
];

export default function PilgrimFeedbackPage() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [ratings, setRatings] = useState<Record<string, number>>({
        flight_rating: 0,
        makkah_hotel_rating: 0,
        madinah_hotel_rating: 0,
        guide_rating: 0,
        overall_rating: 0,
    });
    const [comment, setComment] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSetRating = (key: string, value: number) => {
        setRatings(prev => ({ ...prev, [key]: value }));
    };

    const isFormValid = Object.values(ratings).every(val => val >= 1);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!isFormValid) {
            setError('Veuillez attribuer une note (au moins 1 étoile) à toutes les catégories.');
            return;
        }

        startTransition(async () => {
            const res = await submitFeedbackAction({
                flight_rating: ratings.flight_rating,
                makkah_hotel_rating: ratings.makkah_hotel_rating,
                madinah_hotel_rating: ratings.madinah_hotel_rating,
                guide_rating: ratings.guide_rating,
                overall_rating: ratings.overall_rating,
                comment: comment || undefined
            });

            if (res.error) {
                setError(res.error);
            } else {
                setSuccess(true);
                setTimeout(() => {
                    router.push('/dashboard');
                    router.refresh();
                }, 3000);
            }
        });
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-radial-gradient">
                <div className="glass max-w-md w-full p-8 rounded-[2.5rem] border border-emerald-500/20 text-center space-y-6 shadow-2xl animate-scale-in">
                    <div className="w-20 h-20 mx-auto bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500">
                        <CheckCircle className="w-10 h-10" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-main uppercase tracking-tight">Taqabbal Allah !</h2>
                        <p className="text-dim text-sm leading-relaxed">
                            Votre évaluation a été bien reçue. Merci infiniment d'avoir pris le temps de nous aider à nous améliorer.
                        </p>
                    </div>
                    <div className="text-xs text-dim opacity-70 italic">
                        Redirection vers votre tableau de bord...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-12">
            {/* Header */}
            <nav className="glass px-6 py-4 flex justify-between items-center sticky top-0 z-50 border-emerald-500/5">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="p-2 hover:bg-emerald-500/10 rounded-xl transition-colors text-main">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex items-center gap-2.5">
                        <Image src="/logo.png" alt="OMRAYANAIR Logo" width={28} height={28} className="rounded-lg object-contain" />
                        <div className="text-xl font-black tracking-tighter text-main uppercase">
                            OMRA<span className="text-emerald-500">YANAIR</span>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-xl mx-auto px-6 pt-8 space-y-8">
                <div className="text-center space-y-2">
                    <div className="inline-flex p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-2xl mb-2">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <h1 className="text-3xl font-black text-main uppercase tracking-tighter">Votre Avis sur le Séjour 🕋</h1>
                    <p className="text-dim text-xs leading-relaxed max-w-sm mx-auto">
                        Partagez votre retour d'expérience pour nous aider à parfaire les prochaines organisations de voyage.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-start gap-3 text-red-500 text-xs font-semibold">
                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                            <p className="m-0 leading-relaxed">{error}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        {CATEGORIES.map(category => (
                            <div key={category.key} className="glass p-6 rounded-3xl border border-emerald-500/5 flex flex-col gap-4 shadow-sm">
                                <div>
                                    <h4 className="font-black text-sm text-main uppercase tracking-wider">{category.label}</h4>
                                    <p className="text-[10px] text-dim opacity-80 leading-relaxed mt-1">{category.description}</p>
                                </div>
                                <div className="flex gap-2.5 items-center">
                                    {[1, 2, 3, 4, 5].map(star => {
                                        const isSelected = ratings[category.key] >= star;
                                        return (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => handleSetRating(category.key, star)}
                                                className="p-1 hover:scale-115 active:scale-95 transition-all text-amber-400 focus:outline-none"
                                            >
                                                <Star
                                                    className={`w-7 h-7 ${isSelected ? 'fill-current' : 'opacity-25'}`}
                                                />
                                            </button>
                                        );
                                    })}
                                    {ratings[category.key] > 0 && (
                                        <span className="text-[10px] font-black uppercase text-amber-500 ml-2 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                                            {ratings[category.key]}/5
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Free comment */}
                    <div className="glass p-6 rounded-3xl border border-emerald-500/5 flex flex-col gap-4 shadow-sm">
                        <div>
                            <h4 className="font-black text-sm text-main uppercase tracking-wider">Commentaire libre (Facultatif)</h4>
                            <p className="text-[10px] text-dim opacity-80 leading-relaxed mt-1">
                                Partagez des détails, remarques ou anecdotes sur votre expérience.
                            </p>
                        </div>
                        
                        {/* RGPD Warning */}
                        <div className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-2xl text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold leading-relaxed">
                            🛡️ <strong>Avis de confidentialité :</strong> Pour protéger votre vie privée, merci de ne pas mentionner d'informations personnelles sensibles (comme des détails de santé ou traitements médicaux) dans vos commentaires.
                        </div>

                        <textarea
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            placeholder="Vos remarques ou suggestions..."
                            rows={4}
                            className="w-full bg-white/5 border border-emerald-500/10 rounded-2xl p-4 text-xs text-main focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-dim resize-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isPending || !isFormValid}
                        className={`w-full font-bold text-xs uppercase tracking-widest py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all ${
                            isFormValid
                                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20 hover:scale-102 cursor-pointer'
                                : 'bg-emerald-500/10 text-emerald-500/40 border border-emerald-500/10 cursor-not-allowed'
                        }`}
                    >
                        {isPending ? (
                            'Soumission en cours...'
                        ) : (
                            <>
                                Envoyer mon évaluation
                                <Send className="w-3.5 h-3.5" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
