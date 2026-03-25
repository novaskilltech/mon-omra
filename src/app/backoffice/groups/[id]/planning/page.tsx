'use client';

import { useState } from 'react';
import ProgramEditor from './_components/ProgramEditor';
import { ChevronLeft, Calendar } from 'lucide-react';
import Link from 'next/link';
import DownloadJournalButton from '../_components/DownloadJournalButton';

export default function GroupPlanningPage({ params }: { params: { id: string } }) {
    const [selectedDay, setSelectedDay] = useState(1);
    const groupName = "Groupe Ramadan Premium";

    return (
        <div className="max-w-5xl mx-auto space-y-8 p-6">
            {/* Navigation Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <Link href="/backoffice/groups" className="text-emerald-600 dark:text-emerald-500 hover:text-emerald-500 font-black flex items-center gap-2 text-[10px] uppercase tracking-widest mb-4 transition-all hover:-translate-x-1">
                        <ChevronLeft className="w-4 h-4" /> Retour aux groupes
                    </Link>
                    <div className="flex flex-wrap items-center gap-4">
                        <h1 className="text-4xl font-black uppercase tracking-tighter text-main">{groupName}</h1>
                        <DownloadJournalButton groupName={groupName} groupId={params.id} pilgrimName="Tous les Pèlerins" />
                    </div>
                    <p className="text-sub text-sm mt-1">Édition du programme journalier</p>
                </div>

                <div className="flex bg-emerald-500/5 dark:bg-white/5 p-1 rounded-2xl border border-emerald-500/10 dark:border-white/5 shadow-inner">
                    {[1, 2, 3, 4, 5].map(day => (
                        <button
                            key={day}
                            onClick={() => setSelectedDay(day)}
                            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedDay === day
                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                : 'text-dim hover:text-main'
                                }`}
                        >
                            J{day}
                        </button>
                    ))}
                    <button className="px-4 py-3 text-dim hover:text-emerald-500 transition-colors">
                        <Calendar className="w-5 h-5" />
                    </button>
                    <Link href="/documents" className="ml-2 btn-secondary py-3 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-emerald-500/10 dark:border-white/10 hover:bg-emerald-500/5 transition-all">
                        Mes Documents
                    </Link>
                </div>
            </header>

            {/* Main Editor Surface */}
            <div className="glass p-1 rounded-[3rem] border-emerald-500/5">
                <div className="bg-emerald-500/[0.02] dark:bg-[#050a08]/50 p-6 md:p-12 rounded-[2.8rem] backdrop-blur-3xl shadow-xl">
                    <ProgramEditor groupId={params.id} dayNumber={selectedDay} />
                </div>
            </div>
        </div>
    );
}
