'use client';

import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { FileText, Download, Loader2 } from 'lucide-react';
import { TravelJournalDocument } from '@/lib/reports/TravelJournalTemplate';

export default function DownloadJournalButton({
    groupName,
    groupId,
    pilgrimName
}: {
    groupName: string,
    groupId: string,
    pilgrimName: string
}) {
    // Mock data for the demonstration build
    const data = {
        groupName,
        groupId,
        pilgrimName,
        flights: [
            {
                type: 'ALLER',
                carrier: 'Turkish Airlines',
                segments: [
                    { from: 'CDG', to: 'IST', flightNum: 'TK1822', date: '15/05', time: '11:40' },
                    { from: 'IST', to: 'JED', flightNum: 'TK96', date: '15/05', time: '20:15' }
                ]
            },
            {
                type: 'RETOUR',
                carrier: 'Saudi Arabian',
                segments: [
                    { from: 'MED', to: 'CDG', flightNum: 'SV143', date: '30/05', time: '09:20' }
                ]
            }
        ],
        hotels: [
            { name: 'Hilton Convention', city: 'Makkah', checkIn: '15/05', checkOut: '22/05' },
            { name: 'Pullman Zamzam', city: 'Madinah', checkIn: '22/05', checkOut: '30/05' }
        ],
        program: [
            {
                day: 1,
                date: '15 Mai',
                activities: [
                    { time: '20:15', title: 'Atterrissage Jeddah', description: 'Accueil terminal Hajj.' },
                    { time: '23:30', title: 'Arrivée Makkah', description: 'Check-in et repos rapide.' }
                ]
            },
            {
                day: 2,
                date: '16 Mai',
                activities: [
                    { time: '09:00', title: 'Omra Collective', description: 'Rendez-vous dans le lobby en Ihram.' }
                ]
            }
        ]
    };

    return (
        <div className="inline-block">
            <PDFDownloadLink
                document={<TravelJournalDocument data={data} />}
                fileName={`Carnet_Voyage_${groupName.replace(/\s+/g, '_')}.pdf`}
            >
                {({ blob, url, loading, error }) => (
                    <button
                        disabled={loading}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all border ${loading
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-dim cursor-not-allowed'
                            : 'bg-emerald-600 dark:bg-emerald-500 border-emerald-500 text-white dark:text-[#050605] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-95'
                            }`}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Génération...</span>
                            </>
                        ) : (
                            <>
                                <FileText className="w-4 h-4" />
                                <span>Télécharger le Carnet</span>
                            </>
                        )}
                    </button>
                )}
            </PDFDownloadLink>
        </div>
    );
}
