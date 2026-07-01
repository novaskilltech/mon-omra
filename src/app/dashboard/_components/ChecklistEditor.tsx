'use client';

import { useState } from 'react';
import { CheckCircle2, Loader2, Check } from 'lucide-react';
import { updatePilgrimCheckinStatusAction } from '@/lib/actions/logistics';
import { useRouter } from 'next/navigation';

interface ChecklistItem {
    label: string;
    status: string;
    ok: boolean;
}

interface ChecklistEditorProps {
    initialChecklist: ChecklistItem[];
    pilgrimId: string;
}

export default function ChecklistEditor({ initialChecklist, pilgrimId }: ChecklistEditorProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [checklist, setChecklist] = useState<ChecklistItem[]>(initialChecklist);

    const handleToggleCheckin = async () => {
        const checkinItem = checklist.find(item => item.label === 'Check-in');
        if (!checkinItem) return;

        const nextState = !checkinItem.ok;
        setLoading(true);

        try {
            const res = await updatePilgrimCheckinStatusAction(pilgrimId, nextState);
            if (res.success) {
                // Update local UI state
                setChecklist(prev => prev.map(item => {
                    if (item.label === 'Check-in') {
                        return {
                            ...item,
                            ok: nextState,
                            status: nextState ? 'Prêt' : 'À faire'
                        };
                    }
                    return item;
                }));
                router.refresh();
            } else {
                alert(res.error || "Une erreur est survenue lors de la mise à jour.");
            }
        } catch (e) {
            console.error(e);
            alert("Une erreur inattendue est survenue.");
        } finally {
            setLoading(false);
        }
    };

    const completedTasksCount = checklist.filter(item => item.ok).length;
    const completionPercentage = Math.round((completedTasksCount / checklist.length) * 100);

    const checkinDone = checklist.find(item => item.label === 'Check-in')?.ok || false;

    return (
        <div className="glass p-8 rounded-[2.5rem] flex flex-col justify-between border-emerald-500/10 bg-emerald-500/[0.02] shadow-sm min-h-[400px]">
            <div>
                <h3 className="text-xs font-bold mb-6 flex items-center gap-2 uppercase tracking-[0.2em] text-main">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    Ma Préparation
                </h3>
                
                <div className="space-y-6">
                    {checklist.map((d, i) => (
                        <div key={i} className="flex flex-col gap-2">
                            <div className="flex justify-between items-center text-[11px] font-semibold uppercase tracking-tight">
                                <span className="text-dim opacity-80">{d.label}</span>
                                <span className={d.ok ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-amber-600 font-bold"}>{d.status}</span>
                            </div>
                            <div className="h-1.5 w-full bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full overflow-hidden border border-emerald-500/10">
                                <div className={`h-full transition-all duration-1000 ${d.ok ? 'w-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'w-1/4 bg-amber-500'}`} />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 pt-6 border-t border-emerald-500/10">
                    <button
                        onClick={handleToggleCheckin}
                        disabled={loading}
                        className={`w-full py-3.5 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                            checkinDone
                                ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/25'
                                : 'bg-emerald-500 hover:bg-emerald-600 text-[#050605] shadow-lg shadow-emerald-500/10'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : checkinDone ? (
                            <>
                                <Check className="w-4 h-4" /> Check-in Effectué (Annuler)
                            </>
                        ) : (
                            "J'ai fait mon Check-in"
                        )}
                    </button>
                </div>
            </div>

            <div className="mt-8 flex items-center gap-4 p-5 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-3xl border border-emerald-500/10 shadow-inner">
                <div className="text-3xl font-black text-emerald-500 drop-shadow-sm">{completionPercentage}%</div>
                <div className="text-[10px] font-bold uppercase tracking-widest leading-tight text-dim opacity-80">
                    {completionPercentage === 100 ? "Prêt pour le grand départ insha'Allah" : "Dossier en cours de finalisation"}
                </div>
            </div>
        </div>
    );
}
