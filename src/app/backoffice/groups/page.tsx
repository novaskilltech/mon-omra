'use client';
import { useState, useEffect } from 'react';
import { Plus, Users, Calendar, ArrowRight, Hotel, Bell, Edit, Trash2, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { getGroupsDetailed, createGroupAction, updateGroupAction, deleteGroupAction, getAvailableFlightsAndHotels } from '@/lib/actions/concierge';

interface Group {
    id: string;
    name: string;
    pelerinCount: number;
    date: string;
    status: 'En préparation' | 'Complet' | 'Brouillon';
    flightDepartureId?: string;
    flightReturnId?: string;
    makkahHotelId?: string;
    madinahHotelId?: string;
}

export default function GroupsPage() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

    // Form fields
    const [name, setName] = useState('');
    const [pelerinCount, setPelerinCount] = useState(0);
    const [date, setDate] = useState('');
    const [status, setStatus] = useState<'En préparation' | 'Complet' | 'Brouillon'>('En préparation');

    // Available options
    const [availableFlights, setAvailableFlights] = useState<any[]>([]);
    const [availableHotels, setAvailableHotels] = useState<any[]>([]);

    // Selected options for logistics
    const [flightDepartureId, setFlightDepartureId] = useState('');
    const [flightReturnId, setFlightReturnId] = useState('');
    const [selectedHotels, setSelectedHotels] = useState<string[]>([]);

    useEffect(() => {
        loadGroups();
    }, []);

    const loadGroups = async () => {
        setLoading(true);
        try {
            const list = await getGroupsDetailed();
            setGroups(list as any);

            const options = await getAvailableFlightsAndHotels();
            setAvailableFlights(options.flights);
            setAvailableHotels(options.hotels);
        } catch (e) {
            console.error("Error loading groups:", e);
        } finally {
            setLoading(false);
        }
    };

    const toggleHotel = (hotelId: string) => {
        setSelectedHotels(prev => 
            prev.includes(hotelId) 
                ? prev.filter(id => id !== hotelId) 
                : [...prev, hotelId]
        );
    };

    const openAddModal = () => {
        setModalMode('add');
        setSelectedGroup(null);
        setName('');
        setPelerinCount(0);
        setDate('2026-05-01');
        setStatus('En préparation');
        setFlightDepartureId('');
        setFlightReturnId('');
        setSelectedHotels([]);
        setIsModalOpen(true);
    };

    const openEditModal = (group: Group) => {
        setModalMode('edit');
        setSelectedGroup(group);
        setName(group.name);
        setPelerinCount(group.pelerinCount);
        setDate(group.date);
        setStatus(group.status);
        setFlightDepartureId(group.flightDepartureId || '');
        setFlightReturnId(group.flightReturnId || '');
        
        const hIds: string[] = [];
        if (group.makkahHotelId) hIds.push(group.makkahHotelId);
        if (group.madinahHotelId) hIds.push(group.madinahHotelId);
        setSelectedHotels(hIds);
        
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !date) return;

        setLoading(true);
        try {
            if (modalMode === 'add') {
                const res = await createGroupAction({
                    name,
                    departureDate: date,
                    status,
                    flightDepartureId: flightDepartureId || undefined,
                    flightReturnId: flightReturnId || undefined,
                    hotelIds: selectedHotels
                });
                if (res.error) alert(res.error);
            } else if (modalMode === 'edit' && selectedGroup) {
                const res = await updateGroupAction(selectedGroup.id, {
                    name,
                    departureDate: date,
                    status,
                    flightDepartureId: flightDepartureId || undefined,
                    flightReturnId: flightReturnId || undefined,
                    hotelIds: selectedHotels
                });
                if (res.error) alert(res.error);
            }
            setIsModalOpen(false);
            await loadGroups();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Voulez-vous vraiment supprimer ce groupe ?")) {
            setLoading(true);
            try {
                const res = await deleteGroupAction(id);
                if (res.error) alert(res.error);
                await loadGroups();
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
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
                    <p className="text-sub text-sm mt-1">Créez et gérez vos départs pour la saison 2026.</p>
                </div>
                <button 
                    onClick={openAddModal}
                    className="btn-premium py-3 px-8 flex items-center gap-2 shadow-xl shadow-emerald-500/10"
                >
                    <Plus className="w-5 h-5" /> Nouveau Groupe
                </button>
            </header>

            <div className="grid grid-cols-1 gap-4">
                {loading && groups.length === 0 ? (
                    <div className="flex justify-center items-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                    </div>
                ) : groups.length === 0 ? (
                    <p className="text-center text-dim text-sm italic py-12">Aucun groupe trouvé dans la base de données. Créez-en un nouveau !</p>
                ) : (
                    groups.map((g) => (
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
                    ))
                )}
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
                                    className="w-full bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/10 rounded-2xl px-5 py-4 text-sm font-medium text-main outline-none focus:border-emerald-500/40 focus:bg-white/10 transition-all"
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
                                        className="w-full bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/10 rounded-2xl px-5 py-4 text-sm font-medium text-main outline-none focus:border-emerald-500/40 focus:bg-white/10 transition-all [color-scheme:dark]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-dim ml-1">Nombre Pèlerins</label>
                                    <input 
                                        type="number" 
                                        value={pelerinCount} 
                                        onChange={(e) => setPelerinCount(parseInt(e.target.value) || 0)} 
                                        className="w-full bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/10 rounded-2xl px-5 py-4 text-sm font-medium text-main outline-none focus:border-emerald-500/40 focus:bg-white/10 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-dim ml-1">Statut</label>
                                <select 
                                    value={status} 
                                    onChange={(e: any) => setStatus(e.target.value)} 
                                    className="w-full bg-[#0b0f0d] dark:bg-[#0b0f0d] border border-white/10 dark:border-white/10 rounded-2xl px-5 py-4 text-sm font-medium text-main outline-none focus:border-emerald-500/40 transition-all"
                                >
                                    <option value="En préparation" className="bg-[#050605] text-main">En préparation</option>
                                    <option value="Complet" className="bg-[#050605] text-main">Complet</option>
                                    <option value="Brouillon" className="bg-[#050605] text-main">Brouillon</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-dim ml-1">Vol Aller</label>
                                    <select 
                                        value={flightDepartureId} 
                                        onChange={(e) => setFlightDepartureId(e.target.value)} 
                                        className="w-full bg-[#0b0f0d] dark:bg-[#0b0f0d] border border-white/10 dark:border-white/10 rounded-2xl px-3 py-3.5 text-xs font-medium text-main outline-none focus:border-emerald-500/40 transition-all"
                                    >
                                        <option value="">-- Aucun vol --</option>
                                        {availableFlights.map((f: any) => {
                                            const seg = f.flight_segments?.[0];
                                            return (
                                                <option key={f.id} value={f.id}>
                                                    {seg ? `${seg.airline} (${seg.flight_number})` : f.id.slice(0, 8)}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-dim ml-1">Vol Retour</label>
                                    <select 
                                        value={flightReturnId} 
                                        onChange={(e) => setFlightReturnId(e.target.value)} 
                                        className="w-full bg-[#0b0f0d] dark:bg-[#0b0f0d] border border-white/10 dark:border-white/10 rounded-2xl px-3 py-3.5 text-xs font-medium text-main outline-none focus:border-emerald-500/40 transition-all"
                                    >
                                        <option value="">-- Aucun vol --</option>
                                        {availableFlights.map((f: any) => {
                                            const seg = f.flight_segments?.[0];
                                            return (
                                                <option key={f.id} value={f.id}>
                                                    {seg ? `${seg.airline} (${seg.flight_number})` : f.id.slice(0, 8)}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 pt-2">
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-emerald-500 ml-1">Hôtels Makkah (Sélectionner)</label>
                                    <div className="glass p-4 rounded-2xl border-white/5 space-y-2.5 max-h-[180px] overflow-y-auto">
                                        {availableHotels.filter((h: any) => h.city?.toUpperCase() === 'MAKKAH').map((h: any) => {
                                            const isChecked = selectedHotels.includes(h.id);
                                            return (
                                                <label key={h.id} className="flex items-center gap-3 cursor-pointer text-xs text-main select-none p-1.5 hover:bg-white/5 rounded-lg transition-all">
                                                    <input 
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => toggleHotel(h.id)}
                                                        className="w-4 h-4 rounded border-white/10 text-emerald-500 focus:ring-emerald-500 bg-[#0b0f0d]"
                                                    />
                                                    <span className={isChecked ? "font-bold text-emerald-400" : ""}>{h.name}</span>
                                                </label>
                                            );
                                        })}
                                        {availableHotels.filter((h: any) => h.city?.toUpperCase() === 'MAKKAH').length === 0 && (
                                            <p className="text-[10px] text-dim italic">Aucun hôtel disponible</p>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-emerald-500 ml-1">Hôtels Madinah (Sélectionner)</label>
                                    <div className="glass p-4 rounded-2xl border-white/5 space-y-2.5 max-h-[180px] overflow-y-auto">
                                        {availableHotels.filter((h: any) => h.city?.toUpperCase() === 'MADINAH').map((h: any) => {
                                            const isChecked = selectedHotels.includes(h.id);
                                            return (
                                                <label key={h.id} className="flex items-center gap-3 cursor-pointer text-xs text-main select-none p-1.5 hover:bg-white/5 rounded-lg transition-all">
                                                    <input 
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => toggleHotel(h.id)}
                                                        className="w-4 h-4 rounded border-white/10 text-emerald-500 focus:ring-emerald-500 bg-[#0b0f0d]"
                                                    />
                                                    <span className={isChecked ? "font-bold text-emerald-400" : ""}>{h.name}</span>
                                                </label>
                                            );
                                        })}
                                        {availableHotels.filter((h: any) => h.city?.toUpperCase() === 'MADINAH').length === 0 && (
                                            <p className="text-[10px] text-dim italic">Aucun hôtel disponible</p>
                                        )}
                                    </div>
                                </div>
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
