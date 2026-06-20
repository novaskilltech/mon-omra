import React from 'react';
import { Star, MessageSquare, Compass, Plane, Hotel, Users, Sparkles, Filter } from 'lucide-react';
import { getAllFeedbacks } from '@/lib/actions/feedback';

export const revalidate = 0; // Disable cache for real-time reviews

export default async function AdminFeedbacksPage() {
    const feedbacks = await getAllFeedbacks();

    // Calculate averages
    const totalCount = feedbacks.length;
    const averages = {
        flight: 0,
        makkah_hotel: 0,
        madinah_hotel: 0,
        guide: 0,
        overall: 0,
    };

    if (totalCount > 0) {
        let sums = { flight: 0, makkah_hotel: 0, madinah_hotel: 0, guide: 0, overall: 0 };
        feedbacks.forEach(f => {
            sums.flight += f.flight_rating;
            sums.makkah_hotel += f.makkah_hotel_rating;
            sums.madinah_hotel += f.madinah_hotel_rating;
            sums.guide += f.guide_rating;
            sums.overall += f.overall_rating;
        });

        averages.flight = Number((sums.flight / totalCount).toFixed(1));
        averages.makkah_hotel = Number((sums.makkah_hotel / totalCount).toFixed(1));
        averages.madinah_hotel = Number((sums.madinah_hotel / totalCount).toFixed(1));
        averages.guide = Number((sums.guide / totalCount).toFixed(1));
        averages.overall = Number((sums.overall / totalCount).toFixed(1));
    }

    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center gap-0.5 text-amber-500">
                {[1, 2, 3, 4, 5].map(star => (
                    <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${star <= rating ? 'fill-current' : 'opacity-20'}`}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-main uppercase tracking-tighter flex items-center gap-3">
                        <Star className="w-8 h-8 text-amber-500 fill-current" />
                        Retours & Avis Pèlerins
                    </h1>
                    <p className="text-dim text-xs font-semibold m-0 mt-1">
                        Consultez et analysez les évaluations soumises par les pèlerins à la fin de leur séjour.
                    </p>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-2xl text-[11px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">
                    Total : {totalCount} évaluation{totalCount > 1 ? 's' : ''}
                </div>
            </div>

            {totalCount === 0 ? (
                <div className="glass p-12 rounded-[2.5rem] text-center border-emerald-500/5 shadow-sm space-y-4">
                    <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 mx-auto">
                        <MessageSquare className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="font-bold text-main text-lg">Aucun retour d'expérience pour le moment</h3>
                        <p className="text-dim text-xs max-w-sm mx-auto leading-relaxed mt-2">
                            Les évaluations apparaîtront ici automatiquement dès que les premiers pèlerins seront de retour et auront soumis le formulaire.
                        </p>
                    </div>
                </div>
            ) : (
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                        {[
                            { label: 'Satisfaction Globale', val: averages.overall, icon: Sparkles, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
                            { label: 'Vols & Transports', val: averages.flight, icon: Plane, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
                            { label: 'Hôtel Makkah', val: averages.makkah_hotel, icon: Hotel, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
                            { label: 'Hôtel Madinah', val: averages.madinah_hotel, icon: Hotel, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
                            { label: 'Guides & Accompagnement', val: averages.guide, icon: Users, color: 'text-pink-500 bg-pink-500/10 border-pink-500/20' },
                        ].map((stat, i) => (
                            <div key={i} className="glass p-6 rounded-3xl border border-emerald-500/5 shadow-sm flex flex-col justify-between gap-4">
                                <div className="flex justify-between items-start">
                                    <span className="text-[10px] font-black uppercase tracking-widest leading-tight text-dim max-w-[80%]">
                                        {stat.label}
                                    </span>
                                    <div className={`p-2 rounded-xl border ${stat.color.split(' ')[1]} ${stat.color.split(' ')[2]} ${stat.color.split(' ')[0]}`}>
                                        <stat.icon className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-main">{stat.val}</span>
                                    <span className="text-xs text-dim">/ 5</span>
                                </div>
                                <div className="h-1.5 w-full bg-black/10 dark:bg-white/5 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-emerald-500 rounded-full" 
                                        style={{ width: `${(stat.val / 5) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Detailed Feedbacks List */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-dim">
                            <Filter className="w-4 h-4 text-emerald-500" />
                            Liste des avis pèlerins
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {feedbacks.map((f) => (
                                <div key={f.id} className="glass p-6 rounded-[2rem] border border-emerald-500/5 shadow-sm flex flex-col md:flex-row gap-6 justify-between">
                                    <div className="space-y-4 flex-1">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-bold text-emerald-600 dark:text-emerald-400">
                                                {f.profiles?.full_name?.charAt(0).toUpperCase() || 'P'}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-main text-sm">{f.profiles?.full_name || 'Pèlerin Anonyme'}</h4>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase px-2 py-0.5 rounded border border-emerald-500/10">
                                                        {f.groups?.name || 'Sans Groupe'}
                                                    </span>
                                                    <span className="text-[10px] text-dim opacity-70">
                                                        Le {new Date(f.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {f.comment ? (
                                            <div className="bg-emerald-500/[0.01] border border-emerald-500/5 p-4 rounded-2xl text-xs leading-relaxed text-sub italic shadow-inner">
                                                "{f.comment}"
                                            </div>
                                        ) : (
                                            <div className="text-[10px] text-dim italic opacity-60">
                                                Aucun commentaire écrit fourni.
                                            </div>
                                        )}
                                    </div>

                                    {/* Ratings categories dashboard */}
                                    <div className="bg-emerald-500/5 dark:bg-white/[0.01] p-5 rounded-2xl border border-emerald-500/10 flex flex-col gap-3 min-w-[240px]">
                                        {[
                                            { label: 'Global', rating: f.overall_rating },
                                            { label: 'Vols', rating: f.flight_rating },
                                            { label: 'Hôtel Makkah', rating: f.makkah_hotel_rating },
                                            { label: 'Hôtel Madinah', rating: f.madinah_hotel_rating },
                                            { label: 'Guides', rating: f.guide_rating },
                                        ].map((cat, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                                                <span className="text-dim">{cat.label}</span>
                                                <div className="flex items-center gap-2">
                                                    {renderStars(cat.rating)}
                                                    <span className="text-main font-black w-4 text-right">{cat.rating}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
