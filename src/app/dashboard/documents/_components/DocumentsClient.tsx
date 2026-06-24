'use client';

import { useState } from 'react';
import { User, FileCheck, ShieldCheck } from 'lucide-react';
import DocumentUpload from '@/components/documents/DocumentUpload';

interface Document {
    id: string;
    user_id: string;
    type: 'PASSPORT' | 'PHOTO' | 'RESIDENCE_PERMIT' | 'INVOICE';
    file_name: string;
    verified: boolean;
    url?: string;
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
    const invoices = currentTraveler.documents.filter(d => d.type === 'INVOICE');

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

            {/* Factures & Règlements Section */}
            {invoices.length > 0 && (
                <div className="glass p-8 rounded-[2.5rem] border-emerald-500/10 space-y-6">
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-main flex items-center gap-2 m-0">
                            <FileCheck className="w-5 h-5 text-emerald-500" /> Mes Factures & Règlements
                        </h3>
                        <p className="text-xs text-dim mt-1">
                            Retrouvez vos factures émises et effectuez votre virement bancaire pour valider vos règlements.
                        </p>
                    </div>

                    {/* Invoices List */}
                    <div className="grid gap-3">
                        {invoices.map((doc, idx) => (
                            <div key={doc.id} className="flex justify-between items-center bg-[#0b0f0d]/35 p-4 rounded-2xl border border-emerald-500/5">
                                <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                                    <div className="bg-emerald-500/10 p-2 rounded-xl shrink-0">
                                        <FileCheck className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <span className="font-bold text-main block text-xs truncate">Facture #{idx + 1}</span>
                                        <span className="text-dim text-[10px] opacity-75 truncate block">{doc.file_name}</span>
                                    </div>
                                </div>
                                {doc.url ? (
                                    <a 
                                        href={doc.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="btn-premium px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-center shrink-0"
                                    >
                                        Télécharger
                                    </a>
                                ) : (
                                    <span className="text-dim text-[10px] shrink-0 font-bold">Lien expiré</span>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Bank Transfer Instructions */}
                    <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-3xl p-6 space-y-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-500 block font-bold">
                            Instructions de Règlement par Virement
                        </span>
                        <p className="text-xs text-dim leading-relaxed">
                            Pour valider votre règlement, merci d'effectuer le virement bancaire sur le compte de l'agence ci-dessous. Pensez à préciser votre nom en référence de virement.
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono bg-[#0b0f0d]/50 p-4 rounded-2xl border border-emerald-500/5">
                            <div>
                                <span className="text-dim block text-[10px] uppercase font-bold tracking-wider mb-1 font-sans">Bénéficiaire</span>
                                <span className="text-main font-bold">NOVA TRAVEL</span>
                            </div>
                            <div>
                                <span className="text-dim block text-[10px] uppercase font-bold tracking-wider mb-1 font-sans">Banque</span>
                                <span className="text-main font-bold">BNP PARIBAS</span>
                            </div>
                            <div className="sm:col-span-2">
                                <span className="text-dim block text-[10px] uppercase font-bold tracking-wider mb-1 font-sans">IBAN</span>
                                <span className="text-main font-bold select-all">FR76 3000 4000 0012 3456 7890 123</span>
                            </div>
                            <div>
                                <span className="text-dim block text-[10px] uppercase font-bold tracking-wider mb-1 font-sans">Code BIC/SWIFT</span>
                                <span className="text-main font-bold select-all">BNPAFR22XXX</span>
                            </div>
                            <div className="sm:col-span-2">
                                <span className="text-dim block text-[10px] uppercase font-bold tracking-wider mb-1 font-sans font-sans">Référence Obligatoire</span>
                                <span className="text-emerald-500 font-bold select-all">Virement Omra - {currentTraveler.name}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
