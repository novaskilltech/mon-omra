'use client';

import { DollarSign, Wallet, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';

interface FinanceSummaryProps {
    data?: {
        totalRevenue: string;
        received: string;
        pending: string;
        completion: number;
    };
}

export default function FinanceSummary({ data: propData }: FinanceSummaryProps) {
    const fallbackData = {
        totalRevenue: "482,000 €",
        received: "312,000 €",
        pending: "170,000 €",
        completion: 64, // percentage
    };
    const data = propData || fallbackData;

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
                    <span className="text-emerald-600 dark:text-emerald-500 font-bold">Collecté</span>
                    <span className="text-dim">Objectif: {data.totalRevenue}</span>
                </div>
                <div className="h-3 w-full bg-emerald-500/5 dark:bg-white/5 rounded-full overflow-hidden border border-emerald-500/10 p-0.5">
                    <div
                        className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.2)] transition-all duration-1000"
                        style={{ width: `${data.completion}%` }}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 relative z-10">
                <div className="bg-emerald-500/5 dark:bg-white/5 p-4 rounded-2xl border border-emerald-500/10 group/card hover:border-emerald-500/20 transition-all">
                    <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-3 h-3 text-amber-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-dim">En attente</span>
                    </div>
                    <p className="text-xl font-bold text-amber-600 dark:text-amber-500">{data.pending}</p>
                </div>
                <div className="bg-emerald-500/5 dark:bg-white/5 p-4 rounded-2xl border border-emerald-500/10 group/card hover:border-emerald-500/20 transition-all">
                    <div className="flex items-center gap-2 mb-1">
                        <Wallet className="w-3 h-3 text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-dim">Virements J5</span>
                    </div>
                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">+12,500 €</p>
                </div>
            </div>
        </div>
    );
}
