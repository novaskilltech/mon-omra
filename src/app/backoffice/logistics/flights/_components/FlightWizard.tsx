'use client';

import { useState } from 'react';
import { Plane, Plus, Trash2, Save, Loader2, CheckCircle2, Upload } from 'lucide-react';
import { createFlight } from '@/lib/actions/logistics';
import { extractFlightTicketOCR } from '@/lib/actions/concierge';
import { FlightSegment } from '@/types/logistics';

export default function FlightWizard({ agencyId }: { agencyId: string }) {
    const [loading, setLoading] = useState(false);
    const [ocrLoading, setOcrLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [type, setType] = useState<'ALLER' | 'RETOUR'>('ALLER');

    const [segments, setSegments] = useState<Partial<FlightSegment>[]>([
        { flight_number: '', airline: '', departure_airport: '', arrival_airport: '', departure_time: '', arrival_time: '' }
    ]);

    const addSegment = () => {
        setSegments([...segments, { flight_number: '', airline: '', departure_airport: '', arrival_airport: '', departure_time: '', arrival_time: '' }]);
    };

    const removeSegment = (index: number) => {
        setSegments(segments.filter((_, i) => i !== index));
    };

    const handleOcrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        try {
            setOcrLoading(true);
            const formData = new FormData();
            formData.append('ticket', file);
            
            const res = await extractFlightTicketOCR(formData);
            if (res.success && res.data) {
                const parsed = res.data;
                if (parsed.segments && Array.isArray(parsed.segments) && parsed.segments.length > 0) {
                    setSegments(parsed.segments.map((s: any) => ({
                        flight_number: s.flight_number || '',
                        airline: s.airline || '',
                        departure_airport: s.departure_airport || '',
                        arrival_airport: s.arrival_airport || '',
                        departure_time: s.departure_time ? s.departure_time.substring(0, 16) : '',
                        arrival_time: s.arrival_time ? s.arrival_time.substring(0, 16) : ''
                    })));
                } else {
                    const newSegment = {
                        flight_number: parsed.flight_number || '',
                        airline: parsed.airline || '',
                        departure_airport: parsed.departure_airport || '',
                        arrival_airport: parsed.arrival_airport || '',
                        departure_time: parsed.departure_time ? parsed.departure_time.substring(0, 16) : '',
                        arrival_time: parsed.arrival_time ? parsed.arrival_time.substring(0, 16) : ''
                    };
                    setSegments([newSegment]);
                }
                alert("Billet d'avion analysé et importé avec succès !");
            } else {
                alert(res.error || "Impossible d'analyser le billet.");
            }
        } catch (err) {
            console.error(err);
            alert("Erreur lors de l'analyse du document.");
        } finally {
            setOcrLoading(false);
        }
    };

    const updateSegment = (index: number, field: keyof FlightSegment, value: string) => {
        const newSegments = [...segments];
        newSegments[index] = { ...newSegments[index], [field]: value };
        setSegments(newSegments);
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const flightData = {
                agency_id: agencyId,
                type,
                segments: segments as FlightSegment[]
            };

            await createFlight(flightData);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error(err);
            alert("Erreur lors de la création du vol. Vérifiez les formats de dates (UTC).");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-main flex items-center gap-4">
                        <Plane className="text-emerald-500 w-8 h-8" /> Gestion des Vols
                    </h2>
                    <div className="flex flex-wrap gap-4 mt-6 items-center">
                        <div className="flex gap-2 p-1 bg-emerald-500/5 dark:bg-white/5 rounded-2xl border border-emerald-500/10 dark:border-white/10 w-fit">
                            {['ALLER', 'RETOUR'].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setType(t as any)}
                                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${type === t
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                        : 'text-dim hover:text-main'
                                        }`}
                                >
                                    {t === 'ALLER' ? '✈️ Aller' : '🏢 Retour'}
                                </button>
                            ))}
                        </div>
                        
                        <label className="flex items-center gap-2 px-5 py-3.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-400 cursor-pointer transition-all">
                            {ocrLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                            <span>{ocrLoading ? "Analyse..." : "Assistant OCR (PDF/Capture)"}</span>
                            <input 
                                type="file" 
                                accept="application/pdf,image/*" 
                                onChange={handleOcrUpload} 
                                className="hidden" 
                                disabled={ocrLoading}
                            />
                        </label>
                    </div>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="btn-premium py-4 px-10 flex items-center gap-3 disabled:opacity-50 shadow-xl shadow-emerald-500/10"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (success ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5" />)}
                    <span className="uppercase tracking-widest text-[10px] font-black">{success ? "Enregistré !" : "Sauvegarder"}</span>
                </button>
            </div>

            <div className="space-y-6">
                {segments.map((segment, index) => (
                    <div key={index} className="glass p-6 md:p-8 rounded-[2.5rem] relative border-l-8 border-emerald-500/30 dark:border-emerald-500/20 shadow-sm group">
                        <div className="absolute -left-4 top-1/2 -translate-y-1/2 bg-white dark:bg-[#050a08] p-1.5 rounded-full border-2 border-emerald-500 text-emerald-600 dark:text-emerald-500 text-[10px] font-black w-8 h-8 flex items-center justify-center shadow-lg z-10 group-hover:scale-110 transition-transform">
                            {index + 1}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-500 block mb-2 ml-1">Vol</label>
                                <input
                                    type="text"
                                    value={segment.flight_number}
                                    onChange={(e) => updateSegment(index, 'flight_number', e.target.value)}
                                    placeholder="ex: TK1822"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-black text-main outline-none focus:border-emerald-500 transition-all shadow-inner"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-500 block mb-2 ml-1">Compagnie</label>
                                <input
                                    type="text"
                                    value={segment.airline}
                                    onChange={(e) => updateSegment(index, 'airline', e.target.value)}
                                    placeholder="Turkish Airlines"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-black text-main outline-none focus:border-emerald-500 transition-all shadow-inner"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-500 block mb-2 ml-1">De (IATA)</label>
                                <input
                                    type="text"
                                    maxLength={3}
                                    value={segment.departure_airport}
                                    onChange={(e) => updateSegment(index, 'departure_airport', e.target.value.toUpperCase())}
                                    placeholder="CDG"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-black text-main outline-none focus:border-emerald-500 transition-all shadow-inner"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-500 block mb-2 ml-1">À (IATA)</label>
                                <input
                                    type="text"
                                    maxLength={3}
                                    value={segment.arrival_airport}
                                    onChange={(e) => updateSegment(index, 'arrival_airport', e.target.value.toUpperCase())}
                                    placeholder="JED"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-black text-main outline-none focus:border-emerald-500 transition-all shadow-inner"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-500 block mb-2 ml-1">Départ</label>
                                <input
                                    type="datetime-local"
                                    value={segment.departure_time}
                                    onChange={(e) => updateSegment(index, 'departure_time', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-[11px] font-black text-main outline-none focus:border-emerald-500 transition-all shadow-inner [color-scheme:dark]"
                                />
                            </div>
                            <div className="flex items-end gap-3">
                                <div className="flex-1">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-500 block mb-2 ml-1">Arrivée</label>
                                    <input
                                        type="datetime-local"
                                        value={segment.arrival_time}
                                        onChange={(e) => updateSegment(index, 'arrival_time', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-[11px] font-black text-main outline-none focus:border-emerald-500 transition-all shadow-inner [color-scheme:dark]"
                                    />
                                </div>
                                {segments.length > 1 && (
                                    <button
                                        onClick={() => removeSegment(index)}
                                        className="p-3 mb-0.5 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20"
                                    >
                                        <Trash2 className="w-6 h-6" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={addSegment}
                className="w-full py-6 rounded-[2.5rem] border-2 border-dashed border-emerald-500/20 dark:border-white/10 hover:border-emerald-500 hover:bg-emerald-500/[0.02] text-dim hover:text-emerald-500 transition-all flex flex-col items-center justify-center gap-2 group mb-8"
            >
                <Plus className="w-8 h-8 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Ajouter une escale / étape</span>
            </button>
        </div>
    );
}
