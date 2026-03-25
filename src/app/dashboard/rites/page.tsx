import RitualGuideContent from './_components/RitualGuideContent';
import { getRitualProgress } from '@/lib/actions/rituals';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default async function RitualGuidePage() {
    // Fetch user progress on the server
    const initialProgress = await getRitualProgress();

    return (
        <div className="min-h-screen pb-20">
            {/* Header */}
            <nav className="glass px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-50 border-emerald-500/5">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="text-dim hover:text-emerald-500 transition-colors">
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <div className="text-xl font-black tracking-tighter text-main">
                        MON <span className="text-emerald-500">OMRA</span>
                    </div>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto p-6 lg:p-12">
                <RitualGuideContent initialProgress={initialProgress} />
            </div>
        </div>
    );
}
