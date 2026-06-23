'use client';

import { useState } from 'react';
import { User, FileCheck, ShieldCheck } from 'lucide-react';
import DocumentUpload from '@/components/documents/DocumentUpload';

interface Document {
    id: string;
    user_id: string;
    type: 'PASSPORT' | 'PHOTO' | 'RESIDENCE_PERMIT';
    file_name: string;
    verified: boolean;
}

interface Traveler {
    id: string;
    name: string;
    documents: Document[];
}

interface DocumentsClientProps {
    travelers: Traveler[];
}

export default function DocumentsClient({ travelers }: DocumentsClientProps) {
    const [activeTab, setActiveTab] = useState(travelers[0]?.id || '');

    const currentTraveler = travelers.find(t => t.id === activeTab) || travelers[0];
    if (!currentTraveler) return null;

    const getDocs = (type: string) => currentTraveler.documents.filter(d => d.type === type);

    const docConfigs = [
        {
            type: 'PASSPORT' as const,
            label: 'Passeport',
            description: 'Copie lisible de la page d\'identité. Le passeport doit être valide au moins 6 mois après votre retour.',
            existingDocs: getDocs('PASSPORT')
        },
        {
            type: 'PHOTO' as const,
            label: 'Photo d\'identité',
            description: 'Photo récente sur fond blanc, format passeport (e-photo acceptée).',
            existingDocs: getDocs('PHOTO')
        },
        {
            type: 'RESIDENCE_PERMIT' as const,
            label: 'Titre de Séjour',
            description: 'Uniquement pour les résidents non-européens. Copie recto-verso en cours de validité.',
            existingDocs: getDocs('RESIDENCE_PERMIT')
        }
    ];

    return (
        <div className="space-y-8">
            {/* Folder Travelers Tabs */}
            {travelers.length > 1 && (
                <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-dim">Membres du Dossier :</span>
                    <div className="flex flex-wrap gap-2">
                        {travelers.map((traveler) => {
                            const isActive = traveler.id === activeTab;
                            return (
                                <button
                                    key={traveler.id}
                                    onClick={() => setActiveTab(traveler.id)}
                                    className={`py-3 px-6 rounded-2xl text-xs font-bold transition-all duration-300 flex items-center gap-2 border ${
                                        isActive
                                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                                            : 'bg-emerald-500/[0.02] border-emerald-500/5 text-dim hover:border-emerald-500/20 hover:bg-emerald-500/5'
                                    }`}
                                >
                                    <User className="w-3.5 h-3.5" />
                                    {traveler.name}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="grid gap-6">
                {docConfigs.map((config, i) => (
                    <DocumentUpload 
                        key={`${activeTab}-${config.type}`}
                        type={config.type}
                        label={config.label}
                        description={config.description}
                        existingDocs={config.existingDocs}
                        targetUserId={activeTab}
                    />
                ))}
            </div>

            {/* Safety Note */}
            <div className="glass p-8 rounded-[2.5rem] bg-emerald-500/[0.01] border-emerald-500/10 flex gap-6 items-center">
                <div className="bg-emerald-500/10 p-4 rounded-3xl shrink-0">
                    <ShieldCheck className="w-8 h-8 text-emerald-500" />
                </div>
                <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-[0.1em] text-main mb-1">Sécurité de vos données</h4>
                    <p className="text-[12px] text-dim italic opacity-80 leading-relaxed">
                        Vos documents sont chiffrés et stockés sur des serveurs sécurisés. Seuls les agents habilités de l'agence peuvent les consulter.
                    </p>
                </div>
            </div>
        </div>
    );
}
