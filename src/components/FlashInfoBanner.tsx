'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, Clock, MessageSquare, Phone, X, ChevronRight, Info, ShieldAlert } from 'lucide-react';
import { getTransaviaAlertWhatsAppUrl, AGENCY_WHATSAPP_PHONE } from '@/lib/utils/phone';

export default function FlashInfoBanner() {
    const [isDismissed, setIsDismissed] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const storedDismissed = sessionStorage.getItem('omrayanair-transavia-alert-dismissed');
        if (storedDismissed === 'true') {
            setIsDismissed(true);
        }
    }, []);

    const handleDismiss = () => {
        setIsDismissed(true);
        sessionStorage.setItem('omrayanair-transavia-alert-dismissed', 'true');
    };

    const handleRestore = () => {
        setIsDismissed(false);
        sessionStorage.removeItem('omrayanair-transavia-alert-dismissed');
    };

    if (!isMounted) return null;

    return (
        <>
            {/* 1. TOP ALERT BANNER (If not dismissed) */}
            {!isDismissed ? (
                <aside 
                    aria-label="Flash Info Annulation Vols Transavia"
                    className="relative z-50 w-full bg-gradient-to-r from-red-950/90 via-amber-950/90 to-red-950/90 border-b border-amber-500/40 text-white backdrop-blur-md shadow-lg shadow-black/40"
                >
                    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 sm:gap-4">
                            
                            {/* Left: Badge & Core Alert Message */}
                            <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600/30 border border-red-500/50 text-red-300 text-[10px] sm:text-xs font-black tracking-wider uppercase shrink-0 shadow-inner animate-pulse">
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                                    <span>FLASH INFO AIRLINES</span>
                                </span>

                                <div className="text-xs sm:text-sm text-zinc-100 font-medium leading-snug">
                                    <span className="font-bold text-white">Annulation de tous les vols Transavia</span>{' '}
                                    <span className="text-amber-300 font-semibold">(16 oct. — 09 nov. inclus)</span>{' '}
                                    <span className="text-zinc-300 hidden md:inline">au départ de</span>{' '}
                                    <span className="font-bold text-white hidden md:inline">Lyon, Marseille et Paris-Orly</span>.
                                </div>
                            </div>

                            {/* Center / Right: Operational Status Badges */}
                            <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs w-full lg:w-auto">
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 font-semibold">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                    <span>Octobre : <strong className="text-emerald-200">100% modifiés & sécurisés</strong></span>
                                </div>

                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/70 border border-amber-500/40 text-amber-300 font-semibold">
                                    <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                    <span>Novembre : <strong className="text-amber-200">Modifications en cours</strong></span>
                                </div>
                            </div>

                            {/* Right: Actions (Details modal + WhatsApp + Dismiss) */}
                            <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all border border-white/15 hover:border-white/30 flex items-center gap-1"
                                >
                                    <Info className="w-3 h-3 text-amber-400" />
                                    <span>Détails & FAQ</span>
                                </button>

                                <a
                                    href={getTransaviaAlertWhatsAppUrl()}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-emerald-950/40 flex items-center gap-1.5"
                                >
                                    <MessageSquare className="w-3 h-3" />
                                    <span className="hidden sm:inline">Assistance</span> WhatsApp
                                </a>

                                <button
                                    onClick={handleDismiss}
                                    title="Masquer l'alerte pour cette session"
                                    aria-label="Fermer le flash info"
                                    className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors ml-1"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                        </div>
                    </div>
                </aside>
            ) : (
                /* 2. MINIMIZED FLOATING PILL (Allows user to reopen alert at any time) */
                <button
                    onClick={handleRestore}
                    title="Afficher le Flash Info Vols Transavia"
                    className="fixed top-3 right-3 z-50 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-900/90 text-amber-200 text-xs font-bold uppercase tracking-wider border border-amber-500/40 shadow-xl backdrop-blur-md hover:bg-red-800 transition-all hover:scale-105"
                >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    <span>Flash Info Transavia</span>
                </button>
            )}

            {/* 3. MODAL : DÉTAILS DE LA CELLULE DE CRISE & PRISE EN CHARGE */}
            {isModalOpen && (
                <div 
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="flash-info-modal-title"
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
                >
                    <div className="relative w-full max-w-2xl bg-zinc-950 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-left overflow-hidden">
                        {/* Glow ambient */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-500/10 blur-3xl pointer-events-none rounded-full" />

                        {/* Close button */}
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-5 right-5 p-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border border-white/10"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Modal Header */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-red-500/20 border border-amber-500/40 text-amber-400">
                                <ShieldAlert className="w-6 h-6" />
                            </div>
                            <div>
                                <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-amber-400">
                                    Communiqué Officiel de la Conciergerie
                                </span>
                                <h3 id="flash-info-modal-title" className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
                                    Flash Info : Annulation des vols Transavia
                                </h3>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="space-y-4 text-xs sm:text-sm text-zinc-300 leading-relaxed mb-6 max-h-[60vh] overflow-y-auto pr-1">
                            {/* Cadre Situation */}
                            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-white/10 space-y-2">
                                <div className="text-zinc-100 font-bold flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                                    <span>Périmètre des perturbations aériennes</span>
                                </div>
                                <p>
                                    La compagnie <strong>Transavia</strong> a procédé à l&apos;annulation de l&apos;ensemble de ses vols programmés du <strong>16 octobre au 9 novembre inclus</strong>.
                                </p>
                                <p className="text-zinc-400 text-xs">
                                    Aéroports concernés : <strong>Lyon-Saint Exupéry (LYS)</strong>, <strong>Marseille-Provence (MRS)</strong> et <strong>Paris-Orly (ORY)</strong>. Les vols assurés par les autres compagnies partenaires ne sont pas impactés.
                                </p>
                            </div>

                            {/* Statut Opérationnel */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-1.5">
                                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>Départs d&apos;Octobre</span>
                                    </div>
                                    <p className="text-xs text-zinc-200">
                                        <strong>100% modifiés & sécurisés.</strong> Tous les pèlerins dont le départ était prévu en octobre ont d&apos;ores et déjà été replacés sur de nouvelles liaisons fiables.
                                    </p>
                                </div>

                                <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 space-y-1.5">
                                    <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                                        <Clock className="w-4 h-4" />
                                        <span>Départs de Novembre</span>
                                    </div>
                                    <p className="text-xs text-zinc-200">
                                        <strong>Modifications en cours.</strong> Notre cellule logistique procède activement aux réacheminements et confirme chaque dossier par ordre de date de départ.
                                    </p>
                                </div>
                            </div>

                            {/* Consignes aux Pèlerins */}
                            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5 space-y-2">
                                <h4 className="text-white font-bold text-xs uppercase tracking-wider">
                                    Ce que vous devez savoir & démarches :
                                </h4>
                                <ul className="space-y-1.5 text-xs text-zinc-300 list-disc list-inside">
                                    <li>
                                        <strong>Inutile de saturer les standards :</strong> Notre équipe conciergerie contacte personnellement chaque pèlerin et chef de famille par ordre chronologique de départ.
                                    </li>
                                    <li>
                                        <strong>Accompagnement continu :</strong> Votre hôtel et vos réservations sur place en Terre Sainte sont synchronisés avec votre nouveau plan de vol.
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Modal Footer / CTAs */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/10">
                            <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5 text-amber-400" />
                                <span>Ligne d&apos;assistance : <strong>07 52 28 08 90</strong></span>
                            </div>

                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors"
                                >
                                    Fermer
                                </button>

                                <a
                                    href={getTransaviaAlertWhatsAppUrl()}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 sm:flex-initial px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    <span>Contacter sur WhatsApp</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
