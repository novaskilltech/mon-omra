'use client';

import { useState, useEffect } from 'react';
import { Sparkles, X, Mail, Phone, User, MessageSquare, CheckCircle, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { getPublicActiveGroups, requestRegistration } from '@/lib/actions/concierge';

export default function PromoInquiryBanner() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [groups, setGroups] = useState<any[]>([]);
    const [airports, setAirports] = useState<string[]>([]);
    const [selectedAirport, setSelectedAirport] = useState('');
    const [filteredGroups, setFilteredGroups] = useState<any[]>([]);
    
    // Form States
    const [form, setForm] = useState({
        firstName: '',
        familyName: '',
        gender: 'M' as 'M' | 'F',
        email: '',
        phone: '',
        message: '',
        isFormerClient: false,
        wantsLoyaltyBenefits: false,
        desiredGroupId: ''
    });

    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadGroups() {
            try {
                const res = await getPublicActiveGroups();
                if (res.success && res.groups) {
                    const mapped = res.groups.map((g: any) => {
                        let airport = "AUTRE";
                        const lowerName = g.name.toLowerCase();
                        if (lowerName.includes("paris") || lowerName.includes("cdg") || lowerName.includes("ory")) {
                            airport = "PARIS";
                        } else if (lowerName.includes("lyon") || lowerName.includes("lys")) {
                            airport = "LYON";
                        } else if (lowerName.includes("marseille") || lowerName.includes("mrs")) {
                            airport = "MARSEILLE";
                        } else if (lowerName.includes("bruxelles") || lowerName.includes("bru") || lowerName.includes("brussels")) {
                            airport = "BRUXELLES";
                        } else if (lowerName.includes("nice") || lowerName.includes("nce")) {
                            airport = "NICE";
                        } else if (lowerName.includes("toulouse") || lowerName.includes("tls")) {
                            airport = "TOULOUSE";
                        } else if (lowerName.includes("nantes") || lowerName.includes("nte")) {
                            airport = "NANTES";
                        }
                        return { ...g, airport };
                    });
                    setGroups(mapped);

                    // Get unique airports
                    const uniqueAirports = Array.from(new Set(mapped.map((g: any) => g.airport))) as string[];
                    setAirports(uniqueAirports.filter(Boolean).sort());
                }
            } catch (err) {
                console.error("Error loading groups for banner modal:", err);
            }
        }
        loadGroups();
    }, []);

    // Filter groups when airport selection changes
    useEffect(() => {
        if (selectedAirport) {
            const filtered = groups
                .filter((g: any) => g.airport === selectedAirport)
                .sort((a: any, b: any) => new Date(a.departure_date).getTime() - new Date(b.departure_date).getTime());
            setFilteredGroups(filtered);
        } else {
            setFilteredGroups([]);
        }
    }, [selectedAirport, groups]);

    const handleOpenModal = () => {
        setSuccess(false);
        setError(null);
        setSelectedAirport('');
        setForm({
            firstName: '',
            familyName: '',
            gender: 'M',
            email: '',
            phone: '',
            message: "Je souhaite obtenir des renseignements pour une prochaine Omra.",
            isFormerClient: false,
            wantsLoyaltyBenefits: false,
            desiredGroupId: ''
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            const res = await requestRegistration({
                email: form.email,
                firstName: form.firstName,
                familyName: form.familyName,
                gender: form.gender,
                phone: form.phone,
                message: form.message,
                isFormerClient: form.isFormerClient,
                wantsLoyaltyBenefits: form.wantsLoyaltyBenefits,
                desiredGroupId: form.desiredGroupId || undefined
            });

            if (res.error) {
                setError(res.error);
            } else {
                setSuccess(true);
            }
        } catch (err: any) {
            setError(err.message || "Une erreur est survenue lors de l'envoi.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <div className="mt-10 animate-fade-in">
                <button 
                    onClick={handleOpenModal}
                    className="inline-flex items-center gap-2 text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#D8AA4D] hover:text-[#F2CE79] transition-all bg-[#D8AA4D]/10 px-6 py-3.5 rounded-2xl border border-[#D8AA4D]/25 hover:scale-102 hover:shadow-[0_0_20px_rgba(216,170,77,0.15)] cursor-pointer"
                >
                    ✨ Si vous êtes intéressé par une Omra, cliquez ici pour demander des renseignements
                </button>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-[#020302]/90 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                    <div className="glass w-full max-w-2xl rounded-[2.5rem] border border-emerald-500/15 overflow-hidden flex flex-col max-h-[90vh]">
                        <header className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-[#050a08]/30 shrink-0">
                            <div className="text-left">
                                <h3 className="text-lg font-black uppercase tracking-tighter text-main">
                                    Demande de Renseignement Omra
                                </h3>
                                <p className="text-[9px] font-black uppercase tracking-wider text-emerald-400 mt-1">
                                    Remplissez ce formulaire pour planifier votre voyage spirituel
                                </p>
                            </div>
                            <button 
                                onClick={() => setIsModalOpen(false)} 
                                className="p-2 hover:bg-white/10 rounded-xl transition-all"
                            >
                                <X className="w-5 h-5 text-dim hover:text-main" />
                            </button>
                        </header>

                        {success ? (
                            <div className="p-8 text-center space-y-6 overflow-y-auto">
                                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-xl font-black uppercase tracking-tighter text-main">Demande Envoyée !</h4>
                                    <p className="text-xs text-dim leading-relaxed max-w-md mx-auto">
                                        Merci pour votre intérêt. Notre équipe de conciergerie étudie votre demande et vous recontactera très rapidement pour concevoir votre séjour.
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-full max-w-xs mx-auto bg-emerald-500 hover:bg-emerald-400 text-[#050605] py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center cursor-pointer"
                                >
                                    Fermer
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="p-8 space-y-4 overflow-y-auto text-left">
                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex gap-3 items-center text-xs text-red-400 animate-in fade-in">
                                        <AlertCircle className="w-5 h-5 shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-wider text-dim ml-1">Aéroport / Ville de départ</label>
                                        <select
                                            required
                                            value={selectedAirport}
                                            onChange={(e) => {
                                                setSelectedAirport(e.target.value);
                                                setForm({ ...form, desiredGroupId: '' });
                                            }}
                                            className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs focus:border-emerald-500/40 outline-none text-main"
                                        >
                                            <option value="" className="bg-[#0c120f] text-dim">-- Choisir un aéroport --</option>
                                            {airports.map((ap) => (
                                                <option key={ap} value={ap} className="bg-[#0c120f] text-main">{ap}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-wider text-dim ml-1">Dates disponibles (chronologique)</label>
                                        <select
                                            disabled={!selectedAirport}
                                            value={form.desiredGroupId}
                                            onChange={(e) => setForm({ ...form, desiredGroupId: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs focus:border-emerald-500/40 outline-none text-main disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <option value="" className="bg-[#0c120f] text-dim">-- Choisir une date --</option>
                                            {filteredGroups.map((grp) => (
                                                <option key={grp.id} value={grp.id} className="bg-[#0c120f] text-main">
                                                    {new Date(grp.departure_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} - {grp.name} {grp.price ? `(${Number(grp.price).toLocaleString('fr-FR')} €)` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-wider text-dim ml-1">Prénom</label>
                                        <input
                                            required
                                            type="text"
                                            value={form.firstName}
                                            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                                            placeholder="Karim"
                                            className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs focus:border-emerald-500/40 outline-none text-main"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-wider text-dim ml-1">Nom de famille</label>
                                        <input
                                            required
                                            type="text"
                                            value={form.familyName}
                                            onChange={(e) => setForm({ ...form, familyName: e.target.value })}
                                            placeholder="El-Amrani"
                                            className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs focus:border-emerald-500/40 outline-none text-main"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase tracking-wider text-dim ml-1">Genre</label>
                                    <div className="flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setForm({ ...form, gender: 'M' })}
                                            className={`flex-1 py-3.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border ${form.gender === 'M' ? 'bg-emerald-500 border-emerald-500 text-[#050605]' : 'border-white/10 text-dim'}`}
                                        >
                                            Homme
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setForm({ ...form, gender: 'F' })}
                                            className={`flex-1 py-3.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border ${form.gender === 'F' ? 'bg-emerald-500 border-emerald-500 text-[#050605]' : 'border-white/10 text-dim'}`}
                                        >
                                            Femme
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-wider text-dim ml-1">Adresse E-mail</label>
                                        <input
                                            required
                                            type="email"
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            placeholder="votre.email@domaine.com"
                                            className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs focus:border-emerald-500/40 outline-none text-main"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-wider text-dim ml-1">Numéro de téléphone</label>
                                        <input
                                            required
                                            type="tel"
                                            value={form.phone}
                                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                            placeholder="+33 6 12 34 56 78"
                                            className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs focus:border-emerald-500/40 outline-none text-main"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase tracking-wider text-dim ml-1">Détaillez votre projet (facultatif)</label>
                                    <textarea
                                        rows={3}
                                        value={form.message}
                                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                                        placeholder="Indiquez le nombre de personnes, des demandes de chambre..."
                                        className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs focus:border-emerald-500/40 outline-none text-main resize-none"
                                    />
                                </div>

                                <div className="flex flex-col gap-2 pt-2">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={form.isFormerClient}
                                            onChange={(e) => setForm({ ...form, isFormerClient: e.target.checked })}
                                            className="w-4 h-4 rounded border-white/10 bg-white/5 accent-emerald-500 text-black cursor-pointer"
                                        />
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-dim group-hover:text-main transition-colors">Je suis un ancien client de l'agence</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={form.wantsLoyaltyBenefits}
                                            onChange={(e) => setForm({ ...form, wantsLoyaltyBenefits: e.target.checked })}
                                            className="w-4 h-4 rounded border-white/10 bg-white/5 accent-emerald-500 text-black cursor-pointer"
                                        />
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-dim group-hover:text-main transition-colors">Je souhaite bénéficier des avantages fidélité</span>
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-[#050605] py-4.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all mt-4 flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    {submitting ? (
                                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                                    ) : (
                                        <>Envoyer ma demande <ArrowRight className="w-4 h-4" /></>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
