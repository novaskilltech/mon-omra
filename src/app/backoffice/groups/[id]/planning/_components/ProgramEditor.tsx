'use client';

import { useState } from 'react';
import { Plus, Trash2, Save, GripVertical, Clock, MapPin, Sparkles, Bus, Utensils, Coffee } from 'lucide-react';

const TYPES = [
    { label: 'Rituel', value: 'RITUEL', icon: Sparkles, color: 'text-amber-500' },
    { label: 'Visite', value: 'ZIYARAT', icon: MapPin, color: 'text-purple-500' },
    { label: 'Transport', value: 'TRANSPORT', icon: Bus, color: 'text-blue-500' },
    { label: 'Repas', value: 'REPAS', icon: Utensils, color: 'text-emerald-500' },
    { label: 'Repos', value: 'REPOS', icon: Coffee, color: 'text-dim' },
];

export default function ProgramEditor({ groupId, dayNumber }: { groupId: string, dayNumber: number }) {
    const [activities, setActivities] = useState<any[]>([
        { id: '1', time: '08:00', title: '', location: '', type: 'RITUEL', description: '' }
    ]);

    const addActivity = () => {
        setActivities([...activities, { id: Date.now().toString(), time: '09:00', title: '', location: '', type: 'ZIYARAT', description: '' }]);
    };

    const removeActivity = (id: string) => {
        setActivities(activities.filter(a => a.id !== id));
    };

    const updateActivity = (id: string, field: string, value: string) => {
        setActivities(activities.map(a => a.id === id ? { ...a, [field]: value } : a));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-main">Édition <span className="text-emerald-500">Jour {dayNumber}</span></h2>
                    <p className="text-sub text-xs mt-1 uppercase tracking-widest font-black opacity-40">Configurez les étapes clés de cette journée.</p>
                </div>
                <button className="btn-premium py-3 px-8 flex items-center gap-2 shadow-xl shadow-emerald-500/10">
                    <Save className="w-4 h-4" /> Publier le Planning
                </button>
            </div>

            <div className="space-y-6">
                {activities.map((activity, index) => (
                    <div key={activity.id} className="glass p-6 md:p-8 rounded-[2.5rem] border-emerald-500/5 dark:border-white/5 hover:border-emerald-500/20 dark:hover:border-white/10 transition-all group relative">
                        <div className="absolute -left-2 top-8 w-1 h-12 bg-emerald-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Left Part: Time & Type */}
                            <div className="lg:w-56 space-y-4">
                                <div className="relative">
                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                                    <input
                                        type="time"
                                        value={activity.time}
                                        onChange={(e) => updateActivity(activity.id, 'time', e.target.value)}
                                        className="w-full bg-[#0a0e0c] border border-emerald-500/10 dark:border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm font-black text-main outline-none focus:border-emerald-500 transition-all"
                                    />
                                </div>
                                <div className="grid grid-cols-5 gap-2 p-1 bg-emerald-500/5 dark:bg-white/5 rounded-2xl border border-emerald-500/10 dark:border-white/10">
                                    {TYPES.map(t => (
                                        <button
                                            key={t.value}
                                            onClick={() => updateActivity(activity.id, 'type', t.value)}
                                            title={t.label}
                                            className={`p-2.5 rounded-xl border transition-all flex items-center justify-center ${activity.type === t.value
                                                ? `bg-white dark:bg-white/10 border-emerald-500/20 dark:border-white/20 shadow-sm ${t.color}`
                                                : 'border-transparent text-dim opacity-40 hover:opacity-100 hover:bg-white/50 dark:hover:bg-white/5'
                                                }`}
                                        >
                                            <t.icon className="w-5 h-5" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Right Part: Title & Desc */}
                            <div className="flex-1 space-y-4">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Titre de l'activité (ex: Visite du Mont Ohud)"
                                        value={activity.title}
                                        onChange={(e) => updateActivity(activity.id, 'title', e.target.value)}
                                        className="w-full bg-transparent text-2xl font-black uppercase tracking-tighter outline-none placeholder:text-dim placeholder:opacity-20 text-main focus:text-emerald-500 transition-colors"
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex-1 relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                                        <input
                                            type="text"
                                            placeholder="Lieu de rendez-vous"
                                            value={activity.location}
                                            onChange={(e) => updateActivity(activity.id, 'location', e.target.value)}
                                            className="w-full bg-[#0a0e0c] border border-emerald-500/10 dark:border-white/5 rounded-xl pl-12 pr-4 py-3 text-xs font-bold text-main outline-none focus:border-emerald-500"
                                        />
                                    </div>
                                    <button
                                        onClick={() => removeActivity(activity.id)}
                                        className="p-3 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20 shadow-sm"
                                        title="Supprimer cette étape"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>

                                <textarea
                                    placeholder="Description détaillée, conseils logistiques ou spirituels pour les pèlerins..."
                                    value={activity.description}
                                    onChange={(e) => updateActivity(activity.id, 'description', e.target.value)}
                                    className="w-full bg-[#0a0e0c] border border-emerald-500/10 dark:border-white/5 rounded-2xl px-6 py-4 text-sm font-medium text-sub outline-none focus:border-emerald-500/30 min-h-[100px] resize-none shadow-inner"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={addActivity}
                className="w-full py-6 rounded-[2.5rem] border-2 border-dashed border-emerald-500/20 dark:border-white/10 hover:border-emerald-500 hover:bg-emerald-500/[0.02] text-dim hover:text-emerald-500 transition-all flex flex-col items-center justify-center gap-2 group mb-8"
            >
                <Plus className="w-8 h-8 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Ajouter une étape à cette journée</span>
            </button>
        </div>
    );
}
