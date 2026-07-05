'use client';

import React, { useState, useEffect } from 'react';
import { 
    Route, Search, User, Save, Loader2, ArrowRight, Phone, MessageSquare, Users
} from 'lucide-react';
import { 
    getPilgrimsList, savePilgrimTransfers, getGroups, 
    getLogisticsDefaultsForPilgrim, getGroupsDetailed,
    generateDriverShareLink
} from '@/lib/actions/concierge';
import { getAgencyFlights, getRoomingAssignmentsForTransfers } from '@/lib/actions/logistics';

export default function TransfersPage() {
    const [pilgrims, setPilgrims] = useState<any[]>([]);
    const [groups, setGroups] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPilgrim, setSelectedPilgrim] = useState<any>(null);
    const [roomingMap, setRoomingMap] = useState<Record<string, {
        makkahHotel: string;
        makkahRoom: string;
        madinahHotel: string;
        madinahRoom: string;
    }>>({});
    
    // New local states for flights and detailed groups
    const [agencyFlights, setAgencyFlights] = useState<any[]>([]);
    const [groupsDetailed, setGroupsDetailed] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'individual' | 'arrival_groups' | 'return_groups'>('individual');

    // Filters
    const [search, setSearch] = useState('');
    const [groupFilter, setGroupFilter] = useState('');

    // Transfer Form State
    const [arrivalAirport, setArrivalAirport] = useState('');
    const [arrivalTime, setArrivalTime] = useState('');
    const [arrivalFlight, setArrivalFlight] = useState('');
    const [firstDestination, setFirstDestination] = useState<'MAKKAH' | 'MADINAH'>('MAKKAH');
    const [makkahArrivalTime, setMakkahArrivalTime] = useState('');
    const [makkahDepartureTime, setMakkahDepartureTime] = useState('');
    const [makkahTransport, setMakkahTransport] = useState('');
    const [madinahArrivalTime, setMadinahArrivalTime] = useState('');
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

            const detailed = await getGroupsDetailed();
            setGroupsDetailed(detailed || []);

            const flights = await getAgencyFlights();
            setAgencyFlights(flights || []);

            const rooming = await getRoomingAssignmentsForTransfers();
            setRoomingMap(rooming || {});
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // Helper to get flight segments for a pilgrim
    const getPilgrimFlights = (p: any) => {
        let segments: any[] = [];
        if (p.individual_flight_info && p.individual_flight_info.flights && p.individual_flight_info.flights.length > 0) {
            segments = p.individual_flight_info.flights;
        } else if (p.group_id) {
            const g = groupsDetailed.find(gd => gd.id === p.group_id);
            if (g) {
                if (g.flightDepartureId) {
                    const f = agencyFlights.find(af => af.id === g.flightDepartureId);
                    if (f && f.flight_segments) segments.push(...f.flight_segments);
                }
                if (g.flightReturnId) {
                    const f = agencyFlights.find(af => af.id === g.flightReturnId);
                    if (f && f.flight_segments) segments.push(...f.flight_segments);
                }
            }
        }
        
        // Find segment landing in JED or MED
        const arrivalSeg = segments.find(s => s.arrival_airport === 'JED' || s.arrival_airport === 'MED') || segments[0];
        
        // Find segment departing from JED or MED
        const returnSeg = segments.find(s => s.departure_airport === 'JED' || s.departure_airport === 'MED') || segments[segments.length - 1];
        
        return { arrivalSeg, returnSeg };
    };

    const getArrivalGroups = () => {
        const flightMap: { [key: string]: { flight: any; pilgrims: any[] } } = {};
        
        pilgrims.forEach(p => {
            const { arrivalSeg } = getPilgrimFlights(p);
            if (!arrivalSeg) return;
            
            const dateKey = arrivalSeg.departure_time ? new Date(arrivalSeg.departure_time).toLocaleDateString('fr-FR') : 'Date inconnue';
            const key = `${arrivalSeg.flight_number || 'VOL-INCONNU'}_${dateKey}_${arrivalSeg.arrival_airport || ''}`;
            
            if (!flightMap[key]) {
                flightMap[key] = {
                    flight: {
                        flight_number: arrivalSeg.flight_number || 'N/A',
                        airline: arrivalSeg.airline || 'N/A',
                        arrival_airport: arrivalSeg.arrival_airport || 'N/A',
                        departure_airport: arrivalSeg.departure_airport || 'N/A',
                        arrival_time: arrivalSeg.arrival_time,
                        departure_time: arrivalSeg.departure_time,
                        dateStr: dateKey
                    },
                    pilgrims: []
                };
            }
            flightMap[key].pilgrims.push(p);
        });
        
        return Object.values(flightMap);
    };

    const getReturnGroups = () => {
        const flightMap: { [key: string]: { flight: any; pilgrims: any[] } } = {};
        
        pilgrims.forEach(p => {
            const { returnSeg } = getPilgrimFlights(p);
            if (!returnSeg) return;
            
            const dateKey = returnSeg.departure_time ? new Date(returnSeg.departure_time).toLocaleDateString('fr-FR') : 'Date inconnue';
            const key = `${returnSeg.flight_number || 'VOL-INCONNU'}_${dateKey}_${returnSeg.departure_airport || ''}`;
            
            if (!flightMap[key]) {
                flightMap[key] = {
                    flight: {
                        flight_number: returnSeg.flight_number || 'N/A',
                        airline: returnSeg.airline || 'N/A',
                        arrival_airport: returnSeg.arrival_airport || 'N/A',
                        departure_airport: returnSeg.departure_airport || 'N/A',
                        arrival_time: returnSeg.arrival_time,
                        departure_time: returnSeg.departure_time,
                        dateStr: dateKey
                    },
                    pilgrims: []
                };
            }
            flightMap[key].pilgrims.push(p);
        });
        
        return Object.values(flightMap);
    };

    const generateGroupWhatsAppManifest = (group: any, isArrival: boolean) => {
        const flight = group.flight;
        const typeStr = isArrival ? "ARRIVÉE AÉROPORT" : "RETOUR AÉROPORT";
        const airportLabel = isArrival ? "Aéroport d'Arrivée" : "Aéroport de Départ";
        const airportVal = isArrival ? flight.arrival_airport : flight.departure_airport;
        const timeLabel = isArrival ? "Heure d'Arrivée" : "Heure de Départ";
        const timeVal = isArrival ? flight.arrival_time : flight.departure_time;
        
        let msg = `*MANIFESTE DE TRANSFERT TERRESTRE - ${typeStr}*\n\n`;
        msg += `*Vol :* ${flight.flight_number} (${flight.airline})\n`;
        msg += `*${airportLabel} :* ${airportVal}\n`;
        msg += `*Date :* ${flight.dateStr}\n`;
        msg += `*${timeLabel} :* ${timeVal ? new Date(timeVal).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}\n\n`;
        msg += `*Liste des Pèlerins (${group.pilgrims.length}) :*\n`;
        
        group.pilgrims.forEach((p: any, idx: number) => {
            const genderStr = p.gender === 'F' ? 'Femme' : 'Homme';
            const roomInfo = roomingMap[p.id] || { makkahHotel: '', makkahRoom: '', madinahHotel: '', madinahRoom: '' };
            let hotelDetails = '';
            if (roomInfo.makkahHotel) hotelDetails += ` | Makkah: ${roomInfo.makkahHotel}${roomInfo.makkahRoom ? ` (Ch. ${roomInfo.makkahRoom})` : ''}`;
            if (roomInfo.madinahHotel) hotelDetails += ` | Madinah: ${roomInfo.madinahHotel}${roomInfo.madinahRoom ? ` (Ch. ${roomInfo.madinahRoom})` : ''}`;
            
            msg += `${idx + 1}. ${p.first_name} ${p.family_name} (${genderStr})${hotelDetails} - ${p.email || 'Pas d\'email'}\n`;
        });
        
        return `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    };

    const handleSelectPilgrim = async (p: any) => {
        setSelectedPilgrim(p);
        const tf = p.land_transfers || {};
        
        // Check if transfers data already exists
        const hasData = Object.values(tf).some(val => val !== '' && val !== null && val !== undefined);
        
        if (!hasData) {
            try {
                const res = await getLogisticsDefaultsForPilgrim(p.id);
                if (res.success && res.defaults) {
                    const defs = res.defaults;
                    setArrivalAirport(defs.arrival_airport || '');
                    setArrivalTime(defs.arrival_time ? defs.arrival_time.slice(0, 16) : '');
                    setArrivalFlight(defs.arrival_flight || '');
                    setFirstDestination(defs.first_destination || 'MAKKAH');
                    setMakkahArrivalTime(defs.makkah_arrival_time ? defs.makkah_arrival_time.slice(0, 16) : '');
                    setMakkahDepartureTime(defs.makkah_departure_time ? defs.makkah_departure_time.slice(0, 16) : '');
                    setMakkahTransport('');
                    setMadinahArrivalTime(defs.madinah_arrival_time ? defs.madinah_arrival_time.slice(0, 16) : '');
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
        setFirstDestination(tf.first_destination || 'MAKKAH');
        setMakkahArrivalTime(tf.makkah_arrival_time ? tf.makkah_arrival_time.slice(0, 16) : '');
        setMakkahDepartureTime(tf.makkah_departure_time ? tf.makkah_departure_time.slice(0, 16) : '');
        setMakkahTransport(tf.makkah_transport || '');
        setMadinahArrivalTime(tf.madinah_arrival_time ? tf.madinah_arrival_time.slice(0, 16) : '');
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
            first_destination: firstDestination,
            makkah_arrival_time: makkahArrivalTime,
            makkah_departure_time: makkahDepartureTime,
            makkah_transport: makkahTransport,
            madinah_arrival_time: madinahArrivalTime,
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

        // Find all pilgrims in the same group
        const groupPilgrims = selectedPilgrim.group_id 
            ? pilgrims.filter(p => p.group_id === selectedPilgrim.group_id)
            : [selectedPilgrim];

        const passengerList = groupPilgrims.map((p, idx) => {
            const genderStr = p.gender === 'F' ? 'Femme' : 'Homme';
            const roomInfo = roomingMap[p.id] || { makkahHotel: '', makkahRoom: '', madinahHotel: '', madinahRoom: '' };
            let hotelDetails = '';
            if (roomInfo.makkahHotel) hotelDetails += ` | Makkah: ${roomInfo.makkahHotel}${roomInfo.makkahRoom ? ` (Ch. ${roomInfo.makkahRoom})` : ''}`;
            if (roomInfo.madinahHotel) hotelDetails += ` | Madinah: ${roomInfo.madinahHotel}${roomInfo.madinahRoom ? ` (Ch. ${roomInfo.madinahRoom})` : ''}`;
            return `${idx + 1}. ${p.first_name} ${p.family_name} (${genderStr})${hotelDetails}`;
        }).join('\n');

        const passengerListAR = groupPilgrims.map((p, idx) => {
            const genderStr = p.gender === 'F' ? 'أنثى' : 'ذكر';
            const roomInfo = roomingMap[p.id] || { makkahHotel: '', makkahRoom: '', madinahHotel: '', madinahRoom: '' };
            let hotelDetails = '';
            if (roomInfo.makkahHotel) hotelDetails += ` | مكة: ${roomInfo.makkahHotel}${roomInfo.makkahRoom ? ` (غرفة ${roomInfo.makkahRoom})` : ''}`;
            if (roomInfo.madinahHotel) hotelDetails += ` | المدينة: ${roomInfo.madinahHotel}${roomInfo.madinahRoom ? ` (غرفة ${roomInfo.madinahRoom})` : ''}`;
            return `${idx + 1}. ${p.first_name} ${p.family_name} (${genderStr})${hotelDetails}`;
        }).join('\n');

        // Stay segments definitions (EN)
        const makkahSegEN = `*Makkah Stay (🕋):*\n` +
            `- Arrival (Check-in): ${makkahArrivalTime ? new Date(makkahArrivalTime).toLocaleString('en-US') : 'N/A'}\n` +
            `- Departure (Check-out): ${makkahDepartureTime ? new Date(makkahDepartureTime).toLocaleString('en-US') : 'N/A'}\n` +
            `- Transport/Driver: ${makkahTransport || 'N/A'}`;

        const madinahSegEN = `*Madinah Stay (🕌):*\n` +
            `- Arrival (Check-in): ${madinahArrivalTime ? new Date(madinahArrivalTime).toLocaleString('en-US') : 'N/A'}\n` +
            `- Departure (Check-out): ${madinahDepartureTime ? new Date(madinahDepartureTime).toLocaleString('en-US') : 'N/A'}\n` +
            `- Transport/Driver: ${madinahTransport || 'N/A'}`;

        // Stay segments definitions (AR)
        const makkahSegAR = `*الإقامة في مكة المكرمة (🕋):*\n` +
            `- تاريخ الدخول: ${makkahArrivalTime ? new Date(makkahArrivalTime).toLocaleString('fr-FR') : 'غير محدد'}\n` +
            `- تاريخ الخروج: ${makkahDepartureTime ? new Date(makkahDepartureTime).toLocaleString('fr-FR') : 'غير محدد'}\n` +
            `- وسيلة النقل / السائق: ${makkahTransport || 'غير محدد'}`;

        const madinahSegAR = `*الإقامة في المدينة المنورة (🕌):*\n` +
            `- تاريخ الدخول: ${madinahArrivalTime ? new Date(madinahArrivalTime).toLocaleString('fr-FR') : 'غير محدد'}\n` +
            `- تاريخ الخروج: ${madinahDepartureTime ? new Date(madinahDepartureTime).toLocaleString('fr-FR') : 'غير محدد'}\n` +
            `- وسيلة النقل / السائق: ${madinahTransport || 'غير محدد'}`;

        // Order stay segments based on sequence preference
        const staysEN = firstDestination === 'MAKKAH' 
            ? `*2. ${makkahSegEN}*\n\n*3. ${madinahSegEN}*` 
            : `*2. ${madinahSegEN}*\n\n*3. ${makkahSegEN}*`;

        const staysAR = firstDestination === 'MAKKAH' 
            ? `*2. ${makkahSegAR}*\n\n*3. ${madinahSegAR}*` 
            : `*2. ${madinahSegAR}*\n\n*3. ${makkahSegAR}*`;

        // English manifest
        const manifestEN = `*LAND TRANSFER MANIFEST*\n` +
            `*Group:* ${selectedPilgrim.group_name || 'N/A'}\n` +
            `*Sequence:* ${firstDestination === 'MAKKAH' ? 'Makkah First' : 'Madinah First'}\n\n` +
            `*Passengers (${groupPilgrims.length}):*\n${passengerList}\n\n` +
            `*1. Airport Arrival:*\n` +
            `- Airport: ${arrivalAirport || 'N/A'}\n` +
            `- Date/Time: ${arrivalTime ? new Date(arrivalTime).toLocaleString('en-US') : 'N/A'}\n` +
            `- Flight: ${arrivalFlight || 'N/A'}\n\n` +
            `${staysEN}\n\n` +
            `*4. Departure to Airport:*\n` +
            `- Airport: ${airportName || 'N/A'}\n` +
            `- Date/Time: ${airportDepartureTime ? new Date(airportDepartureTime).toLocaleString('en-US') : 'N/A'}\n` +
            `- Transport/Driver: ${airportTransport || 'N/A'}`;

        // Arabic manifest
        const manifestAR = `*بيان النقل البري (Land Transfer)*\n` +
            `*المجموعة:* ${selectedPilgrim.group_name || 'غير محدد'}\n` +
            `*الترتيب:* ${firstDestination === 'MAKKAH' ? 'مكة أولاً' : 'المدينة أولاً'}\n\n` +
            `*الركاب (${groupPilgrims.length}):*\n${passengerListAR}\n\n` +
            `*1. الوصول إلى المطار:*\n` +
            `- مطار الوصول: ${arrivalAirport || 'غير محدد'}\n` +
            `- التاريخ والوقت: ${arrivalTime ? new Date(arrivalTime).toLocaleString('fr-FR') : 'غير محدد'}\n` +
            `- رقم الرحلة: ${arrivalFlight || 'غير محدد'}\n\n` +
            `${staysAR}\n\n` +
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

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-4 border-b border-emerald-500/10 pb-1">
                <button
                    onClick={() => setActiveTab('individual')}
                    className={`pb-3 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'individual' ? 'border-emerald-500 text-main' : 'border-transparent text-dim hover:text-main'}`}
                >
                    Gestion par Pèlerin
                </button>
                <button
                    onClick={() => setActiveTab('arrival_groups')}
                    className={`pb-3 text-xs font-black uppercase tracking-widest transition-all border-b-2 flex items-center gap-2 ${activeTab === 'arrival_groups' ? 'border-emerald-500 text-main' : 'border-transparent text-dim hover:text-main'}`}
                >
                    <Users className="w-3.5 h-3.5" /> Groupes d'Arrivée ({getArrivalGroups().length})
                </button>
                <button
                    onClick={() => setActiveTab('return_groups')}
                    className={`pb-3 text-xs font-black uppercase tracking-widest transition-all border-b-2 flex items-center gap-2 ${activeTab === 'return_groups' ? 'border-emerald-500 text-main' : 'border-transparent text-dim hover:text-main'}`}
                >
                    <Users className="w-3.5 h-3.5" /> Groupes de Retour ({getReturnGroups().length})
                </button>
            </div>

            {/* Filters (only visible for individual mode) */}
            {activeTab === 'individual' && (
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
            )}

            {/* Content Body */}
            {activeTab === 'individual' ? (
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
                                    <div className="flex flex-wrap gap-2">
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
                                                            setFirstDestination(defs.first_destination || 'MAKKAH');
                                                            setMakkahArrivalTime(defs.makkah_arrival_time ? defs.makkah_arrival_time.slice(0, 16) : '');
                                                            setMakkahDepartureTime(defs.makkah_departure_time ? defs.makkah_departure_time.slice(0, 16) : '');
                                                            setMakkahTransport(makkahTransport);
                                                            setMadinahArrivalTime(defs.madinah_arrival_time ? defs.madinah_arrival_time.slice(0, 16) : '');
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
                                        {selectedPilgrim.group_id && (
                                            <button 
                                                type="button"
                                                onClick={async () => {
                                                    try {
                                                        const res = await generateDriverShareLink(selectedPilgrim.group_id);
                                                        if (res.success && res.link) {
                                                            const fullLink = `${window.location.origin}${res.link}`;
                                                            navigator.clipboard.writeText(`${fullLink}\nCode PIN : ${res.passcode}`);
                                                            alert(`Lien d'accès chauffeur copié avec code PIN !\n\nLien : ${fullLink}\nCode PIN : ${res.passcode}`);
                                                        } else {
                                                            alert(res.error || "Erreur de génération.");
                                                        }
                                                    } catch (err) {
                                                        console.error(err);
                                                        alert("Erreur de génération.");
                                                    }
                                                }}
                                                className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl font-bold uppercase tracking-wider text-[10px] transition-all border border-blue-500/20"
                                            >
                                                <Users className="w-3.5 h-3.5" /> Lien Chauffeur
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Séquence du voyage */}
                                    <div className="bg-emerald-500/5 p-5 rounded-2xl border border-emerald-500/10 space-y-3 col-span-1 md:col-span-2">
                                        <label className="block text-[10px] font-black uppercase tracking-wider text-dim">Séquence du voyage</label>
                                        <div className="flex gap-6">
                                            <label className="flex items-center gap-2 text-xs text-main cursor-pointer">
                                                <input 
                                                    type="radio" 
                                                    name="first_destination" 
                                                    value="MAKKAH" 
                                                    checked={firstDestination === 'MAKKAH'} 
                                                    onChange={() => setFirstDestination('MAKKAH')}
                                                    className="w-4 h-4 text-emerald-500 border-emerald-500/20 bg-transparent focus:ring-0"
                                                />
                                                <span>🕋 La Mecque en Premier (Makkah First)</span>
                                            </label>
                                            <label className="flex items-center gap-2 text-xs text-main cursor-pointer">
                                                <input 
                                                    type="radio" 
                                                    name="first_destination" 
                                                    value="MADINAH" 
                                                    checked={firstDestination === 'MADINAH'} 
                                                    onChange={() => setFirstDestination('MADINAH')}
                                                    className="w-4 h-4 text-emerald-500 border-emerald-500/20 bg-transparent focus:ring-0"
                                                />
                                                <span>🕌 Médine en Premier (Madinah First)</span>
                                            </label>
                                        </div>
                                    </div>

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

                                    {/* Séjour à La Mecque */}
                                    <div className="bg-emerald-500/5 p-5 rounded-2xl border border-emerald-500/10 space-y-4">
                                        <h4 className="text-xs font-black uppercase tracking-wider text-main">2. Séjour à La Mecque (🕋)</h4>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-[10px] font-bold uppercase tracking-wider text-dim mb-1">Date/Heure d'arrivée (Entrée)</label>
                                                <input 
                                                    type="datetime-local" 
                                                    value={makkahArrivalTime} 
                                                    onChange={(e) => setMakkahArrivalTime(e.target.value)}
                                                    className="w-full bg-[#0b0f0d]/40 border border-emerald-500/10 rounded-xl px-3 py-2 text-xs text-main focus:outline-none focus:border-emerald-500" 
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold uppercase tracking-wider text-dim mb-1">Date/Heure de départ (Sortie)</label>
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

                                    {/* Séjour à Médine */}
                                    <div className="bg-emerald-500/5 p-5 rounded-2xl border border-emerald-500/10 space-y-4">
                                        <h4 className="text-xs font-black uppercase tracking-wider text-main">3. Séjour à Médine (🕌)</h4>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-[10px] font-bold uppercase tracking-wider text-dim mb-1">Date/Heure d'arrivée (Entrée)</label>
                                                <input 
                                                    type="datetime-local" 
                                                    value={madinahArrivalTime} 
                                                    onChange={(e) => setMadinahArrivalTime(e.target.value)}
                                                    className="w-full bg-[#0b0f0d]/40 border border-emerald-500/10 rounded-xl px-3 py-2 text-xs text-main focus:outline-none focus:border-emerald-500" 
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold uppercase tracking-wider text-dim mb-1">Date/Heure de départ (Sortie)</label>
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
            ) : (
                /* Grouped Views */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full flex justify-center items-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                        </div>
                    ) : (activeTab === 'arrival_groups' ? getArrivalGroups() : getReturnGroups()).length === 0 ? (
                        <p className="col-span-full text-center text-dim text-sm italic py-12">Aucun groupe de transfert trouvé pour ces vols.</p>
                    ) : (
                        (activeTab === 'arrival_groups' ? getArrivalGroups() : getReturnGroups()).map((g, idx) => {
                            const flight = g.flight;
                            const pelerins = g.pilgrims;
                            const menCount = pelerins.filter((p: any) => p.gender === 'M').length;
                            const womenCount = pelerins.filter((p: any) => p.gender === 'F').length;
                            
                            return (
                                <div key={idx} className="glass p-6 rounded-[2rem] border border-emerald-500/5 flex flex-col justify-between space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500">
                                                    {flight.airline}
                                                </span>
                                                <h3 className="text-xl font-black uppercase tracking-tighter text-main mt-0.5">
                                                    {flight.flight_number}
                                                </h3>
                                            </div>
                                            <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase px-2.5 py-1 rounded-xl border border-emerald-500/20">
                                                {pelerins.length} Pèlerins
                                            </span>
                                        </div>
                                        
                                        <div className="text-xs text-dim space-y-1">
                                            <p>🛫 {flight.departure_airport} ➔ 🛬 {flight.arrival_airport}</p>
                                            <p>📅 Date : {flight.dateStr}</p>
                                            <p>⏰ Dép. : {flight.departure_time ? new Date(flight.departure_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</p>
                                            <p>👥 Répartition : {menCount} ♂️ / {womenCount} ♀️</p>
                                        </div>

                                        <div className="border-t border-emerald-500/10 pt-3">
                                            <h4 className="text-[10px] font-black uppercase tracking-wider text-main mb-2">Passagers :</h4>
                                            <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                                                {pelerins.map((p: any) => (
                                                    <div key={p.id} className="text-[11px] text-dim flex justify-between">
                                                        <span>• {p.first_name} {p.family_name}</span>
                                                        <span className="text-[9px] uppercase font-bold text-emerald-500/70">
                                                            {p.gender === 'M' ? 'Hom' : 'Fem'}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-2 flex gap-2">
                                        <a 
                                            href={generateGroupWhatsAppManifest(g, activeTab === 'arrival_groups')}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-1/2 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-500 text-white dark:text-[#050605] rounded-xl font-bold uppercase tracking-wider text-[10px] transition-all shadow-md"
                                        >
                                            <MessageSquare className="w-3.5 h-3.5" /> Manifeste
                                        </a>
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                const firstP = pelerins[0];
                                                if (firstP && firstP.group_id) {
                                                    try {
                                                        const res = await generateDriverShareLink(firstP.group_id);
                                                        if (res.success && res.link) {
                                                            const fullLink = `${window.location.origin}${res.link}`;
                                                            navigator.clipboard.writeText(`${fullLink}\nCode PIN : ${res.passcode}`);
                                                            alert(`Lien d'accès chauffeur copié avec code PIN !\n\nLien : ${fullLink}\nCode PIN : ${res.passcode}`);
                                                        } else {
                                                            alert(res.error || "Erreur de génération.");
                                                        }
                                                    } catch (err) {
                                                        console.error(err);
                                                        alert("Erreur de génération.");
                                                    }
                                                } else {
                                                    alert("Aucun groupe de voyage associé aux pèlerins de ce vol.");
                                                }
                                            }}
                                            className="w-1/2 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl font-bold uppercase tracking-wider text-[10px] transition-all border border-blue-500/20"
                                        >
                                            Lien Chauffeur
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}
