'use client';

import { useState, useEffect } from 'react';
import BroadcastForm from './_components/BroadcastForm';
import { ChevronLeft, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { getGroup } from '@/lib/actions/logistics';

export default function GroupNotificationsPage({ params }: { params: { id: string } }) {
    const [groupName, setGroupName] = useState("Chargement...");

    useEffect(() => {
        async function loadGroup() {
            try {
                const res = await getGroup(params.id);
                if (res.success && res.group) {
                    setGroupName(res.group.name);
                } else {
                    setGroupName("Sans Groupe");
                }
            } catch (err) {
                console.error(err);
                setGroupName("Erreur de chargement");
            }
        }
        loadGroup();
    }, [params.id]);

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Navigation Header */}
            <header>
                <Link href={`/backoffice/groups/${params.id}/planning`} className="text-emerald-500 hover:text-emerald-400 flex items-center gap-1 text-sm mb-2 transition-colors">
                    <ChevronLeft className="w-4 h-4" /> Retour au planning
                </Link>
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-black uppercase tracking-tighter">Communication <span className="text-white/20">/</span> {groupName}</h1>
                </div>
            </header>

            {/* Broadcast Center */}
            <div className="glass p-1 rounded-[3rem]">
                <div className="bg-[#050a08]/50 p-8 md:p-12 rounded-[2.8rem] backdrop-blur-3xl">
                    <BroadcastForm groupId={params.id} />
                </div>
            </div>

            {/* History Preview Placeholder */}
            <div className="glass p-8 rounded-[2.5rem] border-white/5 opacity-50">
                <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-6 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Historique des messages
                </h3>
                <div className="text-center py-10 italic text-white/20 text-xs">
                    Aucun message envoyé à ce groupe pour le moment.
                </div>
            </div>
        </div>
    );
}
