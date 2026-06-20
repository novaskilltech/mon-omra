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

    // Initial dummy data for rendering while loading/generating
    const defaultData = stats || {
        kpis: [
            { label: 'Pèlerins Actifs', value: '1,284' },
            { label: 'Satisfaction', value: '4.9/5' },
            { label: 'Visas Validés', value: '92%' },
            { label: 'Alertes', value: '3' },
        ],
        logistics: [
            { label: 'Vols Assignés', val: 78 },
            { label: 'Rooming List', val: 42 },
            { label: 'Kits Départ', val: 95 },
        ],
        finance: {
            totalRevenue: "482,000 €",
            received: "312,000 €",
            pending: "170,000 €",
            completion: 64
        },
        activities: [
            { msg: "Paiement 1,200 € reçu de Yahya Ali", subgroup: "Virement immédiat", time: "12m ago", type: 'FINANCE' },
            { msg: "Rooming List complète : Ramadan Premium", subgroup: "42 pèlerins logés", time: "1h ago", type: 'LOG' },
            { msg: "Broadcast d'urgence envoyé", subgroup: "Sujet: Retard de vol JED", time: "4h ago", type: 'COMM' },
        ]
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
