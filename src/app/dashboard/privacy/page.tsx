'use client';

import PrivacySettings from './_components/PrivacySettings';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen p-6">
            <header className="mb-12">
                <Link href="/dashboard" className="text-emerald-600 dark:text-emerald-500 hover:text-emerald-400 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest mb-4 transition-colors">
                    <ChevronLeft className="w-4 h-4" /> Retour au dashboard
                </Link>
                <h1 className="text-4xl font-black uppercase tracking-tighter text-main">Votre <span className="text-emerald-500">Confidentialité</span></h1>
                <p className="text-sub text-sm mt-1">Contrôlez vos données et gérez vos droits RGPD.</p>
            </header>

            <div className="max-w-4xl">
                <PrivacySettings />
            </div>
        </div>
    );
}
