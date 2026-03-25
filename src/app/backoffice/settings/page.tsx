import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { getAgencySettings } from '@/lib/actions/agency';
import AgencySettingsContent from './_components/AgencySettingsContent';

export default async function AgencySettingsPage() {
    const settings = await getAgencySettings();

    return (
        <div className="min-h-screen pb-12">
            {/* Header */}
            <nav className="glass px-6 py-4 flex items-center gap-4 sticky top-0 z-50 border-emerald-500/5">
                <Link href="/backoffice" className="p-2 hover:bg-emerald-500/10 rounded-full transition-colors">
                    <ChevronLeft className="w-6 h-6 text-main" />
                </Link>
                <div className="text-xl font-black tracking-tighter text-main">
                    BACKOFFICE <span className="text-emerald-500">AGENCE</span>
                </div>
            </nav>

            <div className="p-8">
                <AgencySettingsContent initialSettings={settings} />
            </div>
        </div>
    );
}
