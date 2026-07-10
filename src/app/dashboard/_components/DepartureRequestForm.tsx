'use client';

import { useState } from 'react';
import { Calendar, Users, HelpCircle, Check, Info, FileText, ShoppingBag } from 'lucide-react';
import { submitDepartureRequest } from '@/lib/actions/logistics';

interface GroupDeparture {
    id: string;
    name: string;
    departure_date: string;
}

interface ExistingRequest {
    id?: string;
    month: string;
    during_holidays: boolean | null;
    num_people: number;
    already_travelled: boolean;
    requested_group_id: string | null;
}

interface DepartureRequestFormProps {
    futureDepartures: GroupDeparture[];
    existingRequest: ExistingRequest | null;
}

const MONTHS = [
    "Septembre", "Octobre", "Novembre", "Décembre",
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août"
];

export default function DepartureRequestForm({ futureDepartures, existingRequest }: DepartureRequestFormProps) {
    const [isEditing, setIsEditing] = useState(!existingRequest);
    const [month, setMonth] = useState(existingRequest?.month || '');
    const [duringHolidays, setDuringHolidays] = useState<boolean | null>(
        existingRequest?.during_holidays !== undefined ? existingRequest.during_holidays : null
    );
    const [numPeople, setNumPeople] = useState(existingRequest?.num_people || 1);
    const [alreadyTravelled, setAlreadyTravelled] = useState<boolean>(existingRequest?.already_travelled || false);
    const [requestedGroupId, setRequestedGroupId] = useState<string>(existingRequest?.requested_group_id || '');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const showHolidaysQuestion = month.toLowerCase() === 'octobre' || month.toLowerCase() === 'décembre';

    const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setMonth(val);
        if (val.toLowerCase() !== 'octobre' && val.toLowerCase() !== 'décembre') {
            setDuringHolidays(null);
        } else if (duringHolidays === null) {
            setDuringHolidays(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!month) {
            setMessage("Veuillez sélectionner un mois de départ.");
            return;
        }
        setLoading(true);
        setMessage('');

        const res = await submitDepartureRequest({
            month,
            duringHolidays: showHolidaysQuestion ? !!duringHolidays : undefined,
            numPeople,
            alreadyTravelled,
            requestedGroupId: requestedGroupId || undefined
        });

        setLoading(false);
        if (res.success) {
            setMessage("Votre demande a été enregistrée avec succès !");
            setIsEditing(false);
        } else {
            setMessage(res.error || "Une erreur est survenue lors de l'enregistrement.");
        }
    };

    if (!isEditing && existingRequest) {
        const selectedGroup = futureDepartures.find(g => g.id === requestedGroupId);
        return (
            <div className="glass p-8 rounded-[2.5rem] border-amber-500/20 shadow-lg space-y-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-emerald-500">
                        <Check className="w-6 h-6" />
                    </div>
                    <div className="space-y-1.5 flex-1">
                        <h3 className="font-bold text-main text-lg uppercase tracking-tight">Demande de départ Omra enregistrée</h3>
                        <p className="text-dim text-[11px] font-medium leading-relaxed">
                            Nous étudions votre dossier. Voici le récapitulatif de votre demande :
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold uppercase tracking-widest text-main pt-2">
                    <div className="bg-emerald-500/5 p-5 rounded-2xl border border-emerald-500/10">
                        <p className="text-dim mb-1 opacity-70 text-[9px]">Période de départ</p>
                        <p>{month} {existingRequest.during_holidays !== null ? (existingRequest.during_holidays ? "(Pendant les vacances)" : "(Hors vacances)") : ""}</p>
                    </div>
                    <div className="bg-emerald-500/5 p-5 rounded-2xl border border-emerald-500/10">
                        <p className="text-dim mb-1 opacity-70 text-[9px]">Nombre de personnes</p>
                        <p>{numPeople} personne(s)</p>
                    </div>
                    <div className="bg-emerald-500/5 p-5 rounded-2xl border border-emerald-500/10">
                        <p className="text-dim mb-1 opacity-70 text-[9px]">Déjà venu avec nous ?</p>
                        <p>{alreadyTravelled ? "Oui" : "Non"}</p>
                    </div>
                    <div className="bg-emerald-500/5 p-5 rounded-2xl border border-emerald-500/10">
                        <p className="text-dim mb-1 opacity-70 text-[9px]">Tarification demandée sur</p>
                        <p>{selectedGroup ? selectedGroup.name : "Aucune date spécifique"}</p>
                    </div>
                </div>

                <button
                    onClick={() => setIsEditing(true)}
                    className="w-full text-center bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 font-bold text-xs uppercase tracking-widest py-4 rounded-2xl transition-all"
                >
                    Modifier ma demande
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="glass p-8 rounded-[2.5rem] border-amber-500/20 shadow-lg space-y-6">
            <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-amber-500" />
                <h3 className="font-bold text-main text-lg uppercase tracking-tight">Faire une demande de départ</h3>
            </div>

            <div className="space-y-4">
                {/* Month of Departure */}
                <div className="space-y-1.5">
                    <label className="block text-dim text-[10px] font-black uppercase tracking-widest">
                        Mois souhaité pour le départ *
                    </label>
                    <select
                        required
                        value={month}
                        onChange={handleMonthChange}
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-semibold"
                    >
                        <option value="">Sélectionnez un mois...</option>
                        {MONTHS.map((m, idx) => (
                            <option key={idx} value={m}>{m}</option>
                        ))}
                    </select>
                </div>

                {/* Conditional Holiday Question */}
                {showHolidaysQuestion && (
                    <div className="space-y-2 p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10 animate-fade-in">
                        <label className="block text-dim text-[10px] font-black uppercase tracking-widest">
                            Période souhaitée pendant ce mois *
                        </label>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <label className="flex items-center gap-2 cursor-pointer bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl flex-1 text-xs font-bold uppercase tracking-wider text-main">
                                <input
                                    type="radio"
                                    name="duringHolidays"
                                    checked={duringHolidays === true}
                                    onChange={() => setDuringHolidays(true)}
                                    className="accent-emerald-500"
                                />
                                Pendant les vacances scolaires
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl flex-1 text-xs font-bold uppercase tracking-wider text-main">
                                <input
                                    type="radio"
                                    name="duringHolidays"
                                    checked={duringHolidays === false}
                                    onChange={() => setDuringHolidays(false)}
                                    className="accent-emerald-500"
                                />
                                Hors vacances scolaires
                            </label>
                        </div>
                    </div>
                )}

                {/* Number of People */}
                <div className="space-y-1.5">
                    <label className="block text-dim text-[10px] font-black uppercase tracking-widest">
                        Nombre de personnes
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                            <Users className="w-4 h-4" />
                        </div>
                        <input
                            type="number"
                            min="1"
                            value={numPeople}
                            onChange={(e) => setNumPeople(parseInt(e.target.value) || 1)}
                            className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-semibold"
                        />
                    </div>
                </div>

                {/* Already Travelled */}
                <div className="space-y-2">
                    <label className="block text-dim text-[10px] font-black uppercase tracking-widest">
                        Êtes-vous déjà parti en voyage avec nous ?
                    </label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold uppercase tracking-wider text-main">
                            <input
                                type="radio"
                                name="alreadyTravelled"
                                checked={alreadyTravelled === true}
                                onChange={() => setAlreadyTravelled(true)}
                                className="accent-emerald-500"
                            />
                            Oui
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold uppercase tracking-wider text-main">
                            <input
                                type="radio"
                                name="alreadyTravelled"
                                checked={alreadyTravelled === false}
                                onChange={() => setAlreadyTravelled(false)}
                                className="accent-emerald-500"
                            />
                            Non
                        </label>
                    </div>
                </div>

                {/* Future departures quote selection */}
                {futureDepartures.length > 0 && (
                    <div className="space-y-3 pt-2">
                        <label className="block text-dim text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                            Demander une tarification sur une date (optionnel)
                        </label>
                        <p className="text-dim text-[9px] font-medium leading-relaxed m-0 -mt-1.5">
                            Cochez l'un de nos futurs départs prévus pour obtenir une proposition de prix personnalisée.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {futureDepartures.map((departure) => (
                                <label
                                    key={departure.id}
                                    className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                                        requestedGroupId === departure.id
                                            ? 'bg-emerald-500/10 border-emerald-500 text-main'
                                            : 'bg-white/5 border-white/10 hover:bg-white/10 text-main'
                                    }`}
                                >
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold uppercase tracking-wider">{departure.name}</p>
                                        <p className="text-[10px] text-dim font-medium">
                                            Départ : {new Date(departure.departure_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <input
                                        type="radio"
                                        name="futureDepartureQuote"
                                        checked={requestedGroupId === departure.id}
                                        onChange={() => setRequestedGroupId(departure.id)}
                                        className="accent-emerald-500"
                                    />
                                </label>
                            ))}
                        </div>
                        {requestedGroupId && (
                            <button
                                type="button"
                                onClick={() => setRequestedGroupId('')}
                                className="text-[10px] font-bold text-amber-500 hover:text-amber-600 uppercase tracking-widest"
                            >
                                Désélectionner la date
                            </button>
                        )}
                    </div>
                )}
            </div>

            {message && (
                <div className={`p-4 rounded-xl text-xs font-bold uppercase tracking-wider text-center ${
                    message.includes('succès')
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        : 'bg-red-500/10 text-red-500 border border-red-500/20'
                }`}>
                    {message}
                </div>
            )}

            <div className="flex gap-4">
                {existingRequest && (
                    <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="flex-1 text-center bg-gray-500/10 hover:bg-gray-500/20 text-dim border border-white/10 font-bold text-xs uppercase tracking-widest py-4 rounded-2xl transition-all"
                    >
                        Annuler
                    </button>
                )}
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 btn-premium text-center font-bold text-xs uppercase tracking-widest py-4 rounded-2xl shadow-lg transition-all"
                >
                    {loading ? "Enregistrement..." : "Enregistrer ma demande"}
                </button>
            </div>
        </form>
    );
}
