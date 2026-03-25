'use client';

import { useState } from 'react';
import { BookOpen, CheckCircle, Circle, MapPin, Navigation, Scissors, Settings, Languages, RotateCcw } from 'lucide-react';
import { RitualStep, markRitualStepComplete, unmarkRitualStep } from '@/lib/actions/rituals';

interface RitualPhase {
    title: string;
    icon: any;
    steps: {
        id: RitualStep;
        label: string;
        description: string;
        dua?: {
            arabic: string;
            phonetic: string;
            french: string;
        };
        requiresCounter?: boolean; // Pour le Tawaf et Sa'i
    }[];
}

const RITUALS: RitualPhase[] = [
    {
        title: "Al-Ihram",
        icon: Settings,
        steps: [
            {
                id: 'ihram_intention',
                label: "L'Intention (An-Niyyah)",
                description: "Au Miqat, formulez l'intention d'accomplir l'Omra.",
                dua: {
                    arabic: "لَبَّيْكَ اللَّهُمَّ عُمْرَةً",
                    phonetic: "Labbayka Llahumma 'Umratan",
                    french: "Me voici, ô Allah, pour accomplir une Omra."
                }
            },
            {
                id: 'ihram_talbiyah',
                label: "La Talbiyah",
                description: "Récitez la Talbiyah continuellement jusqu'à l'arrivée à la Mosquée Sacrée.",
                dua: {
                    arabic: "لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لا شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لا شَرِيكَ لَكَ",
                    phonetic: "Labbayka llahumma labbayk, labbayka la sharika laka labbayk, inna-l-hamda wa-n-ni'mata laka wa-l-mulk, la sharika lak",
                    french: "Me voici ô Seigneur, me voici ! Me voici, Tu n'as pas d'associé, me voici ! En vérité a Toi appartiennent les louanges, les bienfaits et la souveraineté. Tu n'as pas d'associé."
                }
            }
        ]
    },
    {
        title: "At-Tawaf",
        icon: RotateCcw,
        steps: [
            {
                id: 'tawaf_start',
                label: "Début du Tawaf (La Pierre Noire)",
                description: "Commencez le premier de vos 7 tours au niveau de la Pierre Noire.",
                dua: {
                    arabic: "بِسْمِ اللَّهِ، اللَّهُ أَكْبَرُ",
                    phonetic: "Bismillahi Allahu Akbar",
                    french: "Au nom d'Allah, Allah est le plus grand."
                }
            },
            {
                id: 'tawaf_complete',
                label: "Les 7 tours terminés",
                description: "Après avoir terminé les 7 tours, effectuez 2 rak'ats derrière le Maqam Ibrahim, puis buvez de l'eau de Zamzam.",
                requiresCounter: true
            }
        ]
    },
    {
        title: "As-Sa'i",
        icon: Navigation,
        steps: [
            {
                id: 'sai_safa',
                label: "Mont Safa (Début)",
                description: "Montez sur Safa, faites face à la Kaaba et invoquez Allah. C'est le point de départ de votre premier trajet vers Marwa.",
                dua: {
                    arabic: "إِنَّ الصَّفَا وَالْمَرْوَةَ مِن شَعَآئِرِ اللّهِ",
                    phonetic: "Innas-Safa wal Mahrwata min sha'aa'irillaah",
                    french: "En vérité, Safa et Marwa sont parmi les signes d'Allah."
                }
            },
            {
                id: 'sai_complete',
                label: "Les 7 trajets terminés",
                description: "Faites le trajet 7 fois entre Safa et Marwa. Le 7ème trajet se termine à Marwa.",
                requiresCounter: true
            }
        ]
    },
    {
        title: "Halq / Taqsir",
        icon: Scissors,
        steps: [
            {
                id: 'halq_taqsir',
                label: "Le Rasage ou la Coupe",
                description: "Pour l'homme : se raser la tête (préférable) ou couper les cheveux. Pour la femme : couper la longueur d'une phalange.",
                dua: {
                    arabic: "اللَّهُمَّ ارْحَمِ الْمُحَلِّقِينَ",
                    phonetic: "Allahumar-hamil-muhalliqeen",
                    french: "Ô Allah, fais miséricorde à ceux qui se rasent la tête."
                }
            }
        ]
    }
];

export default function RitualGuideContent({ initialProgress }: { initialProgress: RitualStep[] }) {
    const [progress, setProgress] = useState<RitualStep[]>(initialProgress);
    const [loadingStep, setLoadingStep] = useState<string | null>(null);
    const [counter, setCounter] = useState(0); // Optional global counter for Tawaf/Sai

    const handleToggleStep = async (stepId: RitualStep) => {
        setLoadingStep(stepId);
        const isCompleted = progress.includes(stepId);
        
        try {
            if (isCompleted) {
                await unmarkRitualStep(stepId);
                setProgress(progress.filter(id => id !== stepId));
            } else {
                await markRitualStepComplete(stepId);
                setProgress([...progress, stepId]);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingStep(null);
        }
    };

    const isStepCompleted = (stepId: RitualStep) => progress.includes(stepId);

    // Calculate overall progress percentage
    const totalSteps = RITUALS.reduce((acc, phase) => acc + phase.steps.length, 0);
    const progressPercentage = Math.round((progress.length / totalSteps) * 100);

    return (
        <div className="space-y-8">
            {/* Header & Global Progress */}
            <div className="glass p-8 rounded-[3rem] border-emerald-500/10 shadow-sm flex flex-col md:flex-row items-center gap-8 justify-between">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-main">Guide de <span className="text-emerald-500">l'Omra</span></h2>
                    <p className="text-sub font-light mt-2 max-w-md">Suivez ces étapes essentielles pour accomplir votre Omra selon la Sunnah. Que Dieu accepte votre dévotion.</p>
                </div>
                <div className="relative w-32 h-32 flex-shrink-0">
                    <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" className="stroke-emerald-500/10" strokeWidth="10" />
                        <circle cx="50" cy="50" r="45" fill="none" className="stroke-emerald-500 transition-all duration-1000 ease-out" strokeWidth="10" strokeLinecap="round" 
                            strokeDasharray={`${2 * Math.PI * 45}`} 
                            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progressPercentage / 100)}`} 
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-black text-main">{progressPercentage}%</span>
                        <span className="text-[8px] uppercase font-black tracking-widest text-emerald-500">Terminé</span>
                    </div>
                </div>
            </div>

            {/* Stepper / Timeline */}
            <div className="space-y-12 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-emerald-500/20 before:via-emerald-500/20 before:to-transparent">
                
                {RITUALS.map((phase, phaseIndex) => (
                    <div key={phaseIndex} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                        
                        {/* Icon Node */}
                        <div className="flex items-center justify-center w-12 h-12 rounded-full absolute left-0 md:left-1/2 -ml-6 md:-ml-6 bg-white dark:bg-[#050a08] border-2 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)] text-emerald-500 group-hover:scale-110 transition-transform z-10">
                            <phase.icon className="w-5 h-5" />
                        </div>

                        {/* Content Card */}
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] ml-16 md:ml-0 glass p-6 rounded-3xl border border-emerald-500/10 shadow-sm hover:border-emerald-500/30 transition-all">
                            <h3 className="text-xl font-black uppercase tracking-tight text-main mb-6">{phase.title}</h3>
                            
                            <div className="space-y-6">
                                {phase.steps.map((step) => {
                                    const completed = isStepCompleted(step.id);
                                    const loading = loadingStep === step.id;

                                    return (
                                        <div key={step.id} className={`p-5 rounded-2xl border transition-all ${completed ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-black/5 dark:bg-white/5 border-transparent hover:border-emerald-500/10'}`}>
                                            
                                            <div className="flex items-start justify-between gap-4 mb-3">
                                                <div>
                                                    <h4 className={`font-black uppercase tracking-tight ${completed ? 'text-emerald-600 dark:text-emerald-400' : 'text-main'}`}>
                                                        {step.label}
                                                    </h4>
                                                    <p className="text-xs text-sub mt-1 leading-relaxed">{step.description}</p>
                                                </div>
                                                <button 
                                                    onClick={() => handleToggleStep(step.id)}
                                                    disabled={loading}
                                                    className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${loading ? 'opacity-50 cursor-wait' : ''} ${completed ? 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-white/10 text-dim hover:text-emerald-500 border border-current shadow-inner'}`}
                                                >
                                                    {completed ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                                                </button>
                                            </div>

                                            {/* Invocations (Du'a) */}
                                            {step.dua && (
                                                <div className="mt-4 space-y-3 p-4 bg-white/50 dark:bg-black/20 rounded-xl border border-emerald-500/5">
                                                    <div className="text-right">
                                                        <p className="font-arabic text-xl sm:text-2xl text-main leading-loose mb-2 bg-clip-text text-transparent bg-gradient-to-l from-emerald-600 to-main">{step.dua.arabic}</p>
                                                    </div>
                                                    <div className="border-t border-emerald-500/10 pt-3 space-y-2">
                                                        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 italic">"{step.dua.phonetic}"</p>
                                                        <p className="text-[11px] font-black uppercase tracking-wide text-dim">Traduction : <span className="font-medium normal-case text-sub">{step.dua.french}</span></p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Optional Interactive Counter for Tawaf/Sai */}
                                            {step.requiresCounter && !completed && (
                                                <div className="mt-4 flex items-center justify-between p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-500">Compteur (Optionnel)</span>
                                                    <div className="flex items-center gap-4">
                                                        <button 
                                                            onClick={() => setCounter(c => Math.max(0, c - 1))}
                                                            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-main font-black"
                                                        >-</button>
                                                        <span className="font-black text-lg text-main w-8 text-center">{counter} <span className="text-xs opacity-40">/7</span></span>
                                                        <button 
                                                            onClick={() => setCounter(c => Math.min(7, c + 1))}
                                                            className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-black shadow-lg"
                                                        >+</button>
                                                    </div>
                                                </div>
                                            )}

                                        </div>
                                    );
                                })}
                            </div>

                        </div>
                    </div>
                ))}

            </div>
        </div>
    );
}
