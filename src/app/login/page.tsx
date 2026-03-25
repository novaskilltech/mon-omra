'use client';

import { useState } from 'react';
import { Mail, ArrowRight, ShieldCheck, Timer, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'email' | 'otp'>('email');
    const [otp, setOtp] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulation envoi OTP
        setTimeout(() => {
            setLoading(false);
            setStep('otp');
        }, 1200);
    };

    const verifyOtp = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Suppression du bypass de test '786921' pour la mise en production
        // Une intégration réelle avec Supabase Auth (verifyOtp) doit être implémentée ici
        setTimeout(() => {
            alert("Vérification OTP réelle requise pour la production via Supabase.");
            setLoading(false);
        }, 1000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px]" />

            <div className="w-full max-w-[440px] relative z-10">
                <div className="text-center mb-10">
                    <Link href="/" className="text-2xl font-black tracking-tighter mb-2 inline-block text-main uppercase">
                        MON <span className="text-emerald-500">OMRA</span>
                    </Link>
                    <div className="h-1 w-12 bg-emerald-500 mx-auto rounded-full" />
                </div>

                <div className="glass p-10 rounded-[3rem] border-emerald-500/10 shadow-2xl bg-white/[0.02]">
                    {step === 'email' ? (
                        <>
                            <div className="mb-8">
                                <h1 className="text-2xl font-black mb-2 text-main uppercase tracking-tighter">Connexion</h1>
                                <p className="text-sub text-sm leading-relaxed font-light">
                                    Entrez votre email pour recevoir votre code de connexion à 6 chiffres.
                                </p>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-dim ml-4">Adresse Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500/30" />
                                        <input
                                            required
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="salah.lamkhannet@gmail.com"
                                            className="w-full bg-emerald-500/[0.03] dark:bg-white/5 border border-emerald-500/10 p-5 pl-14 rounded-2xl text-sm focus:border-emerald-500/50 outline-none transition-all text-main dark:text-white"
                                        />
                                    </div>
                                </div>

                                <button
                                    disabled={loading}
                                    className="w-full bg-emerald-500 hover:bg-emerald-600 dark:hover:bg-emerald-400 text-white dark:text-[#050605] py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed group"
                                >
                                    {loading ? "Envoi du code..." : "Recevoir mon code"}
                                    {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="mb-8">
                                <h1 className="text-2xl font-black mb-2 text-main uppercase tracking-tighter">Vérification</h1>
                                <p className="text-sub text-sm leading-relaxed font-light">
                                    Entrez le code envoyé à <span className="text-emerald-500 font-bold">{email}</span>.
                                </p>
                            </div>

                            <form onSubmit={verifyOtp} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-dim ml-4">Code de sécurité (6 chiffres)</label>
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
                                    className="w-full bg-emerald-500 hover:bg-emerald-600 dark:hover:bg-emerald-400 text-white dark:text-[#050605] py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
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
                    )}

                    <div className="mt-8 pt-8 border-t border-emerald-500/5 flex items-center gap-4">
                        <ShieldCheck className="w-8 h-8 text-emerald-500/30" />
                        <p className="text-[9px] text-dim uppercase tracking-widest leading-relaxed">
                            Protection par <span className="text-main font-bold">Supabase Auth</span> & MFA.
                        </p>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-[9px] text-dim font-black uppercase tracking-widest flex items-center justify-center gap-2">
                        <AlertCircle className="w-3 h-3 text-amber-500" /> Accès réservé aux agences et pèlerins
                    </p>
                </div>
            </div>
        </div>
    );
}
