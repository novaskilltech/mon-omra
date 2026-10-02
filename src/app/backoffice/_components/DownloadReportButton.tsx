'use client';

import React, { useState, useEffect } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Package, Download, Loader2 } from 'lucide-react';
import { AgencyReportDocument } from '@/lib/reports/AgencyReportTemplate';

export default function DownloadReportButton({ stats }: { stats: any }) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Data for rendering while generating PDF report
    const defaultData = stats || {
        kpis: [
            { label: 'Pèlerins Actifs', value: '0' },
            { label: 'Satisfaction', value: 'N/A' },
            { label: 'Visas Validés', value: '0%' },
            { label: 'Alertes', value: '0' },
        ],
        logistics: [
            { label: 'Vols Assignés', val: 0 },
            { label: 'Rooming List', val: 0 },
            { label: 'Kits Départ', val: 0 },
        ],
        finance: {
            totalRevenue: "0 €",
            received: "0 €",
            pending: "0 €",
            completion: 0
        },
        activities: []
    };

    if (!isClient) {
        return (
            <div className="glass flex flex-col items-center justify-center gap-4 p-8 rounded-[2.5rem] border-emerald-500/5 cursor-pointer">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/5 flex items-center justify-center">
                    <Package className="w-6 h-6 text-emerald-500" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-main">Exporter PDF</span>
            </div>
        );
    }

    return (
        <PDFDownloadLink
            document={<AgencyReportDocument data={defaultData} />}
            fileName="Rapport_Agence_Omra.pdf"
            className="block w-full h-full"
        >
            {({ blob, url, loading, error }) => (
                <div className="glass flex flex-col items-center justify-center gap-4 p-8 rounded-[2.5rem] hover:bg-emerald-500/5 group transition-all border-emerald-500/5 cursor-pointer h-full">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                        {loading ? (
                            <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                        ) : (
                            <Package className="w-6 h-6 text-emerald-500" />
                        )}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-main">
                        {loading ? 'Génération...' : 'Exporter PDF'}
                    </span>
                </div>
            )}
        </PDFDownloadLink>
    );
}
