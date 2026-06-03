import { ChevronLeft, Hotel, Star, MapPin, Compass, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';

export default async function PilgrimHotelsPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Query assigned room and hotels for the pilgrim
    let hotelsData: any[] = [];
    try {
        if (user) {
            // Get stays for the pilgrim's group
            const { data: pilgrim } = await supabase
                .from('pilgrims')
                .select('group_id')
                .eq('id', user.id)
                .single();

            if (pilgrim && pilgrim.group_id) {
                const { data: stays } = await supabase
                    .from('group_hotel_stays')
                    .select('*, hotels(*)')
                    .eq('group_id', pilgrim.group_id);

                if (stays) {
                    hotelsData = stays.map((s: any) => ({
                        ...s.hotels,
                        checkIn: new Date(s.check_in).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }),
                        checkOut: new Date(s.check_out).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }),
                    }));
                }
            }
        }
    } catch (e) {
        console.error(e);
    }

    // Mock data fallback if nothing returned from DB
    if (hotelsData.length === 0) {
        hotelsData = [
            {
                id: '1',
                name: 'Hilton Convention Makkah',
                city: 'MAKKAH',
                stars: 5,
                address: 'Jabal Omar, Ibrahim Al Khalil, Makkah 21955',
                distance_from_haram: 150,
                checkIn: '17 Mars',
                checkOut: '24 Mars'
            },
            {
                id: '2',
                name: 'Pulman Zamzam Madinah',
                city: 'MADINAH',
                stars: 5,
                address: 'Amr Bin Al Aas Street, Al Aridh, Madinah 42314',
                distance_from_haram: 50,
                checkIn: '24 Mars',
                checkOut: '31 Mars'
            }
        ];
    }

    return (
        <div className="min-h-screen pb-12">
            {/* Header */}
            <nav className="glass px-6 py-4 flex items-center gap-4 sticky top-0 z-50 border-emerald-500/5">
                <Link href="/dashboard" className="p-2 hover:bg-emerald-500/10 rounded-full transition-colors">
                    <ChevronLeft className="w-6 h-6 text-main" />
                </Link>
                <div className="text-xl font-bold tracking-tighter text-main">
                    MES <span className="text-emerald-500">HÔTELS</span>
                </div>
            </nav>

            <div className="max-w-3xl mx-auto p-6 space-y-8">
                <header className="py-6 border-b border-emerald-500/5">
                    <h1 className="text-3xl font-bold mb-2 text-main uppercase tracking-tighter">Hébergements</h1>
                    <p className="text-sub italic font-medium">Retrouvez les détails de vos séjours à Makkah et Madinah.</p>
                </header>

                <div className="space-y-6">
                    {hotelsData.map((hotel, index) => (
                        <div key={hotel.id} className="glass p-8 rounded-[2.5rem] border-emerald-500/5 relative overflow-hidden group shadow-lg">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Hotel className="w-32 h-32 text-emerald-500" />
                            </div>

                            <div className="relative z-10 space-y-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold tracking-[0.2em] px-3 py-1.5 rounded-full border border-emerald-500/10 mb-3 inline-block uppercase">
                                            {hotel.city}
                                        </span>
                                        <h3 className="text-2xl font-black text-main uppercase tracking-tighter">{hotel.name}</h3>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {[...Array(hotel.stars)].map((_, i) => (
                                            <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-[11px] font-bold uppercase tracking-widest pt-4 border-t border-emerald-500/5">
                                    <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10">
                                        <p className="text-dim mb-1 opacity-70">Arrivée</p>
                                        <p className="text-main">{hotel.checkIn}</p>
                                    </div>
                                    <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10">
                                        <p className="text-dim mb-1 opacity-70">Départ</p>
                                        <p className="text-main">{hotel.checkOut}</p>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-2 text-sm text-dim">
                                    <div className="flex items-center gap-3">
                                        <MapPin className="w-4 h-4 text-emerald-500/60" />
                                        <span>{hotel.address}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Compass className="w-4 h-4 text-emerald-500/60" />
                                        <span>À environ <strong className="text-main font-black">{hotel.distance_from_haram}m</strong> du Haram</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="glass p-8 rounded-[2.5rem] bg-emerald-500/[0.01] border-emerald-500/10 flex gap-6 items-center">
                    <div className="bg-emerald-500/10 p-4 rounded-3xl">
                        <ShieldCheck className="w-8 h-8 text-emerald-500" />
                    </div>
                    <div>
                        <h4 className="text-[11px] font-bold uppercase tracking-[0.1em] text-main mb-1">Attribution des chambres</h4>
                        <p className="text-[12px] text-dim italic opacity-80 leading-relaxed">
                            Les chambres sont attribuées conformément aux règles religieuses du Mahram. Pour tout changement, contactez votre chef de groupe.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
