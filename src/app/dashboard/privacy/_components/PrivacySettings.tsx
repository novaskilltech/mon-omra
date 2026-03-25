'use client';

import { useState } from 'react';
import { Shield, Download, Trash2, Check, Loader2, Info } from 'lucide-react';

export default function PrivacySettings() {
    const [loading, setLoading] = useState(false);
    const [requested, setRequested] = useState<string | null>(null);

    const handleExport = () => {
        setLoading(true);
        setTimeout(() => {
            setRequested('export');
            setLoading(false);
            // Simulate JSON download
            console.log("Downloading personal data archive...");
        }, 2000);
    };

    const handleDeleteRequest = () => {
        setLoading(true);
        setTimeout(() => {
            setRequested('delete');
            setLoading(false);
        }, 2000);
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-2xl border border-emerald-500/20">
                    <Shield className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-main">Vie Privée & RGPD</h2>
                    <p className="text-dim text-xs italic">Gérez vos données personnelles et vos droits.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Export Data */}
                <div className="glass p-8 rounded-[2.5rem] border-emerald-500/5 dark:border-white/5 group hover:border-emerald-500/20 transition-all shadow-sm">
                    <Download className="w-8 h-8 text-emerald-500 mb-6 group-hover:scale-110 transition-transform" />
                    <h3 className="font-black uppercase tracking-tighter text-main text-lg mb-2">Droit à la portabilité</h3>
                    <p className="text-xs text-sub leading-relaxed mb-8 font-light">
                        Téléchargez l'intégralité de vos données personnelles stockées sur Mon Omra au format JSON (Profil, Vols, Hôtels, Paiements).
                    </p>
                    <button
                        onClick={handleExport}
                        disabled={loading}
                        className="w-full py-4 bg-emerald-500/5 dark:bg-white/5 border border-emerald-500/10 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-main hover:bg-emerald-500/10 transition-all flex items-center justify-center gap-2"
                    >
                        {requested === 'export' ? <Check className="w-4 h-4 text-emerald-500" /> : <Download className="w-4 h-4" />}
                        {requested === 'export' ? "Archive envoyée par email" : "Exporter mes données"}
                        {loading && requested !== 'export' && <Loader2 className="w-3 h-3 animate-spin" />}
                    </button>
                </div>

                {/* Delete Data */}
                <div className="glass p-8 rounded-[2.5rem] border-red-500/5 dark:border-white/5 group hover:border-red-500/20 transition-all shadow-sm">
                    <Trash2 className="w-8 h-8 text-red-500 mb-6 group-hover:scale-110 transition-transform" />
                    <h3 className="font-black uppercase tracking-tighter text-main text-lg mb-2">Droit à l'oubli</h3>
                    <p className="text-xs text-sub leading-relaxed mb-8 font-light">
                        Demandez la suppression définitive de vos données personnelles après votre voyage. Notez que les factures sont conservées 10 ans (légal).
                    </p>
                    <button
                        onClick={handleDeleteRequest}
                        disabled={loading || requested === 'delete'}
                        className="w-full py-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-500 hover:bg-red-500/20 transition-all"
                    >
                        {requested === 'delete' ? "Demande en cours d'examen" : "Supprimer mon compte"}
                    </button>
                </div>
            </div>

            <div className="bg-emerald-500/5 dark:bg-white/5 p-6 rounded-[2rem] border border-emerald-500/10 dark:border-white/5 flex gap-4 items-start shadow-inner">
                <Info className="w-5 h-5 text-emerald-500 dark:text-white/40 shrink-0 mt-1" />
                <p className="text-[10px] text-sub leading-relaxed uppercase tracking-widest font-black opacity-80">
                    Conformément au RGPD, vos données sont stockées de manière sécurisée en UE. Pour toute question, contactez notre DPO à <span className="text-emerald-600 dark:text-emerald-500 font-black">privacy@mon-omra.com</span>.
                </p>
            </div>
        </div>
    );
}
