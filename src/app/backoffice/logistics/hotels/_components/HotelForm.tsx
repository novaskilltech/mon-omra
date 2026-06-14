'use client';

import { useState } from 'react';
import { Hotel, Plus, Trash2, Save, Star } from 'lucide-react';

export default function HotelForm({ agencyId }: { agencyId: string }) {
    const [rooms, setRooms] = useState([
        { type: 'DOUBLE', quantity: 0 },
        { type: 'TRIPLE', quantity: 0 },
        { type: 'QUADRUPLE', quantity: 0 },
    ]);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRoomChange = (idx: number, qty: string) => {
        const newRooms = [...rooms];
        newRooms[idx].quantity = Math.max(0, parseInt(qty) || 0);
        setRooms(newRooms);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(false);

        const formData = new FormData(e.currentTarget);
        // Append quantities to formData
        rooms.forEach(r => formData.append(`${r.type}_qty`, r.quantity.toString()));

        try {
            const { createHotel } = await import('@/lib/actions/logistics');
            const result = await createHotel(formData);

            if (result.error) {
                setError(result.error);
            } else {
                setSuccess(true);
                // Reset form
                e.currentTarget.reset();
                setRooms([
                    { type: 'DOUBLE', quantity: 0 },
                    { type: 'TRIPLE', quantity: 0 },
                    { type: 'QUADRUPLE', quantity: 0 },
                ]);
                setTimeout(() => setSuccess(false), 3000);
            }
        } catch (err) {
            setError("Erreur inattendue");
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Info Base */}
                <div className="space-y-6">
                    <h3 className="text-xl font-black flex items-center gap-3 text-main uppercase tracking-tighter">
                        <Hotel className="w-5 h-5 text-emerald-500" /> Informations Générales
                    </h3>
                    <div className="space-y-4">
                        <input name="name" required type="text" placeholder="Nom de l'hôtel" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-emerald-500 transition-all text-main placeholder:text-dim" />
                        <div className="grid grid-cols-2 gap-4">
                            <select name="city" className="bg-[#0b0f0d] border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-emerald-500 transition-all text-sub appearance-none font-medium">
                                <option value="MAKKAH" className="bg-[#050605] text-main">Makkah</option>
                                <option value="MADINAH" className="bg-[#050605] text-main">Madinah</option>
                                <option value="JEDDAH" className="bg-[#050605] text-main">Jeddah</option>
                            </select>
                            <select name="stars" className="bg-[#0b0f0d] border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-emerald-500 transition-all text-amber-500 font-medium">
                                <option value="5" className="bg-[#050605] text-main">⭐⭐⭐⭐⭐ (5)</option>
                                <option value="4" className="bg-[#050605] text-main">⭐⭐⭐⭐ (4)</option>
                                <option value="3" className="bg-[#050605] text-main">⭐⭐⭐ (3)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Quotas Chambres */}
                <div className="space-y-6">
                    <h3 className="text-xl font-black flex items-center gap-3 text-main uppercase tracking-tighter">
                        <Plus className="w-5 h-5 text-amber-500" /> Quotas de Chambres
                    </h3>
                    <div className="space-y-3">
                        {rooms.map((room, idx) => (
                            <div key={idx} className="flex items-center justify-between p-5 bg-emerald-500/5 dark:bg-white/5 border border-emerald-500/10 dark:border-white/10 rounded-[1.8rem] shadow-sm group hover:border-emerald-500/20 transition-all">
                                <span className="font-black text-xs uppercase tracking-widest text-main">{room.type}</span>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="number"
                                        min="0"
                                        value={room.quantity === 0 ? '' : room.quantity}
                                        onChange={(e) => handleRoomChange(idx, e.target.value)}
                                        placeholder="Qté"
                                        className="w-20 bg-white/10 border-none rounded-xl px-3 py-3 text-center text-sm outline-none font-black text-main placeholder:text-dim"
                                    />
                                    <span className="text-dim text-[9px] uppercase font-black tracking-widest opacity-60">Chambres</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {error && <p className="text-red-500 text-sm font-bold text-center">{error}</p>}
            {success && <p className="text-emerald-500 text-sm font-bold text-center">Hôtel ajouté avec succès !</p>}

            <div className="pt-8 border-t border-emerald-500/10 dark:border-white/5">
                <button type="submit" disabled={saving} className="btn-premium w-full py-6 flex items-center justify-center gap-3 shadow-lg hover:shadow-emerald-500/20 disabled:opacity-50">
                    <Save className="w-6 h-6" /> {saving ? 'Ajout en cours...' : "Enregistrer l'Hôtel dans l'Annuaire"}
                </button>
            </div>
        </form>
    );
}
