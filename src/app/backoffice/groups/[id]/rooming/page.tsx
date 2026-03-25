'use client';

import RoomingManager from './_components/RoomingManager';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function GroupRoomingPage({ params }: { params: { id: string } }) {
    const groupName = "Groupe Ramadan Premium";

    return (
        <div className="max-w-7xl mx-auto space-y-8 p-6">
            {/* Navigation Header */}
            <header>
                <Link href={`/backoffice/groups`} className="text-emerald-600 dark:text-emerald-500 hover:text-emerald-500 font-black flex items-center gap-2 text-[10px] uppercase tracking-widest mb-4 transition-all hover:-translate-x-1">
                    <ChevronLeft className="w-4 h-4" /> Retour aux groupes
                </Link>
                <div className="flex items-center gap-4">
                    <h1 className="text-4xl font-black uppercase tracking-tighter text-main">Rooming <span className="text-emerald-500">List</span> <span className="opacity-20 mx-2">/</span> <span className="text-sub opacity-60">{groupName}</span></h1>
                </div>
            </header>

            {/* Main Rooming Surface */}
            <div className="glass p-1 rounded-[3.5rem] border-emerald-500/5">
                <div className="bg-emerald-500/[0.02] dark:bg-[#050a08]/50 p-6 md:p-12 rounded-[3.3rem] backdrop-blur-3xl shadow-xl">
                    <RoomingManager groupId={params.id} />
                </div>
            </div>
        </div>
    );
}
