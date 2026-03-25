'use client';
import { Plus, Users, Calendar, ArrowRight, Hotel, Bell } from 'lucide-react';
import Link from 'next/link';

export default function GroupsPage() {
    const groups = [
        { id: '1', name: 'Groupe Ramadan A', pelerinCount: 45, date: '25 Mars 2025', status: 'En préparation' },
        { id: '2', name: 'Pack Économique 01', pelerinCount: 20, date: '12 Avril 2025', status: 'Complet' },
        { id: '3', name: 'Premium Medina', pelerinCount: 12, date: '05 Mai 2025', status: 'Brouillon' },
    ];

    return (
        <div className="space-y-8 p-6">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter text-main">Gestion des <span className="text-emerald-500">Groupes</span></h1>
                    <p className="text-sub text-sm mt-1">Créez et gérez vos départs pour la saison 2025.</p>
                </div>
                <button className="btn-premium py-3 px-8 flex items-center gap-2 shadow-xl shadow-emerald-500/10">
                    <Plus className="w-5 h-5" /> Nouveau Groupe
                </button>
            </header>

            <div className="grid grid-cols-1 gap-4">
                {groups.map((g) => (
                    <div key={g.id} className="glass p-6 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between group hover:border-emerald-500/30 transition-all shadow-sm">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/5 flex items-center justify-center border border-emerald-500/10">
                                <Users className="w-8 h-8 text-emerald-600 dark:text-emerald-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tighter text-main">{g.name}</h3>
                                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-dim mt-2">
                                    <span className="flex items-center gap-2"><Users className="w-4 h-4 text-emerald-500" /> {g.pelerinCount} pèlerins</span>
                                    <span className="flex items-center gap-2 text-sub opacity-20">|</span>
                                    <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-emerald-500" /> {g.date}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 mt-6 md:mt-0">
                            <div className="flex bg-emerald-500/5 dark:bg-white/5 p-1 rounded-2xl border border-emerald-500/10 dark:border-white/5 shadow-inner">
                                <Link href={`/backoffice/groups/${g.id}/planning`} className="p-3 hover:bg-emerald-500/20 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl transition-all text-dim" title="Planning">
                                    <Calendar className="w-5 h-5" />
                                </Link>
                                <Link href={`/backoffice/groups/${g.id}/rooming`} className="p-3 hover:bg-amber-500/20 hover:text-amber-600 dark:hover:text-amber-400 rounded-xl transition-all text-dim" title="Rooming">
                                    <Hotel className="w-5 h-5" />
                                </Link>
                                <Link href={`/backoffice/groups/${g.id}/notifications`} className="p-3 hover:bg-blue-500/20 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all text-dim" title="Broadcast">
                                    <Bell className="w-5 h-5" />
                                </Link>
                            </div>

                            <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border shadow-sm ${g.status === 'Complet' ? 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400' :
                                g.status === 'En préparation' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                                    'bg-gray-500/10 border-gray-500/20 text-dim'
                                }`}>
                                {g.status}
                            </span>
                            <button className="p-4 rounded-full hover:bg-emerald-500/5 text-dim hover:text-emerald-500 transition-all group-hover:scale-110">
                                <ArrowRight className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
