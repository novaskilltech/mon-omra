'use client';

import { Bell, Send, Filter, Search, MoreVertical, ArrowRight } from 'lucide-react';

export default function GlobalNotificationsPage() {
    const history = [
        { id: 1, group: 'Ramadan Premium', type: 'URGENT', msg: 'Retard de vol JED-CDG', date: 'Aujourd\'hui, 14:30', status: 'Délivré' },
        { id: 2, group: 'Tous les pèlerins', type: 'INFO', msg: 'Bienvenue en Terre Sainte', date: 'Hier, 09:12', status: 'Délivré' },
        { id: 3, group: 'Pack Éco 01', type: 'LOGISTIQUE', msg: 'Changement de bus pour Médine', date: 'Il y a 2 jours', status: 'Délivré' },
    ];

    return (
        <div className="space-y-10 animate-in fade-in duration-500 p-6">
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
                            className="pl-12 pr-6 py-4 bg-emerald-500/5 dark:bg-white/5 border border-emerald-500/10 dark:border-white/10 rounded-[1.5rem] text-[10px] font-black tracking-widest text-main focus:border-emerald-500/50 outline-none transition-all w-full md:w-72 shadow-inner"
                        />
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Stats Summary */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="glass p-8 rounded-[3rem] border-emerald-500/5 dark:border-white/5 shadow-xl group hover:border-emerald-500/20 transition-all">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/5 flex items-center justify-center mb-6 border border-emerald-500/10">
                            <Send className="w-7 h-7 text-emerald-600 dark:text-emerald-500" />
                        </div>
                        <h3 className="text-4xl font-black tracking-tighter text-main group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">1,492</h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dim mt-2 italic opacity-60">Messages envoyés (30 derniers jours)</p>
                    </div>

                    <div className="glass p-8 rounded-[3rem] border-emerald-500/5 dark:border-white/5 shadow-xl group hover:border-blue-500/20 transition-all">
                        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 dark:bg-blue-500/5 flex items-center justify-center mb-6 border border-blue-500/10">
                            <Bell className="w-7 h-7 text-blue-600 dark:text-blue-500" />
                        </div>
                        <h3 className="text-4xl font-black tracking-tighter text-main group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">98.2%</h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dim mt-2 italic opacity-60">Taux de délivrabilité global</p>
                    </div>
                </div>

                {/* Global History Table */}
                <div className="lg:col-span-8 glass p-8 md:p-10 rounded-[3.5rem] border-emerald-500/5 dark:border-white/5 shadow-2xl">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-2xl font-black uppercase tracking-tighter text-main">Historique <span className="text-emerald-500">Récent</span></h3>
                        <button className="p-3 hover:bg-emerald-500/5 dark:hover:bg-white/5 rounded-2xl transition-all border border-emerald-500/10">
                            <Filter className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {history.map((h) => (
                            <div key={h.id} className="group p-6 rounded-[2rem] bg-emerald-500/[0.02] dark:bg-white/[0.02] border border-emerald-500/10 dark:border-white/5 hover:border-emerald-500/30 dark:hover:border-white/10 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
                                <div className="flex items-center gap-6">
                                    <div className={`w-1.5 h-12 rounded-full shadow-lg ${h.type === 'URGENT' ? 'bg-red-500' :
                                        h.type === 'LOGISTIQUE' ? 'bg-amber-500' : 'bg-emerald-500'
                                        }`} />
                                    <div>
                                        <h4 className="text-lg font-black text-main group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{h.msg}</h4>
                                        <p className="text-[10px] text-dim font-black uppercase tracking-widest mt-1 opacity-60">{h.group} <span className="mx-2 opacity-20">|</span> {h.date}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm">
                                        {h.status}
                                    </span>
                                    <button className="p-3 opacity-30 group-hover:opacity-100 transition-all hover:bg-emerald-500/5 rounded-xl">
                                        <MoreVertical className="w-5 h-5 text-dim" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="w-full mt-10 py-5 bg-emerald-500/5 dark:bg-white/5 border border-emerald-500/5 dark:border-white/5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-emerald-500/10 dark:hover:bg-white/10 transition-all text-dim hover:text-main group">
                        Parcourir tout l'historique <ArrowRight className="w-4 h-4 inline-block ml-2 transition-transform group-hover:translate-x-1" />
                    </button>
                </div>
            </div>
        </div>
    );
}
