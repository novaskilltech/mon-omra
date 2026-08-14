'use client';

import { useState } from 'react';
import { Compass, Users, MapPin, Calendar, Mail, Phone, User, CheckCircle, AlertCircle, ArrowRight, Loader2, Globe, Home } from 'lucide-react';
import { createHajjRequestAction } from '@/lib/actions/hajj';

export default function HajjInquirySection() {
    const [form, setForm] = useState({
        firstName: '',
        familyName: '',
        nationality: '',
        phone: '',
        email: '',
        address: '',
        peopleCount: 1,
        hajjYear: 2027
    });

    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            const res = await createHajjRequestAction({
                firstName: form.firstName,
                familyName: form.familyName,
                nationality: form.nationality,
                phone: form.phone,
                email: form.email,
                address: form.address,
                peopleCount: Number(form.peopleCount),
                hajjYear: Number(form.hajjYear)
            });

            if (res.error) {
                setError(res.error);
            } else {
                setSuccess(true);
            }
        } catch (err: any) {
            setError(err.message || "Une erreur est survenue lors de l'enregistrement de votre demande.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section id="hajj" className="relative z-10 py-20 px-6 max-w-7xl mx-auto">
            <div className="glass p-8 md:p-16 rounded-[3.5rem] border-amber-500/20 bg-gradient-to-b from-[#0a0f0d] via-[#050807] to-[#020403] relative overflow-hidden shadow-[0_0_100px_rgba(216,170,77,0.08)]">
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-500/10 blur-[140px] rounded-full pointer-events-none" />

                <div className="max-w-3xl mx-auto text-center space-y-6 mb-14">
                    <div className="inline-flex items-center gap-2 bg-[#D8AA4D]/15 text-[#F2CE79] border border-[#D8AA4D]/30 text-[10px] font-black uppercase px-4 py-1.5 rounded-full tracking-[0.2em]">
                        <Compass className="w-3.5 h-3.5" />
                        Voyage d'une Vie — Le Grand Pèlerinage
                    </div>

                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-main leading-tight">
                        Pré-Inscription & Demande <span className="text-[#D8AA4D]">HAJJ</span>
                    </h2>

                    <p className="text-sub text-xs md:text-sm leading-relaxed max-w-2xl mx-auto font-medium opacity-80">
                        Anticipez votre départ pour le Hajj. Remplissez ce formulaire d'intention pour être accompagné en priorité par nos experts concierges dès l'ouverture des quotas officiels.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto bg-black/40 border border-amber-500/15 p-6 md:p-12 rounded-[2.5rem] backdrop-blur-xl relative">
                    {success ? (
                        <div className="py-12 text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
                            <div className="w-20 h-20 bg-amber-500/15 rounded-full flex items-center justify-center mx-auto border border-amber-500/30 text-[#D8AA4D]">
                                <CheckCircle className="w-10 h-10" />
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-2xl font-black uppercase tracking-tighter text-main">
                                    Demande Hajj {form.hajjYear} Enregistrée !
                                </h3>
                                <p className="text-xs md:text-sm text-dim leading-relaxed max-w-lg mx-auto font-medium">
                                    Qu'Allah bénisse votre noble intention. Votre dossier de pré-inscription pour <strong>{form.peopleCount} personne(s)</strong> a bien été reçu. Notre équipe conciergerie prendra contact avec vous rapidement à l'adresse <strong>{form.email}</strong>.
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setSuccess(false);
                                    setForm({
                                        firstName: '',
                                        familyName: '',
                                        nationality: '',
                                        phone: '',
                                        email: '',
                                        address: '',
                                        peopleCount: 1,
                                        hajjYear: 2027
                                    });
                                }}
                                className="bg-[#D8AA4D] hover:bg-[#F2CE79] text-[#050605] px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-[0_0_30px_rgba(216,170,77,0.3)] cursor-pointer"
                            >
                                Soumettre une autre demande
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6 text-left">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex gap-3 items-center text-xs text-red-400 animate-in fade-in">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Section 1 : Informations personnelles */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-wider text-[#D8AA4D] flex items-center gap-2">
                                    <User className="w-4 h-4" /> 1. Identité du Demandeur
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-dim ml-1">Prénom</label>
                                        <input
                                            required
                                            type="text"
                                            value={form.firstName}
                                            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                                            placeholder="Mohamed"
                                            className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs focus:border-[#D8AA4D]/50 outline-none text-main transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-dim ml-1">Nom de famille</label>
                                        <input
                                            required
                                            type="text"
                                            value={form.familyName}
                                            onChange={(e) => setForm({ ...form, familyName: e.target.value })}
                                            placeholder="Benali"
                                            className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs focus:border-[#D8AA4D]/50 outline-none text-main transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-dim ml-1 flex items-center gap-1.5">
                                            <Globe className="w-3 h-3 text-[#D8AA4D]" /> Nationalité (Passeport)
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            value={form.nationality}
                                            onChange={(e) => setForm({ ...form, nationality: e.target.value })}
                                            placeholder="Française, Algérienne, Marocaine..."
                                            className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs focus:border-[#D8AA4D]/50 outline-none text-main transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-dim ml-1 flex items-center gap-1.5">
                                            <Phone className="w-3 h-3 text-[#D8AA4D]" /> Téléphone / WhatsApp
                                        </label>
                                        <input
                                            required
                                            type="tel"
                                            value={form.phone}
                                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                            placeholder="+33 6 12 34 56 78"
                                            className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs focus:border-[#D8AA4D]/50 outline-none text-main transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-dim ml-1 flex items-center gap-1.5">
                                            <Mail className="w-3 h-3 text-[#D8AA4D]" /> Adresse E-mail
                                        </label>
                                        <input
                                            required
                                            type="email"
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            placeholder="votre.email@domaine.com"
                                            className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs focus:border-[#D8AA4D]/50 outline-none text-main transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-dim ml-1 flex items-center gap-1.5">
                                            <Home className="w-3 h-3 text-[#D8AA4D]" /> Adresse Physique Postale
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            value={form.address}
                                            onChange={(e) => setForm({ ...form, address: e.target.value })}
                                            placeholder="12 Avenue des Champs-Élysées, 75008 Paris"
                                            className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs focus:border-[#D8AA4D]/50 outline-none text-main transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2 : Détails du Hajj */}
                            <div className="space-y-4 pt-4 border-t border-white/5">
                                <h3 className="text-xs font-black uppercase tracking-wider text-[#D8AA4D] flex items-center gap-2">
                                    <Calendar className="w-4 h-4" /> 2. Projet & Nombre de Pèlerins
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-dim ml-1">
                                            Année du Hajj Souhaitée
                                        </label>
                                        <select
                                            required
                                            value={form.hajjYear}
                                            onChange={(e) => setForm({ ...form, hajjYear: Number(e.target.value) })}
                                            className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs focus:border-[#D8AA4D]/50 outline-none text-main transition-all"
                                        >
                                            <option value={2027} className="bg-[#0b0e0c] text-main">Hajj 2027 (1448 H)</option>
                                            <option value={2028} className="bg-[#0b0e0c] text-main">Hajj 2028 (1449 H)</option>
                                            <option value={2029} className="bg-[#0b0e0c] text-main">Hajj 2029 (1450 H)</option>
                                            <option value={2030} className="bg-[#0b0e0c] text-main">Hajj 2030 (1451 H+)</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-dim ml-1 flex items-center gap-1.5">
                                            <Users className="w-3 h-3 text-[#D8AA4D]" /> Hajj pour combien de personnes ?
                                        </label>
                                        <select
                                            required
                                            value={form.peopleCount}
                                            onChange={(e) => setForm({ ...form, peopleCount: Number(e.target.value) })}
                                            className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs focus:border-[#D8AA4D]/50 outline-none text-main transition-all"
                                        >
                                            <option value={1} className="bg-[#0b0e0c] text-main">1 Personne (Seul)</option>
                                            <option value={2} className="bg-[#0b0e0c] text-main">2 Personnes (Couple / Binôme)</option>
                                            <option value={3} className="bg-[#0b0e0c] text-main">3 Personnes (Famille)</option>
                                            <option value={4} className="bg-[#0b0e0c] text-main">4 Personnes (Famille)</option>
                                            <option value={5} className="bg-[#0b0e0c] text-main">5 Personnes et plus (Groupe familial)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-[#D8AA4D] hover:bg-[#F2CE79] disabled:opacity-50 text-[#050605] py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all mt-6 flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(216,170,77,0.25)] hover:shadow-[0_0_40px_rgba(216,170,77,0.4)] cursor-pointer"
                            >
                                {submitting ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                                ) : (
                                    <>Transmettre ma pré-inscription Hajj <ArrowRight className="w-4 h-4" /></>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
}
