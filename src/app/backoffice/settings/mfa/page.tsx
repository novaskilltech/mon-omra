'use client';

import { useState } from 'react';
import { ShieldCheck, Smartphone, CheckCircle2, Copy, Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function MFASetupPage() {
    const [step, setStep] = useState(1); // 1: Info, 2: QR Code, 3: Verify, 4: Success
    const [loading, setLoading] = useState(false);
    const [code, setCode] = useState('');

    const handleNext = () => {
        setLoading(true);
        setTimeout(() => {
            setStep((prev) => prev + 1);
            setLoading(false);
        }, 1000);
    };

    const handleVerify = () => {
        if (code.length === 6) {
            handleNext();
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-12 px-6">
            <div className="text-center mb-12">
                <div className="w-24 h-24 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-emerald-500/20 shadow-xl shadow-emerald-500/5">
                    <ShieldCheck className="w-12 h-12 text-emerald-600 dark:text-emerald-500" />
                </div>
                <h1 className="text-4xl font-black uppercase tracking-tighter text-main">Double Authentification <span className="text-emerald-500">MFA</span></h1>
                <p className="text-dim mt-2 uppercase tracking-widest text-[10px] font-black opacity-40">Sécurisez votre compte d'agence conformément à la politique de sécurité de <strong>Nova Squad</strong>.</p>
            </div>

            <div className="glass p-1.5 rounded-[4rem] border-emerald-500/5 dark:border-white/5 shadow-2xl overflow-hidden">
                <div className="bg-emerald-500/[0.02] dark:bg-[#050a08]/50 p-10 md:p-14 rounded-[3.5rem] backdrop-blur-3xl min-h-[480px] flex flex-col justify-center border border-emerald-500/10 dark:border-white/5">

                    {step === 1 && (
                        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-emerald-500/10 rounded-2xl">
                                    <Smartphone className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
                                </div>
                                <h3 className="text-2xl font-black uppercase tracking-tighter text-main m-0">
                                    Étape 1 : Installation
                                </h3>
                            </div>
                            <p className="text-[13px] text-dim leading-relaxed mb-10 font-medium italic opacity-80">
                                Pour sécuriser votre accès critique, installez une application d'authentification standard (RFC 6238) comme
                                <span className="text-emerald-600 dark:text-emerald-400 font-black"> Google Authenticator</span> ou
                                <span className="text-emerald-600 dark:text-emerald-400 font-black"> Microsoft Authenticator</span>.
                            </p>
                            <button
                                onClick={handleNext}
                                className="w-full py-5 bg-emerald-600 dark:bg-emerald-500 text-white dark:text-[#050a08] rounded-[2rem] font-black uppercase tracking-[0.3em] text-[10px] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20"
                            >
                                J'ai l'application, continuer
                                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="text-center animate-in fade-in zoom-in-95 duration-700">
                            <h3 className="text-2xl font-black uppercase tracking-tighter text-main mb-8">Étape 2 : Synchronisation</h3>
                            <div className="bg-white p-6 rounded-[3rem] w-56 h-56 mx-auto mb-8 relative group shadow-2xl border border-black/5">
                                <div className="w-full h-full bg-black flex items-center justify-center text-white p-3 rounded-2xl overflow-hidden">
                                    <div className="grid grid-cols-5 gap-1.5 w-full h-full">
                                        {[...Array(25)].map((_, i) => (
                                            <div key={i} className={`bg-${(i * 7) % 3 === 0 ? 'white' : 'black'} rounded-sm`} />
                                        ))}
                                    </div>
                                </div>
                                <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-[3rem] pointer-events-none" />
                            </div>
                            <div className="bg-emerald-500/5 border border-emerald-500/10 dark:border-white/10 rounded-2xl py-3 px-6 inline-flex items-center gap-3 mb-10 overflow-hidden max-w-full">
                                <span className="text-[10px] font-black tracking-[0.2em] text-dim uppercase truncate opacity-40">Secret : OMRA-392D-AGENCY-JET</span>
                                <button className="text-emerald-600 dark:text-emerald-400 p-1 hover:scale-125 transition-transform"><Copy className="w-4 h-4" /></button>
                            </div>
                            <button
                                onClick={handleNext}
                                className="w-full py-5 bg-emerald-800 dark:bg-emerald-100 text-white dark:text-emerald-900 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl"
                            >
                                SCAN TERMINÉ
                            </button>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="animate-in fade-in slide-in-from-right-8 duration-700">
                            <h3 className="text-2xl font-black uppercase tracking-tighter text-main mb-6">Étape 3 : Vérification</h3>
                            <p className="text-[11px] text-dim mb-10 font-bold uppercase tracking-widest opacity-60">
                                Saisissez le code de validation généré par votre mobile pour confirmer la liaison sécurisée.
                            </p>
                            <input
                                type="text"
                                maxLength={6}
                                placeholder="000 000"
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                                className="w-full bg-emerald-500/5 dark:bg-white/5 border-2 border-emerald-500/10 dark:border-white/10 rounded-[2.5rem] py-8 text-center text-5xl font-black tracking-[0.4em] text-main focus:border-emerald-500 focus:bg-transparent outline-none mb-10 transition-all shadow-inner"
                            />
                            <button
                                onClick={handleVerify}
                                disabled={code.length !== 6}
                                className="w-full py-5 bg-emerald-600 dark:bg-emerald-500 text-white dark:text-[#050a08] rounded-[2rem] font-black uppercase tracking-[0.3em] text-[10px] disabled:opacity-30 disabled:grayscale shadow-xl shadow-emerald-500/20"
                            >
                                ACTIVER LA PROTECTION
                            </button>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="text-center animate-in fade-in zoom-in-110 duration-1000">
                            <div className="w-20 h-20 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/20 shadow-glow">
                                <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-500" />
                            </div>
                            <h3 className="text-3xl font-black uppercase tracking-tighter text-main mb-3">MFA Activé !</h3>
                            <p className="text-[11px] text-dim mb-12 font-bold uppercase tracking-widest opacity-50">
                                Votre accès est désormais protégé par un chiffrement de niveau militaire.
                            </p>
                            <div className="bg-amber-500/[0.03] dark:bg-amber-400/5 border border-amber-500/20 dark:border-amber-400/10 p-8 rounded-[2.5rem] mb-12 flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left shadow-sm">
                                <AlertTriangle className="w-8 h-8 text-amber-500 shrink-0" />
                                <div className="space-y-2">
                                    <p className="text-[10px] text-amber-600 dark:text-amber-500 font-black uppercase tracking-[0.2em] leading-relaxed">
                                        Mesures de Secours Critiques
                                    </p>
                                    <p className="text-[11px] text-dim font-medium italic leading-relaxed">
                                        Conservez vos codes de récupération hors ligne. En cas de perte de votre dispositif mobile, l'accès au Back-Office nécessitera une réinitialisation manuelle par <strong>Nova Squad Compliance</strong>.
                                    </p>
                                </div>
                            </div>
                            <Link
                                href="/backoffice/settings"
                                className="w-full py-5 bg-emerald-600 dark:bg-emerald-500 text-white dark:text-[#050a08] rounded-[2rem] font-black uppercase tracking-[0.3em] text-[10px] shadow-xl shadow-emerald-500/20 inline-block"
                            >
                                RETOUR AUX PARAMÈTRES
                            </Link>
                        </div>
                    )}

                </div>
            </div>

            <div className="flex flex-col items-center mt-12 gap-8">
                <p className="text-[9px] text-dim font-black uppercase tracking-[0.4em] opacity-30 text-center">
                    Nova Squad Security Engine • End-to-End AES-256 Vault Encryption
                </p>
                <Link href="/backoffice/settings" className="flex items-center gap-2 text-dim hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors uppercase tracking-widest text-[9px] font-black">
                    <ArrowLeft className="w-3 h-3" /> Revenir aux paramètres
                </Link>
            </div>
        </div>
    );
}
