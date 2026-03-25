'use client';

import { useState } from 'react';
import { Plane, Trash2, Loader2, MapPin, Calendar, Clock } from 'lucide-react';
import { deleteFlight } from '@/lib/actions/logistics';
import { useToast } from '@/components/ui/Toast';

interface FlightCardProps {
    flight: any;
}

export default function FlightCard({ flight }: FlightCardProps) {
    const [deleting, setDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const { showToast } = useToast();

    // Sort segments by sequence_order or departure_time
    const sortedSegments = [...(flight.flight_segments || [])].sort((a, b) => 
        new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime()
    );

    const firstSegment = sortedSegments[0];
    const lastSegment = sortedSegments[sortedSegments.length - 1];

    const handleDelete = async () => {
        setDeleting(true);
        try {
            const result = await deleteFlight(flight.id);
            if (result?.error) {
                showToast(result.error, 'error');
            } else {
                showToast("Plan de vol supprimé.");
            }
        } catch (err) {
            showToast("Erreur lors de la suppression.", "error");
        } finally {
            setDeleting(false);
            setShowConfirm(false);
        }
    };

    if (!firstSegment) return null;

    return (
        <div className="glass p-6 rounded-3xl border border-emerald-500/10 shadow-sm hover:border-emerald-500/30 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors" />
            
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest border border-emerald-500/10">
                                {flight.type === 'DIRECT' ? 'Direct' : 'Avec Escale'}
                            </span>
                            <button 
                                onClick={() => setShowConfirm(true)}
                                className="p-2 text-dim hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        <h3 className="font-black text-lg uppercase mt-2 text-main flex items-center gap-2">
                            {firstSegment.departure_airport} <Plane className="w-4 h-4 text-emerald-500 rotate-90" /> {lastSegment.arrival_airport}
                        </h3>
                    </div>
                </div>

                <div className="space-y-4">
                    {sortedSegments.map((segment: any, idx: number) => (
                        <div key={segment.id} className="relative pl-6 border-l border-emerald-500/10 pb-4 last:pb-0">
                            <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-black" />
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">
                                        Segment {idx + 1} — {segment.airline}
                                    </p>
                                    <p className="text-xs font-bold text-main mt-1">
                                        {segment.departure_airport} → {segment.arrival_airport}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-bold text-dim uppercase">Départ</p>
                                    <p className="text-[10px] font-black text-main">
                                        {new Date(segment.departure_time).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal de Confirmation */}
            {showConfirm && (
                <div className="absolute inset-0 z-20 bg-main/90 backdrop-blur-md p-6 flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
                    <Trash2 className="w-10 h-10 text-red-500 mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-main mb-6">
                        Supprimer ce plan de vol ?
                    </p>
                    <div className="flex gap-3 w-full">
                        <button 
                            onClick={() => setShowConfirm(false)}
                            className="flex-1 py-3 rounded-2xl bg-emerald-500/10 text-main text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all"
                        >
                            Annuler
                        </button>
                        <button 
                            onClick={handleDelete}
                            disabled={deleting}
                            className="flex-1 py-3 rounded-2xl bg-red-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                        >
                            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmer"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
