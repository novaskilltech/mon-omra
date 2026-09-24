'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    Lock, Key, ShieldCheck, User, Mail, Phone, MapPin, 
    Plane, Calendar, FileText, CheckCircle2, Eye, EyeOff, 
    Loader2, Sparkles, AlertCircle, ArrowLeft, Home
} from 'lucide-react';
import { 
    verifyOnboardingPasscodeAction, 
    checkOnboardingUnlockedAction, 
    getAvailableAirportsAction, 
    submitPilgrimSelfOnboardingAction 
} from '@/lib/actions/onboarding';

export default function InscriptionPage() {
    // État du flux
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [isCheckingSession, setIsCheckingSession] = useState(true);
    const [isSuccess, setIsSuccess] = useState(false);
    const [successData, setSuccessData] = useState<{
        fullName: string;
        invoiceNumber: string;
        airport: string;
        dates: string;
    } | null>(null);

    // Étape 1 : Passcode
    const [passcode, setPasscode] = useState('');
    const [showPasscode, setShowPasscode] = useState(false);
    const [passcodeLoading, setPasscodeLoading] = useState(false);
    const [passcodeError, setPasscodeError] = useState('');

    // Étape 2 : Formulaire
    const [airports, setAirports] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        gender: 'M' as 'M' | 'F',
        familyName: '',
        firstName: '',
        invoiceNumber: '',
        email: '',
        phone: '',
        address: '',
        postalCode: '',
        city: '',
        departureAirport: '',
        travelDates: '',
        requestedRoomType: 'DOUBLE' as 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'QUADRUPLE' | 'QUINTUPLE'
    });

    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');

    // Initialisation : Vérifier si déjà déverrouillé et charger les aéroports
    useEffect(() => {
        async function init() {
            try {
                const unlocked = await checkOnboardingUnlockedAction();
                setIsUnlocked(unlocked);
                const apList = await getAvailableAirportsAction();
                setAirports(apList);
                if (apList.length > 0) {
                    setFormData(prev => ({ ...prev, departureAirport: apList[0] }));
                }
            } catch (err) {
                console.error("Erreur init inscription:", err);
            } finally {
                setIsCheckingSession(false);
            }
        }
        init();
    }, []);

    // Déverrouillage Passcode
    const handleVerifyPasscode = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasscodeError('');
        if (!passcode.trim()) {
            setPasscodeError("Veuillez saisir le code d'accès communiqué par l'agence.");
            return;
        }

        setPasscodeLoading(true);
        try {
            const res = await verifyOnboardingPasscodeAction(passcode);
            if (res.error) {
                setPasscodeError(res.error);
            } else if (res.success) {
                setIsUnlocked(true);
            }
        } catch {
            setPasscodeError("Une erreur est survenue lors de la vérification.");
        } finally {
            setPasscodeLoading(false);
        }
    };

    // Soumission du Formulaire Pèlerin
    const handleSubmitForm = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');

        // Validations rapides avant envoi
        if (!formData.familyName.trim() || !formData.firstName.trim()) {
            setFormError("Veuillez renseigner votre nom et votre prénom.");
            return;
        }
        if (!formData.invoiceNumber.trim()) {
            setFormError("Le numéro de facture est obligatoire pour valider votre dossier.");
            return;
        }
        if (!formData.email.trim() || !formData.email.includes('@')) {
            setFormError("Veuillez renseigner une adresse e-mail valide.");
            return;
        }
        if (!formData.phone.trim()) {
            setFormError("Veuillez renseigner votre numéro de téléphone.");
            return;
        }
        if (!formData.address.trim() || !formData.postalCode.trim() || !formData.city.trim()) {
            setFormError("Veuillez renseigner votre adresse de domicile complète (rue, code postal, ville).");
            return;
        }
        if (!formData.departureAirport) {
            setFormError("Veuillez choisir un aéroport de départ.");
            return;
        }
        if (!formData.travelDates.trim()) {
            setFormError("Veuillez indiquer les dates de séjour figurant sur votre facture.");
            return;
        }

        setFormLoading(true);
        try {
            const res = await submitPilgrimSelfOnboardingAction({
                passcode: passcode.trim() || 'OMRA2026',
                gender: formData.gender,
                familyName: formData.familyName.trim().toUpperCase(),
                firstName: formData.firstName.trim(),
                invoiceNumber: formData.invoiceNumber.trim().toUpperCase(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                address: formData.address.trim(),
                postalCode: formData.postalCode.trim(),
                city: formData.city.trim(),
                departureAirport: formData.departureAirport,
                travelDates: formData.travelDates.trim(),
                requestedRoomType: formData.requestedRoomType
            });

            if (res.error) {
                setFormError(res.error);
            } else if (res.success) {
                setSuccessData({
                    fullName: `${formData.firstName} ${formData.familyName.toUpperCase()}`,
                    invoiceNumber: formData.invoiceNumber.trim().toUpperCase(),
                    airport: formData.departureAirport,
                    dates: formData.travelDates.trim()
                });
                setIsSuccess(true);
            }
        } catch {
            setFormError("Erreur technique lors de la transmission. Veuillez réessayer.");
        } finally {
            setFormLoading(false);
        }
    };

    if (isCheckingSession) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-black">
            {/* Header Header Brand */}
            <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-4 py-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold text-lg shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                            🕋
                        </div>
                        <div>
                            <span className="font-serif font-bold text-lg text-white tracking-wide">Mon Omra</span>
                            <span className="text-[10px] block uppercase tracking-widest text-amber-400/80 font-semibold">Portail Pèlerin</span>
                        </div>
                    </Link>
                    <Link 
                        href="/" 
                        className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors border border-white/10 px-3 py-1.5 rounded-lg hover:border-white/20"
                    >
                        <Home className="w-3.5 h-3.5" />
                        <span>Accueil</span>
                    </Link>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 sm:py-12">
                
                {/* ------------------------------------------------------------- */}
                {/* ÉCRAN DE CONFIRMATION / SUCCÈS */}
                {/* ------------------------------------------------------------- */}
                {isSuccess && successData ? (
                    <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-6 sm:p-10 shadow-2xl shadow-emerald-950/40 text-center animate-in fade-in zoom-in-95 duration-300">
                        <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/40 shadow-lg shadow-emerald-500/20">
                            <CheckCircle2 className="w-9 h-9" />
                        </div>
                        
                        <span className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/30 uppercase tracking-wider mb-3">
                            Enregistrement Confirmé
                        </span>
                        
                        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2">
                            Alhamdulillah ! Votre dossier est bien transmis
                        </h1>
                        <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-8">
                            Merci <strong className="text-amber-300">{successData.fullName}</strong>. Vos coordonnées ont été enregistrées avec succès sur la plateforme de l&apos;agence.
                        </p>

                        {/* Récapitulatif Carte */}
                        <div className="bg-slate-950/60 border border-white/10 rounded-xl p-5 text-left max-w-md mx-auto mb-8 space-y-3">
                            <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                                <span className="text-slate-400">N° de Facture :</span>
                                <span className="font-mono font-bold text-amber-400">{successData.invoiceNumber}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                                <span className="text-slate-400">Aéroport de départ :</span>
                                <span className="font-semibold text-white">{successData.airport}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400">Dates du séjour :</span>
                                <span className="font-semibold text-white text-right">{successData.dates}</span>
                            </div>
                        </div>

                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-xs text-amber-200/90 text-left max-w-md mx-auto mb-8 flex gap-3 items-start">
                            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                            <div>
                                <span className="font-bold block text-amber-300 mb-0.5">Vérification de paiement par l&apos;agence :</span>
                                Nos conseillers vérifient la concordance avec votre règlement bancaire. Vous recevrez vos accès et vos convocations de voyage par e-mail.
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link
                                href="/auth/login"
                                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-semibold rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                            >
                                <User className="w-4 h-4" />
                                <span>Accéder à l&apos;Espace Pèlerin</span>
                            </Link>
                            <Link
                                href="/"
                                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl transition-colors border border-white/10 flex items-center justify-center"
                            >
                                Retour à l&apos;accueil
                            </Link>
                        </div>
                    </div>
                ) : !isUnlocked ? (
                    
                    /* ------------------------------------------------------------- */
                    /* ÉTAPE 1 : SAS DE SÉCURITÉ MOT DE PASSE AGENCE */
                    /* ------------------------------------------------------------- */
                    <div className="max-w-md mx-auto">
                        <div className="text-center mb-8">
                            <div className="inline-flex p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400 mb-4 shadow-lg shadow-amber-500/10">
                                <Lock className="w-8 h-8" />
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2">
                                Enregistrement Pèlerin
                            </h1>
                            <p className="text-slate-400 text-sm">
                                Ce formulaire d&apos;auto-enrôlement est réservé aux pèlerins ayant confirmé leur réservation auprès de l&apos;agence.
                            </p>
                        </div>

                        <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl">
                            <form onSubmit={handleVerifyPasscode} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                        <Key className="w-3.5 h-3.5 text-amber-400" />
                                        <span>Mot de passe d&apos;accès agence</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPasscode ? 'text' : 'password'}
                                            value={passcode}
                                            onChange={(e) => setPasscode(e.target.value)}
                                            placeholder="Ex: OMRA2026"
                                            className="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all tracking-wider"
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasscode(!showPasscode)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                                        >
                                            {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <span className="text-[11px] text-slate-400 block mt-2">
                                        Ce code vous a été remis par votre conseiller après votre paiement.
                                    </span>
                                </div>

                                {passcodeError && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-300 flex items-start gap-2">
                                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                                        <span>{passcodeError}</span>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={passcodeLoading}
                                    className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-semibold rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {passcodeLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Vérification...</span>
                                        </>
                                    ) : (
                                        <>
                                            <ShieldCheck className="w-4 h-4" />
                                            <span>Déverrouiller le formulaire</span>
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="mt-6 pt-5 border-t border-white/10 text-center">
                                <p className="text-xs text-slate-500">
                                    Vous n&apos;avez pas encore le code ? Contactez votre agence par WhatsApp ou par téléphone pour l&apos;obtenir.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    
                    /* ------------------------------------------------------------- */
                    /* ÉTAPE 2 : FORMULAIRE COMPLET D'AUTO-ENRÔLEMENT */
                    /* ------------------------------------------------------------- */
                    <div className="space-y-8 animate-in fade-in duration-300">
                        {/* Header Formulaire */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                            <div>
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/30 mb-2">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    <span>Accès Sécurisé Déverrouillé</span>
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                                    Fiche d&apos;enregistrement du Pèlerin
                                </h1>
                                <p className="text-slate-400 text-sm mt-1">
                                    Remplissez soigneusement vos coordonnées telles qu&apos;inscrites sur vos papiers officiels.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsUnlocked(false)}
                                className="self-start sm:self-center text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                <span>Changer de code</span>
                            </button>
                        </div>

                        {formError && (
                            <div className="p-4 bg-red-500/15 border border-red-500/30 rounded-xl text-sm text-red-200 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-semibold block mb-0.5">Vérification requise :</span>
                                    <span>{formError}</span>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmitForm} className="space-y-8">
                            
                            {/* SECTION 1 : JUSTIFICATIF & FACTURATION */}
                            <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
                                
                                <h2 className="text-base font-semibold text-amber-300 flex items-center gap-2 mb-4">
                                    <FileText className="w-4 h-4 text-amber-400" />
                                    <span>1. Référence de Facturation</span>
                                </h2>
                                
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                                        Numéro de Facture <span className="text-amber-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.invoiceNumber}
                                        onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                                        placeholder="Ex: FAC-2026-104"
                                        className="w-full bg-slate-950 border border-amber-500/30 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all font-mono font-bold tracking-wider uppercase"
                                    />
                                    <span className="text-[11px] text-amber-200/70 block mt-1.5">
                                        💡 Renseignez le numéro exact figurant sur la facture fournie par votre agence suite à votre paiement.
                                    </span>
                                </div>
                            </div>

                            {/* SECTION 2 : IDENTITÉ DU PÈLERIN */}
                            <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
                                <h2 className="text-base font-semibold text-white flex items-center gap-2 border-b border-white/5 pb-3">
                                    <User className="w-4 h-4 text-amber-400" />
                                    <span>2. Identité Officielle</span>
                                </h2>

                                {/* Civilité */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                        Civilité <span className="text-amber-400">*</span>
                                    </label>
                                    <div className="grid grid-cols-2 gap-3 max-w-sm">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, gender: 'M' })}
                                            className={`py-2.5 px-4 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-2 ${
                                                formData.gender === 'M'
                                                    ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md shadow-amber-500/20'
                                                    : 'bg-slate-950 text-slate-400 border-white/10 hover:border-white/20'
                                            }`}
                                        >
                                            <span>👨 Monsieur</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, gender: 'F' })}
                                            className={`py-2.5 px-4 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-2 ${
                                                formData.gender === 'F'
                                                    ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md shadow-amber-500/20'
                                                    : 'bg-slate-950 text-slate-400 border-white/10 hover:border-white/20'
                                            }`}
                                        >
                                            <span>🧕 Madame</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                                            Nom de famille (Passeport) <span className="text-amber-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.familyName}
                                            onChange={(e) => setFormData({ ...formData, familyName: e.target.value })}
                                            placeholder="Ex: BENALIA"
                                            className="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-amber-500 uppercase"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                                            Prénom(s) <span className="text-amber-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            placeholder="Ex: Ibraheem"
                                            className="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-amber-500 capitalize"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 3 : CONTACT & NOTIFICATIONS */}
                            <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
                                <h2 className="text-base font-semibold text-white flex items-center gap-2 border-b border-white/5 pb-3">
                                    <Phone className="w-4 h-4 text-amber-400" />
                                    <span>3. Coordonnées de Contact</span>
                                </h2>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                            <Mail className="w-3 h-3 text-slate-400" />
                                            <span>Adresse E-mail</span> <span className="text-amber-400">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="votre.email@exemple.com"
                                            className="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-amber-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                            <Phone className="w-3 h-3 text-slate-400" />
                                            <span>Téléphone portable (WhatsApp)</span> <span className="text-amber-400">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            required
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="Ex: 06 12 34 56 78"
                                            className="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-amber-500 font-mono"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 4 : ADRESSE DU DOMICILE */}
                            <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
                                <h2 className="text-base font-semibold text-white flex items-center gap-2 border-b border-white/5 pb-3">
                                    <MapPin className="w-4 h-4 text-amber-400" />
                                    <span>4. Adresse du Domicile</span>
                                </h2>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                                        Numéro et Nom de voie / Rue <span className="text-amber-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        placeholder="Ex: 14 rue de la Liberté, Bâtiment B"
                                        className="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-amber-500"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                                            Code Postal <span className="text-amber-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.postalCode}
                                            onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                                            placeholder="Ex: 69001"
                                            className="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-amber-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                                            Ville <span className="text-amber-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            placeholder="Ex: Lyon"
                                            className="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-amber-500 capitalize"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 5 : SÉJOUR & VOL */}
                            <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
                                <h2 className="text-base font-semibold text-white flex items-center gap-2 border-b border-white/5 pb-3">
                                    <Plane className="w-4 h-4 text-amber-400" />
                                    <span>5. Vol & Dates de Voyage</span>
                                </h2>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                                            Aéroport de Départ <span className="text-amber-400">*</span>
                                        </label>
                                        <select
                                            value={formData.departureAirport}
                                            onChange={(e) => setFormData({ ...formData, departureAirport: e.target.value })}
                                            className="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                                        >
                                            {airports.map((ap) => (
                                                <option key={ap} value={ap}>
                                                    {ap}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                            <Calendar className="w-3 h-3 text-slate-400" />
                                            <span>Dates du séjour (sur la facture)</span> <span className="text-amber-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.travelDates}
                                            onChange={(e) => setFormData({ ...formData, travelDates: e.target.value })}
                                            placeholder="Ex: 12 au 26 Octobre 2026"
                                            className="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-amber-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                                        Type de Chambre Réservé
                                    </label>
                                    <select
                                        value={formData.requestedRoomType}
                                        onChange={(e: any) => setFormData({ ...formData, requestedRoomType: e.target.value })}
                                        className="w-full sm:w-64 bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                                    >
                                        <option value="DOUBLE">Chambre Double (2 lits)</option>
                                        <option value="TRIPLE">Chambre Triple (3 lits)</option>
                                        <option value="QUADRUPLE">Chambre Quadruple (4 lits)</option>
                                        <option value="SINGLE">Chambre Individuelle (Single)</option>
                                    </select>
                                </div>
                            </div>

                            {/* BOUTON DE SOUMISSION */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-base rounded-2xl transition-all shadow-xl shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-3 transform active:scale-[0.99]"
                                >
                                    {formLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Enregistrement en cours...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-5 h-5" />
                                            <span>Valider et Enregistrer mon dossier</span>
                                        </>
                                    )}
                                </button>
                                <p className="text-center text-xs text-slate-500 mt-3">
                                    Vos données sont traitées de manière sécurisée et confidentielle conformément aux règles de protection des données (RGPD).
                                </p>
                            </div>
                        </form>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 py-6 text-center text-xs text-slate-500">
                <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <span>© {new Date().getFullYear()} Mon Omra — Tous droits réservés.</span>
                    <span className="text-slate-600">Portail Pèlerin Sécurisé</span>
                </div>
            </footer>
        </div>
    );
}
