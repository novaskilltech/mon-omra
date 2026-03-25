'use client';

import { Bell, Info, AlertTriangle, Bus, Sparkles, Check } from 'lucide-react';

const ICONS = {
    INFO: Info,
    URGENT: AlertTriangle,
    LOGISTICS: Bus,
    RITUAL: Sparkles,
};

const COLORS = {
    INFO: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20',
    URGENT: 'text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20 animate-pulse',
    LOGISTICS: 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    RITUAL: 'text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
};

export default function NotificationCard({ notification, onRead }: { notification: any, onRead: () => void }) {
    const Icon = (ICONS as any)[notification.type] || Info;
    const colorClass = (COLORS as any)[notification.type] || COLORS.INFO;

    return (
        <div className={`glass p-5 rounded-[1.8rem] border transition-all shadow-sm ${notification.is_read ? 'opacity-40 grayscale-[0.8]' : 'border-emerald-500/5 dark:border-white/10'}`}>
            <div className="flex gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border ${colorClass.split(' ')[0]} ${colorClass.split(' ')[1]} ${colorClass.split(' ')[2]} ${colorClass.split(' ')[3]}`}>
                    <Icon className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                        <h4 className="font-black text-sm truncate text-main uppercase tracking-tighter">{notification.title}</h4>
                        <span className="text-[10px] text-dim whitespace-nowrap ml-2 font-medium">{notification.time}</span>
                    </div>
                    <p className="text-xs text-sub leading-relaxed mb-3 font-light">
                        {notification.content}
                    </p>

                    {!notification.is_read && (
                        <button
                            onClick={onRead}
                            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-500 hover:text-emerald-400 transition-colors"
                        >
                            <Check className="w-3 h-3" /> Marquer comme lu
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
