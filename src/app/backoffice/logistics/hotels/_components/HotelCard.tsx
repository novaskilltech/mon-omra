'use client';

import { useState } from 'react';
import { Star, Trash2, Loader2, Building2 } from 'lucide-react';
import { deleteHotel } from '@/lib/actions/logistics';
import { useToast } from '@/components/ui/Toast';

interface HotelCardProps {
    hotel: any;
}

export default function HotelCard({ hotel }: HotelCardProps) {
    const [deleting, setDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const { showToast } = useToast();

    const doubleQty = hotel.rooms.filter((r: any) => r.type === 'DOUBLE').length;
    const tripleQty = hotel.rooms.filter((r: any) => r.type === 'TRIPLE').length;
    const quadrupleQty = hotel.rooms.filter((r: any) => r.type === 'QUADRUPLE').length;

    const handleDelete = async () => {
        setDeleting(true);
        try {
            const result = await deleteHotel(hotel.id);
            if (result?.error) {
                showToast(result.error, 'error');
            } else {
                showToast("Hôtel supprimé avec succès.");
            }
        } catch (err) {
            showToast("Erreur lors de la suppression.", "error");
        } finally {
            setDeleting(false);
            setShowConfirm(false);
        }
    };

    return (
        <div className="glass p-6 rounded-3xl border border-emerald-500/10 shadow-sm hover:border-emerald-500/30 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors" />
            
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h3 className="font-black text-xl uppercase tracking-tight text-main line-clamp-1">{hotel.name}</h3>
                            <button 
                                onClick={() => setShowConfirm(true)}
                                className="p-2 text-dim hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                title="Supprimer l'hôtel"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 mt-1">{hotel.city}</p>
                    </div>
                    <div className="flex bg-amber-500/10 px-2 py-1 rounded-full items-center gap-1 border border-amber-500/20 shrink-0 ml-4">
                        <span className="text-amber-600 dark:text-amber-400 font-bold text-xs">{hotel.stars}</span>
                        <Star className="w-3 h-3 text-amber-500 fill-current" />
                    </div>
                </div>
                
                <div className="space-y-2 mt-6">
                    {[
                        { label: 'Double', qty: doubleQty },
                        { label: 'Triple', qty: tripleQty },
                        { label: 'Quadruple', qty: quadrupleQty }
                    ].map((type) => (
                        <div key={type.label} className="flex justify-between text-xs items-center p-2 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5">
                            <span className="font-bold text-dim uppercase tracking-widest text-[9px]">{type.label}</span>
                            <span className="font-black text-main bg-white dark:bg-black px-2 py-1 rounded-md shadow-sm">{type.qty}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal de Confirmation ultra-fine */}
            {showConfirm && (
                <div className="absolute inset-0 z-20 bg-main/90 backdrop-blur-md p-6 flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
                    <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-main mb-6">
                        Confirmer la suppression ?
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
                            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Supprimer"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function AlertCircle(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="12" />
            <line x1="12" x2="12.01" y1="16" y2="16" />
        </svg>
    )
}
