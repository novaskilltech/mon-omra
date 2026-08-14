'use client';

import { useState, useEffect } from 'react';
import { 
    Users, Calendar, Search, Filter, Phone, Mail, Globe, Home, 
    CheckCircle, Clock, XCircle, Trash2, MessageSquare, Compass, Loader2, AlertCircle, RefreshCw 
} from 'lucide-react';
import { getHajjRequestsAction, updateHajjRequestStatusAction, deleteHajjRequestAction } from '@/lib/actions/hajj';

export default function BackofficeHajjPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [yearFilter, setYearFilter] = useState<string>('ALL');
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const loadRequests = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getHajjRequestsAction();
            if (res.success && res.requests) {
                setRequests(res.requests);
            } else {
                setError(res.error || "Erreur lors du chargement des demandes Hajj.");
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Erreur lors du chargement.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, []);

    const handleStatusChange = async (id: string, newStatus: string) => {
        setUpdatingId(id);
        try {
            const res = await updateHajjRequestStatusAction(id, newStatus);
            if (res.success) {
                setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
            } else {
                alert(res.error || "Erreur lors de la mise à jour du statut.");
            }
        } catch (err) {
            console.error(err);
            alert("Erreur lors de la mise à jour.");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Voulez-vous vraiment supprimer la demande Hajj de ${name} ?`)) return;

        setUpdatingId(id);
        try {
            const res = await deleteHajjRequestAction(id);
            if (res.success) {
                setRequests(prev => prev.filter(r => r.id !== id));
            } else {
                alert(res.error || "Erreur de suppression.");
            }
        } catch (err) {
            console.error(err);
            alert("Erreur de suppression.");
        } finally {
            setUpdatingId(null);
        }
    };

    // Derived statistics
    const totalRequests = requests.length;
    const totalPeople = requests.reduce((sum, r) => sum + (r.people_count || 1), 0);
    const pendingRequests = requests.filter(r => r.status === 'PENDING').length;
    const count2027 = requests.filter(r => r.hajj_year === 2027).length;
    const count2028 = requests.filter(r => r.hajj_year === 2028).length;

    // Filtered requests list
    const filteredRequests = requests.filter(r => {
        const matchesSearch = 
            `${r.first_name} ${r.family_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.phone.includes(searchTerm) ||
            r.nationality.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.address.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
        const matchesYear = yearFilter === 'ALL' || r.hajj_year.toString() === yearFilter;

        return matchesSearch && matchesStatus && matchesYear;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return { label: 'En attente', style: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: Clock };
            case 'CONTACTED':
                return { label: 'Contacté', style: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: MessageSquare };
            case 'CONFIRMED':
                return { label: 'Confirmé', style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: CheckCircle };
            case 'CANCELLED':
                return { label: 'Annulé', style: 'bg-red-500/10 text-red-400 border-red-500/20', icon: XCircle };
            default:
                return { label: status, style: 'bg-white/5 text-dim border-white/10', icon: Clock };
        }
    };

    return (
        <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto text-left">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-emerald-500/10 dark:border-white/5">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                        <Compass className="w-3.5 h-3.5" />
                        Gestion Espace Agence
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-main">
                        Demandes de Prépélinage <span className="text-[#D8AA4D]">HAJJ</span>
                    </h1>
                    <p className="text-xs text-dim mt-1 font-medium">
                        Centralisation et suivi des pré-inscriptions Hajj soumises depuis la landing page.
                    </p>
                </div>

                <button
                    onClick={loadRequests}
                    disabled={loading}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold transition-all border bg-white/5 border-white/10 text-main hover:bg-white/10 active:scale-95 text-xs"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    <span>Actualiser</span>
                </button>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass p-6 rounded-3xl border border-white/5 bg-white/[0.02]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-dim">Total Demandes Hajj</p>
                    <p className="text-3xl font-black text-main mt-2">{totalRequests}</p>
                    <p className="text-[11px] text-amber-400 font-bold mt-1">{pendingRequests} en attente de traitement</p>
                </div>

                <div className="glass p-6 rounded-3xl border border-amber-500/20 bg-amber-500/[0.03]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">Total Pèlerins Cumulés</p>
                    <p className="text-3xl font-black text-[#D8AA4D] mt-2">{totalPeople} <span className="text-sm font-bold text-dim">personnes</span></p>
                    <p className="text-[11px] text-dim font-bold mt-1">Cumul des réservations de groupe</p>
                </div>

                <div className="glass p-6 rounded-3xl border border-white/5 bg-white/[0.02]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-dim">Cibles Hajj 2027</p>
                    <p className="text-3xl font-black text-emerald-400 mt-2">{count2027}</p>
                    <p className="text-[11px] text-dim font-bold mt-1">Première session disponible</p>
                </div>

                <div className="glass p-6 rounded-3xl border border-white/5 bg-white/[0.02]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-dim">Cibles Hajj 2028+</p>
                    <p className="text-3xl font-black text-blue-400 mt-2">{count2028 + requests.filter(r => r.hajj_year > 2028).length}</p>
                    <p className="text-[11px] text-dim font-bold mt-1">Demandes de prospective</p>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="glass p-6 rounded-3xl border border-white/5 bg-white/[0.02] flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Search */}
                <div className="relative w-full md:w-96">
                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-dim" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Rechercher nom, email, ville, nationalité..."
                        className="w-full bg-white/5 border border-white/10 pl-11 pr-4 py-3 rounded-2xl text-xs outline-none focus:border-[#D8AA4D]/50 text-main"
                    />
                </div>

                {/* Filter Selects */}
                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl text-xs">
                        <Filter className="w-3.5 h-3.5 text-[#D8AA4D]" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-dim">Année :</span>
                        <select
                            value={yearFilter}
                            onChange={(e) => setYearFilter(e.target.value)}
                            className="bg-transparent text-xs font-bold text-main outline-none cursor-pointer"
                        >
                            <option value="ALL" className="bg-[#0c120f]">Toutes les années</option>
                            <option value="2027" className="bg-[#0c120f]">Hajj 2027</option>
                            <option value="2028" className="bg-[#0c120f]">Hajj 2028</option>
                            <option value="2029" className="bg-[#0c120f]">Hajj 2029</option>
                            <option value="2030" className="bg-[#0c120f]">Hajj 2030+</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl text-xs">
                        <span className="text-[10px] font-black uppercase tracking-wider text-dim">Statut :</span>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-transparent text-xs font-bold text-main outline-none cursor-pointer"
                        >
                            <option value="ALL" className="bg-[#0c120f]">Tous les statuts</option>
                            <option value="PENDING" className="bg-[#0c120f]">En attente</option>
                            <option value="CONTACTED" className="bg-[#0c120f]">Contacté</option>
                            <option value="CONFIRMED" className="bg-[#0c120f]">Confirmé</option>
                            <option value="CANCELLED" className="bg-[#0c120f]">Annulé</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* List Table / Cards */}
            {loading ? (
                <div className="py-20 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#D8AA4D] mx-auto" />
                    <p className="text-xs text-dim font-bold mt-3">Chargement des demandes Hajj...</p>
                </div>
            ) : error ? (
                <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-3xl text-center text-xs text-red-400">
                    <AlertCircle className="w-6 h-6 mx-auto mb-2" />
                    <span>{error}</span>
                </div>
            ) : filteredRequests.length === 0 ? (
                <div className="glass p-16 rounded-3xl border border-white/5 text-center text-dim space-y-3">
                    <Compass className="w-10 h-10 mx-auto opacity-40 text-[#D8AA4D]" />
                    <p className="text-sm font-bold uppercase tracking-wide">Aucune demande Hajj trouvée</p>
                    <p className="text-xs opacity-75">Modifiez vos filtres ou attendez de nouvelles soumissions depuis la landing page.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredRequests.map((req) => {
                        const statusObj = getStatusBadge(req.status);
                        const StatusIcon = statusObj.icon;
                        const cleanPhone = req.phone ? req.phone.replace(/[^0-9+]/g, '') : '';
                        const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone.replace('+', '')}?text=Bonjour%20${encodeURIComponent(req.first_name)},%20nous%20avons%20bien%20re%C3%A7u%20votre%20demande%20de%20pr%C3%A9-inscription%20Hajj%20${req.hajj_year}.` : null;

                        return (
                            <div 
                                key={req.id} 
                                className="glass p-6 md:p-8 rounded-3xl border border-white/5 hover:border-[#D8AA4D]/30 transition-all space-y-4 bg-white/[0.01]"
                            >
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-[#D8AA4D]/10 border border-[#D8AA4D]/25 flex items-center justify-center text-[#D8AA4D] font-black text-lg">
                                            {req.first_name?.[0]}{req.family_name?.[0]}
                                        </div>
                                        <div>
                                            <h3 className="text-base font-black uppercase tracking-tight text-main">
                                                {req.first_name} {req.family_name}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-3 text-xs text-dim font-medium mt-1">
                                                <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5 text-[#D8AA4D]" /> {req.nationality}</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-emerald-400" /> Hajj {req.hajj_year}</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-blue-400" /> {req.people_count} personne(s)</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status selector */}
                                    <div className="flex items-center gap-3">
                                        <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wider ${statusObj.style}`}>
                                            <StatusIcon className="w-3.5 h-3.5" />
                                            <span>{statusObj.label}</span>
                                        </div>

                                        <select
                                            disabled={updatingId === req.id}
                                            value={req.status}
                                            onChange={(e) => handleStatusChange(req.id, e.target.value)}
                                            className="bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-wider text-main px-3 py-1.5 rounded-xl outline-none cursor-pointer"
                                        >
                                            <option value="PENDING" className="bg-[#0c120f]">En attente</option>
                                            <option value="CONTACTED" className="bg-[#0c120f]">Contacté</option>
                                            <option value="CONFIRMED" className="bg-[#0c120f]">Confirmé</option>
                                            <option value="CANCELLED" className="bg-[#0c120f]">Annulé</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Body details */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black uppercase tracking-wider text-dim">Contact E-mail</p>
                                        <a href={`mailto:${req.email}`} className="text-main hover:text-[#D8AA4D] font-bold flex items-center gap-1.5 truncate">
                                            <Mail className="w-3.5 h-3.5 text-dim shrink-0" />
                                            <span className="truncate">{req.email}</span>
                                        </a>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black uppercase tracking-wider text-dim">Téléphone</p>
                                        <a href={`tel:${req.phone}`} className="text-main hover:text-[#D8AA4D] font-bold flex items-center gap-1.5">
                                            <Phone className="w-3.5 h-3.5 text-dim shrink-0" />
                                            <span>{req.phone}</span>
                                        </a>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black uppercase tracking-wider text-dim">Adresse Postal</p>
                                        <p className="text-main font-medium flex items-center gap-1.5 truncate">
                                            <Home className="w-3.5 h-3.5 text-dim shrink-0" />
                                            <span className="truncate">{req.address}</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Footer actions */}
                                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5">
                                    <span className="text-[9px] text-dim font-bold">
                                        Soumis le {new Date(req.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </span>

                                    <div className="flex items-center gap-3">
                                        {whatsappUrl && (
                                            <a
                                                href={whatsappUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-wider transition-all"
                                            >
                                                <MessageSquare className="w-3.5 h-3.5" />
                                                <span>WhatsApp</span>
                                            </a>
                                        )}

                                        <button
                                            disabled={updatingId === req.id}
                                            onClick={() => handleDelete(req.id, `${req.first_name} ${req.family_name}`)}
                                            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/20 transition-all cursor-pointer"
                                            title="Supprimer la demande"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
