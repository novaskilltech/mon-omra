'use client';

import { DollarSign, Wallet, Clock, TrendingUp } from 'lucide-react';

interface FinanceSummaryProps {
    data?: {
        totalRevenue: string;
        received: string;
        pending: string;
        completion: number;
    };
    loading?: boolean;
}

export default function FinanceSummary({ data: propData, loading }: FinanceSummaryProps) {
    if (loading) {
        return (
            <div className="glass p-8 rounded-[2.5rem] space-y-8 relative overflow-hidden border-emerald-500/5 animate-pulse">
                <div className="flex justify-between items-start relative z-10">
                    <div className="space-y-2">
                        <div className="h-3 w-32 bg-white/10 rounded-full" />
                        <div className="h-9 w-48 bg-white/10 rounded-xl" />
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10" />
                </div>

                <div className="space-y-3 pt-4">
                    <div className="flex justify-between">
                        <div className="h-3 w-20 bg-white/10 rounded-full" />
                        <div className="h-3 w-28 bg-white/10 rounded-full" />
                    </div>
                    <div className="h-3 w-full bg-white/5 rounded-full" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                        <div className="h-3 w-16 bg-white/10 rounded-full" />
                        <div className="h-6 w-24 bg-white/10 rounded-lg" />
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                        <div className="h-3 w-20 bg-white/10 rounded-full" />
                        <div className="h-6 w-24 bg-white/10 rounded-lg" />
                    </div>
                </div>
            </div>
        );
    }

    const data = propData || {
        totalRevenue: "0 €",
        received: "0 €",
        pending: "0 €",
        completion: 0,
    };

    return (
        <div className="glass p-8 rounded-[2.5rem] space-y-8 relative overflow-hidden group border-emerald-500/5">
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 blur-[100px] group-hover:bg-emerald-500/20 transition-all duration-700" />

            <div className="flex justify-between items-start relative z-10">
                <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-dim mb-1">Encaissements Globaux</h3>
                    <p className="text-4xl font-black text-main">{data.received}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center border border-emerald-500/20">
                    <DollarSign className="w-6 h-6 text-emerald-500" />
                </div>
            </div>

            <div className="relative pt-4 z-10">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                    <span className="text-emerald-600 dark:text-emerald-500 font-bold">Collecté ({data.completion}%)</span>
                    <span className="text-dim">Objectif: {data.totalRevenue}</span>
                </div>
                <div className="h-3 w-full bg-emerald-500/5 dark:bg-white/5 rounded-full overflow-hidden border border-emerald-500/10 p-0.5">
                    <div
                        className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.2)] transition-all duration-1000"
                        style={{ width: `${Math.min(100, Math.max(0, data.completion))}%` }}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 relative z-10">
                <div className="bg-emerald-500/5 dark:bg-white/5 p-4 rounded-2xl border border-emerald-500/10 group/card hover:border-emerald-500/20 transition-all">
                    <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-3 h-3 text-amber-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-dim">Reste à encaisser</span>
                    </div>
                    <p className="text-xl font-bold text-amber-600 dark:text-amber-500">{data.pending}</p>
                </div>
                <div className="bg-emerald-500/5 dark:bg-white/5 p-4 rounded-2xl border border-emerald-500/10 group/card hover:border-emerald-500/20 transition-all">
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-3 h-3 text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-dim">Taux d'encaissement</span>
                    </div>
                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{data.completion}%</p>
                </div>
            </div>
        </div>
    );
}

