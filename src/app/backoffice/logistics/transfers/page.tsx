'use client';

import React, { useState, useEffect } from 'react';
import { 
    Route, Search, User, Save, Loader2, ArrowRight, Phone, MessageSquare
} from 'lucide-react';
import { getPilgrimsList, savePilgrimTransfers, getGroups, getLogisticsDefaultsForPilgrim } from '@/lib/actions/concierge';

export default function TransfersPage() {
    const [pilgrims, setPilgrims] = useState<any[]>([]);
    const [groups, setGroups] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPilgrim, setSelectedPilgrim] = useState<any>(null);
    
    // Filters
    const [search, setSearch] = useState('');
    const [groupFilter, setGroupFilter] = useState('');

    // Transfer Form State
    const [arrivalAirport, setArrivalAirport] = useState('');
    const [arrivalTime, setArrivalTime] = useState('');
    const [arrivalFlight, setArrivalFlight] = useState('');
    const [makkahDepartureTime, setMakkahDepartureTime] = useState('');
    const [makkahTransport, setMakkahTransport] = useState('');
    const [madinahDepartureTime, setMadinahDepartureTime] = useState('');
    const [madinahTransport, setMadinahTransport] = useState('');
    const [airportDepartureTime, setAirportDepartureTime] = useState('');
    const [airportTransport, setAirportTransport] = useState('');
    const [airportName, setAirportName] = useState('');

    useEffect(() => {
        loadData();
    }, [groupFilter]);

    const loadData = async () => {
        setLoading(true);
        try {
            const list = await getPilgrimsList({
                groupId: groupFilter || undefined
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

    const handleSelectPilgrim = async (p: any) => {
        setSelectedPilgrim(p);
        const tf = p.land_transfers || {};
        
        // Vérifier si des données de transfert existent déjà
        const hasData = Object.values(tf).some(val => val !== '' && val !== null && val !== undefined);
        
        if (!hasData) {
            try {
                const res = await getLogisticsDefaultsForPilgrim(p.id);
                if (res.success && res.defaults) {
                    const defs = res.defaults;
                    setArrivalAirport(defs.arrival_airport || '');
                    setArrivalTime(defs.arrival_time ? defs.arrival_time.slice(0, 16) : '');
                    setArrivalFlight(defs.arrival_flight || '');
                    setMakkahDepartureTime(defs.makkah_departure_time ? defs.makkah_departure_time.slice(0, 16) : '');
                    setMakkahTransport('');
                    setMadinahDepartureTime(defs.madinah_departure_time ? defs.madinah_departure_time.slice(0, 16) : '');
                    setMadinahTransport('');
                    setAirportDepartureTime(defs.airport_departure_time ? defs.airport_departure_time.slice(0, 16) : '');
                    setAirportTransport('');
                    setAirportName(defs.airport_name || '');
                    return;
                }
            } catch (err) {
                console.error("Error loading logistics defaults:", err);
            }
        }

        setArrivalAirport(tf.arrival_airport || '');
        setArrivalTime(tf.arrival_time ? tf.arrival_time.slice(0, 16) : '');
        setArrivalFlight(tf.arrival_flight || '');
        setMakkahDepartureTime(tf.makkah_departure_time ? tf.makkah_departure_time.slice(0, 16) : '');
        setMakkahTransport(tf.makkah_transport || '');
        setMadinahDepartureTime(tf.madinah_departure_time ? tf.madinah_departure_time.slice(0, 16) : '');
        setMadinahTransport(tf.madinah_transport || '');
        setAirportDepartureTime(tf.airport_departure_time ? tf.airport_departure_time.slice(0, 16) : '');
        setAirportTransport(tf.airport_transport || '');
        setAirportName(tf.airport_name || '');
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPilgrim) return;
        setLoading(true);

        const dataToSave = {
            arrival_airport: arrivalAirport,
            arrival_time: arrivalTime,
            arrival_flight: arrivalFlight,
            makkah_departure_time: makkahDepartureTime,
            makkah_transport: makkahTransport,
            madinah_departure_time: madinahDepartureTime,
            madinah_transport: madinahTransport,
            airport_departure_time: airportDepartureTime,
            airport_transport: airportTransport,
            airport_name: airportName
        };

        try {
            const res = await savePilgrimTransfers(selectedPilgrim.id, dataToSave);
            if (res.success) {
                alert("Détails des transferts terrestres sauvegardés !");
                // Reload list to update local state
                const list = await getPilgrimsList({
                    groupId: groupFilter || undefined
                });
                setPilgrims(list);
                const updated = list.find((item: any) => item.id === selectedPilgrim.id);
                if (updated) setSelectedPilgrim(updated);
            } else {
                alert(res.error || "Erreur de sauvegarde.");
            }
        } catch (err) {
            console.error(err);
            alert("Erreur de sauvegarde.");
        } finally {
            setLoading(false);
        }
    };

    const generateWhatsAppManifest = () => {
        if (!selectedPilgrim) return '';

        const name = `${selectedPilgrim.first_name} ${selectedPilgrim.family_name}`;
        
        // English manifest
        const manifestEN = `*LAND TRANSFER MANIFEST*\n` +
            `*Name:* ${name}\n\n` +
            `*1. Airport Arrival:*\n` +
            `- Airport: ${arrivalAirport || 'N/A'}\n` +
            `- Date/Time: ${arrivalTime ? new Date(arrivalTime).toLocaleString('en-US') : 'N/A'}\n` +
            `- Flight: ${arrivalFlight || 'N/A'}\n\n` +
            `*2. Departure to Makkah:*\n` +
            `- Date/Time: ${makkahDepartureTime ? new Date(makkahDepartureTime).toLocaleString('en-US') : 'N/A'}\n` +
            `- Transport/Driver: ${makkahTransport || 'N/A'}\n\n` +
            `*3. Departure to Madinah:*\n` +
            `- Date/Time: ${madinahDepartureTime ? new Date(madinahDepartureTime).toLocaleString('en-US') : 'N/A'}\n` +
            `- Transport/Driver: ${madinahTransport || 'N/A'}\n\n` +
            `*4. Departure to Airport:*\n` +
            `- Airport: ${airportName || 'N/A'}\n` +
            `- Date/Time: ${airportDepartureTime ? new Date(airportDepartureTime).toLocaleString('en-US') : 'N/A'}\n` +
            `- Transport/Driver: ${airportTransport || 'N/A'}`;

        // Arabic manifest
        const manifestAR = `*بيان النقل البري (Land Transfer)*\n` +
            `*الاسم:* ${name}\n\n` +
            `*1. الوصول إلى المطار:*\n` +
            `- مطار الوصول: ${arrivalAirport || 'غير محدد'}\n` +
            `- التاريخ والوقت: ${arrivalTime ? new Date(arrivalTime).toLocaleString('fr-FR') : 'غير محدد'}\n` +
            `- رقم الرحلة: ${arrivalFlight || 'غير محدد'}\n\n` +
            `*2. المغادرة إلى مكة المكرمة:*\n` +
            `- التاريخ والوقت: ${makkahDepartureTime ? new Date(makkahDepartureTime).toLocaleString('fr-FR') : 'غير محدد'}\n` +
            `- وسيلة النقل / السائق: ${makkahTransport || 'غير محدد'}\n\n` +
            `*3. المغادرة إلى المدينة المنورة:*\n` +
            `- التاريخ والوقت: ${madinahDepartureTime ? new Date(madinahDepartureTime).toLocaleString('fr-FR') : 'غير محدد'}\n` +
            `- وسيلة النقل / السائق: ${madinahTransport || 'غير محدد'}\n\n` +
            `*4. المغادرة إلى مطار العودة:*\n` +
            `- المطار: ${airportName || 'غير محدد'}\n` +
            `- التاريخ والوقت: ${airportDepartureTime ? new Date(airportDepartureTime).toLocaleString('fr-FR') : 'غير محدد'}\n` +
            `- وسيلة النقل / السائق: ${airportTransport || 'غير محدد'}`;

        const fullMessage = `${manifestEN}\n\n====================\n\n${manifestAR}`;
        return `https://api.whatsapp.com/send?text=${encodeURIComponent(fullMessage)}`;
    };

    const filteredPilgrims = pilgrims.filter(p => 
        `${p.first_name} ${p.family_name}`.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8 font-inter pb-12 p-6 max-w-7xl mx-auto">
            {/* Header */}
            <header className="flex justify-between items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter text-main flex items-center gap-3">
                        <Route className="w-8 h-8 text-emerald-500" /> Logistique <span className="text-emerald-500">Terrestre</span>
                    </h1>
                    <p className="text-dim text-sm mt-1 italic">Gérez les transferts terrestres et manifestes WhatsApp des pèlerins.</p>
                </div>
            </header>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            {/* Content Body */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Pilgrims List */}
                <div className="lg:col-span-5 glass p-6 rounded-[2.5rem] border-emerald-500/5 flex flex-col">
                    <h3 className="text-sm font-black uppercase tracking-wider text-main mb-4 flex items-center gap-2">
                        Pèlerins ({filteredPilgrims.length})
                    </h3>
                    
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                        </div>
                    ) : filteredPilgrims.length === 0 ? (
                        <p className="text-center text-dim text-sm italic py-12">Aucun pèlerin trouvé.</p>
                    ) : (
                        <div className="space-y-3 overflow-y-auto max-h-[60vh] pr-2">
                            {filteredPilgrims.map((p) => {
                                const hasTransfers = p.land_transfers && Object.keys(p.land_transfers).length > 0;
                                return (
                                    <div 
                                        key={p.id}
                                        onClick={() => handleSelectPilgrim(p)}
                                        className={`p-4 rounded-2xl cursor-pointer border transition-all ${
                                            selectedPilgrim?.id === p.id 
                                                ? 'bg-emerald-500/10 border-emerald-500/30 shadow-inner' 
                                                : 'glass border-emerald-500/5 hover:bg-emerald-500/5'
                                        }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h4 className="font-bold text-sm text-main uppercase">
                                                    {p.first_name} {p.family_name}
                                                </h4>
                                                <p className="text-[10px] text-dim font-bold uppercase tracking-widest mt-1">{p.group_name}</p>
                                            </div>
                                            <div>
                                                {hasTransfers ? (
                                                    <span className="bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase px-2 py-0.5 rounded border border-emerald-500/20">Configuré</span>
                                                ) : (
                                                    <span className="bg-amber-500/10 text-amber-500 text-[8px] font-black uppercase px-2 py-0.5 rounded border border-amber-500/20">Non Configuré</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Right: Detailed Transfer Form */}
                <div className="lg:col-span-7">
                    {selectedPilgrim ? (
                        <form onSubmit={handleSave} className="glass p-8 rounded-[2.5rem] border-emerald-500/5 space-y-6">
                            <div className="flex justify-between items-start pb-6 border-b border-emerald-500/10">
                                <div>
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500">TRANSFERTS TERRESTRES</span>
                                    <h2 className="text-2xl font-black uppercase tracking-tighter text-main mt-1">
                                        {selectedPilgrim.first_name} {selectedPilgrim.family_name}
                                    </h2>
                                    <p className="text-xs text-dim italic mt-0.5">Groupe : {selectedPilgrim.group_name}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        type="button"
                                        onClick={async () => {
                                            if (confirm("Voulez-vous écraser les champs actuels avec les horaires des vols et du programme ?")) {
                                                try {
                                                    const res = await getLogisticsDefaultsForPilgrim(selectedPilgrim.id);
                                                    if (res.success && res.defaults) {
                                                        const defs = res.defaults;
                                                        setArrivalAirport(defs.arrival_airport || '');
                                                        setArrivalTime(defs.arrival_time ? defs.arrival_time.slice(0, 16) : '');
                                                        setArrivalFlight(defs.arrival_flight || '');
                                                        setMakkahDepartureTime(defs.makkah_departure_time ? defs.makkah_departure_time.slice(0, 16) : '');
                                                        setMakkahTransport(makkahTransport);
                                                        setMadinahDepartureTime(defs.madinah_departure_time ? defs.madinah_departure_time.slice(0, 16) : '');
                                                        setMadinahTransport(madinahTransport);
                                                        setAirportDepartureTime(defs.airport_departure_time ? defs.airport_departure_time.slice(0, 16) : '');
                                                        setAirportTransport(airportTransport);
                                                        setAirportName(defs.airport_name || '');
                                                    } else {
                                                        alert(res.error || "Impossible de charger les données par défaut.");
                                                    }
                                                } catch (err) {
                                                    console.error(err);
                                                    alert("Erreur de chargement.");
                                                }
                                            }
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-xl font-bold uppercase tracking-wider text-[10px] transition-all border border-emerald-500/20"
                                    >
                                        Importer Vols & Programme
                                    </button>
                                    <a 
                                        href={generateWhatsAppManifest()}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-500 text-white dark:text-[#050605] rounded-xl font-bold uppercase tracking-wider text-[10px] transition-all shadow-md"
                                    >
                                        <MessageSquare className="w-3.5 h-3.5" /> Manifeste WhatsApp
                                    </a>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Arrivée Aéroport */}
                                <div className="bg-emerald-500/5 p-5 rounded-2xl border border-emerald-500/10 space-y-4 col-span-1 md:col-span-2">
                                    <h4 className="text-xs font-black uppercase tracking-wider text-main">1. Arrivée à l'aéroport</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-wider text-dim mb-1">Aéroport</label>
                                            <input 
                                                type="text" 
                                                placeholder="Ex: JED, MED" 
                                                value={arrivalAirport} 
                                                onChange={(e) => setArrivalAirport(e.target.value)}
                                                className="w-full bg-[#0b0f0d]/40 border border-emerald-500/10 rounded-xl px-3 py-2 text-xs text-main focus:outline-none focus:border-emerald-500" 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-wider text-dim mb-1">Date/Heure</label>
                                            <input 
                                                type="datetime-local" 
                                                value={arrivalTime} 
                                                onChange={(e) => setArrivalTime(e.target.value)}
                                                className="w-full bg-[#0b0f0d]/40 border border-emerald-500/10 rounded-xl px-3 py-2 text-xs text-main focus:outline-none focus:border-emerald-500" 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-wider text-dim mb-1">N° de Vol</label>
                                            <input 
                                                type="text" 
                                                placeholder="Ex: SV123" 
                                                value={arrivalFlight} 
                                                onChange={(e) => setArrivalFlight(e.target.value)}
                                                className="w-full bg-[#0b0f0d]/40 border border-emerald-500/10 rounded-xl px-3 py-2 text-xs text-main focus:outline-none focus:border-emerald-500" 
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Départ vers La Mecque */}
                                <div className="bg-emerald-500/5 p-5 rounded-2xl border border-emerald-500/10 space-y-4">
                                    <h4 className="text-xs font-black uppercase tracking-wider text-main">2. Départ vers la Mecque</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-wider text-dim mb-1">Date/Heure de départ</label>
                                            <input 
                                                type="datetime-local" 
                                                value={makkahDepartureTime} 
                                                onChange={(e) => setMakkahDepartureTime(e.target.value)}
                                                className="w-full bg-[#0b0f0d]/40 border border-emerald-500/10 rounded-xl px-3 py-2 text-xs text-main focus:outline-none focus:border-emerald-500" 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-wider text-dim mb-1">Transport / Chauffeur</label>
                                            <input 
                                                type="text" 
                                                placeholder="Ex: Bus Chauffeur Ahmed" 
                                                value={makkahTransport} 
                                                onChange={(e) => setMakkahTransport(e.target.value)}
                                                className="w-full bg-[#0b0f0d]/40 border border-emerald-500/10 rounded-xl px-3 py-2 text-xs text-main focus:outline-none focus:border-emerald-500" 
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Départ vers Médine */}
                                <div className="bg-emerald-500/5 p-5 rounded-2xl border border-emerald-500/10 space-y-4">
                                    <h4 className="text-xs font-black uppercase tracking-wider text-main">3. Départ vers Médine</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-wider text-dim mb-1">Date/Heure de départ</label>
                                            <input 
                                                type="datetime-local" 
                                                value={madinahDepartureTime} 
                                                onChange={(e) => setMadinahDepartureTime(e.target.value)}
                                                className="w-full bg-[#0b0f0d]/40 border border-emerald-500/10 rounded-xl px-3 py-2 text-xs text-main focus:outline-none focus:border-emerald-500" 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-wider text-dim mb-1">Transport / Chauffeur</label>
                                            <input 
                                                type="text" 
                                                placeholder="Ex: Train Haramain" 
                                                value={madinahTransport} 
                                                onChange={(e) => setMadinahTransport(e.target.value)}
                                                className="w-full bg-[#0b0f0d]/40 border border-emerald-500/10 rounded-xl px-3 py-2 text-xs text-main focus:outline-none focus:border-emerald-500" 
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Départ vers Aéroport Retour */}
                                <div className="bg-emerald-500/5 p-5 rounded-2xl border border-emerald-500/10 space-y-4 col-span-1 md:col-span-2">
                                    <h4 className="text-xs font-black uppercase tracking-wider text-main">4. Départ vers l'aéroport de retour</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-wider text-dim mb-1">Nom de l'aéroport</label>
                                            <input 
                                                type="text" 
                                                placeholder="Ex: JED, MED" 
                                                value={airportName} 
                                                onChange={(e) => setAirportName(e.target.value)}
                                                className="w-full bg-[#0b0f0d]/40 border border-emerald-500/10 rounded-xl px-3 py-2 text-xs text-main focus:outline-none focus:border-emerald-500" 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-wider text-dim mb-1">Date/Heure départ</label>
                                            <input 
                                                type="datetime-local" 
                                                value={airportDepartureTime} 
                                                onChange={(e) => setAirportDepartureTime(e.target.value)}
                                                className="w-full bg-[#0b0f0d]/40 border border-emerald-500/10 rounded-xl px-3 py-2 text-xs text-main focus:outline-none focus:border-emerald-500" 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-wider text-dim mb-1">Transport / Chauffeur</label>
                                            <input 
                                                type="text" 
                                                placeholder="Ex: Taxi Chauffeur Ali" 
                                                value={airportTransport} 
                                                onChange={(e) => setAirportTransport(e.target.value)}
                                                className="w-full bg-[#0b0f0d]/40 border border-emerald-500/10 rounded-xl px-3 py-2 text-xs text-main focus:outline-none focus:border-emerald-500" 
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 border-t border-emerald-500/10 pt-6">
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-500 text-white dark:text-[#050605] rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg"
                                >
                                    <Save className="w-4 h-4" /> Enregistrer les transferts
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="glass p-12 rounded-[2.5rem] border-emerald-500/5 text-center flex flex-col items-center justify-center min-h-[40vh]">
                            <User className="w-12 h-12 text-dim opacity-30 mb-4" />
                            <h3 className="font-bold text-main uppercase">Aucun Pèlerin Sélectionné</h3>
                            <p className="text-xs text-dim max-w-xs mt-1">Choisissez un pèlerin dans la liste de gauche pour configurer et envoyer sa logistique de transferts terrestres.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
