'use client';

import React, { useState, useTransition } from 'react';
import { 
    CreditCard, Upload, CheckCircle2, Clock, XCircle, AlertCircle, 
    FileText, Copy, Check, ExternalLink, Loader2, ArrowUpRight, ShieldCheck, Info
} from 'lucide-react';
import { submitPilgrimPaymentProofAction, getPaymentProofSignedUrlAction } from '@/lib/actions/concierge';

interface PaymentItem {
    id: string;
    amount: number;
    currency?: string;
    method: string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
    reference?: string | null;
    created_at: string;
    proof_path?: string | null;
    admin_notes?: string | null;
    validated_at?: string | null;
}

interface PaymentManagerProps {
    pilgrimId: string;
    pilgrimName: string;
    packagePrice: number;
    totalPaid: number;
    totalPending: number;
    remainingBalance: number;
    payments: PaymentItem[];
    isPreview?: boolean;
}

export default function PaymentManager({
    pilgrimId,
    pilgrimName,
    packagePrice,
    totalPaid,
    totalPending,
    remainingBalance,
    payments,
    isPreview = false
}: PaymentManagerProps) {
    const [isPending, startTransition] = useTransition();
    const [showModal, setShowModal] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    // Form state
    const [amount, setAmount] = useState<string>('');
    const [method, setMethod] = useState<'TRANSFER' | 'CASH' | 'CHECK'>('TRANSFER');
    const [reference, setReference] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [formSuccess, setFormSuccess] = useState<string | null>(null);

    // Viewing proof state
    const [viewingProofId, setViewingProofId] = useState<string | null>(null);
    const [proofError, setProofError] = useState<string | null>(null);

    const isSoldOut = remainingBalance <= 0;
    const paidPercentage = packagePrice > 0 ? Math.min(100, Math.round((totalPaid / packagePrice) * 100)) : 0;
    const pendingPercentage = packagePrice > 0 ? Math.min(100 - paidPercentage, Math.round((totalPending / packagePrice) * 100)) : 0;

    const copyToClipboard = (text: string, fieldId: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(fieldId);
        setTimeout(() => setCopiedField(null), 2500);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
            if (!allowed.includes(file.type)) {
                setFormError("Format non supporté. Veuillez choisir un fichier PDF, JPG, PNG ou WebP.");
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setFormError("Fichier trop volumineux. La taille maximale autorisée est de 5 Mo.");
                return;
            }
            setFormError(null);
            setSelectedFile(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        setFormSuccess(null);

        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            setFormError("Veuillez renseigner un montant valide supérieur à 0 €.");
            return;
        }

        if (!selectedFile) {
            setFormError("Veuillez joindre votre justificatif de paiement (PDF ou image du reçu de virement).");
            return;
        }

        startTransition(async () => {
            const formData = new FormData();
            formData.append('amount', amount);
            formData.append('method', method);
            formData.append('reference', reference);
            formData.append('file', selectedFile);
            formData.append('pilgrimId', pilgrimId);

            const res = await submitPilgrimPaymentProofAction(formData);
            if (res.error) {
                setFormError(res.error);
            } else {
                setFormSuccess("Votre déclaration de paiement a bien été enregistrée ! L'équipe conciergerie a été notifiée et validera l'encaissement après vérification bancaire.");
                setAmount('');
                setReference('');
                setSelectedFile(null);
                setTimeout(() => {
                    setShowModal(false);
                    setFormSuccess(null);
                }, 3000);
            }
        });
    };

    const handleViewProof = async (payId: string, proofPath: string) => {
        setViewingProofId(payId);
        setProofError(null);
        try {
            const res = await getPaymentProofSignedUrlAction(proofPath);
            if (res.error || !res.signedUrl) {
                setProofError(res.error || "Impossible d'accéder au justificatif.");
            } else {
                window.open(res.signedUrl, '_blank', 'noopener,noreferrer');
            }
        } catch (err: any) {
            setProofError("Erreur lors de l'ouverture du justificatif.");
        } finally {
            setViewingProofId(null);
        }
    };

    return (
        <section className="glass p-8 md:p-10 rounded-[2.5rem] border-emerald-500/10 shadow-sm space-y-8 relative overflow-hidden">
            {/* Background ambient decoration */}
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                <CreditCard className="w-44 h-44 text-emerald-500" />
            </div>

            {/* Header & Main CTA */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
                <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                        <span className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 inline-flex">
                            <CreditCard className="w-5 h-5" />
                        </span>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
                                SUIVI FINANCIER & RÈGLEMENTS
                            </span>
                            <h3 className="text-xl font-black text-main uppercase tracking-tight">
                                Mes Paiements & Solde
                            </h3>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => {
                        setFormError(null);
                        setFormSuccess(null);
                        setShowModal(true);
                    }}
                    className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs uppercase tracking-widest px-6 py-4 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-102 flex items-center justify-center gap-2 cursor-pointer"
                >
                    <Upload className="w-4 h-4" />
                    <span>Déclarer un Paiement</span>
                </button>
            </div>

            {/* Key Financial Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                {/* Forfait Global */}
                <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl space-y-1">
                    <span className="text-dim text-[10px] uppercase tracking-wider font-bold block">
                        Prix du Forfait
                    </span>
                    <p className="text-2xl font-black text-main tracking-tight">
                        {packagePrice.toLocaleString('fr-FR')} €
                    </p>
                    <span className="text-[9px] text-dim font-medium">Forfait complet Omra</span>
                </div>

                {/* Total Validé / Encaissé */}
                <div className="bg-emerald-500/5 border border-emerald-500/20 p-5 rounded-2xl space-y-1">
                    <span className="text-emerald-400 text-[10px] uppercase tracking-wider font-bold block flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Encaissé & Validé
                    </span>
                    <p className="text-2xl font-black text-emerald-400 tracking-tight">
                        {totalPaid.toLocaleString('fr-FR')} €
                    </p>
                    <span className="text-[9px] text-emerald-400/80 font-medium">Reçu sur le compte bancaire</span>
                </div>

                {/* En attente de validation */}
                <div className="bg-amber-500/5 border border-amber-500/20 p-5 rounded-2xl space-y-1">
                    <span className="text-amber-400 text-[10px] uppercase tracking-wider font-bold block flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" /> En vérification
                    </span>
                    <p className="text-2xl font-black text-amber-400 tracking-tight">
                        {totalPending.toLocaleString('fr-FR')} €
                    </p>
                    <span className="text-[9px] text-amber-400/80 font-medium">
                        {totalPending > 0 ? "Pointage agence en cours" : "Aucun paiement en attente"}
                    </span>
                </div>

                {/* Reste à payer */}
                <div className={`p-5 rounded-2xl space-y-1 border ${isSoldOut ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/[0.02] border-white/5'}`}>
                    <span className="text-dim text-[10px] uppercase tracking-wider font-bold block">
                        Reste à solder
                    </span>
                    <p className={`text-2xl font-black tracking-tight ${isSoldOut ? 'text-emerald-400' : 'text-main'}`}>
                        {isSoldOut ? '0 €' : `${remainingBalance.toLocaleString('fr-FR')} €`}
                    </p>
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${isSoldOut ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {isSoldOut ? 'Séjour 100% Soldé ✅' : 'Solde restant'}
                    </span>
                </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="space-y-2 relative z-10">
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
                    <span className="text-dim">Progression des versements</span>
                    <span className="text-main">{paidPercentage}% encaissé {totalPending > 0 ? `(+${pendingPercentage}% en attente)` : ''}</span>
                </div>
                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden flex p-0.5 border border-white/5">
                    {/* Paid segment */}
                    <div 
                        style={{ width: `${paidPercentage}%` }} 
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700 shadow-sm"
                        title={`Encaissé : ${totalPaid} €`}
                    />
                    {/* Pending segment */}
                    {totalPending > 0 && (
                        <div 
                            style={{ width: `${pendingPercentage}%` }} 
                            className="h-full bg-amber-400/80 rounded-full transition-all duration-700 animate-pulse ml-0.5"
                            title={`En attente : ${totalPending} €`}
                        />
                    )}
                </div>
            </div>

            {/* Reassurance banner for pending payments */}
            {totalPending > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-4 flex items-start gap-3 relative z-10">
                    <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                            Paiement en cours de vérification par l'agence
                        </h4>
                        <p className="text-[11px] text-dim leading-relaxed m-0">
                            Votre déclaration de {totalPending} € avec justificatif a bien été transmise. L'agence effectue le pointage de ses comptes bancaires sous 24h à 48h ouvrées. Dès confirmation des fonds, votre solde sera automatiquement mis à jour.
                        </p>
                    </div>
                </div>
            )}

            {/* Payments History Table */}
            <div className="space-y-4 relative z-10 pt-2">
                <div className="flex justify-between items-center">
                    <h4 className="text-xs font-black uppercase tracking-wider text-main flex items-center gap-2 m-0">
                        <FileText className="w-4 h-4 text-emerald-500" /> Historique de mes Règlements ({payments.length})
                    </h4>
                    {proofError && (
                        <span className="text-[10px] text-red-400 font-medium">{proofError}</span>
                    )}
                </div>

                {payments.length === 0 ? (
                    <div className="text-center py-10 bg-white/[0.01] border border-dashed border-white/10 rounded-2xl p-6">
                        <CreditCard className="w-10 h-10 text-dim/40 mx-auto mb-3" />
                        <p className="text-xs text-dim italic m-0">
                            Aucun règlement n'a encore été déclaré. Utilisez le bouton ci-dessus pour envoyer votre premier justificatif de virement.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-2xl border border-white/5">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-white/[0.02] border-b border-white/5 text-dim">
                                    <th className="py-3 px-4 font-bold uppercase tracking-wider">Date</th>
                                    <th className="py-3 px-4 font-bold uppercase tracking-wider">Montant</th>
                                    <th className="py-3 px-4 font-bold uppercase tracking-wider">Mode</th>
                                    <th className="py-3 px-4 font-bold uppercase tracking-wider">Référence</th>
                                    <th className="py-3 px-4 font-bold uppercase tracking-wider">Statut</th>
                                    <th className="py-3 px-4 font-bold uppercase tracking-wider text-right">Justificatif</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map((pay) => {
                                    const isCompleted = pay.status === 'COMPLETED';
                                    const isPendingStatus = pay.status === 'PENDING';
                                    const isFailed = pay.status === 'FAILED';

                                    return (
                                        <tr key={pay.id} className="border-b border-white/5 text-main hover:bg-white/[0.01] transition-colors">
                                            <td className="py-3 px-4 whitespace-nowrap">
                                                {new Date(pay.created_at).toLocaleDateString('fr-FR', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td className="py-3 px-4 font-bold text-sm">
                                                {Number(pay.amount).toLocaleString('fr-FR')} €
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-white/5 text-dim">
                                                    {pay.method === 'TRANSFER' ? 'Virement' : pay.method === 'CASH' ? 'Espèces' : pay.method === 'CHECK' ? 'Chèque' : pay.method}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-dim max-w-[180px] truncate">
                                                {pay.reference || '-'}
                                            </td>
                                            <td className="py-3 px-4">
                                                {isCompleted && (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                        <CheckCircle2 className="w-3 h-3" /> Validé
                                                    </span>
                                                )}
                                                {isPendingStatus && (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
                                                        <Clock className="w-3 h-3" /> En vérification
                                                    </span>
                                                )}
                                                {isFailed && (
                                                    <div className="space-y-0.5">
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase bg-red-500/10 text-red-400 border border-red-500/20">
                                                            <XCircle className="w-3 h-3" /> Non validé
                                                        </span>
                                                        {pay.admin_notes && (
                                                            <p className="text-[10px] text-red-400/90 italic max-w-xs mt-1">
                                                                Motif : {pay.admin_notes}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                {pay.proof_path ? (
                                                    <button
                                                        onClick={() => handleViewProof(pay.id, pay.proof_path!)}
                                                        disabled={viewingProofId === pay.id}
                                                        className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer disabled:opacity-50"
                                                    >
                                                        {viewingProofId === pay.id ? (
                                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        ) : (
                                                            <FileText className="w-3.5 h-3.5" />
                                                        )}
                                                        <span>Voir reçu</span>
                                                    </button>
                                                ) : (
                                                    <span className="text-dim/40 italic text-[10px]">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Declaration Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#0b0e0c] border border-emerald-500/20 rounded-[2rem] max-w-2xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        {/* Close button */}
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-6 right-6 text-dim hover:text-main transition-colors"
                        >
                            <XCircle className="w-6 h-6" />
                        </button>

                        <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
                                DÉCLARATION SÉCURISÉE
                            </span>
                            <h3 className="text-xl font-black text-main uppercase">
                                Déclarer un Règlement & Transmettre le Justificatif
                            </h3>
                            <p className="text-dim text-xs leading-relaxed">
                                Indiquez le montant réglé et joignez votre justificatif de virement bancaire pour validation par notre équipe comptable.
                            </p>
                        </div>

                        {/* Agency Bank Information Card */}
                        <div className="bg-emerald-500/[0.03] border border-emerald-500/15 rounded-2xl p-5 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                                    <ShieldCheck className="w-3.5 h-3.5" /> Coordonnées Bancaires Officielles de l'Agence
                                </span>
                                <span className="text-[9px] text-dim uppercase tracking-wider font-bold">BNP PARIBAS</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                <div>
                                    <span className="text-dim text-[10px] block font-bold uppercase">Bénéficiaire</span>
                                    <span className="font-bold text-main">NOVA TRAVEL</span>
                                </div>
                                <div>
                                    <span className="text-dim text-[10px] block font-bold uppercase">Banque</span>
                                    <span className="font-bold text-main">BNP PARIBAS</span>
                                </div>
                                <div className="sm:col-span-2 flex items-center justify-between bg-black/40 p-2.5 rounded-xl border border-white/5">
                                    <div>
                                        <span className="text-dim text-[9px] block font-bold uppercase">IBAN</span>
                                        <span className="font-mono font-bold text-emerald-400 text-xs select-all">
                                            FR76 3000 4000 0012 3456 7890 123
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => copyToClipboard('FR76 3000 4000 0012 3456 7890 123', 'iban')}
                                        className="p-1.5 rounded-lg bg-white/5 hover:bg-emerald-500/20 text-dim hover:text-emerald-400 transition-all"
                                        title="Copier l'IBAN"
                                    >
                                        {copiedField === 'iban' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                                <div className="sm:col-span-2 flex items-center justify-between bg-black/40 p-2.5 rounded-xl border border-white/5">
                                    <div>
                                        <span className="text-dim text-[9px] block font-bold uppercase">Code BIC / SWIFT</span>
                                        <span className="font-mono font-bold text-main text-xs select-all">
                                            BNPAFR22XXX
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => copyToClipboard('BNPAFR22XXX', 'bic')}
                                        className="p-1.5 rounded-lg bg-white/5 hover:bg-emerald-500/20 text-dim hover:text-emerald-400 transition-all"
                                        title="Copier le BIC"
                                    >
                                        {copiedField === 'bic' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                                <div className="sm:col-span-2 flex items-center justify-between bg-black/40 p-2.5 rounded-xl border border-white/5">
                                    <div>
                                        <span className="text-dim text-[9px] block font-bold uppercase">Libellé obligatoire à indiquer</span>
                                        <span className="font-bold text-amber-400 text-xs select-all">
                                            Virement Omra - {pilgrimName}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => copyToClipboard(`Virement Omra - ${pilgrimName}`, 'ref')}
                                        className="p-1.5 rounded-lg bg-white/5 hover:bg-emerald-500/20 text-dim hover:text-emerald-400 transition-all"
                                        title="Copier le libellé"
                                    >
                                        {copiedField === 'ref' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {formError && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>{formError}</span>
                                </div>
                            )}

                            {formSuccess && (
                                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3.5 rounded-xl text-xs flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                                    <span>{formSuccess}</span>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Montant */}
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-dim mb-1.5">
                                        Montant viré / versé (€) *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="1"
                                            placeholder="Ex: 500"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-main focus:border-emerald-500 outline-none transition-all font-bold"
                                        />
                                        <span className="absolute right-4 top-3 text-dim font-bold text-sm">€</span>
                                    </div>
                                </div>

                                {/* Mode */}
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-dim mb-1.5">
                                        Mode de règlement *
                                    </label>
                                    <select
                                        value={method}
                                        onChange={(e) => setMethod(e.target.value as any)}
                                        className="w-full bg-[#0b0e0c] border border-white/10 rounded-xl px-4 py-3 text-sm text-main focus:border-emerald-500 outline-none transition-all"
                                    >
                                        <option value="TRANSFER">Virement Bancaire (recommandé)</option>
                                        <option value="CASH">Espèces (dépôt en agence)</option>
                                        <option value="CHECK">Chèque</option>
                                    </select>
                                </div>
                            </div>

                            {/* Référence */}
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-wider text-dim mb-1.5">
                                    Référence de virement ou numéro d'opération
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ex: Virement Boursorama REF #98214"
                                    value={reference}
                                    onChange={(e) => setReference(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-main focus:border-emerald-500 outline-none transition-all"
                                />
                            </div>

                            {/* Justificatif Upload */}
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-wider text-dim mb-1.5">
                                    Preuve de paiement (Justificatif bancaire ou reçu) *
                                </label>
                                <div className="border-2 border-dashed border-white/10 hover:border-emerald-500/40 rounded-2xl p-6 text-center transition-all bg-white/[0.01]">
                                    <input
                                        type="file"
                                        id="proofFileInput"
                                        accept=".pdf,image/jpeg,image/png,image/webp"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    <label htmlFor="proofFileInput" className="cursor-pointer block space-y-2">
                                        <Upload className="w-8 h-8 text-emerald-500 mx-auto" />
                                        {selectedFile ? (
                                            <div className="space-y-1">
                                                <p className="text-xs font-bold text-emerald-400 break-all">{selectedFile.name}</p>
                                                <p className="text-[10px] text-dim">
                                                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} Mo • Cliquez pour changer de fichier
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-1">
                                                <p className="text-xs font-bold text-main">
                                                    Cliquez pour choisir un fichier ou glissez-déposez ici
                                                </p>
                                                <p className="text-[10px] text-dim">
                                                    PDF, JPG, PNG, WebP acceptés (max 5 Mo)
                                                </p>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    disabled={isPending}
                                    className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-dim hover:text-main text-xs font-bold uppercase tracking-wider transition-all"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Envoi en cours...</span>
                                        </>
                                    ) : (
                                        <span>Transmettre ma déclaration</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
}
