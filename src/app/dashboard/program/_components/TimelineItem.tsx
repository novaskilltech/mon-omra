'use client';

import { Compass, MapPin, Clock, Utensils, Coffee, Bus, Sparkles } from 'lucide-react';

const ICON_MAP = {
    RITUEL: Sparkles,
    ZIYARAT: MapPin,
    TRANSPORT: Bus,
    REPAS: Utensils,
    REPOS: Coffee,
};

const COLOR_MAP = {
    RITUEL: 'text-amber-600 dark:text-amber-400 bg-amber-500/10',
    ZIYARAT: 'text-purple-600 dark:text-purple-400 bg-purple-500/10',
    TRANSPORT: 'text-blue-600 dark:text-blue-400 bg-blue-500/10',
    REPAS: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
    REPOS: 'text-dim bg-emerald-500/5',
};

export default function TimelineItem({ activity, isLast }: { activity: any, isLast: boolean }) {
    const Icon = (ICON_MAP as any)[activity.type] || Compass;
    const colors = (COLOR_MAP as any)[activity.type] || 'text-main bg-emerald-500/10';

    return (
        <div className="flex gap-6 group">
            {/* Timeline Line */}
            <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border border-emerald-500/10 ${colors.split(' ')[2]} transition-transform duration-300 group-hover:scale-110 shadow-sm shadow-emerald-500/5`}>
                    <Icon className={`w-6 h-6 ${colors.split(' ')[0]} ${colors.split(' ')[1]}`} />
                </div>
                {!isLast && <div className="w-[1px] h-full bg-gradient-to-b from-emerald-500/10 to-transparent my-2" />}
            </div>

            {/* Content Card */}
            <div className="flex-1 pb-10">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2">
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-black tracking-widest text-[#fbbf24] dark:text-[#fbbf24] uppercase bg-emerald-500/5 px-2 py-1 rounded-lg border border-emerald-500/10">{activity.time}</span>
                        <h3 className="text-xl font-black text-main uppercase tracking-tighter">{activity.title}</h3>
                    </div>
                    <span className={`text-[9px] font-black px-3 py-1 rounded-full border border-emerald-500/10 uppercase tracking-widest inline-block self-start ${colors.split(' ')[0]} ${colors.split(' ')[1]}`}>
                        {activity.type}
                    </span>
                </div>

                {activity.location && (
                    <div className="flex items-center gap-1.5 text-dim text-[10px] font-black uppercase tracking-widest mb-4">
                        <MapPin className="w-3 h-3 text-emerald-500" /> {activity.location}
                    </div>
                )}

                <p className="text-sm text-sub leading-relaxed glass p-5 rounded-[1.5rem] border-emerald-500/5 hover:border-emerald-500/20 transition-all font-light">
                    {activity.description}
                </p>
            </div>
        </div>
    );
}
