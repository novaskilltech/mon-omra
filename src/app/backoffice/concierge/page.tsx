'use client';

import React, { useState, useEffect } from 'react';
import { 
    Users, Plus, Search, User, CreditCard, 
    FileCheck, ShieldAlert, ArrowRight, Loader2, 
    CheckCircle, XCircle, Clock, CheckCircle2,
    DollarSign, BookOpen
} from 'lucide-react';
import { 
    getPilgrimsList, createPilgrim, updateVisaStatus, 
    addPayment, getPilgrimPayments, getGroups 
} from '@/lib/actions/concierge';

export default function ConciergeDashboard() {
    const [pilgrims, setPilgrims] = useState<any[]>([]);
    const [groups, setGroups] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPilgrim, setSelectedPilgrim] = useState<any>(null);
    const [payments, setPayments] = useState<any[]>([]);
    
    // Filters
    const [search, setSearch] = useState('');
    const [groupFilter, setGroupFilter] = useState('');
    const [visaFilter, setVisaFilter] = useState('');

    // Modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [addForm, setAddForm] = useState({
        firstName: '',
        familyName: '',
        email: '',
        gender: 'M' as 'M' | 'F',
        groupId: ''
    });
    
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentForm, setPaymentForm] = useState({
        amount: '',
        method: 'TRANSFER' as 'CASH' | 'TRANSFER' | 'CARD' | 'CHECK',
        reference: ''
    });

    const [showVisaModal, setShowVisaModal] = useState(false);
    const [visaForm, setVisaForm] = useState({
        status: 'APPROVED' as 'PENDING' | 'APPROVED' | 'REJECTED',
        visaUrl: 'https://supabase.co/storage/v1/object/public/visas/visa_approved_sample.pdf'
    });

    useEffect(() => {
        loadData();
    }, [groupFilter, visaFilter]);

    const loadData = async () => {
        setLoading(true);
        try {
            const list = await getPilgrimsList({
                groupId: groupFilter || undefined,
                visaStatus: visaFilter || undefined
            });
            setPilgrims(list);

            const grps = await getGroups();
            setGroups(grps);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPilgrim = async (pilgrim: any) => {
        setSelectedPilgrim(pilgrim);
        try {
            const payList = await getPilgrimPayments(pilgrim.id);
            setPayments(payList);
        } catch (e) {
            console.error(e);
        }
    };

    const handleAddPilgrimSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await createPilgrim(addForm);
            if (res.success) {
                setShowAddModal(false);
                setAddForm({ firstName: '', familyName: '', email: '', gender: 'M', groupId: '' });
                await loadData();
            } else {
                alert(res.error || "Erreur lors de la création");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPilgrim) return;
        setLoading(true);
        try {
            const res = await addPayment(
                selectedPilgrim.id, 
                parseFloat(paymentForm.amount), 
                paymentForm.method, 
                paymentForm.reference
            );
            if (res.success) {
                setShowPaymentModal(false);
                setPaymentForm({ amount: '', method: 'TRANSFER', reference: '' });
                await handleSelectPilgrim(selectedPilgrim);
            } else {
                alert(res.error || "Erreur de règlement");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleVisaSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPilgrim) return;
        setLoading(true);
        try {
            const res = await updateVisaStatus(
                selectedPilgrim.id, 
                visaForm.status, 
                visaForm.status === 'APPROVED' ? visaForm.visaUrl : undefined
            );
            if (res.success) {
                setShowVisaModal(false);
                setSelectedPilgrim({
                    ...selectedPilgrim,
                    visa_status: visaForm.status,
                    visa_url: visaForm.status === 'APPROVED' ? visaForm.visaUrl : ''
                });
                await loadData();
            } else {
                alert(res.error || "Erreur de visa");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Calculation
    const totalPaid = payments.reduce((acc, p) => p.status === 'COMPLETED' ? acc + parseFloat(p.amount) : acc, 0);
    const tripPrice = 2500;
    const remainingBalance = tripPrice - totalPaid;

    const filteredPilgrims = pilgrims.filter(p => 
        `${p.first_name} ${p.family_name}`.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8 font-inter pb-12">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter text-main">Espace <span className="text-emerald-500">Conciergerie</span></h1>
                    <p className="text-dim text-sm mt-1 italic">Administration, validation des visas et encaissements pèlerins.</p>
                </div>
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-500 text-white dark:text-[#050605] rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg hover:shadow-emerald-500/20 active:scale-95"
                >
                    <Plus className="w-4 h-4" /> Ajouter un Pèlerin
                </button>
            </header>

            {/* Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass flex items-center px-4 rounded-2xl border-emerald-500/5">
                    <Search className="w-5 h-5 text-dim mr-2" />
                    <input 
                        type="text" 
                        placeholder="Rechercher un pèlerin..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-transparent border-0 outline-none w-full py-3 text-sm text-main"
                    />
                </div>
                <select 
                    value={groupFilter}
                    onChange={(e) => setGroupFilter(e.target.value)}
                    className="glass px-4 py-3 rounded-2xl border border-emerald-500/5 text-sm text-main outline-none"
                >
                    <option value="" className="bg-[#0b0e0c] text-main">Tous les groupes</option>
                    {groups.map(g => (
                        <option key={g.id} value={g.id} className="bg-[#0b0e0c] text-main">{g.name}</option>
                    ))}
                </select>
                <select 
                    value={visaFilter}
                    onChange={(e) => setVisaFilter(e.target.value)}
                    className="glass px-4 py-3 rounded-2xl border border-emerald-500/5 text-sm text-main outline-none"
                >
                    <option value="" className="bg-[#0b0e0c] text-main">Tous les statuts de Visa</option>
                    <option value="PENDING" className="bg-[#0b0e0c] text-main">En attente / En cours</option>
                    <option value="APPROVED" className="bg-[#0b0e0c] text-main">Approuvé</option>
                    <option value="REJECTED" className="bg-[#0b0e0c] text-main">Rejeté</option>
                </select>
            </div>

            {/* Split Screen Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Side: Pilgrims List */}
                <div className="lg:col-span-5 glass p-6 rounded-[2.5rem] border-emerald-500/5 flex flex-col">
                    <h3 className="text-sm font-black uppercase tracking-wider text-main mb-4 flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-500" /> Pèlerins enregistrés ({filteredPilgrims.length})
                    </h3>
                    
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                        </div>
                    ) : filteredPilgrims.length === 0 ? (
                        <p className="text-center text-dim text-sm italic py-12">Aucun pèlerin trouvé.</p>
                    ) : (
                        <div className="space-y-3 overflow-y-auto max-h-[60vh] pr-2">
                            {filteredPilgrims.map((p) => (
                                <div 
                                    key={p.id}
                                    onClick={() => handleSelectPilgrim(p)}
                                    className={`p-4 rounded-2xl cursor-pointer border transition-all ${
                                        selectedPilgrim?.id === p.id 
                                            ? 'bg-emerald-500/10 border-emerald-500/30 shadow-inner' 
                                            : 'glass border-emerald-500/5 hover:bg-emerald-500/5'
                                    }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-sm text-main uppercase">{p.first_name} {p.family_name}</h4>
                                            <p className="text-[10px] text-dim font-bold uppercase tracking-widest mt-1">{p.group_name}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            {p.visa_status === 'APPROVED' ? (
                                                <span className="bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase px-2 py-0.5 rounded border border-emerald-500/20">Visa OK</span>
                                            ) : p.visa_status === 'REJECTED' ? (
                                                <span className="bg-red-500/10 text-red-500 text-[8px] font-black uppercase px-2 py-0.5 rounded border border-red-500/20">Visa Rejeté</span>
                                            ) : (
                                                <span className="bg-amber-500/10 text-amber-500 text-[8px] font-black uppercase px-2 py-0.5 rounded border border-amber-500/20">Visa En Cours</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Side: Detail Panel */}
                <div className="lg:col-span-7 space-y-6">
                    {selectedPilgrim ? (
                        <div className="glass p-8 rounded-[2.5rem] border-emerald-500/5 space-y-8">
                            {/* Summary Card */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-emerald-500/10">
                                <div>
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500">FICHE DÉTAILLÉE</span>
                                    <h2 className="text-3xl font-black uppercase tracking-tighter text-main mt-1">{selectedPilgrim.first_name} {selectedPilgrim.family_name}</h2>
                                    <p className="text-xs text-dim italic mt-0.5">Groupe : {selectedPilgrim.group_name}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setShowVisaModal(true)}
                                        className="btn-secondary py-3 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-emerald-500/10 hover:bg-emerald-500/5 transition-all text-main"
                                    >
                                        Gérer le Visa
                                    </button>
                                    <button 
                                        onClick={() => setShowPaymentModal(true)}
                                        className="btn-secondary py-3 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-emerald-500/10 hover:bg-emerald-500/5 transition-all text-main"
                                    >
                                        Encaisser Règlement
                                    </button>
                                </div>
                            </div>

                            {/* Two-Column Detail Blocks */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Visa Status Block */}
                                <div className="bg-emerald-500/5 p-6 rounded-3xl border border-emerald-500/10 space-y-4">
                                    <h4 className="text-xs font-black uppercase tracking-wider text-main flex items-center gap-2 m-0">
                                        <FileCheck className="w-4 h-4 text-emerald-500" /> Dossier & Documents
                                    </h4>
                                    <div className="space-y-2 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-dim">Statut Visa :</span>
                                            <span className="font-bold text-main">{selectedPilgrim.visa_status}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-dim">Check-in Pèlerin :</span>
                                            <span className="font-bold text-main">{selectedPilgrim.checkin_done ? 'Prêt' : 'Non validé'}</span>
                                        </div>
                                        {selectedPilgrim.visa_url && (
                                            <div className="mt-3">
                                                <a 
                                                    href={selectedPilgrim.visa_url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-emerald-500 font-bold hover:underline"
                                                >
                                                    Visualiser le document Visa →
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Financial Calculator Block */}
                                <div className="bg-emerald-500/5 p-6 rounded-3xl border border-emerald-500/10 space-y-4">
                                    <h4 className="text-xs font-black uppercase tracking-wider text-main flex items-center gap-2 m-0">
                                        <DollarSign className="w-4 h-4 text-emerald-500" /> Comptabilité Client
                                    </h4>
                                    <div className="space-y-2 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-dim">Total du Pack :</span>
                                            <span className="font-bold text-main">{tripPrice} €</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-dim">Montant encaissé :</span>
                                            <span className="font-bold text-emerald-500">{totalPaid} €</span>
                                        </div>
                                        <div className="flex justify-between border-t border-emerald-500/10 pt-2 font-bold text-sm">
                                            <span className="text-main">Solde Restant :</span>
                                            <span className={remainingBalance <= 0 ? "text-emerald-500" : "text-amber-500"}>
                                                {remainingBalance} €
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Ledger Registry / Payments Table */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-black uppercase tracking-wider text-main flex items-center gap-2 m-0">
                                    <CreditCard className="w-4 h-4 text-emerald-500" /> Registre Ledger des Règlements
                                </h4>
                                {payments.length === 0 ? (
                                    <p className="text-xs text-dim italic">Aucune transaction enregistrée pour ce pèlerin.</p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse text-xs">
                                            <thead>
                                                <tr className="border-b border-emerald-500/10 text-dim">
                                                    <th className="pb-2 font-bold uppercase tracking-wider">Date</th>
                                                    <th className="pb-2 font-bold uppercase tracking-wider">Montant</th>
                                                    <th className="pb-2 font-bold uppercase tracking-wider">Méthode</th>
                                                    <th className="pb-2 font-bold uppercase tracking-wider">Référence</th>
                                                    <th className="pb-2 font-bold uppercase tracking-wider">Statut</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {payments.map((pay) => (
                                                    <tr key={pay.id} className="border-b border-emerald-500/5 text-main">
                                                        <td className="py-2.5">{new Date(pay.created_at).toLocaleDateString('fr-FR')}</td>
                                                        <td className="py-2.5 font-bold">{pay.amount} €</td>
                                                        <td className="py-2.5 font-mono">{pay.method}</td>
                                                        <td className="py-2.5 text-dim">{pay.reference || '-'}</td>
                                                        <td className="py-2.5">
                                                            <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded text-[9px] font-black uppercase">
                                                                {pay.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="glass p-12 rounded-[2.5rem] border-emerald-500/5 text-center flex flex-col items-center justify-center min-h-[40vh]">
                            <User className="w-12 h-12 text-dim opacity-30 mb-4" />
                            <h3 className="font-bold text-main uppercase">Aucun Pèlerin Sélectionné</h3>
                            <p className="text-xs text-dim max-w-xs mt-1">Choisissez un pèlerin dans la liste latérale pour consulter sa fiche comptable, ses vols et gérer son dossier visa.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal: Add Pilgrim */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
                    <form onSubmit={handleAddPilgrimSubmit} className="glass w-full max-w-md p-8 rounded-[2.5rem] border-emerald-500/10 space-y-6">
                        <h3 className="text-xl font-black uppercase tracking-tighter text-main m-0">Nouveau Dossier Pèlerin</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[9px] font-black uppercase tracking-wider text-dim mb-1">Prénom</label>
                                <input 
                                    type="text" 
                                    required
                                    value={addForm.firstName}
                                    onChange={(e) => setAddForm({ ...addForm, firstName: e.target.value })}
                                    className="w-full glass px-4 py-3 rounded-2xl border-emerald-500/5 outline-none text-sm text-main"
                                />
                            </div>
                            <div>
                                <label className="block text-[9px] font-black uppercase tracking-wider text-dim mb-1">Nom de Famille</label>
                                <input 
                                    type="text" 
                                    required
                                    value={addForm.familyName}
                                    onChange={(e) => setAddForm({ ...addForm, familyName: e.target.value })}
                                    className="w-full glass px-4 py-3 rounded-2xl border-emerald-500/5 outline-none text-sm text-main"
                                />
                            </div>
                            <div>
                                <label className="block text-[9px] font-black uppercase tracking-wider text-dim mb-1">Adresse Email</label>
                                <input 
                                    type="email" 
                                    required
                                    value={addForm.email}
                                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                                    className="w-full glass px-4 py-3 rounded-2xl border-emerald-500/5 outline-none text-sm text-main"
                                />
                            </div>
                            <div>
                                <label className="block text-[9px] font-black uppercase tracking-wider text-dim mb-1">Genre</label>
                                <select 
                                    value={addForm.gender}
                                    onChange={(e) => setAddForm({ ...addForm, gender: e.target.value as 'M' | 'F' })}
                                    className="w-full glass px-4 py-3 rounded-2xl border border-emerald-500/5 outline-none text-sm text-main"
                                >
                                    <option value="M" className="bg-[#0b0e0c] text-main">Masculin</option>
                                    <option value="F" className="bg-[#0b0e0c] text-main">Féminin</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[9px] font-black uppercase tracking-wider text-dim mb-1">Groupe de Voyage</label>
                                <select 
                                    value={addForm.groupId}
                                    onChange={(e) => setAddForm({ ...addForm, groupId: e.target.value })}
                                    className="w-full glass px-4 py-3 rounded-2xl border border-emerald-500/5 outline-none text-sm text-main"
                                >
                                    <option value="" className="bg-[#0b0e0c] text-main">Sélectionner un groupe</option>
                                    {groups.map(g => (
                                        <option key={g.id} value={g.id} className="bg-[#0b0e0c] text-main">{g.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button 
                                type="button"
                                onClick={() => setShowAddModal(false)}
                                className="w-1/2 btn-secondary py-3 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-500/10 text-main"
                            >
                                Annuler
                            </button>
                            <button 
                                type="submit"
                                className="w-1/2 px-6 py-3 bg-emerald-600 dark:bg-emerald-500 text-white dark:text-[#050605] rounded-2xl font-black uppercase tracking-widest text-[10px]"
                            >
                                Enregistrer
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Modal: Encaisser règlement */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
                    <form onSubmit={handlePaymentSubmit} className="glass w-full max-w-md p-8 rounded-[2.5rem] border-emerald-500/10 space-y-6">
                        <h3 className="text-xl font-black uppercase tracking-tighter text-main m-0">Saisie de Règlement</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[9px] font-black uppercase tracking-wider text-dim mb-1">Montant (€)</label>
                                <input 
                                    type="number" 
                                    required
                                    placeholder="Ex: 500"
                                    value={paymentForm.amount}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                                    className="w-full glass px-4 py-3 rounded-2xl border-emerald-500/5 outline-none text-sm text-main"
                                />
                            </div>
                            <div>
                                <label className="block text-[9px] font-black uppercase tracking-wider text-dim mb-1">Moyen de Paiement</label>
                                <select 
                                    value={paymentForm.method}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value as any })}
                                    className="w-full glass px-4 py-3 rounded-2xl border border-emerald-500/5 outline-none text-sm text-main"
                                >
                                    <option value="TRANSFER" className="bg-[#0b0e0c] text-main">Virement Bancaire</option>
                                    <option value="CARD" className="bg-[#0b0e0c] text-main">Carte Bancaire</option>
                                    <option value="CASH" className="bg-[#0b0e0c] text-main">Espèces</option>
                                    <option value="CHECK" className="bg-[#0b0e0c] text-main">Chèque</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[9px] font-black uppercase tracking-wider text-dim mb-1">Référence / Numéro</label>
                                <input 
                                    type="text" 
                                    placeholder="Ex: VIR-98212"
                                    value={paymentForm.reference}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                                    className="w-full glass px-4 py-3 rounded-2xl border-emerald-500/5 outline-none text-sm text-main"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button 
                                type="button"
                                onClick={() => setShowPaymentModal(false)}
                                className="w-1/2 btn-secondary py-3 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-500/10 text-main"
                            >
                                Annuler
                            </button>
                            <button 
                                type="submit"
                                className="w-1/2 px-6 py-3 bg-emerald-600 dark:bg-emerald-500 text-white dark:text-[#050605] rounded-2xl font-black uppercase tracking-widest text-[10px]"
                            >
                                Confirmer Encaissement
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Modal: Gérer le Visa */}
            {showVisaModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
                    <form onSubmit={handleVisaSubmit} className="glass w-full max-w-md p-8 rounded-[2.5rem] border-emerald-500/10 space-y-6">
                        <h3 className="text-xl font-black uppercase tracking-tighter text-main m-0">Mise à jour du Visa</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[9px] font-black uppercase tracking-wider text-dim mb-1">Statut du Visa</label>
                                <select 
                                    value={visaForm.status}
                                    onChange={(e) => setVisaForm({ ...visaForm, status: e.target.value as any })}
                                    className="w-full glass px-4 py-3 rounded-2xl border border-emerald-500/5 outline-none text-sm text-main"
                                >
                                    <option value="PENDING" className="bg-[#0b0e0c] text-main">En attente / En cours</option>
                                    <option value="APPROVED" className="bg-[#0b0e0c] text-main">Approuvé</option>
                                    <option value="REJECTED" className="bg-[#0b0e0c] text-main">Rejeté</option>
                                </select>
                            </div>
                            
                            {visaForm.status === 'APPROVED' && (
                                <div>
                                    <label className="block text-[9px] font-black uppercase tracking-wider text-dim mb-1">Lien URL du Visa PDF</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={visaForm.visaUrl}
                                        onChange={(e) => setVisaForm({ ...visaForm, visaUrl: e.target.value })}
                                        className="w-full glass px-4 py-3 rounded-2xl border-emerald-500/5 outline-none text-sm text-main"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex gap-4">
                            <button 
                                type="button"
                                onClick={() => setShowVisaModal(false)}
                                className="w-1/2 btn-secondary py-3 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-500/10 text-main"
                            >
                                Annuler
                            </button>
                            <button 
                                type="submit"
                                className="w-1/2 px-6 py-3 bg-emerald-600 dark:bg-emerald-500 text-white dark:text-[#050605] rounded-2xl font-black uppercase tracking-widest text-[10px]"
                            >
                                Valider Statut
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
