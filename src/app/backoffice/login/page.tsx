'use client';

import { useState } from 'react';
import { Lock, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { loginAdmin } from '@/lib/actions/auth';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        try {
            const result = await loginAdmin(formData);
            if (result?.error) {
                setError(result.error);
                setLoading(false);
            } else {
                router.push('/backoffice');
            }
        } catch (err) {
            setError("Erreur d'authentification");
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-main p-6 relative overflow-hidden">
            {/* Background Decorative Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-md relative">
                <div className="text-center mb-10">
                    <div className="inline-flex p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 mb-6 gap-3 items-center">
                        <Image src="/logo.png" alt="OMRAYANAIR Logo" width={40} height={40} className="rounded-xl object-contain animate-pulse" />
                        <ShieldCheck className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-main mb-2">
                        Accès <span className="text-emerald-500">Admin</span>
                    </h1>
                    <p className="text-dim text-xs uppercase tracking-widest font-bold opacity-60">
                        Backoffice OMRAYANAIR
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="glass p-8 rounded-[2.5rem] border-emerald-500/10 shadow-2xl space-y-6">
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-dim mb-3 ml-1">
                            Mot de passe Administrateur
                        </label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500/50 group-focus-within:text-emerald-500 transition-colors" />
                            <input
                                type="password"
                                name="password"
                                required
                                className="w-full bg-emerald-500/5 border border-emerald-500/10 rounded-2xl py-4 pl-12 pr-4 text-main outline-none focus:border-emerald-500/30 transition-all font-medium"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-premium flex items-center justify-center gap-3 py-4 group"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                Se Connecter
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <p className="text-center mt-8 text-[10px] font-bold text-dim uppercase tracking-widest opacity-40">
                    Propulsé par Nova Squad • v1.0
                </p>
            </div>
        </div>
    );
}
