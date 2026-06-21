'use client';

import { useState, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle, 
  Utensils, 
  Coffee, 
  Bus, 
  Compass, 
  BookOpen, 
  FlameKindling,
  Users
} from 'lucide-react';
import TimelineItem from './TimelineItem';

interface GuidedActivity {
  time: string;
  title: string;
  location?: string;
  type: string;
  description: string;
}

interface SpiritualActivity {
  title: string;
  desc: string;
}

interface DayProgram {
  day: number;
  date: string;
  city: 'MAKKAH' | 'MADINAH';
  guidedActivities: GuidedActivity[];
  spiritualActivities: SpiritualActivity[];
}

interface ProgramClientProps {
  initialProgram: {
    success: boolean;
    mode: 'MAKKAH_FIRST' | 'MADINAH_FIRST' | 'TWO_OMRAS';
    duration: number;
    days: DayProgram[];
  };
}

const MODE_LABELS = {
  MAKKAH_FIRST: 'Makkah en Premier (Makkah ➔ Médine)',
  MADINAH_FIRST: 'Médine en Premier (Médine ➔ Makkah)',
  TWO_OMRAS: 'Double Omra (Makkah ➔ Médine ➔ Makkah)',
};

export default function ProgramClient({ initialProgram }: ProgramClientProps) {
  const [currentDay, setCurrentDay] = useState(1);
  const [checkedSpiritual, setCheckedSpiritual] = useState<Record<string, boolean>>({});

  const program = initialProgram;
  const currentProgram = program?.days?.find(p => p.day === currentDay) || program?.days?.[0];

  // Load checked items from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('omra_spiritual_program_checklist');
      if (saved) {
        try {
          setCheckedSpiritual(JSON.parse(saved));
        } catch (e) {
          console.error('Error parsing checklist:', e);
        }
      }
    }
  }, []);

  // Save checked items to localStorage
  const handleToggleSpiritual = (day: number, idx: number) => {
    const key = `day_${day}_act_${idx}`;
    const updated = {
      ...checkedSpiritual,
      [key]: !checkedSpiritual[key]
    };
    setCheckedSpiritual(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('omra_spiritual_program_checklist', JSON.stringify(updated));
    }
  };

  if (!program || !program.days || program.days.length === 0) {
    return (
      <div className="text-center py-20 opacity-20 italic text-main">
        <MapPin className="w-12 h-12 mx-auto mb-4" />
        Aucun programme disponible pour le moment...
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      {/* Dynamic Header */}
      <header className="glass px-6 py-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <Calendar className="w-48 h-48 text-emerald-500" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black mb-2 tracking-tighter text-main uppercase">
              VOTRE <span className="text-emerald-500">PROGRAMME</span>
            </h1>
            <p className="text-sub font-light italic">
              Suivre votre itinéraire spirituel au jour le jour.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">
                Itinéraire : {MODE_LABELS[program.mode] || program.mode}
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/5 text-sub px-3 py-1 rounded-full border border-emerald-500/10">
                Durée : {program.duration} Jours
              </span>
            </div>
          </div>
          <div className="text-right self-start md:self-end">
            <span className="text-6xl font-black text-main opacity-[0.03] dark:opacity-[0.05] tracking-tighter absolute right-6 top-12 select-none uppercase">
              Jour {currentDay}
            </span>
            <div className="bg-emerald-500/10 dark:bg-emerald-500/20 px-4 py-2 rounded-2xl border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold inline-block">
              {currentProgram?.date || `Jour ${currentDay}`}
            </div>
          </div>
        </div>
      </header>

      {/* Day Selector Tabs */}
      <div className="flex px-4 py-6 gap-3 overflow-x-auto no-scrollbar scroll-smooth">
        {program.days.map(day => (
          <button
            key={day.day}
            onClick={() => setCurrentDay(day.day)}
            className={`flex-shrink-0 w-16 h-20 rounded-[1.5rem] flex flex-col items-center justify-center transition-all border ${
              currentDay === day.day
                ? 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-105'
                : 'glass border-emerald-500/10 text-sub hover:border-emerald-500/30'
            }`}
          >
            <span className="text-[9px] font-black uppercase opacity-50 mb-1">Jour</span>
            <span className="text-2xl font-black">{day.day}</span>
            <span className="text-[8px] font-bold uppercase tracking-tighter opacity-60 mt-0.5">
              {day.city === 'MAKKAH' ? 'Mekkah' : 'Médine'}
            </span>
          </button>
        ))}
      </div>

      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
        {/* Left/Middle: Guided activities timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass p-6 rounded-[2rem] border-emerald-500/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-main uppercase tracking-tighter">Activités de Groupe & Logistique</h2>
                <p className="text-[11px] text-dim font-medium italic">Accompagnement guidé par votre agence</p>
              </div>
            </div>

            <div className="space-y-2">
              {currentProgram && currentProgram.guidedActivities && currentProgram.guidedActivities.length > 0 ? (
                currentProgram.guidedActivities.map((activity, idx) => (
                  <TimelineItem
                    key={idx}
                    activity={activity}
                    isLast={idx === currentProgram.guidedActivities.length - 1}
                  />
                ))
              ) : (
                <div className="text-center py-12 opacity-25 italic text-main">
                  <Compass className="w-10 h-10 mx-auto mb-3" />
                  Aucune activité collective n'est planifiée pour ce jour.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Surerogatory Spiritual recommendations */}
        <div className="space-y-6">
          <div className="glass p-6 rounded-[2rem] border-emerald-500/5 bg-gradient-to-br from-emerald-500/[0.02] via-transparent to-transparent">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-main uppercase tracking-tighter">Conseils & Dévotion</h2>
                <p className="text-[11px] text-dim font-medium italic">Programme individuel surérogatoire</p>
              </div>
            </div>

            <div className="bg-emerald-500/5 rounded-2xl p-4 border border-emerald-500/10 mb-6">
              <p className="text-xs text-sub leading-relaxed font-light">
                Maximisez votre séjour dans la ville sainte de <span className="font-bold text-emerald-600 dark:text-emerald-400">{currentProgram?.city === 'MAKKAH' ? 'Makkah' : 'Médine'}</span> en accomplissant ces actions méritoires facultatives.
              </p>
            </div>

            <div className="space-y-4">
              {currentProgram && currentProgram.spiritualActivities && currentProgram.spiritualActivities.length > 0 ? (
                currentProgram.spiritualActivities.map((act, idx) => {
                  const isChecked = !!checkedSpiritual[`day_${currentDay}_act_${idx}`];
                  return (
                    <div 
                      key={idx}
                      onClick={() => handleToggleSpiritual(currentDay, idx)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex gap-4 items-start ${
                        isChecked 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-main'
                          : 'glass border-emerald-500/5 hover:border-emerald-500/20 text-sub'
                      }`}
                    >
                      <button 
                        className={`flex-shrink-0 w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                          isChecked 
                            ? 'bg-emerald-500 border-emerald-500 text-white' 
                            : 'border-emerald-500/20 bg-emerald-500/5'
                        }`}
                      >
                        {isChecked && <CheckCircle2 className="w-4 h-4" />}
                      </button>
                      <div className="space-y-1">
                        <h4 className={`text-sm font-bold uppercase tracking-tight ${isChecked ? 'line-through opacity-60' : ''}`}>
                          {act.title}
                        </h4>
                        <p className={`text-xs leading-relaxed font-light ${isChecked ? 'opacity-50' : 'text-dim'}`}>
                          {act.desc}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 opacity-25 italic text-main">
                  <BookOpen className="w-10 h-10 mx-auto mb-3" />
                  Aucune recommandation spécifique disponible.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
