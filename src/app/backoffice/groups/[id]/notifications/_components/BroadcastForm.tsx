'use client';

import { useState } from 'react';
import { Send, Users, AlertCircle, Info, Bus, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { createNotificationAction } from '@/lib/actions/concierge';

const TYPES = [
    { label: 'Urgent', value: 'URGENT', icon: AlertCircle, color: 'text-red-400' },
    { label: 'Logistique', value: 'LOGISTICS', icon: Bus, color: 'text-emerald-400' },
    { label: 'Rituel', value: 'RITUAL', icon: Sparkles, color: 'text-amber-400' },
    { label: 'Info', value: 'INFO', icon: Info, color: 'text-blue-400' },
];

export default function BroadcastForm({ groupId }: { groupId: string }) {
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [type, setType] = useState('INFO');
    const [message, setMessage] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const handleSend = async () => {
        if (!message) return;
        setLoading(true);
        setErrorMsg('');
        try {
            const res = await createNotificationAction({
                type,
                title: type === 'URGENT' ? 'Message Urgent du Guide' : 'Information Groupe',
                content: message,
                groupId: groupId
            });
            if (res.error) {
                setErrorMsg(res.error);
            } else {
                setSent(true);
                setMessage('');
                setTimeout(() => setSent(false), 3000);
            }
        } catch (err: any) {
            setErrorMsg(err.message || "Erreur de diffusion.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <Users className="w-6 h-6 text-emerald-500" />
                <h2 className="text-xl font-black uppercase tracking-tighter">Diffusion Collective</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {TYPES.map(t => (
                    <button
                        key={t.value}
                        onClick={() => setType(t.value)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${type === t.value
                                ? `bg-white/10 border-white/20 ${t.color}`
                                : 'glass border-white/5 text-white/20 hover:text-white/40'
                            }`}
                    >
                        <t.icon className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{t.label}</span>
                    </button>
                ))}
            </div>

            <div className="relative">
                <textarea
                    placeholder="Votre message au groupe..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-sm outline-none focus:border-emerald-500/50 min-h-[150px] resize-none"
                />
                <div className="absolute bottom-4 right-4 text-[10px] text-white/20 font-mono">
                    {message.length} chars
                </div>
            </div>

            {errorMsg && (
                <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider text-center mb-2">{errorMsg}</p>
            )}

            <button
                onClick={handleSend}
                disabled={loading || !message}
                className={`w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all ${sent
                        ? 'bg-emerald-500 text-[#050605]'
                        : 'bg-white text-[#050605] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-20'
                    }`}
            >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (sent ? <CheckCircle2 className="w-5 h-5" /> : <Send className="w-5 h-5" />)}
                {sent ? "Message Envoyé !" : "Diffuser maintenant"}
            </button>

            <p className="text-[10px] text-white/20 text-center uppercase tracking-widest">
                Ce message sera envoyé en Push et In-App à {sent ? '42' : '...'} pèlerins.
            </p>
        </div>
    );
}
