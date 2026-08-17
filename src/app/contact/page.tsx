'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, MapPin, Send, CheckCircle, Loader2 } from 'lucide-react';
import ThemeSelector from '@/components/ThemeSelector';
import { requestRegistration } from '@/lib/actions/concierge';

export default function ContactPage() {
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        subject: 'General',
        message: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            const res = await requestRegistration({
                firstName: form.name,
                familyName: '',
                email: form.email,
                phone: form.phone,
                message: `[Formulaire Contact - Sujet: ${form.subject}] ${form.message}`,
                gender: 'M'
            });
            if (res.error) {
                setError(res.error);
            } else {
                setSuccess(true);
            }
        } catch (err: any) {
            setError(err.message || "Une erreur est survenue.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen text-main bg-main selection:bg-emerald-500/30 font-inter pb-20 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[40%] bg-emerald-500/5 blur-[140px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[40%] bg-amber-500/5 blur-[140px] rounded-full pointer-events-none" />

            <div className="fixed bottom-6 right-6 z-50">
                <ThemeSelector />
            </div>

            <div className="max-w-6xl mx-auto px-6 pt-10 text-left">
                {/* Back Button */}
                <Link 
                    href="/" 
                    className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-dim hover:text-emerald-400 transition-colors mb-8 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Retour à l'accueil
                </Link>

                {/* Header */}
                <header className="space-y-4 mb-16 max-w-2xl">
                    <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase px-4 py-1.5 rounded-full tracking-[0.2em]">
                        <Mail className="w-3.5 h-3.5" />
                        Support & Relations
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter leading-none">
                        Contactez-<span className="text-emerald-500">nous</span>
                    </h1>
                    <p className="text-sm text-dim leading-relaxed font-medium">
                        Une question sur nos séjours ? Besoin d'assistance administrative ? Vous êtes un professionnel intéressé par notre solution SaaS ? Notre équipe vous répond sous 24h.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    {/* Contact Details */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-8">
                            <div className="flex gap-4 items-start">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-black text-main text-xs uppercase tracking-wider">Téléphone</h4>
                                    <p className="text-sm font-black text-main mt-1">+33 7 52 28 08 90</p>
                                    <p className="text-[10px] text-dim mt-0.5">Lun-Ven, 9h à 18h (Paris)</p>
                                </div>
                            </div>

                            <div className="flex gap-4 items-start">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-black text-main text-xs uppercase tracking-wider">Adresse e-mail</h4>
                                    <p className="text-sm font-black text-main mt-1">contact@omrayanair.com</p>
                                    <p className="text-[10px] text-dim mt-0.5">Pour toute demande de renseignements</p>
                                </div>
                            </div>

                            <div className="flex gap-4 items-start">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-black text-main text-xs uppercase tracking-wider">Siège Social</h4>
                                    <p className="text-sm font-black text-main mt-1">OMRAYANAIR Ltd.</p>
                                    <p className="text-[10px] text-dim mt-0.5">85 Great Portland Street, Londres, Royaume-Uni</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-7">
                        <div className="glass p-8 sm:p-10 rounded-[2.5rem] border border-white/5">
                            {success ? (
                                <div className="text-center py-12 space-y-4">
                                    <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
                                    <h3 className="text-lg font-black uppercase text-main">Message Envoyé !</h3>
                                    <p className="text-xs text-dim max-w-sm mx-auto">Votre demande de contact a été enregistrée avec succès. Nos services reviendront vers vous très prochainement.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {error && (
                                        <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-2xl text-xs text-red-400 font-medium">
                                            {error}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black uppercase tracking-wider text-dim ml-1">Nom & Prénom</label>
                                            <input
                                                required
                                                type="text"
                                                value={form.name}
                                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                                placeholder="Votre nom"
                                                className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs focus:border-emerald-500/40 outline-none text-main"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black uppercase tracking-wider text-dim ml-1">Numéro de Téléphone</label>
                                            <input
                                                required
                                                type="tel"
                                                value={form.phone}
                                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                                placeholder="+33 6 00 00 00 00"
                                                className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs focus:border-emerald-500/40 outline-none text-main"
                                            />
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
                                                placeholder="votre@email.com"
                                                className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs focus:border-emerald-500/40 outline-none text-main"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black uppercase tracking-wider text-dim ml-1">Sujet de votre demande</label>
                                            <select
                                                value={form.subject}
                                                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs focus:border-emerald-500/40 outline-none text-main appearance-none"
                                            >
                                                <option value="General" className="bg-[#050605] text-main">Renseignements généraux</option>
                                                <option value="Agency" className="bg-[#050605] text-main">Je suis une Agence (SaaS / Licence)</option>
                                                <option value="Partnership" className="bg-[#050605] text-main">Partenariat sur place (Arabie)</option>
                                                <option value="Support" className="bg-[#050605] text-main">Assistance technique</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-wider text-dim ml-1">Votre message</label>
                                        <textarea
                                            required
                                            value={form.message}
                                            onChange={(e) => setForm({ ...form, message: e.target.value })}
                                            placeholder="Comment pouvons-nous vous aider ?"
                                            className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs focus:border-emerald-500/40 outline-none text-main h-32 resize-none"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        {submitting ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <>Envoyer le message <Send className="w-4 h-4" /></>}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
