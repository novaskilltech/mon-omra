import HotelForm from './_components/HotelForm';
import HotelCard from './_components/HotelCard';
import { getAgencyHotels } from '@/lib/actions/logistics';
import { Building2 } from 'lucide-react';

export default async function HotelsPage() {
    const hotels = await getAgencyHotels();

    return (
        <div className="max-w-6xl mx-auto p-6 lg:p-0 space-y-12 pb-12">
            <header className="mb-12">
                <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-emerald-400 dark:from-white dark:to-white/50 uppercase tracking-tighter mb-2">
                    Annuaire Hôtelier
                </h1>
                <p className="text-dim font-light">Référencez vos partenaires et gérez vos allotments par type de chambre.</p>
            </header>

            <div className="glass p-1 rounded-[3rem] border-emerald-500/10 shadow-xl overflow-hidden mb-12">
                <div className="bg-emerald-500/[0.02] dark:bg-[#050a08]/30 p-8 md:p-12 rounded-[2.8rem] backdrop-blur-3xl">
                    <HotelForm agencyId="placeholder" />
                </div>
            </div>

            {/* Liste des hôtels */}
            <section className="space-y-6">
                <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3 text-main">
                    <Building2 className="w-6 h-6 text-emerald-500" />
                    Mes Hôtels ({hotels.length})
                </h2>
                
                {hotels.length === 0 ? (
                    <div className="text-center p-12 glass rounded-3xl border-emerald-500/10">
                        <p className="text-dim italic">Aucun hôtel référencé pour le moment.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {hotels.map((hotel: any) => (
                            <HotelCard key={hotel.id} hotel={hotel} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
