'use client';

import React, { useEffect, useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { FileText, Download, Loader2 } from 'lucide-react';
import { TravelJournalDocument } from '@/lib/reports/TravelJournalTemplate';
import { getPilgrimJournalData } from '@/lib/actions/logistics';

export default function DownloadJournalButton({
    groupName,
    groupId,
    pilgrimName,
    pilgrimId
}: {
    groupName: string,
    groupId: string,
    pilgrimName: string,
    pilgrimId?: string
}) {
    const [journalData, setJournalData] = useState<any>(null);
    const [loadingData, setLoadingData] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadData() {
            try {
                setLoadingData(true);
                const res = await getPilgrimJournalData(groupId, pilgrimId);
                if (res.success && res.data) {
                    setJournalData(res.data);
                } else {
                    setError(res.error || "Impossible de charger le carnet de voyage");
                }
            } catch (err: any) {
                console.error(err);
                setError(err.message || "Erreur de chargement");
            } finally {
                setLoadingData(false);
            }
        }
        loadData();
    }, [groupId, pilgrimId]);

    if (loadingData) {
        return (
            <div className="inline-block">
                <button
                    disabled
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all border bg-emerald-500/10 border-emerald-500/20 text-dim cursor-not-allowed"
                >
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Chargement...</span>
                </button>
            </div>
        );
    }

    if (error || !journalData) {
        return (
            <div className="inline-block" title={error || "Erreur"}>
                <button
                    disabled
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all border bg-red-500/10 border-red-500/20 text-red-500 cursor-not-allowed"
                >
                    <FileText className="w-4 h-4" />
                    <span>Carnet indisponible</span>
                </button>
            </div>
        );
    }

    return (
        <div className="inline-block">
            <PDFDownloadLink
                document={<TravelJournalDocument data={journalData} />}
                fileName={`Carnet_Voyage_${journalData.pilgrimName.replace(/\s+/g, '_')}.pdf`}
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
