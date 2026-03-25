'use client';

import { useState } from 'react';
import { Bell, Search, Filter, MessageSquareOff } from 'lucide-react';
import NotificationCard from './_components/NotificationCard';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([
        { id: 1, type: 'URGENT', title: 'Changement de Point de RDV', content: 'Le bus pour le Ziyarat partira finalement devant la porte 79 du Haram à 08h30 précises.', time: 'Il y a 10 min', is_read: false },
        { id: 2, type: 'RITUAL', title: 'Rappel Rites : Ihram', content: 'N\'oubliez pas de revêtir votre Ihram avant l\'atterrissage à Jeddah. Le Miqat est Juhfah.', time: 'Il y a 2h', is_read: false },
        { id: 3, type: 'LOGISTICS', title: 'Bagages Étiquetés', content: 'Vos bagages ont été récupérés et sont en cours de transfert vers l\'hôtel à Madinah.', time: 'Hier', is_read: true },
        { id: 4, type: 'INFO', title: 'Bienvenue en Arabie', content: 'L\'équipe Mon Omra vous souhaite un excellent séjour spirituel.', time: 'Hier', is_read: true },
    ]);

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    };

    const markAsRead = (id: number) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div className="min-h-screen p-6">
            <header className="flex justify-between items-end mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <h1 className="text-3xl font-black tracking-tighter uppercase text-main">Messages</h1>
                        {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(239,68,68,0.3)] border border-red-500/20">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    <p className="text-dim text-sm">Alertes en temps réel de votre agence.</p>
                </div>
                <button
                    onClick={markAllAsRead}
                    className="p-3 glass rounded-2xl border-emerald-500/10 text-dim hover:text-emerald-500 transition-all shadow-sm"
                    title="Tout marquer comme lu"
                >
                    <Bell className="w-5 h-5" />
                </button>
            </header>

            <div className="space-y-4 mb-20">
                {notifications.length > 0 ? (
                    notifications.map((n) => (
                        <NotificationCard
                            key={n.id}
                            notification={n}
                            onRead={() => markAsRead(n.id)}
                        />
                    ))
                ) : (
                    <div className="py-20 text-center opacity-30">
                        <MessageSquareOff className="w-16 h-16 mx-auto mb-4 text-dim" />
                        <p className="italic text-dim font-light">Aucun nouveau message.</p>
                    </div>
                )}
            </div>

            {/* Quick Filters Placeholder */}
            <div className="fixed bottom-24 left-6 right-6 flex gap-2 overflow-x-auto no-scrollbar pb-4 bg-transparent">
                {['Tous', 'Urgents', 'Logistique', 'Rites'].map((f, i) => (
                    <button key={i} className={`px-5 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-sm ${i === 0 ? 'bg-emerald-500 text-white border-emerald-500' : 'glass border-emerald-500/5 dark:border-white/5 text-dim'}`}>
                        {f}
                    </button>
                ))}
            </div>
        </div>
    );
}
