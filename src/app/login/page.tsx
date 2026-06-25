'use client';

import { useState } from 'react';
import { Mail, ArrowRight, ShieldCheck, AlertCircle, CheckCircle, Lock, Users, User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { sendOtpToPilgrim, verifyPilgrimOtp, loginAdmin } from '@/lib/actions/auth';
import { requestRegistration } from '@/lib/actions/concierge';

export default function LoginPage() {
    const [role, setRole] = useState<'pilgrim' | 'agency'>('pilgrim');
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
    
    // Pilgrim Login State
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'email' | 'otp'>('email');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Agency Login State
    const [adminPassword, setAdminPassword] = useState('');

    // Register Request State
    const [regForm, setRegForm] = useState({
        email: '',
        firstName: '',
        familyName: '',
        gender: 'M' as 'M' | 'F',
        phone: ''
    });
    const [regSuccess, setRegSuccess] = useState(false);

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await sendOtpToPilgrim(email);
            if (res.error) {
                setError(res.error);
                setLoading(false);
                return;
            }

            setLoading(false);
            setStep('otp');
        } catch (err) {
            setError("Une erreur est survenue lors de la vérification.");
            setLoading(false);
        }
    };

    const verifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await verifyPilgrimOtp(email, otp);
            if (res.success) {
                window.location.href = '/dashboard';
            } else {
                setError(res.error || "Erreur de connexion.");
                setLoading(false);
            }
        } catch (err) {
            setError("Une erreur est survenue lors de la connexion.");
            setLoading(false);
        }
    };

    const handleAgencyLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('password', adminPassword);

        try {
            const result = await loginAdmin(formData);
            if (result?.error) {
                setError(result.error);
                setLoading(false);
            } else {
                window.location.href = '/backoffice';
            }
        } catch (err) {
            setError("Erreur d'authentification");
            setLoading(false);
        }
    };

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await requestRegistration(regForm);
            if (res.error) {
                setError(res.error);
            } else {
                setRegSuccess(true);
            }
        } catch (err) {
            setError("Impossible de soumettre votre demande pour le moment.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-[460px] relative z-10">
                <div className="text-center mb-6">
                    <Link href="/" className="inline-flex items-center gap-2 text-2xl font-black tracking-tighter mb-2 text-main uppercase">
                        <Image src="/logo.png" alt="OMRAYANAIR Logo" width={32} height={32} className="rounded-lg object-contain" />
                        OMRA<span className="text-emerald-500">YANAIR</span>
                    </Link>
                    <div className="h-1 w-12 bg-emerald-500 mx-auto rounded-full" />
                </div>

                {/* Role Switcher */}
                {step === 'email' && !regSuccess && (
                    <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 border border-white/5 rounded-2xl mb-4">
                        <button
                            onClick={() => { setRole('pilgrim'); setError(null); }}
                            className={`flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${role === 'pilgrim' ? 'bg-emerald-500 text-[#050605] shadow font-bold' : 'text-dim hover:text-main'}`}
                        >
                            <User className="w-3.5 h-3.5" />
                            Pèlerin
                        </button>
                        <button
                            onClick={() => { setRole('agency'); setError(null); }}
                            className={`flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${role === 'agency' ? 'bg-emerald-500 text-[#050605] shadow font-bold' : 'text-dim hover:text-main'}`}
                        >
                            <Users className="w-3.5 h-3.5" />
                            Agence
                        </button>
                    </div>
                )}

                {/* Pilgrim Sub-Tabs */}
                {role === 'pilgrim' && step === 'email' && !regSuccess && (
                    <div className="flex gap-2 p-1 bg-white/5 border border-white/5 rounded-2xl mb-6">
                        <button
                            onClick={() => { setActiveTab('login'); setError(null); }}
                            className={`flex-1 py-2.5 text-[9px] font-bold uppercase tracking-widest rounded-lg transition-all ${activeTab === 'login' ? 'bg-white/10 text-main shadow' : 'text-dim hover:text-main'}`}
                        >
                            Connexion
                        </button>
                        <button
                            onClick={() => { setActiveTab('register'); setError(null); }}
                            className={`flex-1 py-2.5 text-[9px] font-bold uppercase tracking-widest rounded-lg transition-all ${activeTab === 'register' ? 'bg-white/10 text-main shadow' : 'text-dim hover:text-main'}`}
                        >
                            Demande d'accès
                        </button>
                    </div>
                )}

                <div className="glass p-8 md:p-10 rounded-[3rem] border-emerald-500/10 shadow-2xl bg-white/[0.02]">
                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-3">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {role === 'agency' ? (
                        <div>
                            <div className="mb-8">
                                <h1 className="text-2xl font-black mb-2 text-main uppercase tracking-tighter">Espace Agence</h1>
                                <p className="text-sub text-xs leading-relaxed font-light">
                                    Accédez au backoffice d'administration de l'agence OMRAYANAIR.
                                </p>
                            </div>

                            <form onSubmit={handleAgencyLoginSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-dim ml-4">Mot de passe</label>
                                    <div className="relative">
                                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500/30" />
                                        <input
                                            required
                                            type="password"
                                            value={adminPassword}
                                            onChange={(e) => setAdminPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full bg-emerald-500/[0.03] dark:bg-white/5 border border-emerald-500/10 p-5 pl-14 rounded-2xl text-sm focus:border-emerald-500/50 outline-none transition-all text-main dark:text-white"
                                        />
                                    </div>
                                </div>

                                <button
                                    disabled={loading}
                                    className="w-full bg-emerald-500 hover:bg-emerald-600 dark:hover:bg-emerald-400 text-[#050605] py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed group"
                                >
                                    {loading ? "Connexion..." : "Se connecter"}
                                    {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                                </button>
                            </form>
                        </div>
                    ) : activeTab === 'login' ? (
                        step === 'email' ? (
                            <>
                                <div className="mb-8">
                                    <h1 className="text-2xl font-black mb-2 text-main uppercase tracking-tighter">Espace Pèlerin</h1>
                                    <p className="text-sub text-xs leading-relaxed font-light">
                                        Entrez votre e-mail pour accéder à votre espace de voyage sécurisé.
                                    </p>
                                </div>

                                <form onSubmit={handleLoginSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-dim ml-4">Adresse Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500/30" />
                                            <input
                                                required
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="exemple@site.com"
                                                autoComplete="off"
                                                className="w-full bg-emerald-500/[0.03] dark:bg-white/5 border border-emerald-500/10 p-5 pl-14 rounded-2xl text-sm focus:border-emerald-500/50 outline-none transition-all text-main dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        disabled={loading}
                                        className="w-full bg-emerald-500 hover:bg-emerald-600 dark:hover:bg-emerald-400 text-[#050605] py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed group"
                                    >
                                        {loading ? "Vérification..." : "Recevoir mon code"}
                                        {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="mb-8">
                                    <h1 className="text-2xl font-black mb-2 text-main uppercase tracking-tighter">Code de sécurité</h1>
                                    <p className="text-sub text-xs leading-relaxed font-light">
                                        Saisissez le code de connexion temporaire envoyé à <span className="text-emerald-500 font-bold">{email}</span>.
                                    </p>
                                </div>

                                <form onSubmit={verifyOtp} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-dim ml-4">Code à 6 chiffres</label>
                                        <div className="relative">
                                            <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500/30" />
                                            <input
                                                required
                                                type="text"
                                                maxLength={6}
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                                placeholder="786921"
                                                className="w-full bg-emerald-500/[0.03] dark:bg-white/5 border border-emerald-500/10 p-5 pl-14 rounded-2xl text-2xl tracking-[0.5em] font-black focus:border-emerald-500/50 outline-none transition-all text-main dark:text-white placeholder:opacity-20"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        disabled={loading}
                                        className="w-full bg-emerald-500 hover:bg-emerald-600 dark:hover:bg-emerald-400 text-[#050605] py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                                    >
                                        {loading ? "Vérification..." : "Vérifier & Entrer"}
                                    </button>
                                </form>

                                <button
                                    onClick={() => setStep('email')}
                                    className="w-full mt-6 text-[10px] font-black uppercase tracking-widest text-dim hover:text-emerald-500 transition-colors"
                                >
                                    ← Modifier l'adresse email
                                </button>
                            </div>
                        )
                    ) : regSuccess ? (
                        <div className="text-center py-6 animate-in zoom-in-95 duration-500">
                            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                                <CheckCircle className="w-8 h-8 text-emerald-500" />
                            </div>
                            <h2 className="text-2xl font-black uppercase tracking-tighter mb-3 text-main">Demande reçue</h2>
                            <p className="text-sub text-xs leading-relaxed mb-8">
                                Votre demande d'inscription a été transmise avec succès. L'administrateur de l'agence validera votre compte manuellement sous peu. Vous recevrez une notification d'activation.
                            </p>
                            <button
                                onClick={() => { setRegSuccess(false); setActiveTab('login'); }}
                                className="px-8 py-4 bg-emerald-500 text-[#050605] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all"
                            >
                                Retour à la connexion
                            </button>
                        </div>
                    ) : (
                        <div>
                            <div className="mb-8">
                                <h1 className="text-2xl font-black mb-2 text-main uppercase tracking-tighter">Demande d'inscription</h1>
                                <p className="text-sub text-xs leading-relaxed font-light">
                                    Veuillez renseigner vos informations réelles afin que l'agence puisse autoriser l'accès à votre dossier de voyage.
                                </p>
                            </div>

                            <form onSubmit={handleRegisterSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-dim ml-4">Prénom</label>
                                        <input
                                            required
                                            type="text"
                                            value={regForm.firstName}
                                            onChange={(e) => setRegForm({ ...regForm, firstName: e.target.value })}
                                            placeholder="Salah"
                                            className="w-full bg-emerald-500/[0.03] dark:bg-white/5 border border-emerald-500/10 p-4 rounded-xl text-xs focus:border-emerald-500/50 outline-none text-main"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-dim ml-4">Nom</label>
                                        <input
                                            required
                                            type="text"
                                            value={regForm.familyName}
                                            onChange={(e) => setRegForm({ ...regForm, familyName: e.target.value })}
                                            placeholder="Lamkhannet"
                                            className="w-full bg-emerald-500/[0.03] dark:bg-white/5 border border-emerald-500/10 p-4 rounded-xl text-xs focus:border-emerald-500/50 outline-none text-main"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-dim ml-4">Genre</label>
                                    <div className="flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setRegForm({ ...regForm, gender: 'M' })}
                                            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border ${regForm.gender === 'M' ? 'bg-emerald-500 border-emerald-500 text-[#050605]' : 'border-white/10 text-dim'}`}
                                        >
                                            Homme
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setRegForm({ ...regForm, gender: 'F' })}
                                            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border ${regForm.gender === 'F' ? 'bg-emerald-500 border-emerald-500 text-[#050605]' : 'border-white/10 text-dim'}`}
                                        >
                                            Femme
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-dim ml-4">Adresse E-mail</label>
                                    <input
                                        required
                                        type="email"
                                        value={regForm.email}
                                        onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                                        placeholder="exemple@site.com"
                                        autoComplete="off"
                                        className="w-full bg-emerald-500/[0.03] dark:bg-white/5 border border-emerald-500/10 p-4 rounded-xl text-xs focus:border-emerald-500/50 outline-none text-main"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-dim ml-4">Numéro de Téléphone</label>
                                    <input
                                        required
                                        type="tel"
                                        value={regForm.phone}
                                        onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                                        placeholder="+33 6 12 34 56 78"
                                        className="w-full bg-emerald-500/[0.03] dark:bg-white/5 border border-emerald-500/10 p-4 rounded-xl text-xs focus:border-emerald-500/50 outline-none text-main"
                                    />
                                </div>

                                <button
                                    disabled={loading}
                                    className="w-full bg-emerald-500 hover:bg-emerald-600 dark:hover:bg-emerald-400 text-[#050605] py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                                >
                                    {loading ? "Soumission..." : "Soumettre ma demande"}
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                <div className="mt-6 text-center">
                    <p className="text-[9px] text-dim font-black uppercase tracking-widest flex items-center justify-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> PROTECTION PAR SUPABASE AUTH & MFA
                    </p>
                </div>
            </div>
        </div>
    );
}
