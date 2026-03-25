'use client';

import { useState } from 'react';
import { Settings, Users, Building2, Save, CheckCircle2, Loader2 } from 'lucide-react';
import { updateAgencySettings } from '@/lib/actions/agency';
import { PricingMode } from '@/types/agency';

interface AgencySettingsContentProps {
    initialSettings: {
        pricing_mode: PricingMode;
    } | null;
}

export default function AgencySettingsContent({ initialSettings }: AgencySettingsContentProps) {
    const [mode, setMode] = useState<PricingMode>(initialSettings?.pricing_mode || 'PER_PERSON');
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        setSuccess(false);

        try {
            const result = await updateAgencySettings(mode);
            if (result.success) {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header className="mb-12">
                <h1 className="text-4xl font-black text-main uppercase tracking-tighter mb-2">Réglages Agence</h1>
                <p className="text-sub italic">Configurez vos préférences de gestion et de tarification.</p>
            </header>

            <div className="grid gap-8">
                {/* Mode de Tarification */}
                <section className="glass p-8 rounded-[2.5rem] border-emerald-500/10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="bg-emerald-500/10 p-3 rounded-2xl">
                            <Settings className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-main uppercase tracking-tight">Mode de Tarification</h2>
                            <p className="text-xs text-dim">Déterminez comment vos tarifs sont calculés par défaut.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={() => setMode('PER_PERSON')}
                            className={`p-6 rounded-3xl border text-left transition-all ${
                                mode === 'PER_PERSON' 
                                ? 'border-emerald-500 bg-emerald-500/5 shadow-lg shadow-emerald-500/10' 
                                : 'border-emerald-500/5 hover:border-emerald-500/20'
                            }`}
                        >
                            <Users className={`w-8 h-8 mb-4 ${mode === 'PER_PERSON' ? 'text-emerald-500' : 'text-dim'}`} />
                            <h3 className="font-black text-main uppercase tracking-tighter mb-1">Par Personne</h3>
                            <p className="text-[11px] text-dim opacity-70 leading-relaxed">
                                Les prix sont définis par pèlerin (ex: Forfait Quadruple à 2490€/personne).
                            </p>
                        </button>

                        <button
                            onClick={() => setMode('PER_ROOM')}
                            className={`p-6 rounded-3xl border text-left transition-all ${
                                mode === 'PER_ROOM' 
                                ? 'border-emerald-500 bg-emerald-500/5 shadow-lg shadow-emerald-500/10' 
                                : 'border-emerald-500/5 hover:border-emerald-500/20'
                            }`}
                        >
                            <Building2 className={`w-8 h-8 mb-4 ${mode === 'PER_ROOM' ? 'text-emerald-500' : 'text-dim'}`} />
                            <h3 className="font-black text-main uppercase tracking-tighter mb-1">Par Chambre</h3>
                            <p className="text-[11px] text-dim opacity-70 leading-relaxed">
                                Les prix sont définis pour la chambre entière (ex: Suite Junior à 450€/nuit).
                            </p>
                        </button>
                    </div>
                </section>

                {/* Submit Bar */}
                <div className="flex items-center justify-between glass p-6 rounded-[2rem] border-emerald-500/10 sticky bottom-8">
                    <div className="flex items-center gap-3">
                        {success && (
                            <div className="flex items-center gap-2 text-emerald-500 text-xs font-black uppercase tracking-widest animate-in fade-in slide-in-from-bottom-2">
                                <CheckCircle2 className="w-4 h-4" />
                                Réglages enregistrés
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="btn-premium px-10 flex items-center gap-2 disabled:opacity-50"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Enregistrement...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Enregistrer les modifications
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
