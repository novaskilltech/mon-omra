'use client';

import { useState } from 'react';
import { Calendar, ChevronRight, ChevronLeft, MapPin } from 'lucide-react';
import TimelineItem from './_components/TimelineItem';

export default function PilgrimProgramPage() {
    const [currentDay, setCurrentDay] = useState(1);

    const mockProgram = [
        {
            day: 1,
            date: '25 Mars',
            activities: [
                { time: '14:30', title: 'Arrivée à Jeddah (JED)', location: 'Aéroport Roi-Abdelaziz', type: 'TRANSPORT', description: 'Accueil par notre guide local et transfert immédiat vers Makkah en bus climatisé.' },
                { time: '18:00', title: 'Check-in Hôtel', location: 'Hilton Convention Makkah', type: 'REPOS', description: 'Remise des clés et temps libre pour se rafraîchir avant le début des rites.' },
                { time: '21:30', title: 'Omra Collective', location: 'Masjid al-Haram', type: 'RITUEL', description: 'Départ du lobby pour accomplir le Tawaf et le Sa\'y ensemble sous la direction du guide.' }
            ]
        },
        {
            day: 2,
            date: '26 Mars',
            activities: [
                { time: '04:30', title: 'Fajr al-Haram', location: 'Kabatullah', type: 'RITUEL', description: 'Prière du matin en congrégation à la sainte mosquée.' },
                { time: '08:00', title: 'Petit-déjeuner', location: 'Restaurant Al-Falak', type: 'REPAS', description: 'Buffet international servi jusqu\'à 10h30.' },
                { time: '10:30', title: 'Visite (Ziyarat)', location: 'Mont Jabal al-Nour', type: 'ZIYARAT', description: 'Excursion historique vers la grotte de Hira. Prévoir de bonnes chaussures.' }
            ]
        }
    ];

    const currentProgram = mockProgram.find(p => p.day === currentDay) || mockProgram[0];

    return (
        <div className="min-h-screen">
            {/* Dynamic Header */}
            <header className="glass px-6 py-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Calendar className="w-48 h-48 text-emerald-500" />
                </div>
                <div className="relative z-10 flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-black mb-2 tracking-tighter text-main uppercase">VOTRE <span className="text-emerald-500">PROGRAMME</span></h1>
                        <p className="text-sub font-light italic">Suivre votre itinéraire spirituel au jour le jour.</p>
                    </div>
                    <div className="text-right">
                        <span className="text-6xl font-black text-main opacity-[0.03] dark:opacity-[0.05] tracking-tighter absolute right-6 top-12 select-none uppercase">Day {currentDay}</span>
                        <div className="bg-emerald-500/10 dark:bg-emerald-500/20 px-4 py-2 rounded-2xl border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
                            {currentProgram.date}
                        </div>
                    </div>
                </div>
            </header>

            {/* Day Selector */}
            <div className="flex px-4 py-6 gap-3 overflow-x-auto no-scrollbar scroll-smooth">
                {[1, 2, 3, 4, 5, 6, 7].map(day => (
                    <button
                        key={day}
                        onClick={() => setCurrentDay(day)}
                        className={`flex-shrink-0 w-16 h-20 rounded-[1.5rem] flex flex-col items-center justify-center transition-all border ${currentDay === day
                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                            : 'glass border-emerald-500/10 text-sub hover:border-emerald-500/30'
                            }`}
                    >
                        <span className="text-[10px] font-black uppercase opacity-50 mb-1">Jour</span>
                        <span className="text-2xl font-black">{day}</span>
                    </button>
                ))}
            </div>

            {/* Timeline Section */}
            <main className="p-6 space-y-2">
                {currentProgram.activities.length > 0 ? (
                    currentProgram.activities.map((activity, idx) => (
                        <TimelineItem
                            key={idx}
                            activity={activity}
                            isLast={idx === currentProgram.activities.length - 1}
                        />
                    ))
                ) : (
                    <div className="text-center py-20 opacity-20 italic text-main">
                        <MapPin className="w-12 h-12 mx-auto mb-4" />
                        Programme en cours de préparation par votre agence...
                    </div>
                )}
            </main>
        </div>
    );
}
