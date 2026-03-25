import FlightWizard from './_components/FlightWizard';
import FlightCard from './_components/FlightCard';
import { getAgencyFlights } from '@/lib/actions/logistics';
import { Plane } from 'lucide-react';

export default async function FlightsPage() {
    const flights = await getAgencyFlights();

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-12">
            <header className="mb-12">
                <h1 className="text-4xl font-black uppercase tracking-tighter text-main">
                    Logistique <span className="text-emerald-500">Aérienne</span>
                </h1>
                <p className="text-sub text-sm mt-1">Gérez les plans de vol et les escales pour vos pèlerins.</p>
            </header>

            <div className="glass p-1 rounded-[3rem] border-emerald-500/5 shadow-xl overflow-hidden mb-12">
                <div className="bg-emerald-500/[0.02] dark:bg-[#050a08]/50 p-6 md:p-12 rounded-[2.8rem] backdrop-blur-3xl">
                    <FlightWizard agencyId="placeholder" />
                </div>
            </div>

            {/* Liste des vols */}
            <section className="space-y-6">
                <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3 text-main">
                    <Plane className="w-6 h-6 text-emerald-500" />
                    Plans de Vol ({flights.length})
                </h2>
                
                {flights.length === 0 ? (
                    <div className="text-center p-12 glass rounded-3xl border-emerald-500/10">
                        <p className="text-dim italic">Aucun vol enregistré pour le moment.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {flights.map((flight: any) => (
                            <FlightCard key={flight.id} flight={flight} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
