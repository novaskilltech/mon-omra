'use client';

import React, { useState, useEffect } from 'react';
import { 
    Users, Plus, Search, User, CreditCard, 
    FileCheck, ShieldAlert, ArrowRight, Loader2, 
    CheckCircle, XCircle, Clock, CheckCircle2,
    DollarSign, BookOpen, Plane, Upload, Brain, Edit, Hotel, Trash2
} from 'lucide-react';
import { 
    getPilgrimsList, createPilgrim, updateVisaStatus, uploadVisaDocument,
    deletePilgrimAction,
    addPayment, getPilgrimPayments, getGroups,
    getRegistrationRequests, approveRegistrationRequest, rejectRegistrationRequest,
    extractFlightTicketOCR, saveIndividualFlightInfo, updatePilgrimPackagePrice,
    linkFamilyMember, unlinkFamilyMember, updatePilgrimAction,
    getAvailableFlightsAndHotels, saveIndividualHotelInfo
} from '@/lib/actions/concierge';
import { getPilgrimDocuments, deleteDocumentAction } from '@/lib/actions/documents';

export default function ConciergeDashboard() {
    const [pilgrims, setPilgrims] = useState<any[]>([]);
    const [groups, setGroups] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPilgrim, setSelectedPilgrim] = useState<any>(null);
    const [payments, setPayments] = useState<any[]>([]);
    const [pilgrimDocs, setPilgrimDocs] = useState<any[]>([]);
    
    // Flight & Baggage Form State
    const [flights, setFlights] = useState<any[]>([
        { flight_number: '', airline: '', departure_airport: '', arrival_airport: '', departure_time: '', arrival_time: '' }
    ]);
    const [baggageSoute, setBaggageSoute] = useState<string>('');
    const [baggageCabine, setBaggageCabine] = useState<string>('');
    const [baggageMain, setBaggageMain] = useState<string>('');
    
    // Family Link State
    const [familySearchText, setFamilySearchText] = useState('');
    const [selectedFamilyMemberId, setSelectedFamilyMemberId] = useState('');

    // Stays / Hotels Form State
    const [dbHotels, setDbHotels] = useState<any[]>([]);
    const [makkahHotelId, setMakkahHotelId] = useState<string>('');
    const [madinahHotelId, setMadinahHotelId] = useState<string>('');
    const [availableFlights, setAvailableFlights] = useState<any[]>([]);
    
    // Tab active view
    const [activeView, setActiveView] = useState<'pilgrims' | 'requests'>('pilgrims');
    const [requests, setRequests] = useState<any[]>([]);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [approveForm, setApproveForm] = useState({
        groupId: ''
    });

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
        groupId: '',
        flightId: ''
    });

    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({
        id: '',
        firstName: '',
        familyName: '',
        email: '',
        gender: 'M' as 'M' | 'F',
        groupId: '',
        flightId: ''
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
    const [selectedVisaFile, setSelectedVisaFile] = useState<File | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    const handleOpenVisaModal = () => {
        if (!selectedPilgrim) return;
        setVisaForm({
            status: (selectedPilgrim.visa_status || 'PENDING') as any,
            visaUrl: selectedPilgrim.visa_url || ''
        });
        setSelectedVisaFile(null);
        setShowVisaModal(true);
    };

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

            // Load registration requests
            const reqs = await getRegistrationRequests();
            setRequests(reqs);

            // Fetch hotels and flights
            const { hotels, flights: fls } = await getAvailableFlightsAndHotels();
            setDbHotels(hotels || []);
            setAvailableFlights(fls || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPilgrim = async (pilgrim: any) => {
        setSelectedPilgrim(pilgrim);
        const flightInfo = pilgrim.individual_flight_info || {};
        let flightsList = flightInfo.flights;
        if (!flightsList || !Array.isArray(flightsList) || flightsList.length === 0) {
            flightsList = [
                {
                    flight_number: flightInfo.flight_number || '',
                    airline: flightInfo.airline || '',
                    departure_airport: flightInfo.departure_airport || '',
                    arrival_airport: flightInfo.arrival_airport || '',
                    departure_time: flightInfo.departure_time || '',
                    arrival_time: flightInfo.arrival_time || ''
                }
            ];
        }
        setFlights(flightsList);

        // Parse baggage policy
        const policy = flightInfo.baggage_policy || '';
        const souteMatch = policy.match(/Soute:\s*([^|]+)/i);
        const cabineMatch = policy.match(/Cabine:\s*([^|]+)/i);
        const mainMatch = policy.match(/Sac:\s*([^|]+)/i);
        setBaggageSoute(souteMatch ? souteMatch[1].trim() : '');
        setBaggageCabine(cabineMatch ? cabineMatch[1].trim() : '');
        setBaggageMain(mainMatch ? mainMatch[1].trim() : '');

        // Populate hotels
        const hotelInfo = pilgrim.individual_hotel_info || {};
        setMakkahHotelId(hotelInfo.makkah_hotel_id || '');
        setMadinahHotelId(hotelInfo.madinah_hotel_id || '');

        try {
            const payList = await getPilgrimPayments(pilgrim.id);
            setPayments(payList);
            
            const docsRes = await getPilgrimDocuments(pilgrim.id);
            if (docsRes.success && docsRes.documents) {
                setPilgrimDocs(docsRes.documents);
            } else {
                setPilgrimDocs([]);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleDeleteDocument = async (docId: string, type: string) => {
        const confirmMsg = type === 'INVOICE' 
            ? "Voulez-vous vraiment supprimer cette facture ?" 
            : "Voulez-vous vraiment supprimer ce document ?";
        if (!confirm(confirmMsg)) return;

        setLoading(true);
        try {
            const res = await deleteDocumentAction(docId);
            if (res.success) {
                alert("Document supprimé avec succès.");
                if (selectedPilgrim) {
                    await handleSelectPilgrim(selectedPilgrim);
                }
            } else {
                alert(res.error || "Erreur de suppression");
            }
        } catch (err: any) {
            console.error(err);
            alert("Erreur technique lors de la suppression");
        } finally {
            setLoading(false);
        }
    };

    const handleAddPilgrimSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await createPilgrim(addForm);
            if (res.success) {
                setShowAddModal(false);
                setAddForm({ firstName: '', familyName: '', email: '', gender: 'M', groupId: '', flightId: '' });
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

    const handleEditPilgrimSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await updatePilgrimAction(editForm.id, {
                firstName: editForm.firstName,
                familyName: editForm.familyName,
                email: editForm.email,
                gender: editForm.gender,
                groupId: editForm.groupId || undefined,
                flightId: editForm.flightId
            });
            if (res.success) {
                setShowEditModal(false);
                const updatedList = await getPilgrimsList({
                    groupId: groupFilter || undefined,
                    visaStatus: visaFilter || undefined
                });
                setPilgrims(updatedList);
                const updatedPilgrim = updatedList.find((p: any) => p.id === editForm.id);
                if (updatedPilgrim) {
                    await handleSelectPilgrim(updatedPilgrim);
                }
            } else {
                alert(res.error || "Erreur lors de la modification");
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
            let currentVisaUrl = visaForm.status === 'APPROVED' ? visaForm.visaUrl : undefined;

            if (visaForm.status === 'APPROVED' && selectedVisaFile) {
                const formData = new FormData();
                formData.append('file', selectedVisaFile);
                const uploadRes = await uploadVisaDocument(selectedPilgrim.id, formData);
                if (uploadRes.error) {
                    alert(uploadRes.error);
                    return;
                }
                currentVisaUrl = uploadRes.path;
            }

            const res = await updateVisaStatus(
                selectedPilgrim.id, 
                visaForm.status, 
                currentVisaUrl
            );
            if (res.success) {
                setShowVisaModal(false);
                setSelectedPilgrim({
                    ...selectedPilgrim,
                    visa_status: visaForm.status,
                    visa_url: currentVisaUrl || ''
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

    const handleDeletePilgrim = async () => {
        if (!selectedPilgrim || deleteConfirmText !== 'SUPPRIMER') return;
        setLoading(true);
        try {
            const res = await deletePilgrimAction(selectedPilgrim.id);
            if (res.success) {
                setShowDeleteModal(false);
                setSelectedPilgrim(null);
                setDeleteConfirmText('');
                await loadData();
                alert("Pèlerin supprimé avec succès.");
            } else {
                alert(res.error || "Erreur de suppression");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRequest) return;
        setLoading(true);
        try {
            const res = await approveRegistrationRequest(selectedRequest.id, approveForm.groupId || undefined);
            if (res.success) {
                setShowApproveModal(false);
                setSelectedRequest(null);
                await loadData();
            } else {
                alert(res.error || "Erreur lors de l'approbation");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRejectRequest = async (requestId: string) => {
        if (!confirm("Voulez-vous vraiment rejeter cette demande d'inscription ?")) return;
        setLoading(true);
        try {
            const res = await rejectRegistrationRequest(requestId);
            if (res.success) {
                await loadData();
            } else {
                alert(res.error || "Erreur lors du rejet");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddFlightSegment = () => {
        setFlights((prev) => [
            ...prev,
            { flight_number: '', airline: '', departure_airport: '', arrival_airport: '', departure_time: '', arrival_time: '' }
        ]);
    };

    const handleRemoveFlightSegment = (index: number) => {
        if (flights.length <= 1) {
            alert("Vous devez avoir au moins un segment de vol.");
            return;
        }
        setFlights((prev) => prev.filter((_, i) => i !== index));
    };

    const handleFlightSegmentChange = (index: number, key: string, value: string) => {
        setFlights((prev) => prev.map((f, i) => i === index ? { ...f, [key]: value } : f));
    };

    const handleSaveFlightInfo = async () => {
        if (!selectedPilgrim) return;
        setLoading(true);

        const finalBaggagePolicy = [
            baggageSoute ? `Soute: ${baggageSoute}` : '',
            baggageCabine ? `Cabine: ${baggageCabine}` : '',
            baggageMain ? `Sac: ${baggageMain}` : ''
        ].filter(Boolean).join(' | ');

        const flightInfoToSave = {
            flights,
            baggage_policy: finalBaggagePolicy || 'Aucun bagage'
        };

        try {
            const res = await saveIndividualFlightInfo(selectedPilgrim.id, flightInfoToSave);
            if (res.success) {
                alert("Informations de vol enregistrées avec succès !");
                setSelectedPilgrim((prev: any) => ({
                    ...prev,
                    individual_flight_info: flightInfoToSave
                }));
                // Reload list to update local database states
                const list = await getPilgrimsList({
                    groupId: groupFilter || undefined,
                    visaStatus: visaFilter || undefined
                });
                setPilgrims(list);
            } else {
                alert(res.error || "Erreur lors de la sauvegarde.");
            }
        } catch (e) {
            console.error(e);
            alert("Erreur lors de la sauvegarde.");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveHotelInfo = async () => {
        if (!selectedPilgrim) return;
        setLoading(true);

        const hotelInfoToSave = {
            makkah_hotel_id: makkahHotelId || null,
            madinah_hotel_id: madinahHotelId || null
        };

        try {
            const res = await saveIndividualHotelInfo(selectedPilgrim.id, hotelInfoToSave);
            if (res.success) {
                alert("Informations d'hôtels enregistrées avec succès !");
                setSelectedPilgrim((prev: any) => ({
                    ...prev,
                    individual_hotel_info: hotelInfoToSave
                }));
                // Reload list to update local database states
                const list = await getPilgrimsList({
                    groupId: groupFilter || undefined,
                    visaStatus: visaFilter || undefined
                });
                setPilgrims(list);
            } else {
                alert(res.error || "Erreur lors de la sauvegarde.");
            }
        } catch (e) {
            console.error(e);
            alert("Erreur lors de la sauvegarde.");
        } finally {
            setLoading(false);
        }
    };

    const handleLinkFamilyMember = async () => {
        if (!selectedPilgrim || !selectedFamilyMemberId) return;
        setLoading(true);
        try {
            const res = await linkFamilyMember(selectedPilgrim.id, selectedFamilyMemberId);
            if (res.success) {
                alert("Membre de la famille lié avec succès !");
                setSelectedFamilyMemberId('');
                setFamilySearchText('');
                // Reload list to update local state
                const list = await getPilgrimsList({
                    groupId: groupFilter || undefined,
                    visaStatus: visaFilter || undefined
                });
                setPilgrims(list);
                // Refresh selected pilgrim reference in UI
                const updatedSelected = list.find((p: any) => p.id === selectedPilgrim.id);
                if (updatedSelected) setSelectedPilgrim(updatedSelected);
            } else {
                alert(res.error || "Erreur lors de la liaison.");
            }
        } catch (e) {
            console.error(e);
            alert("Erreur lors de la liaison.");
        } finally {
            setLoading(false);
        }
    };

    const handleUnlinkFamilyMember = async (memberId: string) => {
        if (!confirm("Voulez-vous vraiment retirer ce membre de la famille ?")) return;
        setLoading(true);
        try {
            const res = await unlinkFamilyMember(memberId);
            if (res.success) {
                alert("Membre de la famille détaché !");
                // Reload list
                const list = await getPilgrimsList({
                    groupId: groupFilter || undefined,
                    visaStatus: visaFilter || undefined
                });
                setPilgrims(list);
                // Refresh selected pilgrim reference in UI
                const updatedSelected = list.find((p: any) => p.id === selectedPilgrim.id);
                if (updatedSelected) setSelectedPilgrim(updatedSelected);
            } else {
                alert(res.error || "Erreur lors de la suppression du lien.");
            }
        } catch (e) {
            console.error(e);
            alert("Erreur lors de la suppression.");
        } finally {
            setLoading(false);
        }
    };

    const totalPaid = payments.reduce((acc, p) => p.status === 'COMPLETED' ? acc + parseFloat(p.amount) : acc, 0);
    const tripPrice = selectedPilgrim?.package_price !== undefined && selectedPilgrim?.package_price !== null ? Number(selectedPilgrim.package_price) : 2500;
    const remainingBalance = tripPrice - totalPaid;

    const filteredPilgrims = pilgrims.filter(p => 
        `${p.first_name} ${p.family_name}`.toLowerCase().includes(search.toLowerCase())
    );

    const linkedFamilyMembers = pilgrims.filter(p => p.family_head_id === selectedPilgrim?.id);
    const eligiblePilgrimsToLink = pilgrims.filter(p => 
        p.id !== selectedPilgrim?.id && 
        !p.family_head_id &&
        p.id !== selectedPilgrim?.family_head_id &&
        p.family_head_id !== selectedPilgrim?.id
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

            {/* Navigation Tabs */}
            <div className="flex gap-6 border-b border-emerald-500/10 pb-1">
                <button
                    onClick={() => setActiveView('pilgrims')}
                    className={`pb-3 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${activeView === 'pilgrims' ? 'border-emerald-500 text-main' : 'border-transparent text-dim hover:text-main'}`}
                >
                    Pèlerins Actifs ({pilgrims.length})
                </button>
                <button
                    onClick={() => setActiveView('requests')}
                    className={`pb-3 text-xs font-black uppercase tracking-widest transition-all border-b-2 relative ${activeView === 'requests' ? 'border-emerald-500 text-main' : 'border-transparent text-dim hover:text-main'}`}
                >
                    Demandes d'inscription ({requests.length})
                    {requests.length > 0 && (
                        <span className="absolute -top-1 -right-4 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
                            {requests.length}
                        </span>
                    )}
                </button>
            </div>

            {activeView === 'pilgrims' ? (
                <>
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
                                                    <h4 className="font-bold text-sm text-main uppercase flex items-center gap-2">
                                                        {p.gender === 'F' && (
                                                            <span className="w-2.5 h-2.5 rounded-full bg-pink-500 inline-block shrink-0 shadow-[0_0_8px_rgba(236,72,153,0.4)]" title="Féminin"></span>
                                                        )}
                                                        {p.gender === 'M' && (
                                                            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block shrink-0 shadow-[0_0_8px_rgba(96,165,250,0.4)]" title="Masculin"></span>
                                                        )}
                                                        <span>{p.first_name} {p.family_name}</span>
                                                    </h4>
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
                                            <h2 className="text-3xl font-black uppercase tracking-tighter text-main mt-1 flex items-center gap-3">
                                                {selectedPilgrim.gender === 'F' && (
                                                    <span className="w-4 h-4 rounded-full bg-pink-500 inline-block shrink-0 shadow-[0_0_12px_rgba(236,72,153,0.5)]" title="Féminin"></span>
                                                )}
                                                {selectedPilgrim.gender === 'M' && (
                                                    <span className="w-4 h-4 rounded-full bg-blue-400 inline-block shrink-0 shadow-[0_0_12px_rgba(96,165,250,0.5)]" title="Masculin"></span>
                                                )}
                                                <span>{selectedPilgrim.first_name} {selectedPilgrim.family_name}</span>
                                            </h2>
                                            <p className="text-xs text-dim italic mt-0.5">Groupe : {selectedPilgrim.group_name}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => {
                                                    setEditForm({
                                                        id: selectedPilgrim.id,
                                                        firstName: selectedPilgrim.first_name,
                                                        familyName: selectedPilgrim.family_name,
                                                        email: selectedPilgrim.email || '',
                                                        gender: selectedPilgrim.gender as 'M' | 'F',
                                                        groupId: selectedPilgrim.group_id || '',
                                                        flightId: selectedPilgrim.individual_flight_info?.selected_flight_id || ''
                                                    });
                                                    setShowEditModal(true);
                                                }}
                                                className="btn-secondary py-3 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-emerald-500/10 hover:bg-emerald-500/5 transition-all text-main"
                                            >
                                                <Edit className="w-3.5 h-3.5 text-emerald-500" /> Modifier Profil
                                            </button>
                                            <button 
                                                onClick={() => handleOpenVisaModal()}
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
 
                                                {/* Uploaded Documents List */}
                                                <div className="border-t border-emerald-500/10 pt-3 mt-3 space-y-2">
                                                    <span className="font-bold text-main block uppercase text-[10px] tracking-wider mb-2">Documents du Pèlerin :</span>
                                                    {pilgrimDocs && pilgrimDocs.filter((doc: any) => doc.type !== 'INVOICE').length > 0 ? (
                                                        <div className="space-y-2">
                                                            {pilgrimDocs.filter((doc: any) => doc.type !== 'INVOICE').map((doc: any) => {
                                                                const labelMap: Record<string, string> = {
                                                                    PASSPORT: "Passeport",
                                                                    PHOTO: "Photo d'identité",
                                                                    RESIDENCE_PERMIT: "Titre de séjour"
                                                                };
                                                                return (
                                                                    <div key={doc.id} className="flex justify-between items-center bg-[#0b0f0d]/30 p-2.5 rounded-xl border border-emerald-500/5">
                                                                        <div className="min-w-0 flex-1 pr-2">
                                                                            <span className="font-bold text-main block text-[11px] truncate">{labelMap[doc.type] || doc.type}</span>
                                                                            <span className="text-dim text-[10px] opacity-75 truncate block">{doc.file_name}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-2 shrink-0">
                                                                            {doc.url ? (
                                                                                <a 
                                                                                    href={doc.url} 
                                                                                    target="_blank" 
                                                                                    rel="noopener noreferrer" 
                                                                                    className="btn-premium px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest block text-center"
                                                                                >
                                                                                    Ouvrir
                                                                                </a>
                                                                            ) : (
                                                                                <span className="text-dim text-[9px]">Lien expiré</span>
                                                                            )}
                                                                            <button 
                                                                                onClick={() => handleDeleteDocument(doc.id, doc.type)}
                                                                                className="p-1.5 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                                                title="Supprimer le document"
                                                                            >
                                                                                <Trash2 className="w-3.5 h-3.5" />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <span className="text-dim italic text-[11px] block">Aucun document chargé.</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
 
                                        {/* Financial Calculator Block */}
                                        <div className="bg-emerald-500/5 p-6 rounded-3xl border border-emerald-500/10 space-y-4">
                                            <h4 className="text-xs font-black uppercase tracking-wider text-main flex items-center gap-2 m-0">
                                                <DollarSign className="w-4 h-4 text-emerald-500" /> Comptabilité Client
                                            </h4>
                                            <div className="space-y-2 text-xs">
                                                <div className="flex justify-between items-center gap-2">
                                                    <span className="text-dim">Total du Pack :</span>
                                                    <div className="flex items-center gap-1">
                                                        <input 
                                                            type="number" 
                                                            key={selectedPilgrim.id + '-' + tripPrice}
                                                            defaultValue={tripPrice} 
                                                            onBlur={async (e) => {
                                                                const val = parseFloat(e.target.value);
                                                                if (!isNaN(val) && val !== tripPrice) {
                                                                    const res = await updatePilgrimPackagePrice(selectedPilgrim.id, val);
                                                                    if (res.success) {
                                                                        setSelectedPilgrim((prev: any) => ({ ...prev, package_price: val }));
                                                                        const list = await getPilgrimsList({
                                                                            groupId: groupFilter || undefined,
                                                                            visaStatus: visaFilter || undefined
                                                                        });
                                                                        setPilgrims(list);
                                                                    } else {
                                                                        alert(res.error || "Erreur de mise à jour");
                                                                    }
                                                                }
                                                            }}
                                                            className="w-16 bg-[#0b0f0d]/40 border border-emerald-500/10 rounded px-1.5 py-0.5 text-right font-bold text-main focus:outline-none focus:border-emerald-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                                                        />
                                                        <span className="font-bold text-main">€</span>
                                                    </div>
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
 
                                                <div className="border-t border-emerald-500/10 pt-3 mt-3 space-y-2">
                                                    <span className="font-bold text-main block uppercase text-[10px] tracking-wider mb-2">Factures Transmises :</span>
                                                    {pilgrimDocs && pilgrimDocs.filter((doc: any) => doc.type === 'INVOICE').length > 0 ? (
                                                        <div className="space-y-2">
                                                            {pilgrimDocs.filter((doc: any) => doc.type === 'INVOICE').map((doc: any, idx: number) => (
                                                                <div key={doc.id} className="flex justify-between items-center bg-[#0b0f0d]/30 p-2.5 rounded-xl border border-emerald-500/5">
                                                                    <div className="min-w-0 flex-1 pr-2">
                                                                        <span className="font-bold text-main block text-[11px] truncate">Facture #{idx + 1}</span>
                                                                        <span className="text-dim text-[10px] opacity-75 truncate block">{doc.file_name}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 shrink-0">
                                                                        {doc.url ? (
                                                                            <a 
                                                                                href={doc.url} 
                                                                                target="_blank" 
                                                                                rel="noopener noreferrer" 
                                                                                className="btn-premium px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest block text-center"
                                                                            >
                                                                                Ouvrir
                                                                            </a>
                                                                        ) : (
                                                                            <span className="text-dim text-[9px]">Lien expiré</span>
                                                                        )}
                                                                        <button 
                                                                            onClick={() => handleDeleteDocument(doc.id, doc.type)}
                                                                            className="p-1.5 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                                            title="Supprimer la facture"
                                                                        >
                                                                            <Trash2 className="w-3.5 h-3.5" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-dim italic text-[11px] block">Aucune facture transmise.</span>
                                                    )}
                                                    
                                                    {pilgrimDocs && pilgrimDocs.filter((doc: any) => doc.type === 'INVOICE').length < 10 && (
                                                        <div className="pt-2">
                                                            <label className="flex items-center justify-center gap-2 px-3 py-2 bg-[#0b0e0c] border border-emerald-500/30 hover:border-emerald-500 text-emerald-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer transition-colors">
                                                                <Upload className="w-3.5 h-3.5" />
                                                                <span>Uploader une Facture</span>
                                                                <input 
                                                                    type="file" 
                                                                    accept=".pdf,image/*" 
                                                                    className="hidden" 
                                                                    onChange={async (e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (!file) return;
                                                                        if (file.size > 5 * 1024 * 1024) {
                                                                            alert("Le fichier ne doit pas dépasser 5 Mo.");
                                                                            return;
                                                                        }
                                                                        const formData = new FormData();
                                                                        formData.append('file', file);
                                                                        formData.append('type', 'INVOICE');
                                                                        formData.append('targetUserId', selectedPilgrim.id);
                                                                        
                                                                        try {
                                                                            const { uploadDocument } = await import('@/lib/actions/documents');
                                                                            const res = await uploadDocument(formData);
                                                                            if (res.error) {
                                                                                alert(res.error);
                                                                            } else {
                                                                                alert("Facture ajoutée et notification envoyée !");
                                                                                handleSelectPilgrim(selectedPilgrim);
                                                                            }
                                                                        } catch (err: any) {
                                                                            console.error(err);
                                                                            alert("Erreur lors de l'upload de la facture");
                                                                        }
                                                                    }} 
                                                                />
                                                            </label>
                                                        </div>
                                                    )}
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

                                    {/* Membres de la Famille & Accompagnateurs */}
                                    <div className="space-y-4 pt-6 border-t border-emerald-500/10">
                                        <h4 className="text-xs font-black uppercase tracking-wider text-main flex items-center gap-2 m-0">
                                            <Users className="w-4 h-4 text-emerald-500" /> Famille & Accompagnateurs
                                        </h4>
                                        <div className="bg-emerald-500/[0.02] border border-emerald-500/10 rounded-3xl p-6 space-y-6">
                                            <p className="text-xs text-dim m-0">
                                                Liez d'autres pèlerins à ce dossier pour regrouper les membres d'une même famille ou les accompagnateurs.
                                            </p>

                                            {/* Linked Family Members */}
                                            {linkedFamilyMembers.length === 0 ? (
                                                <p className="text-xs text-dim italic m-0">Aucun membre de la famille lié à ce pèlerin.</p>
                                            ) : (
                                                <div className="space-y-2.5">
                                                    <span className="text-[9px] font-black uppercase tracking-[0.15em] text-emerald-500">Membres rattachés</span>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {linkedFamilyMembers.map((member: any) => (
                                                            <div key={member.id} className="flex justify-between items-center bg-white/5 border border-emerald-500/10 rounded-2xl p-4">
                                                                <div>
                                                                    <p className="text-xs font-bold text-main uppercase">{member.first_name} {member.family_name}</p>
                                                                    <p className="text-[9px] text-dim uppercase tracking-wider mt-0.5">{member.group_name}</p>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleUnlinkFamilyMember(member.id)}
                                                                    className="text-red-500 hover:text-red-600 font-bold text-[10px] uppercase tracking-wider"
                                                                >
                                                                    Retirer
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Link Form */}
                                            <div className="space-y-3 pt-4 border-t border-emerald-500/10">
                                                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-emerald-500">Lier un nouveau membre</span>
                                                <div className="flex flex-col sm:flex-row gap-3 items-end">
                                                    <div className="flex-1 w-full space-y-1">
                                                        <input 
                                                            type="text" 
                                                            placeholder="Rechercher par nom..." 
                                                            value={familySearchText}
                                                            onChange={(e) => setFamilySearchText(e.target.value)}
                                                            className="w-full bg-[#0b0f0d]/40 border border-emerald-500/10 rounded-xl px-3 py-2 text-xs text-main focus:outline-none focus:border-emerald-500" 
                                                        />
                                                        {familySearchText && (
                                                            <select
                                                                value={selectedFamilyMemberId}
                                                                onChange={(e) => setSelectedFamilyMemberId(e.target.value)}
                                                                className="w-full bg-[#0b0f0d]/90 border border-emerald-500/10 rounded-xl px-3 py-2 text-xs text-main focus:outline-none focus:border-emerald-500 mt-1"
                                                            >
                                                                <option value="">-- Choisir un pèlerin à lier --</option>
                                                                {eligiblePilgrimsToLink
                                                                    .filter((p: any) => `${p.first_name} ${p.family_name}`.toLowerCase().includes(familySearchText.toLowerCase()))
                                                                    .map((p: any) => (
                                                                        <option key={p.id} value={p.id}>
                                                                            {p.first_name.toUpperCase()} {p.family_name.toUpperCase()} ({p.group_name})
                                                                        </option>
                                                                    ))
                                                                }
                                                            </select>
                                                        )}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={handleLinkFamilyMember}
                                                        disabled={!selectedFamilyMemberId}
                                                        className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-black uppercase tracking-widest text-[10px] py-3 px-6 rounded-2xl transition-all"
                                                    >
                                                        Lier au dossier
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Choix des Hôtels Individuels */}
                                    <div className="space-y-4 pt-6 border-t border-emerald-500/10">
                                        <h4 className="text-xs font-black uppercase tracking-wider text-main flex items-center gap-2 m-0">
                                            <Hotel className="w-4 h-4 text-emerald-500" /> Choix des Hôtels Individuels
                                        </h4>
                                        <div className="bg-emerald-500/[0.02] border border-emerald-500/10 rounded-3xl p-6 space-y-6">
                                            <p className="text-xs text-dim m-0">
                                                Sélectionnez individuellement les hôtels de Makkah et Médine pour ce pèlerin. Ces hôtels écrasent la configuration par défaut du groupe.
                                            </p>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Makkah Hotel Dropdown */}
                                                <div>
                                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-dim mb-1">Hôtel Makkah</label>
                                                    <select 
                                                        value={makkahHotelId}
                                                        onChange={(e) => setMakkahHotelId(e.target.value)}
                                                        className="w-full bg-[#0b0f0d]/40 border border-emerald-500/10 rounded-xl px-3 py-2 text-xs text-main focus:outline-none focus:border-emerald-500"
                                                    >
                                                        <option value="" className="bg-[#0b0e0c] text-main">-- Par défaut (Hôtel du groupe) --</option>
                                                        {dbHotels
                                                            .filter(h => h.city === 'MAKKAH')
                                                            .map(h => (
                                                                <option key={h.id} value={h.id} className="bg-[#0b0e0c] text-main">{h.name}</option>
                                                            ))
                                                        }
                                                    </select>
                                                </div>

                                                {/* Madinah Hotel Dropdown */}
                                                <div>
                                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-dim mb-1">Hôtel Médine</label>
                                                    <select 
                                                        value={madinahHotelId}
                                                        onChange={(e) => setMadinahHotelId(e.target.value)}
                                                        className="w-full bg-[#0b0f0d]/40 border border-emerald-500/10 rounded-xl px-3 py-2 text-xs text-main focus:outline-none focus:border-emerald-500"
                                                    >
                                                        <option value="" className="bg-[#0b0e0c] text-main">-- Par défaut (Hôtel du groupe) --</option>
                                                        {dbHotels
                                                            .filter(h => h.city === 'MADINAH')
                                                            .map(h => (
                                                                <option key={h.id} value={h.id} className="bg-[#0b0e0c] text-main">{h.name}</option>
                                                            ))
                                                        }
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="flex justify-end pt-2">
                                                <button
                                                    type="button"
                                                    onClick={handleSaveHotelInfo}
                                                    className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px] py-3 px-6 rounded-2xl transition-all shadow-lg hover:shadow-emerald-500/20"
                                                >
                                                    Enregistrer les Hôtels
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Détails du Vol & Bagages */}
                                    <div className="space-y-4 pt-6 border-t border-emerald-500/10">
                                        <h4 className="text-xs font-black uppercase tracking-wider text-main flex items-center gap-2 m-0">
                                            <Plane className="w-4 h-4 text-emerald-500" /> Détails des Vols & Bagages
                                        </h4>
                                        <div className="bg-emerald-500/[0.02] border border-emerald-500/10 rounded-3xl p-6 space-y-6">
                                            <p className="text-xs text-dim m-0">
                                                Renseignez manuellement les différents segments de vol (escales) du pèlerin ainsi que les options de bagages allouées.
                                            </p>

                                            {/* Flight Segments List */}
                                            <div className="space-y-6">
                                                {flights.map((flight, idx) => (
                                                    <div key={idx} className="bg-white/[0.02] border border-emerald-500/5 rounded-2xl p-4 space-y-4 relative">
                                                        <div className="flex justify-between items-center pb-2 border-b border-emerald-500/5">
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
                                                                Segment #{idx + 1} {idx === 0 ? "(Départ principal)" : `(Escale #${idx})`}
                                                            </span>
                                                            {flights.length > 1 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveFlightSegment(idx)}
                                                                    className="text-red-400 hover:text-red-500 text-[10px] font-bold uppercase tracking-wider"
                                                                >
                                                                    Supprimer
                                                                </button>
                                                            )}
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-[10px] font-bold uppercase tracking-wider text-dim mb-1">Compagnie Aérienne</label>
                                                                <input 
                                                                    type="text" 
                                                                    placeholder="Ex: Turkish Airlines, Pegasus..."
                                                                    value={flight.airline || ''} 
                                                                    onChange={(e) => handleFlightSegmentChange(idx, 'airline', e.target.value)}
                                                                    className="w-full bg-white/5 border border-emerald-500/10 rounded-xl px-3 py-2 text-xs text-main focus:outline-none focus:border-emerald-500" 
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] font-bold uppercase tracking-wider text-dim mb-1">Numéro de Vol</label>
                                                                <input 
                                                                    type="text" 
                                                                    placeholder="Ex: TK1822, PC1130..."
                                                                    value={flight.flight_number || ''} 
                                                                    onChange={(e) => handleFlightSegmentChange(idx, 'flight_number', e.target.value)}
                                                                    className="w-full bg-white/5 border border-emerald-500/10 rounded-xl px-3 py-2 text-xs text-main focus:outline-none focus:border-emerald-500" 
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] font-bold uppercase tracking-wider text-dim mb-1">Aéroport de Départ (IATA)</label>
                                                                <input 
                                                                    type="text" 
                                                                    placeholder="Ex: CDG, IST..."
                                                                    value={flight.departure_airport || ''} 
                                                                    onChange={(e) => handleFlightSegmentChange(idx, 'departure_airport', e.target.value)}
                                                                    className="w-full bg-white/5 border border-emerald-500/10 rounded-xl px-3 py-2 text-xs text-main focus:outline-none focus:border-emerald-500" 
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] font-bold uppercase tracking-wider text-dim mb-1">Aéroport d'Arrivée (IATA)</label>
                                                                <input 
                                                                    type="text" 
                                                                    placeholder="Ex: IST, JED..."
                                                                    value={flight.arrival_airport || ''} 
                                                                    onChange={(e) => handleFlightSegmentChange(idx, 'arrival_airport', e.target.value)}
                                                                    className="w-full bg-white/5 border border-emerald-500/10 rounded-xl px-3 py-2 text-xs text-main focus:outline-none focus:border-emerald-500" 
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] font-bold uppercase tracking-wider text-dim mb-1">Date & Heure Départ</label>
                                                                <input 
                                                                    type="datetime-local" 
                                                                    value={flight.departure_time ? flight.departure_time.slice(0, 16) : ''} 
                                                                    onChange={(e) => handleFlightSegmentChange(idx, 'departure_time', e.target.value)}
                                                                    className="w-full bg-white/5 border border-emerald-500/10 rounded-xl px-3 py-2 text-xs text-main focus:outline-none focus:border-emerald-500" 
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] font-bold uppercase tracking-wider text-dim mb-1">Date & Heure Arrivée</label>
                                                                <input 
                                                                    type="datetime-local" 
                                                                    value={flight.arrival_time ? flight.arrival_time.slice(0, 16) : ''} 
                                                                    onChange={(e) => handleFlightSegmentChange(idx, 'arrival_time', e.target.value)}
                                                                    className="w-full bg-white/5 border border-emerald-500/10 rounded-xl px-3 py-2 text-xs text-main focus:outline-none focus:border-emerald-500" 
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}

                                                <div className="flex justify-start">
                                                    <button
                                                        type="button"
                                                        onClick={handleAddFlightSegment}
                                                        className="flex items-center gap-1.5 px-4 py-2 border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                                                    >
                                                        + Ajouter une escale / vol
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Politique de Bagages */}
                                            <div className="space-y-4 pt-6 border-t border-emerald-500/10">
                                                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-emerald-500">Politique de Bagages</span>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    {/* Soute */}
                                                    <div className="bg-[#0b0f0d]/30 border border-emerald-500/5 rounded-2xl p-4 space-y-3">
                                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-emerald-400">Bagage en Soute</label>
                                                        <p className="text-[9px] text-dim m-0 leading-relaxed italic">Grande valise voyageant en soute d'avion.</p>
                                                        <div className="grid grid-cols-3 gap-1">
                                                            {['Aucun', '10kg', '12kg', '15kg', '20kg', '23kg', '25kg'].map((w) => (
                                                                <button
                                                                    key={w}
                                                                    type="button"
                                                                    onClick={() => setBaggageSoute(w === 'Aucun' ? '' : w)}
                                                                    className={`py-1.5 text-[9px] font-bold rounded-lg border text-center transition-all ${
                                                                        (w === 'Aucun' && !baggageSoute) || baggageSoute === w
                                                                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                                                            : 'bg-white/5 border-white/5 text-dim hover:bg-white/10 hover:text-main'
                                                                    }`}
                                                                >
                                                                    {w}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Cabine (Petite valise) */}
                                                    <div className="bg-[#0b0f0d]/30 border border-emerald-500/5 rounded-2xl p-4 space-y-3">
                                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-emerald-400">Bagage Cabine (Petite Valise)</label>
                                                        <p className="text-[9px] text-dim m-0 leading-relaxed italic">Petite valise trolley autorisée dans les coffres cabines.</p>
                                                        <div className="grid grid-cols-2 gap-1">
                                                            {['Aucun', '7kg', '8kg', '10kg'].map((w) => (
                                                                <button
                                                                    key={w}
                                                                    type="button"
                                                                    onClick={() => setBaggageCabine(w === 'Aucun' ? '' : w)}
                                                                    className={`py-1.5 text-[9px] font-bold rounded-lg border text-center transition-all ${
                                                                        (w === 'Aucun' && !baggageCabine) || baggageCabine === w
                                                                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                                                            : 'bg-white/5 border-white/5 text-dim hover:bg-white/10 hover:text-main'
                                                                    }`}
                                                                >
                                                                    {w}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Bagage à main (Simple sac) */}
                                                    <div className="bg-[#0b0f0d]/30 border border-emerald-500/5 rounded-2xl p-4 space-y-3">
                                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-emerald-400">Sac à Main (Sous le siège)</label>
                                                        <p className="text-[9px] text-dim m-0 leading-relaxed italic">Sac à dos ou sac à main voyageant sous le siège.</p>
                                                        <div className="grid grid-cols-2 gap-1">
                                                            {['Aucun', '3kg', '10kg'].map((w) => (
                                                                <button
                                                                    key={w}
                                                                    type="button"
                                                                    onClick={() => setBaggageMain(w === 'Aucun' ? '' : w)}
                                                                    className={`py-1.5 text-[9px] font-bold rounded-lg border text-center transition-all ${
                                                                        (w === 'Aucun' && !baggageMain) || baggageMain === w
                                                                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                                                            : 'bg-white/5 border-white/5 text-dim hover:bg-white/10 hover:text-main'
                                                                    }`}
                                                                >
                                                                    {w}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-end pt-2">
                                                <button
                                                    type="button"
                                                    onClick={handleSaveFlightInfo}
                                                    className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px] py-3 px-6 rounded-2xl transition-all shadow-lg hover:shadow-emerald-500/20"
                                                >
                                                    Enregistrer le Vol et Bagages
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action de suppression critique tout en bas */}
                                    <div className="pt-8 border-t border-red-500/10 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => setShowDeleteModal(true)}
                                            className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 hover:border-red-500 font-black uppercase tracking-widest text-[10px] py-3.5 px-6 rounded-2xl transition-all shadow-lg hover:shadow-red-500/10 flex items-center gap-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            delete
                                        </button>
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
                </>
            ) : (
                <div className="glass p-8 rounded-[2.5rem] border-emerald-500/5 space-y-6">
                    <h3 className="text-sm font-black uppercase tracking-wider text-main flex items-center gap-2 m-0">
                        <Users className="w-4 h-4 text-emerald-500 animate-pulse" /> Demandes d'inscription en attente ({requests.length})
                    </h3>
                    
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                        </div>
                    ) : requests.length === 0 ? (
                        <p className="text-center text-dim text-sm italic py-12">Aucune demande en attente.</p>
                    ) : (
                        <div className="overflow-x-auto animate-in fade-in duration-500">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-emerald-500/10 text-dim">
                                        <th className="pb-3 font-bold uppercase tracking-wider">Date</th>
                                        <th className="pb-3 font-bold uppercase tracking-wider">Nom & Prénom</th>
                                        <th className="pb-3 font-bold uppercase tracking-wider">E-mail</th>
                                        <th className="pb-3 font-bold uppercase tracking-wider">Téléphone</th>
                                        <th className="pb-3 font-bold uppercase tracking-wider">Genre</th>
                                        <th className="pb-3 font-bold uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requests.map((req) => (
                                        <tr key={req.id} className="border-b border-emerald-500/5 text-main hover:bg-emerald-500/[0.02] transition-colors">
                                            <td className="py-4">{new Date(req.created_at).toLocaleDateString('fr-FR')}</td>
                                            <td className="py-4 font-bold uppercase">{req.family_name} {req.first_name}</td>
                                            <td className="py-4 font-mono text-dim">{req.email}</td>
                                            <td className="py-4">{req.phone || '-'}</td>
                                            <td className="py-4">{req.gender === 'M' ? 'Homme' : 'Femme'}</td>
                                            <td className="py-4 text-right flex justify-end gap-2">
                                                <button
                                                    onClick={() => { setSelectedRequest(req); setShowApproveModal(true); }}
                                                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-[#050605] rounded-xl text-[9px] font-black uppercase tracking-wider shadow transition-all"
                                                >
                                                    Approuver
                                                </button>
                                                <button
                                                    onClick={() => handleRejectRequest(req.id)}
                                                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-[9px] font-black uppercase tracking-wider border border-red-500/15 transition-all"
                                                >
                                                    Rejeter
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Modal: Approve Registration Request */}
            {showApproveModal && selectedRequest && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
                    <form onSubmit={handleApproveSubmit} className="glass w-full max-w-md p-8 rounded-[2.5rem] border-emerald-500/10 space-y-6">
                        <div>
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500 font-black">MODÉRATION D'ACCÈS</span>
                            <h3 className="text-xl font-black uppercase tracking-tighter text-main mt-1">Approuver l'inscription</h3>
                            <p className="text-xs text-dim mt-2">
                                Vous allez valider le dossier de <strong className="text-main uppercase">{selectedRequest.family_name} {selectedRequest.first_name}</strong> ({selectedRequest.email}).
                            </p>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[9px] font-black uppercase tracking-wider text-dim mb-1">Associer à un Groupe de Voyage</label>
                                <select 
                                    value={approveForm.groupId}
                                    onChange={(e) => setApproveForm({ ...approveForm, groupId: e.target.value })}
                                    className="w-full glass px-4 py-3 rounded-2xl border border-emerald-500/5 outline-none text-sm text-main"
                                    required
                                >
                                    <option value="" className="bg-[#0b0e0c] text-main">Choisir un groupe</option>
                                    {groups.map(g => (
                                        <option key={g.id} value={g.id} className="bg-[#0b0e0c] text-main">{g.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button 
                                type="button"
                                onClick={() => { setShowApproveModal(false); setSelectedRequest(null); }}
                                className="w-1/2 btn-secondary py-3 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-500/10 text-main"
                            >
                                Annuler
                            </button>
                            <button 
                                type="submit"
                                className="w-1/2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-[#050605] rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg shadow-emerald-500/20"
                            >
                                Valider & Créer
                            </button>
                        </div>
                    </form>
                </div>
            )}

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
                                <label className="block text-[9px] font-black uppercase tracking-wider text-dim mb-1">Adresse Email (Optionnel)</label>
                                <input 
                                    type="email" 
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
                            <div>
                                <label className="block text-[9px] font-black uppercase tracking-wider text-dim mb-1">Vol Assigné (Optionnel)</label>
                                <select 
                                    value={addForm.flightId || ''}
                                    onChange={(e) => setAddForm({ ...addForm, flightId: e.target.value })}
                                    className="w-full glass px-4 py-3 rounded-2xl border border-emerald-500/5 outline-none text-sm text-main"
                                >
                                    <option value="" className="bg-[#0b0e0c] text-main">Aucun vol assigné</option>
                                    {availableFlights.map(f => {
                                        const segments = f.flight_segments || [];
                                        const firstSeg = segments[0];
                                        const lastSeg = segments[segments.length - 1];
                                        const dateStr = firstSeg ? new Date(firstSeg.departure_time).toLocaleDateString('fr-FR') : '';
                                        const display = firstSeg
                                            ? `${firstSeg.airline || ''} (${firstSeg.flight_number || ''}) - ${firstSeg.departure_airport || ''} ➔ ${lastSeg?.arrival_airport || firstSeg.arrival_airport || ''} (${dateStr})`
                                            : `Vol #${f.id.slice(0, 8)}`;
                                        return (
                                            <option key={f.id} value={f.id} className="bg-[#0b0e0c] text-main">
                                                {display}
                                            </option>
                                        );
                                    })}
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

            {/* Modal: Edit Pilgrim */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
                    <form onSubmit={handleEditPilgrimSubmit} className="glass w-full max-w-md p-8 rounded-[2.5rem] border-emerald-500/10 space-y-6">
                        <h3 className="text-xl font-black uppercase tracking-tighter text-main m-0">Modifier le Dossier Pèlerin</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[9px] font-black uppercase tracking-wider text-dim mb-1">Prénom</label>
                                <input 
                                    type="text" 
                                    required
                                    value={editForm.firstName}
                                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                                    className="w-full glass px-4 py-3 rounded-2xl border-emerald-500/5 outline-none text-sm text-main"
                                />
                            </div>
                            <div>
                                <label className="block text-[9px] font-black uppercase tracking-wider text-dim mb-1">Nom de Famille</label>
                                <input 
                                    type="text" 
                                    required
                                    value={editForm.familyName}
                                    onChange={(e) => setEditForm({ ...editForm, familyName: e.target.value })}
                                    className="w-full glass px-4 py-3 rounded-2xl border-emerald-500/5 outline-none text-sm text-main"
                                />
                            </div>
                            <div>
                                <label className="block text-[9px] font-black uppercase tracking-wider text-dim mb-1">Adresse Email (Optionnel)</label>
                                <input 
                                    type="email" 
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                    className="w-full glass px-4 py-3 rounded-2xl border-emerald-500/5 outline-none text-sm text-main"
                                />
                            </div>
                            <div>
                                <label className="block text-[9px] font-black uppercase tracking-wider text-dim mb-1">Genre</label>
                                <select 
                                    value={editForm.gender}
                                    onChange={(e) => setEditForm({ ...editForm, gender: e.target.value as 'M' | 'F' })}
                                    className="w-full glass px-4 py-3 rounded-2xl border border-emerald-500/5 outline-none text-sm text-main"
                                >
                                    <option value="M" className="bg-[#0b0e0c] text-main">Masculin</option>
                                    <option value="F" className="bg-[#0b0e0c] text-main">Féminin</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[9px] font-black uppercase tracking-wider text-dim mb-1">Groupe de Voyage</label>
                                <select 
                                    value={editForm.groupId}
                                    onChange={(e) => setEditForm({ ...editForm, groupId: e.target.value })}
                                    className="w-full glass px-4 py-3 rounded-2xl border border-emerald-500/5 outline-none text-sm text-main"
                                >
                                    <option value="" className="bg-[#0b0e0c] text-main">Sélectionner un groupe</option>
                                    {groups.map(g => (
                                        <option key={g.id} value={g.id} className="bg-[#0b0e0c] text-main">{g.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[9px] font-black uppercase tracking-wider text-dim mb-1">Vol Assigné (Optionnel)</label>
                                <select 
                                    value={editForm.flightId || ''}
                                    onChange={(e) => setEditForm({ ...editForm, flightId: e.target.value })}
                                    className="w-full glass px-4 py-3 rounded-2xl border border-emerald-500/5 outline-none text-sm text-main"
                                >
                                    <option value="" className="bg-[#0b0e0c] text-main">Aucun vol assigné</option>
                                    {availableFlights.map(f => {
                                        const segments = f.flight_segments || [];
                                        const firstSeg = segments[0];
                                        const lastSeg = segments[segments.length - 1];
                                        const dateStr = firstSeg ? new Date(firstSeg.departure_time).toLocaleDateString('fr-FR') : '';
                                        const display = firstSeg
                                            ? `${firstSeg.airline || ''} (${firstSeg.flight_number || ''}) - ${firstSeg.departure_airport || ''} ➔ ${lastSeg?.arrival_airport || firstSeg.arrival_airport || ''} (${dateStr})`
                                            : `Vol #${f.id.slice(0, 8)}`;
                                        return (
                                            <option key={f.id} value={f.id} className="bg-[#0b0e0c] text-main">
                                                {display}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button 
                                type="button"
                                onClick={() => setShowEditModal(false)}
                                className="w-1/2 btn-secondary py-3 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-500/10 text-main"
                            >
                                Annuler
                            </button>
                            <button 
                                type="submit"
                                className="w-1/2 px-6 py-3 bg-emerald-600 dark:bg-emerald-500 text-white dark:text-[#050605] rounded-2xl font-black uppercase tracking-widest text-[10px]"
                            >
                                Modifier
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
                                    <label className="block text-[9px] font-black uppercase tracking-wider text-dim mb-1">Document du Visa (PDF ou Image)</label>
                                    <input 
                                        type="file" 
                                        accept=".pdf,image/*"
                                        required={!visaForm.visaUrl}
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                setSelectedVisaFile(e.target.files[0]);
                                            }
                                        }}
                                        className="w-full glass px-4 py-3 rounded-2xl border-emerald-500/5 outline-none text-sm text-main"
                                    />
                                    {visaForm.visaUrl && (
                                        <p className="text-xs text-dim mt-2 truncate">
                                            Document existant : {visaForm.visaUrl.split('/').pop()}
                                        </p>
                                    )}
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

            {/* Modal: Confirmer la Suppression (Double confirmation) */}
            {showDeleteModal && selectedPilgrim && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
                    <div className="glass w-full max-w-md p-8 rounded-[2.5rem] border-red-500/10 space-y-6">
                        <div className="flex items-center gap-3 text-red-500">
                            <ShieldAlert className="w-6 h-6" />
                            <h3 className="text-xl font-black uppercase tracking-tighter text-main m-0">Suppression Critique</h3>
                        </div>

                        <div className="space-y-4">
                            <p className="text-xs text-sub leading-relaxed font-light">
                                Vous êtes sur le point de supprimer définitivement le pèlerin <strong className="text-white uppercase font-black">{selectedPilgrim.first_name} {selectedPilgrim.family_name}</strong>.
                            </p>
                            <p className="text-xs text-red-500 font-bold uppercase tracking-wider bg-red-500/10 p-4 rounded-2xl border border-red-500/20">
                                Attention : Cette action supprimera sa fiche, son profil et son compte d'accès Supabase Auth. Cette opération est irréversible.
                            </p>
                            <div>
                                <label className="block text-[9px] font-black uppercase tracking-wider text-dim mb-2">
                                    Veuillez écrire <strong className="text-white">SUPPRIMER</strong> pour confirmer :
                                </label>
                                <input 
                                    type="text" 
                                    placeholder="SUPPRIMER"
                                    value={deleteConfirmText}
                                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                                    className="w-full glass px-4 py-3 rounded-2xl border-red-500/20 outline-none text-sm text-main font-bold uppercase tracking-widest text-center"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button 
                                type="button"
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeleteConfirmText('');
                                }}
                                className="w-1/2 btn-secondary py-3 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-500/10 text-main"
                            >
                                Annuler
                            </button>
                            <button 
                                type="button"
                                disabled={deleteConfirmText !== 'SUPPRIMER'}
                                onClick={handleDeletePilgrim}
                                className="w-1/2 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-20 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
                            >
                                Confirmer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
