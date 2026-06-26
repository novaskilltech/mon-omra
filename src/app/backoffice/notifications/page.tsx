'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Send, Filter, Search, MoreVertical, ArrowRight, Loader2, CheckCircle2, AlertCircle, Info, Bus, Sparkles, Users } from 'lucide-react';
import { getNotificationsList, createNotificationAction, getGroups, getPilgrimsList } from '@/lib/actions/concierge';

const TYPES = [
    { label: 'Info', value: 'INFO', icon: Info, color: 'text-blue-500 border-blue-500/20 bg-blue-500/10' },
    { label: 'Urgent', value: 'URGENT', icon: AlertCircle, color: 'text-red-500 border-red-500/20 bg-red-500/10' },
    { label: 'Logistique', value: 'LOGISTICS', icon: Bus, color: 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10' },
    { label: 'Rituel', value: 'RITUAL', icon: Sparkles, color: 'text-amber-500 border-amber-500/20 bg-amber-500/10' },
];

export default function GlobalNotificationsPage() {
    // Loaded Data States
    const [history, setHistory] = useState<any[]>([]);
    const [groups, setGroups] = useState<any[]>([]);
    const [pilgrims, setPilgrims] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    // Form States
    const [targetType, setTargetType] = useState<'ALL' | 'GROUP' | 'PILGRIM'>('ALL');
    const [selectedGroupId, setSelectedGroupId] = useState('');
    const [selectedPilgrimId, setSelectedPilgrimId] = useState('');
    const [msgType, setMsgType] = useState('INFO');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [sending, setSending] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Search & Filter
    const [searchQuery, setSearchQuery] = useState('');

    async function loadData() {
        try {
            setLoadingData(true);
            const [notifs, grps, pils] = await Promise.all([
                getNotificationsList(),
                getGroups(),
                getPilgrimsList()
            ]);
            setHistory(notifs);
            setGroups(grps || []);
            setPilgrims(pils || []);
        } catch (e) {
            console.error("Error loading communication center data:", e);
        } finally {
            setLoadingData(false);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !content) return;

        setSending(true);
        setErrorMsg('');
        try {
            const payload = {
                type: msgType,
                title,
                content,
                groupId: targetType === 'GROUP' ? selectedGroupId : undefined,
                pilgrimId: targetType === 'PILGRIM' ? selectedPilgrimId : undefined,
            };

            const res = await createNotificationAction(payload);
            if (res.error) {
                setErrorMsg(res.error);
            } else {
                setSuccess(true);
                setTitle('');
                setContent('');
                setSelectedGroupId('');
                setSelectedPilgrimId('');
                setTimeout(() => setSuccess(false), 3000);
                // Reload list
                const updated = await getNotificationsList();
                setHistory(updated);
            }
        } catch (err: any) {
            setErrorMsg(err.message || "Erreur de diffusion.");
        } finally {
            setSending(false);
        }
    };

    const filteredHistory = history.filter(h => 
        h.msg.toLowerCase().includes(searchQuery.toLowerCase()) || 
        h.group.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-500 p-6 font-inter">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter text-main">Centre de <span className="text-emerald-500">Communication</span></h1>
                    <p className="text-sub text-sm mt-1 uppercase tracking-widest font-black opacity-40">Historique global et gestion des broadcasts agence.</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                        <input
                            type="text"
                            placeholder="RECHERCHER UN MESSAGE..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 pr-6 py-4 bg-emerald-500/5 dark:bg-white/5 border border-emerald-500/10 dark:border-white/10 rounded-[1.5rem] text-[10px] font-black tracking-widest text-main focus:border-emerald-500/50 outline-none transition-all w-full md:w-72 shadow-inner"
                        />
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Side: Stats and Send Form */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Stat: Messages Sent */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="glass p-6 rounded-[2.2rem] border-emerald-500/5 dark:border-white/5 shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Send className="w-10 h-10 text-emerald-500" />
                            </div>
                            <h3 className="text-3xl font-black tracking-tighter text-main group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                {loadingData ? <Loader2 className="w-6 h-6 animate-spin text-emerald-500" /> : history.length}
                            </h3>
                            <p className="text-[8px] font-black uppercase tracking-wider text-dim mt-2 italic opacity-60">Messages envoyés</p>
                        </div>

                        <div className="glass p-6 rounded-[2.2rem] border-emerald-500/5 dark:border-white/5 shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Bell className="w-10 h-10 text-blue-500" />
                            </div>
                            <h3 className="text-3xl font-black tracking-tighter text-main group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">100%</h3>
                            <p className="text-[8px] font-black uppercase tracking-wider text-dim mt-2 italic opacity-60">Délivrabilité globale</p>
                        </div>
                    </div>

                    {/* Send Notification Form */}
                    <div className="glass p-8 rounded-[3rem] border-emerald-500/10 shadow-2xl relative overflow-hidden">
                        <div className="flex items-center gap-3 mb-6">
                            <Send className="w-5 h-5 text-emerald-500" />
                            <h3 className="text-lg font-black uppercase tracking-tighter text-main">Nouvelle Diffusion</h3>
                        </div>

                        <form onSubmit={handleSend} className="space-y-4">
                            {/* Target Type Selector */}
                            <div>
                                <label className="block text-[8px] font-black uppercase tracking-widest text-dim mb-2">Destinataires</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['ALL', 'GROUP', 'PILGRIM'] as const).map((t) => (
                                        <button
                                            type="button"
                                            key={t}
                                            onClick={() => setTargetType(t)}
                                            className={`py-2 px-1 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all ${
                                                targetType === t 
                                                    ? 'bg-emerald-500 text-black border-emerald-500 shadow-lg' 
                                                    : 'glass border-white/5 text-dim hover:text-main'
                                            }`}
                                        >
                                            {t === 'ALL' ? 'Tous' : t === 'GROUP' ? 'Groupe' : 'Pèlerin'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Conditional Target Dropdowns */}
                            {targetType === 'GROUP' && (
                                <div>
                                    <label className="block text-[8px] font-black uppercase tracking-widest text-dim mb-2">Choisir le groupe</label>
                                    <select
                                        value={selectedGroupId}
                                        onChange={(e) => setSelectedGroupId(e.target.value)}
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] text-main outline-none focus:border-emerald-500/50"
                                    >
                                        <option value="" disabled>SÉLECTIONNER UN GROUPE...</option>
                                        {groups.map((g) => (
                                            <option key={g.id} value={g.id}>{g.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {targetType === 'PILGRIM' && (
                                <div>
                                    <label className="block text-[8px] font-black uppercase tracking-widest text-dim mb-2">Choisir le pèlerin</label>
                                    <select
                                        value={selectedPilgrimId}
                                        onChange={(e) => setSelectedPilgrimId(e.target.value)}
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] text-main outline-none focus:border-emerald-500/50"
                                    >
                                        <option value="" disabled>SÉLECTIONNER UN PÈLERIN...</option>
                                        {pilgrims.map((p) => (
                                            <option key={p.id} value={p.id}>{p.full_name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Message Type (INFO, URGENT, LOGISTICS, RITUAL) */}
                            <div>
                                <label className="block text-[8px] font-black uppercase tracking-widest text-dim mb-2">Type d'alerte</label>
                                <div className="grid grid-cols-4 gap-1.5">
                                    {TYPES.map((t) => {
                                        const Icon = t.icon;
                                        return (
                                            <button
                                                type="button"
                                                key={t.value}
                                                onClick={() => setMsgType(t.value)}
                                                className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all ${
                                                    msgType === t.value 
                                                        ? t.color 
                                                        : 'glass border-white/5 text-white/20'
                                                }`}
                                            >
                                                <Icon className="w-3.5 h-3.5" />
                                                <span className="text-[7px] font-black uppercase tracking-wider">{t.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Message Subject */}
                            <div>
                                <label className="block text-[8px] font-black uppercase tracking-widest text-dim mb-2">Sujet / Titre</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Retard de vol JED-CDG"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-main outline-none focus:border-emerald-500/50"
                                />
                            </div>

                            {/* Message Content */}
                            <div>
                                <label className="block text-[8px] font-black uppercase tracking-widest text-dim mb-2">Message</label>
                                <textarea
                                    placeholder="Écrivez le contenu du message de notification..."
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs outline-none focus:border-emerald-500/50 min-h-[100px] resize-none"
                                />
                            </div>

                            {errorMsg && (
                                <p className="text-[9px] text-red-500 font-bold uppercase tracking-wider">{errorMsg}</p>
                            )}

                            <button
                                type="submit"
                                disabled={sending || !title || !content}
                                className={`w-full py-3.5 rounded-xl font-black uppercase tracking-[0.2em] text-[9px] flex items-center justify-center gap-2 transition-all ${
                                    success
                                        ? 'bg-emerald-500 text-black'
                                        : 'bg-white text-[#050605] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-20'
                                }`}
                            >
                                {sending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : success ? (
                                    <CheckCircle2 className="w-4 h-4" />
                                ) : (
                                    <Send className="w-4 h-4" />
                                )}
                                {success ? "Diffusé avec succès !" : "Diffuser maintenant"}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Side: Global History Table */}
                <div className="lg:col-span-7 glass p-8 md:p-10 rounded-[3.5rem] border-emerald-500/5 dark:border-white/5 shadow-2xl">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-2xl font-black uppercase tracking-tighter text-main">Historique <span className="text-emerald-500">Récent</span></h3>
                        <button className="p-3 hover:bg-emerald-500/5 dark:hover:bg-white/5 rounded-2xl transition-all border border-emerald-500/10">
                            <Filter className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                        </button>
                    </div>

                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                        {loadingData ? (
                            <div className="flex flex-col items-center justify-center py-20 text-dim">
                                <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Chargement de l'historique...</span>
                            </div>
                        ) : filteredHistory.length === 0 ? (
                            <div className="text-center py-20 text-dim">
                                <span className="text-[10px] font-black uppercase tracking-widest">Aucun message de diffusion enregistré</span>
                            </div>
                        ) : (
                            filteredHistory.map((h: any) => {
                                const matchedType = TYPES.find(t => t.value === h.type) || TYPES[0];
                                const TypeIcon = matchedType.icon;
                                return (
                                    <div key={h.id} className="group p-6 rounded-[2rem] bg-emerald-500/[0.02] dark:bg-white/[0.02] border border-emerald-500/10 dark:border-white/5 hover:border-emerald-500/30 dark:hover:border-white/10 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
                                        <div className="flex items-center gap-6">
                                            <div className={`w-1.5 h-12 rounded-full shadow-lg ${
                                                h.type === 'URGENT' ? 'bg-red-500' :
                                                h.type === 'LOGISTICS' ? 'bg-emerald-500' : 
                                                h.type === 'RITUAL' ? 'bg-amber-500' : 'bg-blue-500'
                                            }`} />
                                            <div>
                                                <h4 className="text-base font-black text-main group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors uppercase tracking-tight flex items-center gap-2">
                                                    {h.msg}
                                                    <span className="opacity-40 group-hover:opacity-100 transition-opacity">
                                                        <TypeIcon className="w-3.5 h-3.5 text-emerald-500" />
                                                    </span>
                                                </h4>
                                                <p className="text-[9px] text-dim font-black uppercase tracking-widest mt-1 opacity-60">
                                                    Destinataire: {h.group} <span className="mx-2 opacity-20">|</span> Envoyé: {h.date}
                                                </p>
                                                <p className="text-[11px] text-dim font-medium mt-2 leading-relaxed italic">{h.content}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end shrink-0">
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm">
                                                {h.status}
                                            </span>
                                            <button className="p-3 opacity-30 group-hover:opacity-100 transition-all hover:bg-emerald-500/5 rounded-xl">
                                                <MoreVertical className="w-5 h-5 text-dim" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
