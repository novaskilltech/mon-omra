'use client';

import { useState, useEffect } from 'react';
import { Shield, Bell, MapPin, X, Check, AlertCircle } from 'lucide-react';

export default function PermissionConsent() {
    const [showModal, setShowModal] = useState(false);
    const [geoGranted, setGeoGranted] = useState(false);
    const [notifGranted, setNotifGranted] = useState(false);

    useEffect(() => {
        // Only run on client browser
        const consentDeclined = localStorage.getItem('perm_consent_declined');
        const consentAccepted = localStorage.getItem('perm_consent_accepted');

        if (!consentDeclined && !consentAccepted) {
            // Check current statuses to pre-populate if possible
            if (typeof navigator !== 'undefined' && navigator.permissions) {
                navigator.permissions.query({ name: 'geolocation' }).then((status) => {
                    if (status.state === 'granted') setGeoGranted(true);
                }).catch(() => {});
                
                if (typeof window !== 'undefined' && 'Notification' in window) {
                    if (Notification.permission === 'granted') setNotifGranted(true);
                }
            }
            // Show premium dialog on enter
            setShowModal(true);
        }
    }, []);

    const handleDecline = () => {
        localStorage.setItem('perm_consent_declined', 'true');
        setShowModal(false);
    };

    const handleAcceptAll = async () => {
        // Request Geolocation
        if (typeof navigator !== 'undefined' && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                () => { setGeoGranted(true); },
                () => { console.warn("Geolocation declined by browser prompt."); }
            );
        }

        // Request Notifications
        if (typeof window !== 'undefined' && 'Notification' in window) {
            try {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    setNotifGranted(true);
                }
            } catch (err) {
                console.error("Notification permission error:", err);
            }
        }

        localStorage.setItem('perm_consent_accepted', 'true');
        // Close modal after brief delay to let user see feedback
        setTimeout(() => {
            setShowModal(false);
        }, 1200);
    };

    if (!showModal) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
            <div className="glass max-w-md w-full p-8 rounded-[2.5rem] border border-emerald-500/20 shadow-2xl relative overflow-hidden flex flex-col gap-6">
                
                {/* Background highlight */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

                {/* Close Button */}
                <button 
                    onClick={handleDecline}
                    className="absolute top-6 right-6 p-2 rounded-xl text-dim hover:text-main hover:bg-emerald-500/10 transition-all"
                    title="Plus tard"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Shield / Security Indicator */}
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-inner shrink-0">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black uppercase tracking-tight text-main leading-tight">Assistance & Sécurité</h3>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-500">Omrayanair Assistance</p>
                    </div>
                </div>

                {/* Explanatory Context */}
                <p className="text-xs text-dim font-medium leading-relaxed m-0">
                    Pour garantir le bon déroulement de votre pèlerinage et vous assister efficacement en Terre Sainte, nous sollicitons votre accord pour activer deux fonctionnalités clés :
                </p>

                {/* Feature List */}
                <div className="space-y-4">
                    {/* Geolocation */}
                    <div className="flex gap-4 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                        <div className="w-10 h-10 bg-emerald-500/15 rounded-xl flex items-center justify-center text-emerald-500 shrink-0">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-black uppercase tracking-tight text-main">Géolocalisation</span>
                                {geoGranted && (
                                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1">
                                        <Check className="w-3.5 h-3.5" /> Activé
                                    </span>
                                )}
                            </div>
                            <p className="text-[10px] text-dim font-medium mt-1 leading-normal m-0">
                                Permet à vos guides de vous repérer à Makkah/Madinah en cas de perte et facilite la navigation vers votre hôtel.
                            </p>
                        </div>
                    </div>

                    {/* Notifications */}
                    <div className="flex gap-4 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                        <div className="w-10 h-10 bg-emerald-500/15 rounded-xl flex items-center justify-center text-emerald-500 shrink-0">
                            <Bell className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-black uppercase tracking-tight text-main">Notifications</span>
                                {notifGranted && (
                                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1">
                                        <Check className="w-3.5 h-3.5" /> Activé
                                    </span>
                                )}
                            </div>
                            <p className="text-[10px] text-dim font-medium mt-1 leading-normal m-0">
                                Recevez en temps réel les horaires de départ des bus, alertes de vols, rendez-vous du groupe ou nouveaux documents transmis.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Consent buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                        onClick={handleDecline}
                        className="w-full sm:w-1/3 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-dim hover:text-main hover:bg-emerald-500/5 transition-all text-center border border-emerald-500/10"
                    >
                        Plus tard
                    </button>
                    <button
                        onClick={handleAcceptAll}
                        className="w-full sm:w-2/3 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 hover:scale-102"
                    >
                        <Check className="w-4 h-4" /> Accepter & Activer
                    </button>
                </div>

                <div className="flex items-center gap-1.5 justify-center text-[9px] text-dim opacity-70">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Vous pouvez révoquer ces autorisations à tout moment dans les réglages.</span>
                </div>
            </div>
        </div>
    );
}
