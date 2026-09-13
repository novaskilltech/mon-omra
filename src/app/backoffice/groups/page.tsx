'use client';
import { useState, useEffect } from 'react';
import { Plus, Users, Calendar, ArrowRight, Hotel, Bell, Edit, Trash2, X, Loader2, FileText, Star, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { 
    getGroupsDetailed, 
    createGroupAction, 
    updateGroupAction, 
    deleteGroupAction, 
    getAvailableFlightsAndHotels, 
    uploadGroupFlyerAction, 
    getGroupFlyerUrlAction,
    toggleGroupFeaturedAction
} from '@/lib/actions/concierge';

interface Group {
    id: string;
    name: string;
    pelerinCount: number;
    date: string;
    status: 'En préparation' | 'Complet' | 'Brouillon' | 'Terminé';
    flightDepartureId?: string;
    flightReturnId?: string;
    makkahHotelId?: string;
    madinahHotelId?: string;
    flyerPath?: string;
    price?: number;
    flightType?: 'DIRECT' | 'LAYOVER';
    formulaType?: string;
    isFeatured?: boolean;
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
    const [status, setStatus] = useState<'En préparation' | 'Complet' | 'Brouillon' | 'Terminé'>('En préparation');
    const [flyerFile, setFlyerFile] = useState<File | null>(null);
    const [flyerPath, setFlyerPath] = useState('');
    const [price, setPrice] = useState<string>('');
    const [selectedCity, setSelectedCity] = useState<string | null>(null);
    const [flightType, setFlightType] = useState<'DIRECT' | 'LAYOVER'>('DIRECT');
    const [formulaType, setFormulaType] = useState<string>('CLASSIQUE');
    const [isFeatured, setIsFeatured] = useState(false);

    // Available options
    const [availableFlights, setAvailableFlights] = useState<any[]>([]);
    const [availableHotels, setAvailableHotels] = useState<any[]>([]);

    const [flightDepartureId, setFlightDepartureId] = useState('');
    const [flightReturnId, setFlightReturnId] = useState('');
    const [selectedHotels, setSelectedHotels] = useState<string[]>([]);
    const [togglingFeaturedId, setTogglingFeaturedId] = useState<string | null>(null);

    const handleToggleFeatured = async (group: Group) => {
        const newStatus = !group.isFeatured;
        setTogglingFeaturedId(group.id);
        
        // Optimistic state update
        setGroups(prev => prev.map(g => {
            if (g.id === group.id) {
                return { ...g, isFeatured: newStatus };
            }
            return g;
        }));

        try {
            const res = await toggleGroupFeaturedAction(group.id, newStatus);
            if (!res.success) {
                alert(res.error || "Erreur lors de la mise en avant");
                await loadGroups();
            }
        } catch (err) {
            console.error("Error toggling featured group:", err);
            await loadGroups();
        } finally {
            setTogglingFeaturedId(null);
        }
    };

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
        setFlyerFile(null);
        setFlyerPath('');
        setPrice('');
        setFlightType('DIRECT');
        setFormulaType('CLASSIQUE');
        setIsFeatured(false);
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
        setFlyerFile(null);
        setFlyerPath(group.flyerPath || '');
        setPrice(group.price ? group.price.toString() : '');
        setFlightType(group.flightType || 'DIRECT');
        setFormulaType(group.formulaType || 'CLASSIQUE');
        setIsFeatured(group.isFeatured || false);
        
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
            let currentFlyerPath = flyerPath;
            if (flyerFile) {
                const formData = new FormData();
                formData.append('flyer', flyerFile);
                const uploadRes = await uploadGroupFlyerAction(formData);
                if (uploadRes.error) {
                    alert(uploadRes.error);
                    setLoading(false);
                    return;
                }
                if (uploadRes.success && uploadRes.path) {
                    currentFlyerPath = uploadRes.path;
                }
            }

            const numericPrice = price ? parseFloat(price) : undefined;

            if (modalMode === 'add') {
                const res = await createGroupAction({
                    name,
                    departureDate: date,
                    status,
                    flightDepartureId: flightDepartureId || undefined,
                    flightReturnId: flightReturnId || undefined,
                    hotelIds: selectedHotels,
                    flyerPath: currentFlyerPath || undefined,
                    price: numericPrice,
                    flightType,
                    formulaType,
                    isFeatured
                });
                if (res.error) alert(res.error);
            } else if (modalMode === 'edit' && selectedGroup) {
                const res = await updateGroupAction(selectedGroup.id, {
                    name,
                    departureDate: date,
                    status,
                    flightDepartureId: flightDepartureId || undefined,
                    flightReturnId: flightReturnId || undefined,
                    hotelIds: selectedHotels,
                    flyerPath: currentFlyerPath,
                    price: numericPrice,
                    flightType,
                    formulaType,
                    isFeatured
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

    const getCityFromGroupName = (groupName: string) => {
        if (!groupName) return 'Autres / Non spécifié';
        const nameUpper = groupName.toUpperCase();

        if (nameUpper.includes('CDG') || nameUpper.includes('ORY') || nameUpper.includes('PARIS') || nameUpper.includes('PAR')) return 'Paris';
        if (nameUpper.includes('LYS') || nameUpper.includes('LYON')) return 'Lyon';
        if (nameUpper.includes('MRS') || nameUpper.includes('MARSEILLE')) return 'Marseille';
        if (nameUpper.includes('BRU') || nameUpper.includes('BRUXELLES')) return 'Bruxelles';
        if (nameUpper.includes('CRL') || nameUpper.includes('CHARLEROI')) return 'Charleroi';
        if (nameUpper.includes('BVA') || nameUpper.includes('BEAUVAIS')) return 'Paris Beauvais';
        if (nameUpper.includes('BCN') || nameUpper.includes('BARCELONE') || nameUpper.includes('BARCELONA')) return 'Barcelone';
        if (nameUpper.includes('MAD') || nameUpper.includes('MADRID')) return 'Madrid';
        if (nameUpper.includes('AGP') || nameUpper.includes('MALAGA')) return 'Malaga';
        if (nameUpper.includes('ZRH') || nameUpper.includes('ZURICH')) return 'Zurich';
        if (nameUpper.includes('NCE') || nameUpper.includes('NICE')) return 'Nice';
        if (nameUpper.includes('TLS') || nameUpper.includes('TOULOUSE')) return 'Toulouse';
        if (nameUpper.includes('FCO') || nameUpper.includes('CIA') || nameUpper.includes('ROME')) return 'Rome';
        if (nameUpper.includes('MXP') || nameUpper.includes('LIN') || nameUpper.includes('BGY') || nameUpper.includes('MILAN')) return 'Milan';
        if (nameUpper.includes('RUN') || nameUpper.includes('REUNION') || nameUpper.includes('RÉUNION')) return 'La Réunion';
        if (nameUpper.includes('NTE') || nameUpper.includes('NANTES')) return 'Nantes';
        if (nameUpper.includes('BSL') || nameUpper.includes('EAP') || nameUpper.includes('MLH') || nameUpper.includes('BALE') || nameUpper.includes('BÂLE')) return 'Bâle-Mulhouse';

        return 'Autres / Non spécifié';
    };

    const groupsWithCity = groups.map(g => {
        const city = getCityFromGroupName(g.name);
        return { ...g, city };
    });

    const cities = Array.from(new Set(groupsWithCity.map(g => g.city))).sort((a, b) => {
        if (a.includes('Autres')) return 1;
        if (b.includes('Autres')) return -1;
        return a.localeCompare(b);
    });

    const cityStats = cities.map(city => {
        const cityGroups = groupsWithCity.filter(g => g.city === city);
        const totalPilgrims = cityGroups.reduce((acc, g) => acc + g.pelerinCount, 0);
        return {
            name: city,
            groupCount: cityGroups.length,
            pilgrimCount: totalPilgrims
        };
    });

    const featuredGroups = groups.filter(g => g.isFeatured);

    return (
        <div className="space-y-8 p-6 text-left">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter text-main">Gestion des <span className="text-emerald-500">Groupes</span></h1>
                    <p className="text-sub text-sm mt-1">Créez et gérez vos départs pour la saison 2026. Mettez en avant vos formules vedettes dans le carrousel 3D de la Landing Page.</p>
                </div>
                <button 
                    onClick={openAddModal}
                    className="btn-premium py-3 px-8 flex items-center gap-2 shadow-xl shadow-emerald-500/10"
                >
                    <Plus className="w-5 h-5" /> Nouveau Groupe
                </button>
            </header>

            {/* Spotlight Banner Formules en Vedette (Carrousel 3D) */}
            {featuredGroups.length > 0 && (
                <div className="glass p-5 md:p-6 rounded-[2rem] border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-emerald-500/5 space-y-3 shadow-lg shadow-amber-500/5 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                                <Star className="w-5 h-5 fill-amber-400 text-amber-400 animate-pulse" />
                            </div>
                            <div>
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-[#F2CE79] border border-amber-500/30 text-[9px] font-black uppercase tracking-widest">
                                    <Sparkles className="w-3 h-3" />
                                    {featuredGroups.length} Formule{featuredGroups.length > 1 ? 's' : ''} en Vedette sur la Landing Page (Carrousel 3D)
                                </div>
                                <p className="text-xs text-dim font-medium mt-1">
                                    {featuredGroups.length > 1 
                                        ? "Ces formules défilent automatiquement dans le carrousel 3D en haut de la landing page." 
                                        : "Cette formule apparaît mise en avant dans le Bento 3D en haut de la landing page."}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                        {featuredGroups.map(fg => (
                            <div key={fg.id} className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/30 transition-all">
                                <div className="min-w-0">
                                    <h5 className="text-xs font-black uppercase tracking-tight text-main truncate">{fg.name}</h5>
                                    <p className="text-[10px] text-dim truncate">
                                        {formatDateDisplay(fg.date)} • {fg.price ? `${fg.price.toLocaleString('fr-FR')} €` : 'Sur devis'}
                                    </p>
                                </div>
                                <button
                                    disabled={togglingFeaturedId === fg.id}
                                    onClick={() => handleToggleFeatured(fg)}
                                    className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 transition-all shrink-0 cursor-pointer"
                                    title="Retirer du carrousel vedette"
                                >
                                    Retirer
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {loading && groups.length === 0 ? (
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                </div>
            ) : groups.length === 0 ? (
                <p className="text-center text-dim text-sm italic py-12">Aucun groupe trouvé dans la base de données. Créez-en un nouveau !</p>
            ) : (
                <div className="space-y-10 animate-in fade-in duration-500">
                    {/* Bento Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {cityStats.map((stat) => {
                            const isSelected = selectedCity === stat.name;
                            return (
                                <div 
                                    key={stat.name}
                                    onClick={() => setSelectedCity(isSelected ? null : stat.name)}
                                    className={`glass p-8 rounded-[2.5rem] cursor-pointer border transition-all relative overflow-hidden select-none hover:scale-[1.02] ${
                                        isSelected 
                                            ? 'bg-emerald-500/10 border-emerald-500/40 shadow-inner' 
                                            : 'border-emerald-500/5 hover:border-emerald-500/25'
                                    }`}
                                >
                                    {/* Accent background glow */}
                                    {isSelected && (
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-[40px] rounded-full pointer-events-none" />
                                    )}
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-4">
                                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                                <Users className="w-6 h-6 text-emerald-500" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black uppercase tracking-tighter text-main leading-tight">{stat.name}</h3>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-dim mt-1.5 flex items-center gap-1.5">
                                                    <span>{stat.groupCount} {stat.groupCount > 1 ? 'groupes' : 'groupe'}</span>
                                                    <span className="text-sub opacity-25">•</span>
                                                    <span className="text-emerald-500 font-black">{stat.pilgrimCount} pèlerins</span>
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`text-[9px] font-black uppercase tracking-widest py-1.5 px-3 rounded-full ${
                                            isSelected ? 'bg-emerald-500 text-black' : 'bg-white/5 border border-white/5 text-dim'
                                        }`}>
                                            {isSelected ? 'Ouvert' : 'Consulter'}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Chronological Accordion Panel */}
                    {selectedCity && (
                        <div className="glass p-8 rounded-[3rem] border border-emerald-500/10 space-y-6 animate-in slide-in-from-top-6 duration-300">
                            <div className="flex justify-between items-center border-b border-emerald-500/10 pb-4">
                                <h3 className="text-lg font-black uppercase tracking-tight text-main">
                                    Départs de <span className="text-emerald-500">{selectedCity}</span> (Ordre Chronologique)
                                </h3>
                                <button 
                                    onClick={() => setSelectedCity(null)}
                                    className="text-xs font-bold uppercase tracking-widest text-dim hover:text-main transition-colors"
                                >
                                    Fermer
                                </button>
                            </div>

                            <div className="space-y-4">
                                {groupsWithCity
                                    .filter(g => g.city === selectedCity)
                                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                                    .map((g) => (
                                        <div key={g.id} className="glass p-6 rounded-[2rem] border-white/5 hover:border-emerald-500/20 transition-all flex flex-col md:flex-row items-center justify-between shadow-sm animate-in fade-in duration-300">
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/5 flex items-center justify-center border border-emerald-500/10">
                                                    <Calendar className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-black uppercase tracking-tighter text-main">{g.name}</h4>
                                                    <div className="flex flex-wrap items-center gap-4 text-[9px] font-black uppercase tracking-widest text-dim mt-2">
                                                        <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-emerald-500" /> {g.pelerinCount} pèlerins</span>
                                                        <span className="flex items-center gap-1.5 text-sub opacity-20">|</span>
                                                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-emerald-500" /> {formatDateDisplay(g.date)}</span>
                                                        {g.price && (
                                                            <>
                                                                <span className="flex items-center gap-1.5 text-sub opacity-20">|</span>
                                                                <span className="flex items-center gap-1.5 text-emerald-500 font-bold">{g.price.toLocaleString('fr-FR')} €</span>
                                                            </>
                                                        )}
                                                        <span className="flex items-center gap-1.5 text-sub opacity-20">|</span>
                                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                                            g.flightType === 'DIRECT' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                                                        }`}>
                                                            {g.flightType === 'DIRECT' ? 'Direct' : 'Avec Escale'}
                                                        </span>
                                                        <span className="flex items-center gap-1.5 text-sub opacity-20">|</span>
                                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                                            g.formulaType === 'ECO' ? 'bg-sky-500/10 text-sky-500' : 'bg-purple-500/10 text-purple-500'
                                                        }`}>
                                                            {g.formulaType || 'CLASSIQUE'}
                                                        </span>
                                                        {g.isFeatured && (
                                                            <>
                                                                <span className="flex items-center gap-1.5 text-sub opacity-20">|</span>
                                                                <span className="bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded text-[8px] font-black uppercase flex items-center gap-1">
                                                                    🌟 Conseillé
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                    {g.flyerPath && (
                                                        <button
                                                            onClick={async () => {
                                                                const res = await getGroupFlyerUrlAction(g.flyerPath!);
                                                                if (res.success && res.url) {
                                                                    window.open(res.url, '_blank');
                                                                } else {
                                                                    alert(res.error || "Impossible d'accéder au flyer");
                                                                }
                                                            }}
                                                            className="mt-3 text-[8px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 flex items-center gap-1 transition-all bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/15"
                                                        >
                                                            <FileText className="w-3 h-3" /> Voir le Flyer
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-4 mt-6 md:mt-0">
                                                <div className="flex bg-emerald-500/5 dark:bg-white/5 p-1 rounded-2xl border border-emerald-500/10 dark:border-white/5 shadow-inner">
                                                    <Link href={`/backoffice/groups/${g.id}/planning`} className="p-2.5 hover:bg-emerald-500/20 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl transition-all text-dim" title="Planning">
                                                        <Calendar className="w-4.5 h-4.5" />
                                                    </Link>
                                                    <Link href={`/backoffice/groups/${g.id}/rooming`} className="p-2.5 hover:bg-amber-500/20 hover:text-amber-600 dark:hover:text-amber-400 rounded-xl transition-all text-dim" title="Rooming">
                                                        <Hotel className="w-4.5 h-4.5" />
                                                    </Link>
                                                    <Link href={`/backoffice/groups/${g.id}/notifications`} className="p-2.5 hover:bg-blue-500/20 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all text-dim" title="Broadcast">
                                                        <Bell className="w-4.5 h-4.5" />
                                                    </Link>
                                                </div>

                                                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border shadow-sm ${
                                                    g.status === 'Complet' ? 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400' :
                                                    g.status === 'En préparation' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                                                    g.status === 'Terminé' ? 'bg-gray-500/20 border-white/10 text-dim' :
                                                    'bg-gray-500/10 border-gray-500/20 text-dim'
                                                }`}>
                                                    {g.status}
                                                </span>
                                                
                                                <div className="flex items-center gap-1.5">
                                                    {/* Bouton 1-clic Mettre en Vedette */}
                                                    <button
                                                        disabled={togglingFeaturedId === g.id}
                                                        onClick={() => handleToggleFeatured(g)}
                                                        className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider cursor-pointer ${
                                                            g.isFeatured 
                                                                ? 'bg-amber-500/20 border-amber-500/50 text-[#F2CE79] shadow-[0_0_15px_rgba(216,170,77,0.3)] hover:bg-amber-500/30' 
                                                                : 'bg-white/5 border-white/10 text-dim hover:text-amber-400 hover:border-amber-500/30 hover:bg-white/10'
                                                        }`}
                                                        title={g.isFeatured ? "Formule en vedette sur la landing page (cliquez pour désactiver)" : "Mettre en vedette au sommet de la landing page (Bento 3D)"}
                                                    >
                                                        <Star className={`w-3.5 h-3.5 ${g.isFeatured ? 'fill-amber-400 text-amber-400' : 'text-dim'}`} />
                                                        <span>{g.isFeatured ? 'En Vedette' : 'Mettre en Vedette'}</span>
                                                    </button>

                                                    <button 
                                                        onClick={() => openEditModal(g)}
                                                        className="p-2.5 bg-emerald-500/5 hover:bg-emerald-500/10 rounded-xl border border-emerald-500/10 hover:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 transition-all cursor-pointer"
                                                        title="Modifier le groupe"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(g.id)}
                                                        className="p-2.5 bg-red-500/5 hover:bg-red-500/10 rounded-xl border border-red-500/10 hover:border-red-500/30 text-red-600 dark:text-red-500 transition-all cursor-pointer"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                    <Link href={`/backoffice/groups/${g.id}/planning`} className="p-3 bg-white/5 border border-white/5 rounded-full hover:bg-emerald-500/5 text-dim hover:text-emerald-500 transition-all">
                                                        <ArrowRight className="w-4.5 h-4.5" />
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

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

                        <form onSubmit={handleSave} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
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

                            <div className="grid grid-cols-2 gap-4">
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
                                        <option value="Terminé" className="bg-[#050605] text-main">Terminé (Archivé)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-dim ml-1">Tarif (€)</label>
                                    <input 
                                        type="number" 
                                        value={price} 
                                        onChange={(e) => setPrice(e.target.value)} 
                                        placeholder="Ex: 2490" 
                                        min="0"
                                        step="0.01"
                                        className="w-full bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/10 rounded-2xl px-5 py-4 text-sm font-medium text-main outline-none focus:border-emerald-500/40 focus:bg-white/10 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-dim ml-1">Type de Vol</label>
                                    <select 
                                        value={flightType} 
                                        onChange={(e: any) => setFlightType(e.target.value)} 
                                        className="w-full bg-[#0b0f0d] dark:bg-[#0b0f0d] border border-white/10 dark:border-white/10 rounded-2xl px-5 py-4 text-sm font-medium text-main outline-none focus:border-emerald-500/40 transition-all"
                                    >
                                        <option value="DIRECT" className="bg-[#050605] text-main">Vol Direct</option>
                                        <option value="LAYOVER" className="bg-[#050605] text-main">Avec Escale</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-dim ml-1">Formule / Package</label>
                                    <select 
                                        value={formulaType} 
                                        onChange={(e: any) => setFormulaType(e.target.value)} 
                                        className="w-full bg-[#0b0f0d] dark:bg-[#0b0f0d] border border-white/10 dark:border-white/10 rounded-2xl px-5 py-4 text-sm font-medium text-main outline-none focus:border-emerald-500/40 transition-all"
                                    >
                                        <option value="CLASSIQUE" className="bg-[#050605] text-main">Classique (Hôtels Confort)</option>
                                        <option value="CONFORT_NAVETTE" className="bg-[#050605] text-main">Confort (Navette 24h)</option>
                                        <option value="ECO" className="bg-[#050605] text-main">Économique (Hôtels Standard)</option>
                                        <option value="PIEDS_HARAM" className="bg-[#050605] text-main">Prestige (5★ Pieds dans le Haram)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Flyer Upload Field */}
                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-dim ml-1">Flyer de l'offre (PDF ou Image, max 5 Mo)</label>
                                {flyerPath ? (
                                    <div className="flex items-center justify-between bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4">
                                        <div className="flex items-center gap-3 text-xs text-main font-bold">
                                            <FileText className="w-5 h-5 text-emerald-500" />
                                            <span>Flyer configuré</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    const res = await getGroupFlyerUrlAction(flyerPath);
                                                    if (res.success && res.url) {
                                                        window.open(res.url, '_blank');
                                                    } else {
                                                        alert(res.error || "Impossible d'accéder au flyer");
                                                    }
                                                }}
                                                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-main transition-all"
                                            >
                                                Consulter
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFlyerPath('');
                                                    setFlyerFile(null);
                                                }}
                                                className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest text-red-500 transition-all"
                                            >
                                                Supprimer
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <input 
                                        type="file" 
                                        accept="application/pdf,image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                if (file.size > 5 * 1024 * 1024) {
                                                    alert("Fichier trop volumineux. La taille maximale est de 5 Mo.");
                                                    e.target.value = '';
                                                    return;
                                                }
                                                setFlyerFile(file);
                                            }
                                        }}
                                        className="w-full bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/10 rounded-2xl px-5 py-4 text-xs font-medium text-main outline-none focus:border-emerald-500/40 focus:bg-white/10 transition-all"
                                    />
                                )}
                            </div>

                            {/* preferential date checkbox */}
                            <div className="flex items-center gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                                <input 
                                    type="checkbox"
                                    id="isFeatured"
                                    checked={isFeatured}
                                    onChange={(e) => setIsFeatured(e.target.checked)}
                                    className="w-4 h-4 rounded border-amber-500/40 text-amber-500 focus:ring-amber-500 bg-[#0b0f0d] cursor-pointer"
                                />
                                <label htmlFor="isFeatured" className="text-xs font-bold text-main cursor-pointer select-none">
                                    🌟 Mettre en avant ce groupe (Date Conseillée)
                                    <span className="block text-[9px] text-dim font-medium mt-0.5 uppercase tracking-wide">
                                        S'affichera en tête de liste avec un badge "🔥 Date conseillée"
                                    </span>
                                </label>
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

                            <div className="pt-1">
                                <p className="text-[10px] text-emerald-400/90 font-medium flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2.5 rounded-xl">
                                    <span>💡</span>
                                    <span>Les hôtels cochés ci-dessus s'afficheront automatiquement sur l'offre de la landing page (ex: M Makkah & Zaha Taiba).</span>
                                </p>
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
