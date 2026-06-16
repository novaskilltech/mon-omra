'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2, User, Loader2, Search, Check, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { 
    getHotelRoomingState, 
    createRoomAction, 
    deleteRoomAction, 
    assignPilgrimToRoomFromHotel, 
    unassignPilgrimFromRoomFromHotel 
} from '@/lib/actions/logistics';

interface HotelRoomingModalProps {
    hotelId: string;
    onClose: () => void;
}

export default function HotelRoomingModal({ hotelId, onClose }: HotelRoomingModalProps) {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [hotelName, setHotelName] = useState('');
    const [rooms, setRooms] = useState<any[]>([]);
    const [pilgrims, setPilgrims] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Create room form state
    const [newRoomNumber, setNewRoomNumber] = useState('');
    const [newRoomType, setNewRoomType] = useState<'DOUBLE' | 'TRIPLE' | 'QUADRUPLE'>('DOUBLE');
    
    // Room-specific assigning state
    const [assigningToRoom, setAssigningToRoom] = useState<string | null>(null);

    useEffect(() => {
        loadState();
    }, [hotelId]);

    const loadState = async () => {
        setLoading(true);
        try {
            const state = await getHotelRoomingState(hotelId);
            setHotelName(state.hotelName);
            setRooms(state.rooms);
            setPilgrims(state.pilgrims);
        } catch (err) {
            showToast("Erreur lors du chargement du rooming.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading('create-room');
        try {
            const res = await createRoomAction(hotelId, newRoomNumber, newRoomType);
            if (res.success) {
                showToast("Chambre créée avec succès.");
                setNewRoomNumber('');
                await loadState();
            }
        } catch (err: any) {
            showToast(err.message || "Erreur lors de la création de la chambre.", "error");
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteRoom = async (roomId: string) => {
        setActionLoading(`delete-room-${roomId}`);
        try {
            const res = await deleteRoomAction(roomId);
            if (res?.error) {
                showToast(res.error, "error");
            } else {
                showToast("Chambre supprimée avec succès.");
                await loadState();
            }
        } catch (err: any) {
            showToast(err.message || "Erreur lors de la suppression de la chambre.", "error");
        } finally {
            setActionLoading(null);
        }
    };

    const handleAssign = async (pilgrimId: string, roomId: string) => {
        setActionLoading(`assign-${roomId}`);
        try {
            const res = await assignPilgrimToRoomFromHotel(pilgrimId, roomId);
            if (res?.error) {
                showToast(res.error, "error");
            } else {
                showToast("Pèlerin assigné avec succès.");
                setAssigningToRoom(null);
                await loadState();
            }
        } catch (err: any) {
            showToast(err.message || "Erreur lors de l'assignation.", "error");
        } finally {
            setActionLoading(null);
        }
    };

    const handleUnassign = async (pilgrimId: string, roomId: string) => {
        setActionLoading(`unassign-${pilgrimId}`);
        try {
            const res = await unassignPilgrimFromRoomFromHotel(pilgrimId, roomId);
            if (res.success) {
                showToast("Pèlerin retiré de la chambre.");
                await loadState();
            }
        } catch (err: any) {
            showToast(err.message || "Erreur lors de la désassignation.", "error");
        } finally {
            setActionLoading(null);
        }
    };

    // Filter pilgrims available for assignment
    const assignedPilgrimIds = rooms.flatMap(r => r.assignments.map((a: any) => a.pilgrim_id));
    
    const availablePilgrims = pilgrims.filter(p => {
        // Must not be in any room of this hotel already
        const isAlreadyAssignedInThisHotel = assignedPilgrimIds.includes(p.id);
        if (isAlreadyAssignedInThisHotel) return false;

        // Search query
        if (searchQuery.trim() === '') return true;
        const searchLower = searchQuery.toLowerCase();
        return (
            p.name.toLowerCase().includes(searchLower) ||
            p.family.toLowerCase().includes(searchLower) ||
            p.group_name.toLowerCase().includes(searchLower)
        );
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
            <div className="glass w-full max-w-5xl rounded-[2.5rem] border border-emerald-500/20 shadow-2xl overflow-hidden flex flex-col my-8 bg-[#0a0f0d]/95 max-h-[90vh]">
                
                {/* Header */}
                <div className="p-6 md:p-8 border-b border-white/5 flex justify-between items-center bg-emerald-500/[0.02] shrink-0">
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-tight text-main">{hotelName}</h2>
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Gestion du Rooming & Attribution des Chambres</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5 text-dim hover:text-main"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-4 min-h-[400px]">
                        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                        <p className="text-xs font-bold uppercase tracking-widest text-dim">Chargement des chambres...</p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
                        
                        {/* Create Room form */}
                        <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                            <h3 className="text-xs font-black uppercase tracking-widest text-main mb-4 flex items-center gap-2">
                                <Plus className="w-4 h-4 text-emerald-500" />
                                Créer une nouvelle chambre
                            </h3>
                            <form onSubmit={handleCreateRoom} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-dim mb-2">Numéro / Nom de chambre</label>
                                    <input 
                                        type="text" 
                                        required
                                        placeholder="Ex: Chambre 102"
                                        value={newRoomNumber}
                                        onChange={(e) => setNewRoomNumber(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 text-main transition-colors placeholder:text-white/20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-dim mb-2">Type de chambre</label>
                                    <select 
                                        value={newRoomType}
                                        onChange={(e) => setNewRoomType(e.target.value as any)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 text-main transition-colors appearance-none"
                                    >
                                        <option value="DOUBLE" className="bg-[#0c1210]">DOUBLE (2 Lits)</option>
                                        <option value="TRIPLE" className="bg-[#0c1210]">TRIPLE (3 Lits)</option>
                                        <option value="QUADRUPLE" className="bg-[#0c1210]">QUADRUPLE (4 Lits)</option>
                                    </select>
                                </div>
                                <div>
                                    <button 
                                        type="submit" 
                                        disabled={actionLoading === 'create-room'}
                                        className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex justify-center items-center gap-2"
                                    >
                                        {actionLoading === 'create-room' ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Plus className="w-4 h-4" />
                                                Ajouter la chambre
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Rooms Grid */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-main flex items-center justify-between">
                                <span>Chambres configurées ({rooms.length})</span>
                            </h3>

                            {rooms.length === 0 ? (
                                <div className="text-center p-12 border border-dashed border-white/5 rounded-3xl">
                                    <p className="text-xs text-dim italic">Aucune chambre créée dans cet hôtel. Utilisez le formulaire ci-dessus pour commencer.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {rooms.map((room) => {
                                        const totalOccupants = room.assignments.length;
                                        const capacity = room.capacity;
                                        
                                        return (
                                            <div key={room.id} className="glass p-6 rounded-3xl border border-white/5 hover:border-emerald-500/20 transition-all flex flex-col justify-between">
                                                
                                                {/* Card Header */}
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h4 className="font-bold text-main text-lg uppercase tracking-tight">{room.room_number}</h4>
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500 mt-0.5">
                                                            {room.type} • {totalOccupants} / {capacity} Occupants
                                                        </p>
                                                    </div>
                                                    
                                                    {totalOccupants === 0 ? (
                                                        <button 
                                                            onClick={() => handleDeleteRoom(room.id)}
                                                            disabled={actionLoading === `delete-room-${room.id}`}
                                                            className="p-2 text-dim hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all border border-white/5"
                                                            title="Supprimer la chambre"
                                                        >
                                                            {actionLoading === `delete-room-${room.id}` ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                    ) : (
                                                        <span className="text-[8px] font-black uppercase bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-1 rounded-md">
                                                            Occupée
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Beds */}
                                                <div className="space-y-3 my-4">
                                                    {Array.from({ length: capacity }).map((_, idx) => {
                                                        const assignment = room.assignments[idx];
                                                        
                                                        if (assignment) {
                                                            return (
                                                                <div key={assignment.id || idx} className="flex justify-between items-center p-3 bg-white/[0.02] border border-white/5 rounded-xl text-xs">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                                                                            <User className="w-4 h-4 text-emerald-500" />
                                                                        </div>
                                                                        <div>
                                                                            <p className="font-bold text-main">{assignment.name} {assignment.family}</p>
                                                                            <p className="text-[9px] text-dim">{assignment.gender === 'M' ? 'Homme' : 'Femme'}</p>
                                                                        </div>
                                                                    </div>
                                                                    <button 
                                                                        onClick={() => handleUnassign(assignment.pilgrim_id, room.id)}
                                                                        disabled={actionLoading === `unassign-${assignment.pilgrim_id}`}
                                                                        className="text-[9px] font-black text-red-500 uppercase tracking-widest hover:bg-red-500/10 border border-red-500/20 px-2 py-1.5 rounded-lg transition-all"
                                                                    >
                                                                        {actionLoading === `unassign-${assignment.pilgrim_id}` ? (
                                                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                                        ) : (
                                                                            "Retirer"
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            );
                                                        }

                                                        return (
                                                            <div key={idx} className="p-3 border border-dashed border-white/5 rounded-xl flex items-center justify-between text-xs">
                                                                <span className="text-dim italic">Lit disponible ({idx + 1}/{capacity})</span>
                                                                
                                                                {assigningToRoom === room.id ? (
                                                                    <button 
                                                                        onClick={() => setAssigningToRoom(null)}
                                                                        className="text-[9px] font-black uppercase text-dim tracking-widest hover:bg-white/5 border border-white/10 px-2 py-1.5 rounded-lg transition-all"
                                                                    >
                                                                        Annuler
                                                                    </button>
                                                                ) : (
                                                                    <button 
                                                                        onClick={() => setAssigningToRoom(room.id)}
                                                                        className="text-[9px] font-black uppercase text-emerald-400 tracking-widest bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg transition-all"
                                                                    >
                                                                        Assigner
                                                                    </button>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Assign Pilgrim dropdown panel inside card */}
                                                {assigningToRoom === room.id && (
                                                    <div className="mt-4 p-4 rounded-2xl bg-black/40 border border-emerald-500/20 space-y-3">
                                                        <div className="relative">
                                                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-white/30" />
                                                            <input 
                                                                type="text" 
                                                                placeholder="Rechercher un pèlerin..."
                                                                value={searchQuery}
                                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                                className="w-full bg-black/20 border border-white/5 rounded-xl pl-9 pr-4 py-2 text-xs text-main placeholder:text-white/20 focus:outline-none focus:border-emerald-500"
                                                            />
                                                        </div>
                                                        
                                                        <div className="max-h-[150px] overflow-y-auto space-y-1.5 custom-scrollbar">
                                                            {availablePilgrims.length === 0 ? (
                                                                <p className="text-[10px] text-dim italic text-center py-4">Aucun pèlerin disponible</p>
                                                            ) : (
                                                                availablePilgrims.map((p) => (
                                                                    <button
                                                                        key={p.id}
                                                                        onClick={() => handleAssign(p.id, room.id)}
                                                                        disabled={actionLoading === `assign-${room.id}`}
                                                                        className="w-full flex justify-between items-center p-2 rounded-lg bg-white/[0.01] hover:bg-emerald-500/10 text-left transition-colors border border-white/5 hover:border-emerald-500/20 text-xs"
                                                                    >
                                                                        <div>
                                                                            <p className="font-bold text-main">{p.name} {p.family}</p>
                                                                            <p className="text-[8px] text-dim uppercase tracking-wider">{p.group_name}</p>
                                                                        </div>
                                                                        <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded uppercase">
                                                                            Choisir
                                                                        </span>
                                                                    </button>
                                                                ))
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}
