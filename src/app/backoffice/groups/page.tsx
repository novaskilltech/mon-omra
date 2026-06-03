'use client';
import { useState } from 'react';
import { Plus, Users, Calendar, ArrowRight, Hotel, Bell, Edit, Trash2, X } from 'lucide-react';
import Link from 'next/link';

interface Group {
    id: string;
    name: string;
    pelerinCount: number;
    date: string;
    status: 'En préparation' | 'Complet' | 'Brouillon';
}

export default function GroupsPage() {
    const [groups, setGroups] = useState<Group[]>([
        { id: '1', name: 'Groupe Ramadan A', pelerinCount: 45, date: '2025-03-25', status: 'En préparation' },
        { id: '2', name: 'Pack Économique 01', pelerinCount: 20, date: '2025-04-12', status: 'Complet' },
        { id: '3', name: 'Premium Medina', pelerinCount: 12, date: '2025-05-05', status: 'Brouillon' },
    ]);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

    // Form fields
    const [name, setName] = useState('');
    const [pelerinCount, setPelerinCount] = useState(0);
    const [date, setDate] = useState('');
    const [status, setStatus] = useState<'En préparation' | 'Complet' | 'Brouillon'>('En préparation');

    const openAddModal = () => {
        setModalMode('add');
        setSelectedGroup(null);
        setName('');
        setPelerinCount(0);
        setDate('2025-05-01');
        setStatus('En préparation');
        setIsModalOpen(true);
    };

    const openEditModal = (group: Group) => {
        setModalMode('edit');
        setSelectedGroup(group);
        setName(group.name);
        setPelerinCount(group.pelerinCount);
        setDate(group.date);
        setStatus(group.status);
        setIsModalOpen(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !date) return;

        if (modalMode === 'add') {
            const newGroup: Group = {
                id: Date.now().toString(),
                name,
                pelerinCount: Number(pelerinCount) || 0,
                date,
                status
            };
            setGroups([...groups, newGroup]);
        } else if (modalMode === 'edit' && selectedGroup) {
            setGroups(groups.map(g => g.id === selectedGroup.id ? {
                ...g,
                name,
                pelerinCount: Number(pelerinCount) || 0,
                date,
                status
            } : g));
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id: string) => {
        if (confirm("Voulez-vous vraiment supprimer ce groupe ?")) {
            setGroups(groups.filter(g => g.id !== id));
        }
    };

    const formatDateDisplay = (dateStr: string) => {
        if (!dateStr) return '';
        try {
            const [year, month, day] = dateStr.split('-');
            if (!year || !month || !day) return dateStr;
            const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
            return `${day} ${months[parseInt(month) - 1]} ${year}`;
        } catch (e) {
            return dateStr;
        }
    };

    return (
        <div className="space-y-8 p-6">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter text-main">Gestion des <span className="text-emerald-500">Groupes</span></h1>
                    <p className="text-sub text-sm mt-1">Créez et gérez vos départs pour la saison 2025.</p>
                </div>
                <button 
                    onClick={openAddModal}
                    className="btn-premium py-3 px-8 flex items-center gap-2 shadow-xl shadow-emerald-500/10"
                >
                    <Plus className="w-5 h-5" /> Nouveau Groupe
                </button>
            </header>

            <div className="grid grid-cols-1 gap-4">
                {groups.map((g) => (
                    <div key={g.id} className="glass p-6 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between group hover:border-emerald-500/30 transition-all shadow-sm">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/5 flex items-center justify-center border border-emerald-500/10">
                                <Users className="w-8 h-8 text-emerald-600 dark:text-emerald-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tighter text-main">{g.name}</h3>
                                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-dim mt-2">
                                    <span className="flex items-center gap-2"><Users className="w-4 h-4 text-emerald-500" /> {g.pelerinCount} pèlerins</span>
                                    <span className="flex items-center gap-2 text-sub opacity-20">|</span>
                                    <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-emerald-500" /> {formatDateDisplay(g.date)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 mt-6 md:mt-0">
                            <div className="flex bg-emerald-500/5 dark:bg-white/5 p-1 rounded-2xl border border-emerald-500/10 dark:border-white/5 shadow-inner">
                                <Link href={`/backoffice/groups/${g.id}/planning`} className="p-3 hover:bg-emerald-500/20 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl transition-all text-dim" title="Planning">
                                    <Calendar className="w-5 h-5" />
                                </Link>
                                <Link href={`/backoffice/groups/${g.id}/rooming`} className="p-3 hover:bg-amber-500/20 hover:text-amber-600 dark:hover:text-amber-400 rounded-xl transition-all text-dim" title="Rooming">
                                    <Hotel className="w-5 h-5" />
                                </Link>
                                <Link href={`/backoffice/groups/${g.id}/notifications`} className="p-3 hover:bg-blue-500/20 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all text-dim" title="Broadcast">
                                    <Bell className="w-5 h-5" />
                                </Link>
                            </div>

                            <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border shadow-sm ${g.status === 'Complet' ? 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400' :
                                g.status === 'En préparation' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                                    'bg-gray-500/10 border-gray-500/20 text-dim'
                                }`}>
                                {g.status}
                            </span>
                            
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => openEditModal(g)}
                                    className="p-3 bg-emerald-500/5 hover:bg-emerald-500/10 rounded-2xl border border-emerald-500/10 hover:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 transition-all"
                                    title="Modifier le groupe"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => handleDelete(g.id)}
                                    className="p-3 bg-red-500/5 hover:bg-red-500/10 rounded-2xl border border-red-500/10 hover:border-red-500/30 text-red-600 dark:text-red-500 transition-all"
                                    title="Supprimer"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                <Link href={`/backoffice/groups/${g.id}/planning`} className="p-3.5 bg-white/5 border border-white/5 rounded-full hover:bg-emerald-500/5 text-dim hover:text-emerald-500 transition-all group-hover:scale-105">
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal de Saisie (Add/Edit) */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-[#020302]/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="glass w-full max-w-lg rounded-[2.5rem] border border-emerald-500/15 overflow-hidden animate-in fade-in zoom-in duration-300">
                        <header className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-[#050a08]/30">
                            <h3 className="text-xl font-black uppercase tracking-tighter text-main">
                                {modalMode === 'add' ? 'Nouveau Groupe' : 'Modifier le Groupe'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                                <X className="w-5 h-5 text-dim hover:text-main" />
                            </button>
                        </header>

                        <form onSubmit={handleSave} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-dim ml-1">Nom du Groupe</label>
                                <input 
                                    type="text" 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)} 
                                    required 
                                    placeholder="Ex: Ramadan Premium C" 
                                    className="w-full bg-emerald-500/5 border border-emerald-500/10 rounded-2xl px-5 py-4 text-sm font-medium text-main outline-none focus:border-emerald-500/40 focus:bg-emerald-500/[0.08] transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-dim ml-1">Date de Départ</label>
                                    <input 
                                        type="date" 
                                        value={date} 
                                        onChange={(e) => setDate(e.target.value)} 
                                        required 
                                        className="w-full bg-emerald-500/5 border border-emerald-500/10 rounded-2xl px-5 py-4 text-sm font-medium text-main outline-none focus:border-emerald-500/40 focus:bg-emerald-500/[0.08] transition-all [color-scheme:dark]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-dim ml-1">Nombre Pèlerins</label>
                                    <input 
                                        type="number" 
                                        value={pelerinCount} 
                                        onChange={(e) => setPelerinCount(parseInt(e.target.value) || 0)} 
                                        className="w-full bg-emerald-500/5 border border-emerald-500/10 rounded-2xl px-5 py-4 text-sm font-medium text-main outline-none focus:border-emerald-500/40 focus:bg-emerald-500/[0.08] transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-dim ml-1">Statut</label>
                                <select 
                                    value={status} 
                                    onChange={(e: any) => setStatus(e.target.value)} 
                                    className="w-full bg-emerald-500/5 border border-emerald-500/10 rounded-2xl px-5 py-4 text-sm font-medium text-main outline-none focus:border-emerald-500/40 focus:bg-emerald-500/[0.08] transition-all"
                                >
                                    <option value="En préparation" className="bg-[#050605] text-main">En préparation</option>
                                    <option value="Complet" className="bg-[#050605] text-main">Complet</option>
                                    <option value="Brouillon" className="bg-[#050605] text-main">Brouillon</option>
                                </select>
                            </div>

                            <footer className="pt-4 border-t border-white/5 flex gap-4 justify-end">
                                <button 
                                    type="button" 
                                    onClick={() => setIsModalOpen(false)} 
                                    className="px-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all text-dim"
                                >
                                    Annuler
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn-premium px-8 py-4 shadow-lg shadow-emerald-500/15"
                                >
                                    Enregistrer
                                </button>
                            </footer>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
