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
        <div className="flex gap-4 justify-center items-center py-2 [perspective:800px]">
            {[
                { label: 'Jours', value: timeLeft.days },
                { label: 'Heures', value: timeLeft.hours },
                { label: 'Min', value: timeLeft.minutes },
                { label: 'Sec', value: timeLeft.seconds }
            ].map((unit, idx) => (
                <div key={idx} className="flex flex-col items-center [transform-style:preserve-3d] hover:[transform:rotateY(12deg)_rotateX(8deg)] transition-all duration-300">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-[#090b0a]/90 border border-red-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.15)] relative overflow-hidden group hover:border-red-500/60 hover:shadow-[0_0_25px_rgba(239,68,68,0.35)] transition-all duration-300">
                        {/* High-tech diagonal grid line background overlay */}
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(239,68,68,0.03)_25%,transparent_25%,transparent_50%,rgba(239,68,68,0.03)_50%,rgba(239,68,68,0.03)_75%,transparent_75%,transparent)] bg-[size:6px_6px] pointer-events-none" />
                        
                        {/* Laser Scanline */}
                        <div className="absolute inset-x-0 h-[1.5px] bg-red-500/70 top-0 pointer-events-none animate-pulse" />
                        
                        <span className="text-xl md:text-2xl font-black text-red-500 font-mono tracking-tighter relative z-10 [text-shadow:0_0_10px_rgba(239,68,68,0.85),0_0_20px_rgba(239,68,68,0.4)]">
                            {String(unit.value).padStart(2, '0')}
                        </span>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.15em] text-red-500/60 mt-2 font-mono">{unit.label}</span>
                </div>
            ))}
        </div>
    );
}
