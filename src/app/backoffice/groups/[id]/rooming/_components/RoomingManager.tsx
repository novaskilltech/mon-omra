'use client';

import { useState, useEffect } from 'react';
import { User, Hotel, Users, Trash2, Check, AlertCircle, Loader2, Plus, Coffee, Send, Sparkles } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { 
    assignPilgrimToRoom, 
    unassignPilgrimFromRoom, 
    getRoomingState,
    createRoomAction,
    deleteRoomAction,
    toggleRoomBreakfastAction
} from '@/lib/actions/logistics';

export default function RoomingManager({ groupId }: { groupId: string }) {
    const [selectedStay, setSelectedStay] = useState('makkah');
    const { showToast } = useToast();
    const [loading, setLoading] = useState<string | null>(null);
    const [globalLoading, setGlobalLoading] = useState(true);

    // Database states
    const [pilgrims, setPilgrims] = useState<any[]>([]);
    const [stays, setStays] = useState<any[]>([]);
    const [dbRooms, setDbRooms] = useState<any[]>([]);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [groupName, setGroupName] = useState("Chargement...");

    // UI state for creating a room
    const [newRoomNumber, setNewRoomNumber] = useState('');
    const [newRoomType, setNewRoomType] = useState<'DOUBLE' | 'TRIPLE' | 'QUADRUPLE' | 'SUITE'>('DOUBLE');
    const [newRoomBreakfast, setNewRoomBreakfast] = useState(false);
    const [creatingRoom, setCreatingRoom] = useState(false);

    // Click assignment state
    const [selectedPilgrimId, setSelectedPilgrimId] = useState<string | null>(null);
    const [draggedPilgrimId, setDraggedPilgrimId] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, [groupId]);

    const loadData = async () => {
        setGlobalLoading(true);
        try {
            const data = await getRoomingState(groupId);
            setGroupName(data.groupName);
            setPilgrims(data.pilgrims);
            setStays(data.stays);
            setDbRooms(data.rooms);
            setAssignments(data.assignments);
        } catch (e) {
            console.error(e);
            showToast("Erreur lors du chargement des données de rooming.", "error");
        } finally {
            setGlobalLoading(false);
        }
    };

    // Determine current active hotel based on chosen stay city
    const currentStay = stays.find(s => s.city.toUpperCase() === selectedStay.toUpperCase());
    const currentHotelId = currentStay?.hotel_id;
    const currentHotelName = currentStay?.hotel_name || "Non configuré";

    // Rooms for current hotel
    const activeRooms = dbRooms.filter(r => r.hotel_id === currentHotelId);

    // Map database rooms to UI format
    const rooms = activeRooms.map((r, idx) => ({
        id: r.id,
        index: idx + 1,
        room_number: r.room_number || `${idx + 1}`,
        type: r.type,
        capacity: r.capacity,
        has_breakfast: !!r.has_breakfast,
        members: assignments.filter(a => a.room_id === r.id).map(a => a.pilgrim_id)
    }));

    // Unassigned pilgrims for the selected stay (not in any rooms of active hotel)
    const activeHotelRoomIds = activeRooms.map(r => r.id);
    const unassignedPilgrims = pilgrims.filter(p => 
        !assignments.some(a => a.pilgrim_id === p.id && activeHotelRoomIds.includes(a.room_id))
    );

    const handleCreateRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentHotelId) {
            showToast("Veuillez sélectionner un hôtel valide.", "error");
            return;
        }

        setCreatingRoom(true);
        // Calculate capacity based on type
        const capacityMap = { DOUBLE: 2, TRIPLE: 3, QUADRUPLE: 4, SUITE: 6 };
        const capacity = capacityMap[newRoomType];

        try {
            const res = await createRoomAction(
                currentHotelId,
                newRoomType,
                newRoomNumber,
                capacity,
                newRoomBreakfast
            );

            if (res.success && res.room) {
                setDbRooms(prev => [...prev, res.room]);
                setNewRoomNumber('');
                setNewRoomBreakfast(false);
                showToast("Chambre créée avec succès.");
            } else {
                showToast(res.error || "Erreur de création.", "error");
            }
        } catch (err) {
            showToast("Erreur lors de la création de la chambre.", "error");
        } finally {
            setCreatingRoom(false);
        }
    };

    const handleDeleteRoom = async (roomId: string) => {
        if (!confirm("Voulez-vous vraiment supprimer cette chambre ?")) return;
        setLoading(roomId);
        try {
            const res = await deleteRoomAction(roomId);
            if (res.success) {
                setDbRooms(prev => prev.filter(r => r.id !== roomId));
                showToast("Chambre supprimée.");
            } else {
                showToast(res.error || "Erreur de suppression.", "error");
            }
        } catch (err) {
            showToast("Erreur lors de la suppression.", "error");
        } finally {
            setLoading(null);
        }
    };

    const handleToggleBreakfast = async (roomId: string, currentStatus: boolean) => {
        try {
            const res = await toggleRoomBreakfastAction(roomId, !currentStatus);
            if (res.success) {
                setDbRooms(prev => prev.map(r => r.id === roomId ? { ...r, has_breakfast: !currentStatus } : r));
                showToast("Changement du petit-déjeuner enregistré.");
            } else {
                showToast(res.error || "Erreur de modification.", "error");
            }
        } catch (err) {
            showToast("Erreur lors de la modification.", "error");
        }
    };

    // Direct click-to-assign flow
    const handlePilgrimClick = (pilgrimId: string) => {
        if (selectedPilgrimId === pilgrimId) {
            setSelectedPilgrimId(null);
        } else {
            setSelectedPilgrimId(pilgrimId);
            showToast("Sélectionné. Cliquez sur une chambre pour l'y assigner.");
        }
    };

    const handleRoomClick = (roomId: string) => {
        if (selectedPilgrimId) {
            handleAssign(selectedPilgrimId, roomId);
            setSelectedPilgrimId(null);
        }
    };

    // Drag and Drop
    const handleDragStart = (e: React.DragEvent, pilgrimId: string) => {
        setDraggedPilgrimId(pilgrimId);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', pilgrimId);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDropOnRoom = (e: React.DragEvent, roomId: string) => {
        e.preventDefault();
        if (!draggedPilgrimId) return;
        handleAssign(draggedPilgrimId, roomId);
        setDraggedPilgrimId(null);
    };

    const handleDropOnUnassigned = (e: React.DragEvent) => {
        e.preventDefault();
        if (!draggedPilgrimId) return;
        const activeAssignment = assignments.find(a => a.pilgrim_id === draggedPilgrimId && activeHotelRoomIds.includes(a.room_id));
        if (activeAssignment) {
            handleUnassign(draggedPilgrimId, activeAssignment.room_id);
        }
        setDraggedPilgrimId(null);
    };

    const handleAssign = async (pilgrimId: string, roomId: string) => {
        setLoading(pilgrimId);
        try {
            const pilgrim = pilgrims.find(p => p.id === pilgrimId);
            const room = dbRooms.find(r => r.id === roomId);
            
            if (pilgrim && room) {
                // Client-side validations
                const roomAssignments = assignments.filter(a => a.room_id === roomId);
                const existingMembers = roomAssignments.map(a => pilgrims.find(p => p.id === a.pilgrim_id)).filter(Boolean);
                
                const mixedGender = existingMembers.some(m => m!.gender !== pilgrim.gender);
                const differentFamily = existingMembers.some(m => m!.family !== pilgrim.family);

                if (mixedGender && differentFamily) {
                    showToast("Erreur Mahram : Genres différents de familles différentes.", "error");
                    return;
                }

                if (roomAssignments.length >= room.capacity) {
                    showToast("Chambre complète.", "error");
                    return;
                }

                const res = await assignPilgrimToRoom(pilgrimId, roomId, groupId);
                if (res.success) {
                    setAssignments(prev => [...prev, { room_id: roomId, pilgrim_id: pilgrimId }]);
                    showToast("Pèlerin assigné avec succès.");
                } else {
                    showToast(res.error || "Erreur lors de l'assignation.", "error");
                }
            }
        } catch (err) {
            showToast("Erreur lors de l'assignation.", "error");
        } finally {
            setLoading(null);
        }
    };

    const handleUnassign = async (pilgrimId: string, roomId: string) => {
        setLoading(pilgrimId);
        try {
            const res = await unassignPilgrimFromRoom(pilgrimId, roomId, groupId);
            if (res.success) {
                setAssignments(prev => prev.filter(a => !(a.pilgrim_id === pilgrimId && a.room_id === roomId)));
                showToast("Pèlerin retiré de la chambre.");
            } else {
                showToast(res.error || "Erreur lors du retrait.", "error");
            }
        } catch (err) {
            showToast("Erreur lors du retrait.", "error");
        } finally {
            setLoading(null);
        }
    };

    const sendWhatsAppManifest = () => {
        if (!currentStay) return;

        // Generate manifest text
        let text = `*MANIFESTE DE RÉPARTITION DES CHAMBRES*\n`;
        text += `*Hôtel* : ${currentHotelName} (${selectedStay.toUpperCase()})\n`;
        
        // Helper to format date
        const formatDate = (dateStr: string) => {
            return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
        };
        
        if (currentStay.check_in) text += `*Date d'entrée* : ${formatDate(currentStay.check_in)}\n`;
        if (currentStay.check_out) text += `*Date de sortie* : ${formatDate(currentStay.check_out)}\n\n`;

        text += `*RÉPARTITION PAR CHAMBRE :*\n`;

        if (rooms.length === 0) {
            text += `Aucune chambre configurée.\n`;
        } else {
            rooms.forEach(r => {
                const breakfastText = r.has_breakfast ? "Avec petit-déjeuner" : "Sans petit-déjeuner";
                text += `\n*Chambre ${r.room_number} (${r.type} - ${breakfastText})* :\n`;
                
                if (r.members.length === 0) {
                    text += `  _Libre / Disponible_\n`;
                } else {
                    r.members.forEach((mId, idx) => {
                        const pilgrim = pilgrims.find(p => p.id === mId);
                        if (pilgrim) {
                            const dueText = pilgrim.balanceDue > 0 ? ` (Reste à payer sur place : ${pilgrim.balanceDue}€)` : '';
                            text += `  ${idx + 1}. ${pilgrim.name}${dueText}\n`;
                        }
                    });
                }
            });
        }

        const encodedText = encodeURIComponent(text);
        const url = `https://api.whatsapp.com/send?phone=966554318561&text=${encodedText}`;
        window.open(url, '_blank');
    };

    if (globalLoading) {
        return (
            <div className="flex flex-col justify-center items-center py-24 gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
                <p className="text-dim text-xs uppercase tracking-widest font-black">Chargement de la Rooming List...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            {/* Header & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-emerald-500/5 pb-8">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-main">
                        Gestion du <span className="text-emerald-500">Rooming</span>
                    </h2>
                    <p className="text-sub text-xs mt-1 uppercase tracking-widest font-black opacity-40 italic">
                        Hôtel actif : <span className="text-emerald-400 font-bold">{currentHotelName}</span>
                    </p>
                </div>

                <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
                    {/* Stay selector */}
                    <div className="flex bg-emerald-500/5 dark:bg-white/5 p-1 rounded-2xl border border-emerald-500/10 dark:border-white/5 shadow-inner">
                        {['makkah', 'madinah'].map(stay => (
                            <button
                                key={stay}
                                onClick={() => {
                                    setSelectedStay(stay);
                                    setSelectedPilgrimId(null);
                                }}
                                className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${selectedStay === stay
                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                    : 'text-dim hover:text-main'
                                    }`}
                            >
                                {stay === 'makkah' ? '🕋 Makkah' : '🕌 Madinah'}
                            </button>
                        ))}
                    </div>

                    {/* WhatsApp Export */}
                    <button
                        onClick={sendWhatsAppManifest}
                        disabled={!currentStay}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-[10px] uppercase tracking-widest px-5 py-3 rounded-2xl shadow-lg shadow-emerald-600/10 transition-all flex items-center gap-2"
                    >
                        <Send className="w-3.5 h-3.5" /> Manifeste WhatsApp
                    </button>
                </div>
            </div>

            {/* Quick Add Room Form */}
            {currentStay && (
                <form onSubmit={handleCreateRoom} className="glass p-6 rounded-[2rem] border-emerald-500/5 flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex items-center gap-2">
                            <Hotel className="w-5 h-5 text-emerald-500" />
                            <span className="text-xs font-black uppercase tracking-wider text-main">Nouvelle Chambre :</span>
                        </div>
                        <input
                            type="text"
                            placeholder="Ex: 101, A2..."
                            value={newRoomNumber}
                            onChange={(e) => setNewRoomNumber(e.target.value)}
                            required
                            className="bg-emerald-500/5 dark:bg-white/5 border border-emerald-500/10 dark:border-white/5 rounded-xl px-4 py-2 text-xs font-semibold text-main placeholder-dim w-32 focus:outline-none focus:border-emerald-500/30"
                        />
                        <select
                            value={newRoomType}
                            onChange={(e) => setNewRoomType(e.target.value as any)}
                            className="bg-emerald-500/5 dark:bg-white/5 border border-emerald-500/10 dark:border-white/5 rounded-xl px-4 py-2 text-xs font-semibold text-main focus:outline-none w-36"
                        >
                            <option value="DOUBLE">DOUBLE (2 Lits)</option>
                            <option value="TRIPLE">TRIPLE (3 Lits)</option>
                            <option value="QUADRUPLE">QUADRUPLE (4 Lits)</option>
                            <option value="SUITE">SUITE (6 Lits)</option>
                        </select>
                        <label className="flex items-center gap-2 text-xs font-bold text-dim cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={newRoomBreakfast}
                                onChange={(e) => setNewRoomBreakfast(e.target.checked)}
                                className="w-4 h-4 rounded border-emerald-500/20 text-emerald-500 focus:ring-0 cursor-pointer"
                            />
                            Avec Petit-Déjeuner
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={creatingRoom}
                        className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-[9px] uppercase tracking-widest px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
                    >
                        {creatingRoom ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />} Ajouter la chambre
                    </button>
                </form>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Unassigned List (Sidebar) */}
                <div className="lg:col-span-4 space-y-6">
                    <div 
                        className={`glass p-8 rounded-[2.5rem] border-emerald-500/5 dark:border-white/5 shadow-xl min-h-[400px] transition-all ${selectedPilgrimId ? 'ring-2 ring-emerald-500/30 bg-emerald-500/[0.01]' : ''}`}
                        onDragOver={handleDragOver}
                        onDrop={handleDropOnUnassigned}
                    >
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-500 mb-6 flex items-center justify-between">
                            <span>Pèlerins à Assigner ({unassignedPilgrims.length})</span>
                        </h3>

                        {selectedPilgrimId && (
                            <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-3 rounded-xl text-[10px] font-bold uppercase tracking-wider mb-4 flex items-center gap-2 border border-emerald-500/20">
                                <Sparkles className="w-4 h-4 text-emerald-500" />
                                Mode Clic actif. Cliquez sur une chambre ci-contre.
                            </div>
                        )}

                        {pilgrims.length === 0 ? (
                            <div className="text-center py-12 text-dim italic text-xs opacity-50">
                                Aucun pèlerin n'est inscrit dans ce groupe pour le moment.
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                                {unassignedPilgrims.map(p => (
                                    <div 
                                        key={p.id} 
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, p.id)}
                                        onDragEnd={() => setDraggedPilgrimId(null)}
                                        onClick={() => handlePilgrimClick(p.id)}
                                        className={`p-4 bg-emerald-500/[0.03] dark:bg-white/5 border rounded-2xl flex items-center justify-between group hover:border-emerald-500/30 transition-all shadow-sm cursor-grab active:cursor-grabbing ${draggedPilgrimId === p.id ? 'opacity-50 scale-95' : ''} ${selectedPilgrimId === p.id ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/5' : 'border-emerald-500/10 dark:border-white/5'}`}
                                    >
                                        <div className="flex items-center gap-4 pointer-events-none">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-xs font-black text-emerald-600 dark:text-emerald-500 border border-emerald-500/10">
                                                {loading === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : p.name[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-main uppercase tracking-tight">{p.name}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[9px] text-dim uppercase tracking-[0.1em] font-bold opacity-60">
                                                        Famille {p.family} ({p.gender === 'F' ? 'Femme' : 'Homme'})
                                                    </span>
                                                    {p.balanceDue > 0 && (
                                                        <span className="bg-red-500/10 text-red-600 dark:text-red-400 text-[8px] font-black uppercase px-2 py-0.5 rounded border border-red-500/20">
                                                            Dû : {p.balanceDue}€
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {unassignedPilgrims.length === 0 && pilgrims.length > 0 && (
                                    <div className="text-center py-12 text-dim italic text-xs flex flex-col items-center gap-4 opacity-40">
                                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                            <Check className="w-8 h-8 text-emerald-500" />
                                        </div>
                                        <span className="font-black uppercase tracking-widest text-[10px]">Tous les pèlerins sont logés.</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Room Grid (Main) */}
                <div className="lg:col-span-8 flex flex-wrap gap-6 max-h-[75vh] overflow-y-auto pr-2">
                    {!currentStay ? (
                        <div className="w-full glass p-12 rounded-[2.5rem] border-emerald-500/5 text-center flex flex-col items-center justify-center">
                            <AlertCircle className="w-12 h-12 text-dim opacity-30 mb-4" />
                            <h3 className="font-bold text-main uppercase">Aucun hôtel lié</h3>
                            <p className="text-xs text-dim max-w-xs mt-1">
                                Associez d'abord un hôtel de {selectedStay === 'makkah' ? 'Makkah' : 'Médine'} à ce groupe dans l'onglet Groupes.
                            </p>
                        </div>
                    ) : rooms.length === 0 ? (
                        <div className="w-full glass p-12 rounded-[2.5rem] border-emerald-500/5 text-center flex flex-col items-center justify-center py-20">
                            <Hotel className="w-12 h-12 text-emerald-500/30 mb-4" />
                            <h3 className="font-black text-main uppercase tracking-tight text-lg">Aucune chambre créée</h3>
                            <p className="text-xs text-dim max-w-sm mt-2 leading-relaxed">
                                Utilisez le formulaire ci-dessus pour ajouter des chambres au besoin pour cet hôtel. Les pèlerins pourront ensuite y être assignés.
                            </p>
                        </div>
                    ) : (
                        rooms.map(room => (
                          <div 
                                key={room.id} 
                                onClick={() => handleRoomClick(room.id)}
                                className={`w-full md:w-[calc(50%-12px)] glass p-8 rounded-[3rem] border relative overflow-hidden group shadow-xl transition-all ${selectedPilgrimId ? 'hover:border-emerald-500 cursor-pointer hover:bg-emerald-500/[0.02]' : 'border-emerald-500/5 dark:border-white/5'}`}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDropOnRoom(e, room.id)}
                            >
                                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Hotel className="w-24 h-24 text-emerald-500" />
                                </div>

                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-8">
                                        <div>
                                            <h4 className="text-2xl font-black uppercase tracking-tighter text-main">Chambre {room.room_number}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-[0.2em]">{room.type}</span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleToggleBreakfast(room.id, room.has_breakfast);
                                                    }}
                                                    className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider flex items-center gap-1 border transition-all ${
                                                        room.has_breakfast
                                                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                            : 'bg-emerald-500/5 text-dim border-emerald-500/10 hover:border-emerald-500/30'
                                                    }`}
                                                >
                                                    <Coffee className="w-2.5 h-2.5" /> {room.has_breakfast ? 'Avec PDJ' : 'Sans PDJ'}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black border shadow-sm ${room.members.length >= room.capacity
                                                ? 'border-red-500/20 text-red-600 dark:text-red-400 bg-red-400/5'
                                                : 'border-emerald-500/10 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5'
                                                }`}>
                                                {room.members.length} / {room.capacity}
                                            </div>
                                            {room.members.length === 0 && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteRoom(room.id);
                                                    }}
                                                    disabled={loading === room.id}
                                                    className="p-1.5 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                    title="Supprimer la chambre vide"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {[...Array(room.capacity)].map((_, i) => {
                                            const pilgrimId = room.members[i];
                                            const pilgrim = pilgrims.find(p => p.id === pilgrimId);

                                            return (
                                                <div 
                                                    key={i} 
                                                    draggable={!!pilgrim}
                                                    onDragStart={pilgrim ? (e) => handleDragStart(e, pilgrim.id) : undefined}
                                                    onDragEnd={() => setDraggedPilgrimId(null)}
                                                    className={`p-4 rounded-2xl flex items-center justify-between border transition-all ${pilgrim ? 'bg-emerald-500/5 dark:bg-white/5 border-emerald-500/10 dark:border-white/10 shadow-inner cursor-grab active:cursor-grabbing' : 'border-dashed border-emerald-500/10 dark:border-white/5 text-dim opacity-30'
                                                    } ${draggedPilgrimId === pilgrimId ? 'opacity-50 scale-95' : ''}`}
                                                >
                                                    {pilgrim ? (
                                                        <>
                                                            <div className="flex items-center gap-3 pointer-events-none">
                                                                <User className="w-4 h-4 text-emerald-500" />
                                                                <span className="text-xs font-black uppercase tracking-tight text-main">{pilgrim.name}</span>
                                                            </div>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleUnassign(pilgrim.id, room.id); }}
                                                                className="p-2 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                                            >
                                                                 <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <div className="flex items-center gap-3 pointer-events-none">
                                                            <div className="w-2 h-2 rounded-full bg-emerald-500/20" />
                                                            <span className="text-[10px] uppercase font-black tracking-widest">Lit {String.fromCharCode(65 + i)} disponible</span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
