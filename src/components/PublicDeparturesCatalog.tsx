'use client';

import { useState, useEffect } from 'react';
import { Calendar, Users, ArrowRight, X, User, Mail, Phone, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import { getPublicActiveGroups, requestRegistration } from '@/lib/actions/concierge';

export default function PublicDeparturesCatalog() {
    const [groups, setGroups] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Modal & Form State
    const [selectedGroup, setSelectedGroup] = useState<any | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        firstName: '',
        familyName: '',
        gender: 'M' as 'M' | 'F',
        email: '',
        phone: '',
        message: '',
        isFormerClient: false,
        wantsLoyaltyBenefits: false
    });

    useEffect(() => {
        const loadDepartures = async () => {
            try {
                const res = await getPublicActiveGroups();
                if (res.success && res.groups) {
                    setGroups(res.groups);
                }
            } catch (err) {
                console.error("Error loading departures:", err);
            } finally {
                setLoading(false);
            }
        };
        loadDepartures();
    }, []);

    const openInquiryModal = (group: any) => {
        setSelectedGroup(group);
        setSuccess(false);
        setError(null);
        setForm({
            firstName: '',
            familyName: '',
            gender: 'M',
            email: '',
            phone: '',
            message: `Intéressé par le départ : ${group.name}`,
            isFormerClient: false,
            wantsLoyaltyBenefits: false
        });
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
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
                desiredGroupId: selectedGroup?.id
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

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (groups.length === 0) {
        return null; // Don't render anything if no active departures
    }

    return (
        <section id="departures" className="relative z-10 py-16 px-6 max-w-7xl mx-auto">
            <div className="glass p-8 md:p-16 rounded-[3.5rem] border-emerald-500/10 bg-[#050605]/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
                
                <div className="max-w-3xl mx-auto text-center space-y-6 mb-12">
                    <span className="bg-[#D8AA4D]/15 text-[#F2CE79] border border-[#D8AA4D]/25 text-[9px] font-black uppercase px-3 py-1 rounded-md tracking-wider inline-block">
                        Départs Prochains
                    </span>
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-main leading-tight">
                        Si vous êtes intéressé par une Omra prochainement, <span className="text-[#D8AA4D]">cliquez ci-dessous</span>
                    </h2>
                    <p className="text-sub text-xs md:text-sm leading-relaxed max-w-2xl mx-auto font-medium opacity-80">
                        Sélectionnez la formule et la date de départ de votre choix parmi nos séjours planifiés pour ouvrir instantanément votre demande de renseignement personnalisée.
                    </p>
                </div>

                {/* Grid list of departures */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groups.map((grp) => (
                        <div 
                            key={grp.id} 
                            onClick={() => openInquiryModal(grp)}
                            className="glass p-6 rounded-[2.5rem] border-white/5 hover:border-emerald-500/25 hover:bg-white/[0.03] transition-all cursor-pointer group flex flex-col justify-between min-h-[220px]"
                        >
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                                        grp.status === 'Complet' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/15' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15'
                                    }`}>
                                        {grp.status}
                                    </span>
                                </div>
                                <h3 className="text-base font-black uppercase tracking-tight text-main group-hover:text-[#D8AA4D] transition-colors">{grp.name}</h3>
                                <p className="text-[11px] text-dim font-bold mt-1.5 uppercase tracking-wide">
                                    Départ le {new Date(grp.departure_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                            
                            <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                                <div>
                                    <p className="text-[8px] text-dim uppercase tracking-widest font-black">Tarif Package</p>
                                    <p className="text-base font-black text-emerald-500 mt-0.5">
                                        {grp.price ? `${Number(grp.price).toLocaleString('fr-FR')} €` : 'Sur demande'}
                                    </p>
                                </div>
                                <button className="p-2.5 bg-emerald-500 text-white rounded-xl group-hover:scale-105 transition-all shadow-[0_4px_15px_rgba(16,185,129,0.2)]">
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Inquiries / Register Dialog Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-[#020302]/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                    <div className="glass w-full max-w-lg rounded-[2.5rem] border border-emerald-500/15 overflow-hidden flex flex-col max-h-[90vh]">
                        <header className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-[#050a08]/30 shrink-0">
                            <div className="text-left">
                                <h3 className="text-base font-black uppercase tracking-tighter text-main">
                                    Demande de Renseignement
                                </h3>
                                <p className="text-[9px] font-black uppercase tracking-wider text-[#D8AA4D] mt-1">
                                    Pour : {selectedGroup?.name}
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
                                <div>
                                    <h4 className="text-lg font-black uppercase tracking-tighter text-main mb-2">Demande Reçue !</h4>
                                    <p className="text-xs text-dim leading-relaxed max-w-sm mx-auto">
                                        Votre demande concernant le départ <strong>{selectedGroup?.name}</strong> a bien été enregistrée. Notre équipe de conciergerie prendra contact avec vous dans les plus brefs délais.
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#050605] py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all"
                                >
                                    Fermer
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleFormSubmit} className="p-8 space-y-4 overflow-y-auto">
                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex gap-3 items-center text-xs text-red-400 animate-in fade-in">
                                        <AlertCircle className="w-5 h-5 shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
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
                                        <label className="text-[9px] font-black uppercase tracking-wider text-dim ml-1">Nom</label>
                                        <input
                                            required
                                            type="text"
                                            value={form.familyName}
                                            onChange={(e) => setForm({ ...form, familyName: e.target.value })}
                                            placeholder="Dupont"
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
                                            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border ${form.gender === 'M' ? 'bg-emerald-500 border-emerald-500 text-[#050605]' : 'border-white/10 text-dim'}`}
                                        >
                                            Homme
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setForm({ ...form, gender: 'F' })}
                                            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border ${form.gender === 'F' ? 'bg-emerald-500 border-emerald-500 text-[#050605]' : 'border-white/10 text-dim'}`}
                                        >
                                            Femme
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase tracking-wider text-dim ml-1">Adresse E-mail</label>
                                    <input
                                        required
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        placeholder="exemple@site.com"
                                        className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs focus:border-emerald-500/40 outline-none text-main"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase tracking-wider text-dim ml-1">Téléphone</label>
                                    <input
                                        required
                                        type="tel"
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        placeholder="+33 6 12 34 56 78"
                                        className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs focus:border-emerald-500/40 outline-none text-main"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase tracking-wider text-dim ml-1">Votre message / Projet</label>
                                    <textarea
                                        required
                                        rows={3}
                                        value={form.message}
                                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                                        placeholder="Précisez votre demande..."
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
                                    className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-[#050605] py-4.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all mt-4 flex items-center justify-center gap-2"
                                >
                                    {submitting ? (
                                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>Envoyer la demande <ArrowRight className="w-4 h-4" /></>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}
