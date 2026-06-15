import { ChevronLeft, Hotel, Star, MapPin, Compass, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { resolvePilgrimIdByEmail } from '@/lib/actions/logistics';

export default async function PilgrimHotelsPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Query assigned room and hotels for the pilgrim
    let hotelsData: any[] = [];
    try {
        if (user) {
            const resolvedId = await resolvePilgrimIdByEmail(user.id, user.email || undefined);
            // Get stays for the pilgrim's group
            const { data: pilgrim } = await supabase
                .from('pilgrims')
                .select('group_id, individual_hotel_info')
                .eq('id', resolvedId)
                .single();

            if (pilgrim) {
                const indHotels = pilgrim.individual_hotel_info as any;
                
                // Fetch group stays first to get dates and backup hotels
                let groupStays: any[] = [];
                if (pilgrim.group_id) {
                    const { data } = await supabase
                        .from('group_hotel_stays')
                        .select('*, hotels(*)')
                        .eq('group_id', pilgrim.group_id);
                    if (data) groupStays = data;
                }

                if (indHotels && (indHotels.makkah_hotel_id || indHotels.madinah_hotel_id)) {
                    const hotelIds = [indHotels.makkah_hotel_id, indHotels.madinah_hotel_id].filter(Boolean);
                    const { data: specificHotels } = await supabase
                        .from('hotels')
                        .select('*')
                        .in('id', hotelIds);

                    const makkahHotel = specificHotels?.find(h => h.id === indHotels.makkah_hotel_id);
                    const madinahHotel = specificHotels?.find(h => h.id === indHotels.madinah_hotel_id);

                    const groupMakkah = groupStays.find(s => s.hotels?.city === 'MAKKAH');
                    const groupMadinah = groupStays.find(s => s.hotels?.city === 'MADINAH');

                    const targetDate = new Date();
                    const checkInMakkah = groupMakkah?.check_in || targetDate.toISOString();
                    const checkOutMakkah = groupMakkah?.check_out || new Date(targetDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
                    const checkInMadinah = groupMadinah?.check_in || checkOutMakkah;
                    const checkOutMadinah = groupMadinah?.check_out || new Date(new Date(checkInMadinah).getTime() + 5 * 24 * 60 * 60 * 1000).toISOString();

                    if (makkahHotel) {
                        hotelsData.push({
                            ...makkahHotel,
                            checkIn: new Date(checkInMakkah).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }),
                            checkOut: new Date(checkOutMakkah).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }),
                        });
                    } else if (groupMakkah) {
                        hotelsData.push({
                            ...groupMakkah.hotels,
                            checkIn: new Date(groupMakkah.check_in).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }),
                            checkOut: new Date(groupMakkah.check_out).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }),
                        });
                    }

                    if (madinahHotel) {
                        hotelsData.push({
                            ...madinahHotel,
                            checkIn: new Date(checkInMadinah).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }),
                            checkOut: new Date(checkOutMadinah).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }),
                        });
                    } else if (groupMadinah) {
                        hotelsData.push({
                            ...groupMadinah.hotels,
                            checkIn: new Date(groupMadinah.check_in).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }),
                            checkOut: new Date(groupMadinah.check_out).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }),
                        });
                    }
                } else {
                    hotelsData = groupStays.map((s: any) => ({
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
