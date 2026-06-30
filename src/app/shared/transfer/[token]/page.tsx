'use client';

import React, { useEffect, useState } from 'react';
import { getDriverDashboardData } from '@/lib/actions/concierge';
import { Loader2, Route, Hotel, Plane, FileCheck, Eye, ShieldAlert, Lock, Unlock } from 'lucide-react';

export default function DriverDashboardPage({ params }: { params: { token: string } }) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // PIN Authentication States
    const [pin, setPin] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pinError, setPinError] = useState<string | null>(null);
    const [submittingPin, setSubmittingPin] = useState(false);

    useEffect(() => {
        const checkAutoAuth = async () => {
            const savedPin = sessionStorage.getItem(`driver_pin_${params.token}`);
            if (savedPin) {
                try {
                    const res = await getDriverDashboardData(params.token, savedPin);
                    if (!res.error) {
                        setData(res);
                        setIsAuthenticated(true);
                    } else {
                        // Saved PIN is no longer valid, clear it
                        sessionStorage.removeItem(`driver_pin_${params.token}`);
                    }
                } catch (err) {
                    console.error("Auto auth error:", err);
                }
            }
            setLoading(false);
        };

        checkAutoAuth();
    }, [params.token]);

    const handlePinSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (pin.length !== 6) {
            setPinError("Le code PIN doit comporter 6 chiffres.");
            return;
        }

        setSubmittingPin(true);
        setPinError(null);
        try {
            const res = await getDriverDashboardData(params.token, pin);
            if (res.error) {
                if (res.error === 'INVALID_PIN') {
                    setPinError("Code PIN incorrect. Veuillez réessayer.");
                } else {
                    setError(res.error);
                }
            } else {
                setData(res);
                setIsAuthenticated(true);
                sessionStorage.setItem(`driver_pin_${params.token}`, pin);
            }
        } catch (err) {
            console.error(err);
            setPinError("Erreur lors de la validation du code.");
        } finally {
            setSubmittingPin(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050605] flex flex-col justify-center items-center gap-4 text-main p-6 font-inter">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
                <p className="text-sm font-black uppercase tracking-widest text-dim animate-pulse">Validation de la clé de sécurité...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#050605] flex flex-col justify-center items-center text-center p-6 font-inter space-y-4">
                <ShieldAlert className="w-16 h-16 text-red-500 animate-bounce" />
                <h2 className="text-2xl font-black uppercase text-main">Accès Non Autorisé</h2>
                <p className="text-sm text-dim max-w-sm">{error || "Ce lien est invalide ou expiré."}</p>
                <div className="pt-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/50">OMRAYANAIR SÉCURITÉ</span>
                </div>
            </div>
        );
    }

    // Lock Screen View (Unauthenticated)
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#050605] flex flex-col justify-center items-center p-6 font-inter">
                <div className="glass w-full max-w-md p-8 rounded-[2.5rem] border border-emerald-500/10 space-y-6 shadow-2xl text-center">
                    <div className="mx-auto w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                        <Lock className="w-8 h-8 text-emerald-500" />
                    </div>
                    
                    <div>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500">ACCÈS SÉCURISÉ</span>
                        <h2 className="text-2xl font-black uppercase tracking-tighter text-main mt-1">Code PIN requis</h2>
                        <p className="text-xs text-dim mt-2 max-w-xs mx-auto">
                            Veuillez saisir le code PIN à 6 chiffres transmis par l'agence pour déverrouiller cette feuille de route.
                        </p>
                    </div>

                    <form onSubmit={handlePinSubmit} className="space-y-4">
                        <div>
                            <input 
                                type="text"
                                pattern="[0-9]*"
                                inputMode="numeric"
                                maxLength={6}
                                placeholder="******"
                                required
                                value={pin}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                    if (val.length <= 6) setPin(val);
                                }}
                                className="w-full bg-[#0b0e0c]/60 border border-emerald-500/10 focus:border-emerald-500 outline-none text-center text-2xl tracking-[0.4em] font-black py-4 rounded-2xl text-main placeholder-emerald-500/20"
                            />
                        </div>

                        {pinError && (
                            <p className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/15 py-2.5 rounded-xl">
                                {pinError}
                            </p>
                        )}

                        <button 
                            type="submit"
                            disabled={submittingPin || pin.length !== 6}
                            className="w-full flex items-center justify-center gap-2 py-4 bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:opacity-50 text-white dark:text-[#050605] rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-emerald-500/20"
                        >
                            {submittingPin ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <Unlock className="w-4 h-4" /> Déverrouiller l'accès
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    const makkahStay = data.stays?.find((s: any) => s.hotels?.city?.toUpperCase() === 'MAKKAH');
    const madinahStay = data.stays?.find((s: any) => s.hotels?.city?.toUpperCase() === 'MADINAH');

    return (
        <div className="min-h-screen bg-[#050605] text-main font-inter pb-16 p-4 sm:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <header className="glass p-8 rounded-[2.5rem] border border-emerald-500/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl">
                    <div>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500">ACCÈS CHAUFFEUR & LOGISTIQUE</span>
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-main mt-1">
                            {data.groupName}
                        </h1>
                        <p className="text-xs text-dim italic mt-0.5">Feuille de route partagée</p>
                    </div>
                    <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase px-3 py-1.5 rounded-2xl border border-emerald-500/20">
                        {data.pilgrims?.length || 0} Passagers
                    </span>
                </header>

                {/* Hotels Block */}
                <section className="glass p-6 sm:p-8 rounded-[2.5rem] border border-emerald-500/5 space-y-6">
                    <h2 className="text-sm font-black uppercase tracking-wider text-main flex items-center gap-2 border-b border-emerald-500/10 pb-3">
                        <Hotel className="w-4 h-4 text-emerald-500" /> Hébergements & Hôtels
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {makkahStay ? (
                            <div className="bg-emerald-500/5 p-5 rounded-2xl border border-emerald-500/10 flex flex-col justify-between space-y-4">
                                <div>
                                    <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500">LA MECQUE / MAKKAH</span>
                                    <h3 className="font-bold text-main mt-1">{makkahStay.hotels?.name}</h3>
                                    <p className="text-xs text-dim mt-1">{makkahStay.hotels?.address || 'Adresse non spécifiée'}</p>
                                </div>
                                <a 
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(makkahStay.hotels?.name + ' ' + (makkahStay.hotels?.address || 'Makkah'))}`}
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex justify-center items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-xl font-bold uppercase tracking-wider text-[10px] transition-all border border-emerald-500/20"
                                >
                                    Itinéraire Google Maps
                                </a>
                            </div>
                        ) : (
                            <p className="text-xs text-dim italic">Aucun hôtel à Makkah associé.</p>
                        )}

                        {madinahStay ? (
                            <div className="bg-emerald-500/5 p-5 rounded-2xl border border-emerald-500/10 flex flex-col justify-between space-y-4">
                                <div>
                                    <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500">MÉDINE / MADINAH</span>
                                    <h3 className="font-bold text-main mt-1">{madinahStay.hotels?.name}</h3>
                                    <p className="text-xs text-dim mt-1">{madinahStay.hotels?.address || 'Adresse non spécifiée'}</p>
                                </div>
                                <a 
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(madinahStay.hotels?.name + ' ' + (madinahStay.hotels?.address || 'Madinah'))}`}
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex justify-center items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-xl font-bold uppercase tracking-wider text-[10px] transition-all border border-emerald-500/20"
                                >
                                    Itinéraire Google Maps
                                </a>
                            </div>
                        ) : (
                            <p className="text-xs text-dim italic">Aucun hôtel à Madinah associé.</p>
                        )}
                    </div>
                </section>

                {/* Flights Block */}
                {(data.outboundFlight || data.returnFlight) && (
                    <section className="glass p-6 sm:p-8 rounded-[2.5rem] border border-emerald-500/5 space-y-6">
                        <h2 className="text-sm font-black uppercase tracking-wider text-main flex items-center gap-2 border-b border-emerald-500/10 pb-3">
                            <Plane className="w-4 h-4 text-emerald-500" /> Informations de Vol du Groupe
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {data.outboundFlight && (
                                <div className="space-y-3">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500">VOL DE DÉPART (ALLER)</span>
                                    <div className="bg-[#0b0e0c]/40 p-4 rounded-xl border border-emerald-500/10 space-y-2">
                                        {data.outboundFlight.flight_segments?.map((s: any, idx: number) => (
                                            <div key={idx} className="text-xs text-dim">
                                                <p className="font-bold text-main">• Segment #{idx + 1} : {s.airline} ({s.flight_number})</p>
                                                <p className="ml-3">{s.departure_airport} ➔ {s.arrival_airport}</p>
                                                <p className="ml-3 text-[10px]">Départ : {new Date(s.departure_time).toLocaleString('fr-FR')}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {data.returnFlight && (
                                <div className="space-y-3">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500">VOL DE RETOUR</span>
                                    <div className="bg-[#0b0e0c]/40 p-4 rounded-xl border border-emerald-500/10 space-y-2">
                                        {data.returnFlight.flight_segments?.map((s: any, idx: number) => (
                                            <div key={idx} className="text-xs text-dim">
                                                <p className="font-bold text-main">• Segment #{idx + 1} : {s.airline} ({s.flight_number})</p>
                                                <p className="ml-3">{s.departure_airport} ➔ {s.arrival_airport}</p>
                                                <p className="ml-3 text-[10px]">Départ : {new Date(s.departure_time).toLocaleString('fr-FR')}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Pilgrims & Visas Block */}
                <section className="glass p-6 sm:p-8 rounded-[2.5rem] border border-emerald-500/5 space-y-6">
                    <h2 className="text-sm font-black uppercase tracking-wider text-main flex items-center gap-2 border-b border-emerald-500/10 pb-3">
                        <FileCheck className="w-4 h-4 text-emerald-500" /> Manifeste des Pèlerins & Visas
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-emerald-500/10">
                                    <th className="py-4 text-[9px] font-black uppercase tracking-widest text-dim">Nom Complet</th>
                                    <th className="py-4 text-[9px] font-black uppercase tracking-widest text-dim text-center">Genre</th>
                                    <th className="py-4 text-[9px] font-black uppercase tracking-widest text-dim text-right">Document Visa</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.pilgrims?.map((p: any) => (
                                    <tr key={p.id} className="border-b border-emerald-500/5 hover:bg-emerald-500/5 transition-all">
                                        <td className="py-4 font-bold text-sm text-main uppercase">
                                            {p.name}
                                        </td>
                                        <td className="py-4 text-xs text-dim text-center">
                                            {p.gender === 'F' ? 'Femme' : 'Homme'}
                                        </td>
                                        <td className="py-4 text-right">
                                            {p.visaUrl ? (
                                                <a 
                                                    href={p.visaUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-lg font-bold uppercase tracking-wider text-[9px] border border-emerald-500/20 transition-all"
                                                >
                                                    <Eye className="w-3 h-3" /> Ouvrir le Visa
                                                </a>
                                            ) : (
                                                <span className="text-[10px] text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded font-bold uppercase">Non Disponible</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
}
