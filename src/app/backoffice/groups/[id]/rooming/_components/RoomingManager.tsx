'use client';

import { useState, useEffect } from 'react';
import { User, Hotel, Users, Trash2, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { 
    assignPilgrimToRoom, 
    unassignPilgrimFromRoom, 
    getRoomingState 
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
        type: r.type,
        capacity: r.capacity,
        members: assignments.filter(a => a.room_id === r.id).map(a => a.pilgrim_id)
    }));

    // Unassigned pilgrims for the selected stay (not in any rooms of active hotel)
    const activeHotelRoomIds = activeRooms.map(r => r.id);
    const unassignedPilgrims = pilgrims.filter(p => 
        !assignments.some(a => a.pilgrim_id === p.id && activeHotelRoomIds.includes(a.room_id))
    );

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
            {/* Header & Stay Selector */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-main">
                        Gestion du <span className="text-emerald-500">Rooming</span>
                    </h2>
                    <p className="text-sub text-xs mt-1 uppercase tracking-widest font-black opacity-40 italic">
                        Hôtel actif : <span className="text-emerald-400 font-bold">{currentHotelName}</span>
                    </p>
                </div>

                <div className="flex bg-emerald-500/5 dark:bg-white/5 p-1 rounded-2xl border border-emerald-500/10 dark:border-white/5 shadow-inner">
                    {['makkah', 'madinah'].map(stay => (
                        <button
                            key={stay}
                            onClick={() => setSelectedStay(stay)}
                            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedStay === stay
                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                : 'text-dim hover:text-main'
                                }`}
                        >
                            {stay === 'makkah' ? '🕋 Makkah' : '🕌 Madinah'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Unassigned List (Sidebar) */}
                <div className="lg:col-span-4 space-y-6">
                    <div 
                        className="glass p-8 rounded-[2.5rem] border-emerald-500/5 dark:border-white/5 shadow-xl min-h-[400px]"
                        onDragOver={handleDragOver}
                        onDrop={handleDropOnUnassigned}
                    >
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-500 mb-8 flex items-center justify-between">
                            <span>Pèlerins à Assigner ({unassignedPilgrims.length})</span>
                        </h3>

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
                                        className={`p-4 bg-emerald-500/[0.03] dark:bg-white/5 border border-emerald-500/10 dark:border-white/5 rounded-2xl flex items-center justify-between group hover:border-emerald-500/30 transition-all shadow-sm cursor-grab active:cursor-grabbing ${draggedPilgrimId === p.id ? 'opacity-50 scale-95' : ''}`}
                                    >
                                        <div className="flex items-center gap-4 pointer-events-none">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-xs font-black text-emerald-600 dark:text-emerald-500 border border-emerald-500/10">
                                                {loading === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : p.name[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-main uppercase tracking-tight">{p.name}</p>
                                                <p className="text-[9px] text-dim uppercase tracking-[0.1em] font-bold opacity-60">
                                                    Famille {p.family} ({p.gender === 'F' ? 'Femme' : 'Homme'})
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {rooms.slice(0, 3).map(r => (
                                                <button
                                                    key={r.id}
                                                    onClick={() => handleAssign(p.id, r.id)}
                                                    className="w-8 h-8 rounded-lg bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-emerald-500/10"
                                                    title={`Assigner à la chambre ${r.index}`}
                                                >
                                                    Ch.{r.index}
                                                </button>
                                            ))}
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
                    {activeRooms.length === 0 ? (
                        <div className="w-full glass p-12 rounded-[2.5rem] border-emerald-500/5 text-center flex flex-col items-center justify-center">
                            <AlertCircle className="w-12 h-12 text-dim opacity-30 mb-4" />
                            <h3 className="font-bold text-main uppercase">Aucun hôtel lié</h3>
                            <p className="text-xs text-dim max-w-xs mt-1">
                                Associez d'abord un hôtel de {selectedStay === 'makkah' ? 'Makkah' : 'Médine'} à ce groupe dans l'onglet Groupes.
                            </p>
                        </div>
                    ) : (
                        rooms.map(room => (
                            <div 
                                key={room.id} 
                                className="w-full md:w-[calc(50%-12px)] glass p-8 rounded-[3rem] border-emerald-500/5 dark:border-white/5 relative overflow-hidden group shadow-xl hover:border-emerald-500/20 transition-all"
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDropOnRoom(e, room.id)}
                            >
                                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Hotel className="w-24 h-24 text-emerald-500" />
                                </div>

                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-8 pointer-events-none">
                                        <div>
                                            <h4 className="text-2xl font-black uppercase tracking-tighter text-main">Chambre {room.index}</h4>
                                            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-[0.2em]">{room.type}</span>
                                        </div>
                                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black border shadow-sm ${room.members.length >= room.capacity
                                            ? 'border-red-500/20 text-red-600 dark:text-red-400 bg-red-400/5'
                                            : 'border-emerald-500/10 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5'
                                            }`}>
                                            {room.members.length} / {room.capacity}
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
