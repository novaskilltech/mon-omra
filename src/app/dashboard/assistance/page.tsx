'use client';
import { useState } from 'react';
import { AlertTriangle, ShieldAlert, HeartPulse, Luggage, Users, HelpCircle, Send, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { createAssistanceRequest } from '@/lib/actions/logistics';

export default function AssistancePage() {
    const [step, setStep] = useState<'category' | 'form' | 'success'>('category');
    const [category, setCategory] = useState<string | null>(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const categories = [
        { id: 'SANTE', label: 'Urgence Santé', icon: HeartPulse, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500/10' },
        { id: 'GROUPE_PERDU', label: 'Groupe Perdu', icon: Users, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
        { id: 'BAGAGES', label: 'Bagage Perdu', icon: Luggage, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10' },
        { id: 'LOGEMENT', label: 'Problème Hôtel', icon: ShieldAlert, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/10' },
        { id: 'AUTRE', label: 'Autre besoin', icon: HelpCircle, color: 'text-emerald-600 dark:text-emerald-500', bg: 'bg-emerald-500/10' },
    ];

    const handleSelectCategory = (id: string) => {
        setCategory(id);
        setError(null);
        setStep('form');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!category || !message.trim()) return;

        setLoading(true);
        setError(null);

        const priority = category === 'SANTE' || category === 'GROUPE_PERDU' ? 'CRITIQUE' : 'NORMAL';

        try {
            const res = await createAssistanceRequest({
                category,
                priority,
                message,
            });

            if (res.error) {
                setError(res.error);
            } else {
                setStep('success');
            }
        } catch (err: any) {
            setError("Une erreur inattendue est survenue.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen p-6 animate-in fade-in duration-500">
            <header className="mb-12">
                <Link href="/dashboard" className="text-dim text-[10px] font-black uppercase tracking-widest hover:text-emerald-500 transition-colors mb-4 inline-block">
                    ← Retour au Dashboard
                </Link>
                <h1 className="text-4xl font-black uppercase tracking-tighter text-main">Besoin <span className="text-red-600">d'assistance</span> ?</h1>
                <p className="text-sub text-sm mt-1">Signalez votre problème immédiatement à l'équipe encadrante.</p>
            </header>

            {step === 'category' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categories.map((c) => (
                        <button
                            key={c.id}
                            onClick={() => handleSelectCategory(c.id)}
                            className="glass p-8 rounded-[2.5rem] border-emerald-500/5 hover:border-emerald-500/20 transition-all flex items-center gap-6 group text-left shadow-sm"
                        >
                            <div className={`p-4 rounded-2xl ${c.bg} ${c.color.split(' ')[0]} ${c.color.split(' ')[1]} group-hover:scale-110 transition-transform`}>
                                <c.icon className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tighter text-main">{c.label}</h3>
                                <p className="text-[10px] text-dim uppercase tracking-widest mt-1">Priorité élevée</p>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {step === 'form' && (
                <div className="max-w-xl mx-auto glass p-8 rounded-[3rem] border-emerald-500/5 animate-in slide-in-from-bottom-10 duration-500 shadow-xl bg-white/[0.02]">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/10">
                            <AlertTriangle className="w-6 h-6 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter text-main">Détails de l'incident</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-dim mb-2 ml-4">Catégorie sélectionnée</label>
                            <div className="px-6 py-4 bg-emerald-500/5 dark:bg-white/5 rounded-2xl border border-emerald-500/10 text-sm font-black text-main flex items-center gap-3 uppercase tracking-tighter">
                                <div className={`w-2 h-2 rounded-full bg-red-500 animate-pulse outline outline-4 outline-red-500/10`} />
                                {categories.find(c => c.id === category)?.label}
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-dim mb-2 ml-4">Expliquez brièvement</label>
                            <textarea
                                required
                                rows={4}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                disabled={loading}
                                placeholder="Décrivez votre situation ici..."
                                className="w-full bg-emerald-500/[0.03] dark:bg-white/5 border border-emerald-500/10 rounded-[2rem] p-6 text-sm focus:border-red-500/50 outline-none transition-all resize-none text-main dark:text-white placeholder:text-dim disabled:opacity-50"
                            />
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setStep('category')}
                                disabled={loading}
                                className="flex-1 py-5 bg-emerald-500/5 dark:bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-main hover:bg-emerald-500/10 transition-all border border-emerald-500/10 disabled:opacity-50"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-[2] py-5 bg-red-600 hover:bg-red-700 disabled:bg-red-800/80 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        Envoi en cours... <Loader2 className="w-3 h-3 animate-spin" />
                                    </>
                                ) : (
                                    <>
                                        Envoyer l'alerte <Send className="w-3 h-3" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {step === 'success' && (
                <div className="max-w-md mx-auto text-center py-20 animate-in zoom-in-95 duration-500">
                    <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-500/20 shadow-2xl shadow-red-500/10">
                        <CheckCircle2 className="w-12 h-12 text-red-500" />
                    </div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter mb-4 text-main">Alerte transmise</h2>
                    <p className="text-sub text-sm leading-relaxed mb-12 font-light italic">
                        Votre demande d'assistance a été transmise en priorité à votre guide et à l'agence. Un responsable va vous recontacter très rapidement.
                    </p>
                    <Link
                        href="/dashboard"
                        className="px-12 py-5 bg-emerald-500 text-white dark:text-[#050605] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 dark:hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
                    >
                        Retour au Dashboard
                    </Link>
                </div>
            )}
        </div>
    );
}
