'use client';

import React, { useState, useEffect } from 'react';

export default function Countdown({ departureDateIso }: { departureDateIso: string }) {
    const [timeLeft, setTimeLeft] = useState<{
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
        isExpired: boolean;
    }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const targetDate = new Date(departureDateIso).getTime();

        const calculateTimeLeft = () => {
            const difference = targetDate - Date.now();
            
            if (difference <= 0) {
                return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
            }

            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
                isExpired: false
            };
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [departureDateIso]);

    if (!mounted) {
        return (
            <div className="flex gap-4 justify-center items-center py-2 animate-pulse">
                <div className="w-16 h-16 rounded-2xl glass border border-emerald-500/10"></div>
                <div className="w-16 h-16 rounded-2xl glass border border-emerald-500/10"></div>
                <div className="w-16 h-16 rounded-2xl glass border border-emerald-500/10"></div>
                <div className="w-16 h-16 rounded-2xl glass border border-emerald-500/10"></div>
            </div>
        );
    }

    if (timeLeft.isExpired) {
        return (
            <div className="text-emerald-500 font-bold uppercase tracking-widest text-[11px] bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-2xl inline-block">
                Bon Voyage pour votre Omra ! 🕋
            </div>
        );
    }

    return (
        <div className="flex gap-3 justify-center md:justify-start items-center">
            {[
                { label: 'Jours', value: timeLeft.days },
                { label: 'Heures', value: timeLeft.hours },
                { label: 'Min', value: timeLeft.minutes },
                { label: 'Sec', value: timeLeft.seconds }
            ].map((unit, idx) => (
                <div key={idx} className="flex flex-col items-center">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl glass border border-emerald-500/15 flex items-center justify-center shadow-lg relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
                        <div className="absolute inset-0 bg-emerald-500/[0.02] group-hover:bg-emerald-500/[0.05] transition-colors" />
                        <span className="text-xl md:text-2xl font-black text-emerald-500 font-mono tracking-tighter relative z-10">
                            {String(unit.value).padStart(2, '0')}
                        </span>
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-dim mt-1.5 opacity-80">{unit.label}</span>
                </div>
            ))}
        </div>
    );
}
