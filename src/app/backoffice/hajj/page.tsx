'use client';

import { useState, useEffect } from 'react';
import { 
    Users, Calendar, Search, Filter, Phone, Mail, Globe, Home, 
    CheckCircle, Clock, XCircle, Trash2, MessageSquare, Compass, Loader2, 
    AlertCircle, RefreshCw, ShieldCheck, Copy, Check, ExternalLink, Edit3, 
    FileText, Sparkles, X, ShieldAlert, Download, FileSpreadsheet, FileCode, ChevronDown,
    Key, Terminal, CheckCheck, Eye, EyeOff
} from 'lucide-react';
import { 
    getHajjRequestsAction, 
    updateHajjRequestStatusAction, 
    updateHajjAuditAction, 
    deleteHajjRequestAction,
    getHajjSyncConfigAction
} from '@/lib/actions/hajj';
import { 
    formatPhoneForWhatsApp, 
    getWhatsAppUrl, 
    getWhatsAppWebUrl, 
    formatDisplayPhone 
} from '@/lib/utils/phone';
import { 
    generateHajjCsv, 
    generateHajjJson, 
    triggerFileDownload 
} from '@/lib/utils/hajjExport';

export default function BackofficeHajjPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [yearFilter, setYearFilter] = useState<string>('ALL');
    const [nusukFilter, setNusukFilter] = useState<string>('ALL');
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    // Audit & Reply Modal State
    const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
    const [auditForm, setAuditForm] = useState({
        hasNusukAccount: 'NON',
        nusukAccountYear: 'NON_APPLICABLE',
        nusukAccountStatus: 'NON_VERIFIE',
        availabilitySlots: '',
        adminNotes: '',
        status: 'PENDING'
    });
    const [savingAudit, setSavingAudit] = useState(false);
    const [copiedType, setCopiedType] = useState<'whatsapp' | 'email' | null>(null);
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

    // Synchronisation API M2M State
    const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
    const [syncConfig, setSyncConfig] = useState<any | null>(null);
    const [loadingSyncConfig, setLoadingSyncConfig] = useState(false);
    const [showApiKey, setShowApiKey] = useState(false);
    const [copiedApiKey, setCopiedApiKey] = useState(false);
    const [copiedCurl, setCopiedCurl] = useState(false);
    const [testingApi, setTestingApi] = useState(false);
    const [apiTestResult, setApiTestResult] = useState<any | null>(null);

    const handleOpenSyncModal = async () => {
        setIsSyncModalOpen(true);
        if (!syncConfig) {
            setLoadingSyncConfig(true);
            try {
                const res = await getHajjSyncConfigAction();
                if (res.success) {
                    setSyncConfig(res);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingSyncConfig(false);
            }
        }
    };

    const handleCopyApiKey = () => {
        if (!syncConfig?.apiKey) return;
        navigator.clipboard.writeText(syncConfig.apiKey);
        setCopiedApiKey(true);
        setTimeout(() => setCopiedApiKey(false), 2500);
    };

    const handleCopyCurl = () => {
        if (!syncConfig?.apiKey) return;
        const origin = typeof window !== 'undefined' ? window.location.origin : 'https://mon-omra.fr';
        const curlCmd = `curl -X GET "${origin}/api/v1/hajj/pilgrims" \\\n  -H "Authorization: Bearer ${syncConfig.apiKey}"`;
        navigator.clipboard.writeText(curlCmd);
        setCopiedCurl(true);
        setTimeout(() => setCopiedCurl(false), 2500);
    };

    const handleTestLiveApi = async () => {
        if (!syncConfig?.apiKey) return;
        setTestingApi(true);
        setApiTestResult(null);
        try {
            const res = await fetch('/api/v1/hajj/pilgrims?limit=5', {
                headers: {
                    'Authorization': `Bearer ${syncConfig.apiKey}`
                }
            });
            const data = await res.json();
            setApiTestResult({ status: res.status, ok: res.ok, data });
        } catch (err: any) {
            setApiTestResult({ status: 500, ok: false, data: { error: err.message } });
        } finally {
            setTestingApi(false);
        }
    };

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

    const handleOpenAuditModal = (req: any) => {
        setSelectedRequest(req);
        setAuditForm({
            hasNusukAccount: req.has_nusuk_account || 'NON',
            nusukAccountYear: req.nusuk_account_year || 'NON_APPLICABLE',
            nusukAccountStatus: req.nusuk_account_status || 'NON_VERIFIE',
            availabilitySlots: req.availability_slots || '',
            adminNotes: req.admin_notes || '',
            status: req.status || 'PENDING'
        });
        setCopiedType(null);
    };

    const handleSaveAudit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRequest) return;

        setSavingAudit(true);
        try {
            const res = await updateHajjAuditAction(selectedRequest.id, {
                hasNusukAccount: auditForm.hasNusukAccount,
                nusukAccountYear: auditForm.hasNusukAccount === 'OUI' ? auditForm.nusukAccountYear : 'NON_APPLICABLE',
                nusukAccountStatus: auditForm.nusukAccountStatus,
                availabilitySlots: auditForm.availabilitySlots,
                adminNotes: auditForm.adminNotes,
                status: auditForm.status
            });

            if (res.success) {
                setRequests(prev => prev.map(r => r.id === selectedRequest.id ? {
                    ...r,
                    has_nusuk_account: auditForm.hasNusukAccount,
                    nusuk_account_year: auditForm.hasNusukAccount === 'OUI' ? auditForm.nusukAccountYear : 'NON_APPLICABLE',
                    nusuk_account_status: auditForm.nusukAccountStatus,
                    availability_slots: auditForm.availabilitySlots,
                    admin_notes: auditForm.adminNotes,
                    status: auditForm.status
                } : r));
                setSelectedRequest(null);
            } else {
                alert(res.error || "Erreur lors de la mise à jour.");
            }
        } catch (err: any) {
            console.error(err);
            alert(err.message || "Erreur de sauvegarde.");
        } finally {
            setSavingAudit(false);
        }
    };

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

    // Message generators
    const generateWhatsAppText = (req: any) => {
        const firstName = req.first_name || 'Cher pèlerin';
        const year = req.hajj_year || 2027;
        const people = req.people_count > 1 ? ` pour ${req.people_count} personnes` : '';
        const nusukStatus = req.has_nusuk_account === 'OUI' 
            ? `votre compte Nusuk Hajj (${req.nusuk_account_year === '2026_2027' ? 'ouvert cette année' : 'ouvert l’an dernier'})`
            : `la création de votre compte officiel sur la plateforme Nusuk Hajj`;

        return `Salam alaykoum ${firstName},
C'est l'équipe OMRAYANAIR concernant votre demande de pré-inscription pour le Grand Hajj ${year}${people}.

Nous organisons actuellement les vérifications des comptes officiels Nusuk Hajj pour préparer l'accès aux quotas.

📌 Concernant votre dossier :
1. Plateforme Nusuk : ${nusukStatus}
2. Statut des documents : Nous devons vérifier si votre profil est validé ou s'il vous manque des pièces (passeport, photo réglementaire).
3. Appel WhatsApp de 5 min : Seriez-vous disponible sur ce numéro pour un rapide point de vérification ?

Merci de nous confirmer votre créneau souhaité.
Qu'Allah vous facilite ce noble projet.

OMRAYANAIR Conciergerie Hajj`;
    };

    const generateEmailSubject = (req: any) => {
        return `OMRAYANAIR — Pré-inscription Hajj ${req.hajj_year || 2027} & Vérification de votre compte Nusuk`;
    };

    const generateEmailBody = (req: any) => {
        const firstName = req.first_name || 'Cher pèlerin';
        const year = req.hajj_year || 2027;
        const people = req.people_count > 1 ? ` pour ${req.people_count} personnes` : '';

        return `Salam alaykoum ${firstName},

Nous avons bien reçu votre demande de pré-inscription pour le Grand Hajj ${year}${people} sur la plateforme OMRAYANAIR.

Afin de sécuriser votre dossier pour les prochaines attributions de quotas officiels par le Ministère du Hajj :

1. COMPTE NUSUK HAJJ :
Avez-vous déjà créé votre compte officiel sur la plateforme Nusuk Hajj (cette année ou l'an dernier) ?

2. VÉRIFICATION DES PIÈCES :
Votre compte est-il validé à 100% ou des documents sont-ils en attente (passeport, photo d'identité aux normes saoudiennes) ?

3. APPEL DE VÉRIFICATION WHATSAPP :
Nous réalisons des sessions d'audit gratuites de 5 minutes par WhatsApp pour vérifier votre compte ensemble.
Quel créneau vous conviendrait le mieux aujourd'hui ou cette semaine ?

Restant à votre entière disposition pour vous accompagner dans ce voyage béni.

Fraternellement,
L'équipe OMRAYANAIR Conciergerie Hajj
contact@omrayanair.com`;
    };

    const handleCopy = (text: string, type: 'whatsapp' | 'email') => {
        navigator.clipboard.writeText(text);
        setCopiedType(type);
        setTimeout(() => setCopiedType(null), 2500);
    };

    // Exports Hajj (CSV & JSON)
    const handleExportCsv = () => {
        if (filteredRequests.length === 0) {
            alert("Aucun pèlerin à exporter.");
            return;
        }
        const csvContent = generateHajjCsv(filteredRequests);
        const dateStr = new Date().toISOString().split('T')[0];
        triggerFileDownload(csvContent, `pelerins-hajj-${dateStr}.csv`, 'text/csv;charset=utf-8;');
        setIsExportMenuOpen(false);
    };

    const handleExportJson = () => {
        if (filteredRequests.length === 0) {
            alert("Aucun pèlerin à exporter.");
            return;
        }
        const jsonContent = generateHajjJson(filteredRequests);
        const dateStr = new Date().toISOString().split('T')[0];
        triggerFileDownload(jsonContent, `pelerins-hajj-${dateStr}.json`, 'application/json;charset=utf-8;');
        setIsExportMenuOpen(false);
    };

    const handleExportSingleJson = (req: any) => {
        const jsonContent = generateHajjJson([req]);
        const cleanName = `${req.first_name || 'pelerin'}-${req.family_name || 'hajj'}`.toLowerCase().replace(/[^a-z0-9]/g, '-');
        triggerFileDownload(jsonContent, `pelerin-hajj-${cleanName}.json`, 'application/json;charset=utf-8;');
    };

    // Derived statistics
    const totalRequests = requests.length;
    const totalPeople = requests.reduce((sum, r) => sum + (r.people_count || 1), 0);
    const pendingRequests = requests.filter(r => r.status === 'PENDING').length;
    const withNusukAccount = requests.filter(r => r.has_nusuk_account === 'OUI').length;

    // Filtered requests list
    const filteredRequests = requests.filter(r => {
        const matchesSearch = 
            `${r.first_name} ${r.family_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (r.email && r.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (r.phone && r.phone.includes(searchTerm)) ||
            (r.nationality && r.nationality.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (r.address && r.address.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
        const matchesYear = yearFilter === 'ALL' || r.hajj_year.toString() === yearFilter;
        const matchesNusuk = nusukFilter === 'ALL' || 
            (nusukFilter === 'OUI' && r.has_nusuk_account === 'OUI') ||
            (nusukFilter === 'NON' && r.has_nusuk_account === 'NON') ||
            (nusukFilter === 'EN_COURS' && r.has_nusuk_account === 'EN_COURS');

        return matchesSearch && matchesStatus && matchesYear && matchesNusuk;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return { label: 'En attente', style: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: Clock };
            case 'CONTACTED':
                return { label: 'Contacté', style: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: MessageSquare };
            case 'CONFIRMED':
                return { label: 'Audit Validé', style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: CheckCircle };
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
                        Demandes & Audit Nusuk <span className="text-[#D8AA4D]">HAJJ</span>
                    </h1>
                    <p className="text-xs text-dim mt-1 font-medium">
                        Répondez en 1 clic par WhatsApp ou E-mail et auditez les comptes officiels Nusuk Hajj de vos pèlerins.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={loadRequests}
                        disabled={loading}
                        className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold transition-all border bg-white/5 border-white/10 text-main hover:bg-white/10 active:scale-95 text-xs"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        <span>Actualiser</span>
                    </button>

                    {/* Bouton Clé API & Synchronisation */}
                    <button
                        onClick={handleOpenSyncModal}
                        className="flex items-center gap-2 px-4 py-3 rounded-2xl font-black transition-all border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 hover:text-white active:scale-95 text-xs shadow-lg shadow-emerald-500/10 cursor-pointer"
                        title="Afficher la clé API et les instructions de synchronisation externe"
                    >
                        <Key className="w-4 h-4 text-emerald-400" />
                        <span className="hidden sm:inline">Clé API Synchro</span>
                        <span className="sm:hidden">Clé API</span>
                    </button>

                    {/* Menu Déroulant Export (CSV & JSON) */}
                    <div className="relative">
                        <button
                            onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                            disabled={loading || requests.length === 0}
                            className="flex items-center gap-2.5 px-5 py-3 rounded-2xl font-black transition-all border border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-amber-500/15 text-amber-300 hover:text-white hover:border-amber-400 active:scale-95 text-xs shadow-lg shadow-amber-500/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Exporter les informations des pèlerins pour application externe"
                        >
                            <Download className="w-4 h-4 text-amber-400" />
                            <span>Exporter ({filteredRequests.length})</span>
                            <ChevronDown className={`w-3.5 h-3.5 text-amber-400 transition-transform ${isExportMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isExportMenuOpen && (
                            <>
                                <div 
                                    className="fixed inset-0 z-40" 
                                    onClick={() => setIsExportMenuOpen(false)} 
                                />
                                <div className="absolute right-0 mt-2 w-72 rounded-2xl p-2 bg-[#0a120e] border border-amber-500/40 shadow-2xl z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                                <div className="px-3 py-2 border-b border-white/5 mb-1 text-left">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-amber-400">Exporter pour Application Hajj</p>
                                    <p className="text-[11px] text-zinc-400 mt-0.5">
                                        {filteredRequests.length} pèlerin{filteredRequests.length > 1 ? 's' : ''} {filteredRequests.length !== requests.length ? '(sélection filtrée)' : '(base complète)'}
                                    </p>
                                </div>

                                <button
                                    onClick={handleExportCsv}
                                    className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 text-left transition-colors group cursor-pointer"
                                >
                                    <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 group-hover:scale-105 transition-transform shrink-0">
                                        <FileSpreadsheet className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-white block">Format CSV (.csv)</span>
                                        <span className="text-[10px] text-zinc-400 leading-tight block">Excel &amp; Google Sheets (UTF-8 avec BOM)</span>
                                    </div>
                                </button>

                                <button
                                    onClick={handleExportJson}
                                    className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 text-left transition-colors group cursor-pointer mt-1"
                                >
                                    <div className="p-2 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 group-hover:scale-105 transition-transform shrink-0">
                                        <FileCode className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-white block">Format JSON (.json)</span>
                                        <span className="text-[10px] text-zinc-400 leading-tight block">Format structuré pour application dédiée Hajj</span>
                                    </div>
                                </button>
                            </div>
                            </>
                        )}
                    </div>
                </div>
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
                    <p className="text-[11px] text-dim font-bold mt-1">Cumul des inscrits (familles & groupes)</p>
                </div>

                <div className="glass p-6 rounded-3xl border border-white/5 bg-white/[0.02]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Avec Compte Nusuk Hajj</p>
                    <p className="text-3xl font-black text-emerald-400 mt-2">{withNusukAccount}</p>
                    <p className="text-[11px] text-dim font-bold mt-1">Candidats déjà enregistrés sur Nusuk</p>
                </div>

                <div className="glass p-6 rounded-3xl border border-white/5 bg-white/[0.02]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Sans Compte ou À Créer</p>
                    <p className="text-3xl font-black text-blue-400 mt-2">{totalRequests - withNusukAccount}</p>
                    <p className="text-[11px] text-dim font-bold mt-1">Nécessitent un accompagnement création</p>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="glass p-6 rounded-3xl border border-white/5 bg-white/[0.02] flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Search */}
                <div className="relative w-full md:w-80">
                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-dim" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Rechercher nom, email, téléphone, ville..."
                        className="w-full bg-white/5 border border-white/10 pl-11 pr-4 py-3 rounded-2xl text-xs outline-none focus:border-[#D8AA4D]/50 text-main"
                    />
                </div>

                {/* Filter Selects */}
                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl text-xs">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#D8AA4D]" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-dim">Nusuk :</span>
                        <select
                            value={nusukFilter}
                            onChange={(e) => setNusukFilter(e.target.value)}
                            className="bg-transparent text-xs font-bold text-main outline-none cursor-pointer"
                        >
                            <option value="ALL" className="bg-[#0c120f]">Tous les profils</option>
                            <option value="OUI" className="bg-[#0c120f]">Avec compte Nusuk</option>
                            <option value="NON" className="bg-[#0c120f]">Sans compte Nusuk</option>
                            <option value="EN_COURS" className="bg-[#0c120f]">En cours de création</option>
                        </select>
                    </div>

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
                            <option value="CONFIRMED" className="bg-[#0c120f]">Audit Validé</option>
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
                <div className="space-y-5">
                    {filteredRequests.map((req) => {
                        const statusObj = getStatusBadge(req.status);
                        const StatusIcon = statusObj.icon;
                        const displayPhone = formatDisplayPhone(req.phone, req.nationality);
                        const whatsAppText = generateWhatsAppText(req);
                        const whatsappAppUrl = getWhatsAppUrl(req.phone, whatsAppText, req.nationality);
                        const whatsappWebUrl = getWhatsAppWebUrl(req.phone, whatsAppText, req.nationality);
                        
                        const emailSubject = encodeURIComponent(generateEmailSubject(req));
                        const emailBody = encodeURIComponent(generateEmailBody(req));
                        const mailtoUrl = req.email ? `mailto:${req.email}?subject=${emailSubject}&body=${emailBody}` : null;

                        return (
                            <div 
                                key={req.id} 
                                className="glass p-6 md:p-8 rounded-3xl border border-white/5 hover:border-[#D8AA4D]/30 transition-all space-y-5 bg-white/[0.01]"
                            >
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-[#D8AA4D]/10 border border-[#D8AA4D]/25 flex items-center justify-center text-[#D8AA4D] font-black text-lg">
                                            {req.first_name?.[0]}{req.family_name?.[0]}
                                        </div>
                                        <div>
                                            <h3 className="text-base font-black uppercase tracking-tight text-main flex items-center gap-2">
                                                <span>{req.first_name} {req.family_name}</span>
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-3 text-xs text-dim font-medium mt-1">
                                                <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5 text-[#D8AA4D]" /> {req.nationality}</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-emerald-400" /> Hajj {req.hajj_year}</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-blue-400" /> {req.people_count} personne(s)</span>
                                                <span>•</span>
                                                <span className="bg-amber-400/10 text-amber-300 border border-amber-400/30 text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                                                    <span>🕋</span>
                                                    <span>Yusr Al Mashaer</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status selector */}
                                    <div className="flex items-center gap-3 flex-wrap">
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
                                            <option value="CONFIRMED" className="bg-[#0c120f]">Audit Validé</option>
                                            <option value="CANCELLED" className="bg-[#0c120f]">Annulé</option>
                                        </select>
                                    </div>
                                </div>

                                {/* NUSUK AUDIT BADGES & DISPONIBILITÉS */}
                                <div className="p-4 rounded-2xl bg-amber-500/[0.04] border border-amber-500/15 flex flex-wrap items-center gap-3">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#D8AA4D] flex items-center gap-1.5 mr-1">
                                        <ShieldCheck className="w-4 h-4" />
                                        Audit Nusuk :
                                    </span>

                                    {/* Compte Nusuk Badge */}
                                    {req.has_nusuk_account === 'OUI' ? (
                                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" />
                                            Compte Nusuk {req.nusuk_account_year === '2026_2027' ? '(Créé en 2026/2027)' : '(Créé l’an dernier)'}
                                        </span>
                                    ) : req.has_nusuk_account === 'EN_COURS' ? (
                                        <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            Nusuk : En cours de création
                                        </span>
                                    ) : (
                                        <span className="bg-white/5 text-dim border border-white/10 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                            <XCircle className="w-3 h-3" />
                                            Nusuk : Aucun compte créé
                                        </span>
                                    )}

                                    {/* Statut de Vérification Badge */}
                                    {req.has_nusuk_account === 'OUI' && (
                                        req.nusuk_account_status === 'VERIFIE' ? (
                                            <span className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase px-3 py-1 rounded-full">
                                                Compte Vérifié & Validé ✅
                                            </span>
                                        ) : req.nusuk_account_status === 'DOCUMENTS_MANQUANTS' ? (
                                            <span className="bg-red-500/15 text-red-300 border border-red-500/30 text-[10px] font-black uppercase px-3 py-1 rounded-full flex items-center gap-1">
                                                <ShieldAlert className="w-3 h-3" />
                                                Documents Manquants ⚠️
                                            </span>
                                        ) : req.nusuk_account_status === 'EN_ATTENTE' ? (
                                            <span className="bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase px-3 py-1 rounded-full">
                                                En attente de validation ⏳
                                            </span>
                                        ) : (
                                            <span className="bg-white/5 text-dim border border-white/10 text-[10px] font-bold px-3 py-1 rounded-full">
                                                Statut Nusuk non renseigné
                                            </span>
                                        )
                                    )}

                                    {/* Disponibilités Appel WhatsApp */}
                                    {req.availability_slots && (
                                        <span className="bg-purple-500/10 text-purple-300 border border-purple-500/30 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                            <Phone className="w-3 h-3" />
                                            Créneau souhaité : {req.availability_slots}
                                        </span>
                                    )}

                                    {req.admin_notes && (
                                        <span className="bg-amber-500/10 text-[#F2CE79] border border-amber-500/20 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                            <FileText className="w-3 h-3" />
                                            Note : {req.admin_notes}
                                        </span>
                                    )}
                                </div>

                                {/* Body details */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1 text-xs">
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
                                            <span>{displayPhone || req.phone}</span>
                                        </a>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black uppercase tracking-wider text-dim">Adresse Postale</p>
                                        <p className="text-main font-medium flex items-center gap-1.5 truncate">
                                            <Home className="w-3.5 h-3.5 text-dim shrink-0" />
                                            <span className="truncate">{req.address}</span>
                                        </p>
                                    </div>
                                </div>

                                {/* FOOTER ACTIONS RAPIDES 1-CLIC */}
                                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/5">
                                    <span className="text-[9px] text-dim font-bold">
                                        Soumis le {new Date(req.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </span>

                                    <div className="flex items-center gap-2.5 flex-wrap">
                                        {/* Bouton 1-clic Répondre par WhatsApp */}
                                        {whatsappAppUrl && (
                                            <a
                                                href={whatsappAppUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-[10px] uppercase tracking-wider transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
                                                title={`Ouvrir WhatsApp sur ${displayPhone} avec message d'audit`}
                                            >
                                                <MessageSquare className="w-3.5 h-3.5" />
                                                <span>Répondre par WhatsApp</span>
                                            </a>
                                        )}

                                        {/* Bouton 1-clic Répondre par E-mail */}
                                        {mailtoUrl && (
                                            <a
                                                href={mailtoUrl}
                                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D8AA4D]/15 hover:bg-[#D8AA4D]/25 text-[#F2CE79] border border-[#D8AA4D]/30 font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                                                title="Ouvrir votre client e-mail avec message d'audit pré-rédigé"
                                            >
                                                <Mail className="w-3.5 h-3.5" />
                                                <span>Répondre par E-mail</span>
                                            </a>
                                        )}

                                        {/* Bouton Fiche Audit & Gestion */}
                                        <button
                                            onClick={() => handleOpenAuditModal(req)}
                                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-main border border-white/10 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                                            title="Ouvrir le formulaire d'audit et voir les messages"
                                        >
                                            <Edit3 className="w-3.5 h-3.5 text-[#D8AA4D]" />
                                            <span>Gérer l'Audit</span>
                                        </button>

                                        {/* Bouton Export Individuel JSON */}
                                        <button
                                            onClick={() => handleExportSingleJson(req)}
                                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-amber-300 border border-white/10 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                                            title="Exporter cette fiche au format JSON pour votre application Hajj dédiée"
                                        >
                                            <FileCode className="w-3.5 h-3.5 text-amber-400" />
                                            <span>JSON</span>
                                        </button>

                                        {/* Bouton Supprimer */}
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

            {/* MODAL D'AUDIT NUSUK & RÉPONSE RAPIDE */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-[#020302]/90 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                    <div className="glass w-full max-w-3xl rounded-[2.5rem] border border-amber-500/30 overflow-hidden flex flex-col max-h-[92vh]">
                        <header className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-[#050a08]/40 shrink-0">
                            <div className="text-left">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        Fiche d'Audit Nusuk Hajj
                                    </div>
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-[10px] font-black uppercase tracking-wider">
                                        <span>🕋 Provider : Yusr Al Mashaer</span>
                                    </div>
                                </div>
                                <h3 className="text-xl font-black uppercase tracking-tight text-main">
                                    {selectedRequest.first_name} {selectedRequest.family_name}
                                </h3>
                                <p className="text-xs text-dim font-medium">
                                    Hajj {selectedRequest.hajj_year} • {selectedRequest.people_count} personne(s) • <span className="text-[#D8AA4D] font-bold">{formatDisplayPhone(selectedRequest.phone, selectedRequest.nationality)}</span>
                                </p>
                            </div>
                            <button 
                                onClick={() => setSelectedRequest(null)} 
                                className="p-2 hover:bg-white/10 rounded-xl transition-all text-dim hover:text-main"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </header>

                        <form onSubmit={handleSaveAudit} className="p-8 space-y-6 overflow-y-auto text-left">
                            {/* Section Qualification Nusuk */}
                            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                                <h4 className="text-xs font-black uppercase tracking-wider text-[#D8AA4D] flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4" />
                                    Statut du Compte Nusuk Hajj Officiel
                                </h4>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-wider text-dim">Compte créé ?</label>
                                        <select
                                            value={auditForm.hasNusukAccount}
                                            onChange={(e) => setAuditForm({ ...auditForm, hasNusukAccount: e.target.value })}
                                            className="w-full bg-[#0c120f] border border-white/10 p-3 rounded-xl text-xs font-bold text-main outline-none focus:border-[#D8AA4D]/50"
                                        >
                                            <option value="NON">Non (À créer)</option>
                                            <option value="OUI">Oui (Existant)</option>
                                            <option value="EN_COURS">En cours de création</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-wider text-dim">Année d'ouverture</label>
                                        <select
                                            disabled={auditForm.hasNusukAccount !== 'OUI'}
                                            value={auditForm.nusukAccountYear}
                                            onChange={(e) => setAuditForm({ ...auditForm, nusukAccountYear: e.target.value })}
                                            className="w-full bg-[#0c120f] border border-white/10 p-3 rounded-xl text-xs font-bold text-main outline-none focus:border-[#D8AA4D]/50 disabled:opacity-50"
                                        >
                                            <option value="2026_2027">Cette année (2026 / 2027)</option>
                                            <option value="2025_ANTERIEUR">L'an dernier (2025 ou antérieur)</option>
                                            <option value="NON_APPLICABLE">Non applicable</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-wider text-dim">Validation du compte</label>
                                        <select
                                            value={auditForm.nusukAccountStatus}
                                            onChange={(e) => setAuditForm({ ...auditForm, nusukAccountStatus: e.target.value })}
                                            className="w-full bg-[#0c120f] border border-white/10 p-3 rounded-xl text-xs font-bold text-main outline-none focus:border-[#D8AA4D]/50"
                                        >
                                            <option value="NON_VERIFIE">Non vérifié</option>
                                            <option value="VERIFIE">Compte vérifié & validé ✅</option>
                                            <option value="EN_ATTENTE">En attente de validation ⏳</option>
                                            <option value="DOCUMENTS_MANQUANTS">Documents manquants ⚠️</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-wider text-dim">Créneau d'appel WhatsApp souhaité</label>
                                        <input
                                            type="text"
                                            value={auditForm.availabilitySlots}
                                            onChange={(e) => setAuditForm({ ...auditForm, availabilitySlots: e.target.value })}
                                            placeholder="Ex: Soirée (18h - 21h)"
                                            className="w-full bg-[#0c120f] border border-white/10 p-3 rounded-xl text-xs text-main outline-none focus:border-[#D8AA4D]/50"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-wider text-dim">Statut de la demande</label>
                                        <select
                                            value={auditForm.status}
                                            onChange={(e) => setAuditForm({ ...auditForm, status: e.target.value })}
                                            className="w-full bg-[#0c120f] border border-white/10 p-3 rounded-xl text-xs font-bold text-main outline-none focus:border-[#D8AA4D]/50"
                                        >
                                            <option value="PENDING">En attente de traitement</option>
                                            <option value="CONTACTED">Pèlerin Contacté</option>
                                            <option value="CONFIRMED">Audit Validé & Confirmé</option>
                                            <option value="CANCELLED">Annulé</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1 pt-2">
                                    <label className="text-[9px] font-black uppercase tracking-wider text-dim">Notes d'audit internes (Agence)</label>
                                    <textarea
                                        rows={2}
                                        value={auditForm.adminNotes}
                                        onChange={(e) => setAuditForm({ ...auditForm, adminNotes: e.target.value })}
                                        placeholder="Ex: Passeport valide jusqu'en 2029, pèlerin a besoin d'aide pour le téléversement de la photo de sa femme."
                                        className="w-full bg-[#0c120f] border border-white/10 p-3 rounded-xl text-xs text-main outline-none focus:border-[#D8AA4D]/50"
                                    />
                                </div>
                            </div>

                            {/* Section Prévisualisation Message WhatsApp */}
                            <div className="p-5 rounded-2xl bg-emerald-500/[0.04] border border-emerald-500/20 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                                        <MessageSquare className="w-4 h-4" />
                                        Modèle de Message WhatsApp d'Audit
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() => handleCopy(generateWhatsAppText(selectedRequest), 'whatsapp')}
                                        className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                                    >
                                        {copiedType === 'whatsapp' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                        <span>{copiedType === 'whatsapp' ? 'Copié !' : 'Copier texte'}</span>
                                    </button>
                                </div>

                                <pre className="bg-[#0c120f] p-4 rounded-xl text-[11px] text-dim whitespace-pre-wrap font-mono leading-relaxed border border-white/5 max-h-36 overflow-y-auto select-all">
                                    {generateWhatsAppText(selectedRequest)}
                                </pre>

                                <div className="flex flex-wrap gap-3 pt-1">
                                    <a
                                        href={getWhatsAppUrl(selectedRequest.phone, generateWhatsAppText(selectedRequest), selectedRequest.nationality)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-emerald-500/20"
                                        title="Ouvrir dans l'application WhatsApp Desktop ou Mobile"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                        <span>Ouvrir WhatsApp (Bureau / App)</span>
                                    </a>

                                    <a
                                        href={getWhatsAppWebUrl(selectedRequest.phone, generateWhatsAppText(selectedRequest), selectedRequest.nationality)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-emerald-300 border border-emerald-500/30 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                        title="Ouvrir directement dans un nouvel onglet WhatsApp Web"
                                    >
                                        <Globe className="w-3.5 h-3.5" />
                                        <span>Ouvrir WhatsApp Web</span>
                                    </a>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setSelectedRequest(null)}
                                    className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-dim text-xs font-bold"
                                >
                                    Fermer
                                </button>

                                <button
                                    type="submit"
                                    disabled={savingAudit}
                                    className="bg-[#D8AA4D] hover:bg-[#F2CE79] text-[#050605] px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2"
                                >
                                    {savingAudit ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <span>Sauvegarder l'Audit</span>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Synchronisation API Externe */}
            {isSyncModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-[#0b1410] border border-emerald-500/30 rounded-3xl max-w-2xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <button
                            type="button"
                            onClick={() => setIsSyncModalOpen(false)}
                            className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-dim hover:text-white transition-all cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                                <Key className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-wider mb-1">
                                    <Sparkles className="w-3 h-3" />
                                    Synchronisation Machine-to-Machine
                                </div>
                                <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white">
                                    Clé API &amp; Synchronisation Hajj
                                </h3>
                                <p className="text-xs text-zinc-400 mt-1">
                                    Permet à n'importe quelle autre plateforme de lire automatiquement vos nouvelles inscriptions Hajj.
                                </p>
                            </div>
                        </div>

                        {loadingSyncConfig ? (
                            <div className="py-12 flex flex-col items-center justify-center gap-3">
                                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                                <span className="text-xs text-zinc-400">Chargement de la configuration API...</span>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                {/* Clé API Secrète */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
                                        <span>Clé Secrète API (Bearer Token)</span>
                                        <span className="text-[10px] text-amber-400 font-normal">À conserver secrète</span>
                                    </label>
                                    <div className="flex items-center gap-2 bg-[#060b08] border border-white/10 rounded-2xl p-2 px-3">
                                        <code className="text-xs font-mono text-emerald-400 flex-1 truncate select-all">
                                            {showApiKey 
                                                ? (syncConfig?.apiKey || 'Clé non définie') 
                                                : (syncConfig?.apiKey ? `${syncConfig.apiKey.slice(0, 15)}••••••••••••••••••••••••••••••••` : 'Aucune clé configurée')}
                                        </code>
                                        <button
                                            type="button"
                                            onClick={() => setShowApiKey(!showApiKey)}
                                            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                                            title={showApiKey ? 'Masquer' : 'Afficher en clair'}
                                        >
                                            {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleCopyApiKey}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs transition-colors cursor-pointer"
                                        >
                                            {copiedApiKey ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                            <span>{copiedApiKey ? 'Copié !' : 'Copier'}</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Endpoint REST */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-300">
                                        URL de l'Endpoint REST
                                    </label>
                                    <div className="bg-[#060b08] border border-white/10 rounded-2xl p-3 flex items-center justify-between gap-3">
                                        <code className="text-xs font-mono text-amber-400 select-all truncate">
                                            GET {typeof window !== 'undefined' ? window.location.origin : 'https://mon-omra.fr'}/api/v1/hajj/pilgrims
                                        </code>
                                        <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                                            JSON
                                        </span>
                                    </div>
                                </div>

                                {/* Exemple d'appel cURL */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-zinc-300 flex items-center gap-2">
                                            <Terminal className="w-3.5 h-3.5 text-zinc-400" />
                                            <span>Exemple de commande (cURL / HTTP)</span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={handleCopyCurl}
                                            className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                                        >
                                            {copiedCurl ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                            <span>{copiedCurl ? 'cURL copié' : 'Copier cURL'}</span>
                                        </button>
                                    </div>
                                    <pre className="bg-[#060b08] border border-white/10 rounded-2xl p-4 text-[11px] font-mono text-zinc-300 overflow-x-auto leading-relaxed">
{`curl -X GET "${typeof window !== 'undefined' ? window.location.origin : 'https://mon-omra.fr'}/api/v1/hajj/pilgrims" \\
  -H "Authorization: Bearer ${syncConfig?.apiKey || '<VOTRE_CLE_API>'}"`}
                                    </pre>
                                </div>

                                {/* Paramètres de synchronisation différentielle */}
                                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 text-left">
                                    <p className="text-[11px] font-black uppercase tracking-wider text-amber-400">
                                        Synchronisation différentielle (Uniquement les nouveaux)
                                    </p>
                                    <p className="text-xs text-zinc-400 leading-relaxed">
                                        Ajoutez le paramètre <code className="text-amber-300 bg-black/40 px-1 py-0.5 rounded">?since=YYYY-MM-DDTHH:mm:ssZ</code> pour ne récupérer que les formulaires soumis depuis votre dernière synchronisation.
                                    </p>
                                    <p className="text-[11px] text-zinc-500">
                                        Exemple : <code className="text-zinc-400">/api/v1/hajj/pilgrims?since=2026-10-30T00:00:00Z&amp;limit=50</code>
                                    </p>
                                </div>

                                {/* Test en direct */}
                                <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
                                    <button
                                        type="button"
                                        onClick={handleTestLiveApi}
                                        disabled={testingApi || !syncConfig?.apiKey}
                                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                                    >
                                        {testingApi ? <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> : <RefreshCw className="w-4 h-4 text-emerald-400" />}
                                        <span>Tester l'API en direct</span>
                                    </button>

                                    {apiTestResult && (
                                        <div className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                                            apiTestResult.ok ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/15 text-red-300 border border-red-500/30'
                                        }`}>
                                            {apiTestResult.ok ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
                                            <span>
                                                {apiTestResult.ok 
                                                    ? `Succès 200 OK (${apiTestResult.data?.count || 0} pèlerins détectés)` 
                                                    : `Erreur ${apiTestResult.status}`}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="pt-2 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setIsSyncModalOpen(false)}
                                className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-bold transition-colors cursor-pointer"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
