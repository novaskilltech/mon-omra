import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getFlyerById } from '@/lib/actions/flyers';
import { getFlyerWhatsAppUrl, AGENCY_WHATSAPP_PHONE } from '@/lib/utils/phone';
import { Plane, Calendar, Tag, MessageSquare, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';

interface OffrePageProps {
    params: {
        id: string;
    };
}

export async function generateMetadata({ params }: OffrePageProps): Promise<Metadata> {
    const flyer = await getFlyerById(params.id);
    if (!flyer) {
        return {
            title: "Offre Introuvable — OMRAYANAIR",
            description: "Consultez toutes nos offres et formules de voyage spirituel sur OMRAYANAIR."
        };
    }

    const fullImageUrl = flyer.imageUrl.startsWith('http')
        ? flyer.imageUrl
        : `https://omrayanair.novaskill.tech${flyer.imageUrl}`;

    return {
        title: `${flyer.title} • ${flyer.airport} — OMRAYANAIR`,
        description: `Formule Omra au départ de ${flyer.airport} du ${flyer.dates}. Tarif à partir de ${flyer.price}. Contactez notre conciergerie en direct.`,
        openGraph: {
            title: `${flyer.title} — ${flyer.price}`,
            description: `Départ : ${flyer.airport} • Dates : ${flyer.dates}`,
            url: `https://omrayanair.novaskill.tech/offres/${flyer.id}`,
            siteName: 'OMRAYANAIR',
            images: [
                {
                    url: fullImageUrl,
                    width: 1080,
                    height: 1920,
                    alt: flyer.title
                }
            ],
            locale: 'fr_FR',
            type: 'website'
        },
        twitter: {
            card: 'summary_large_image',
            title: `${flyer.title} (${flyer.airport})`,
            description: `Dates : ${flyer.dates} • Tarif : ${flyer.price}`,
            images: [fullImageUrl]
        }
    };
}

export const dynamic = 'force-dynamic';

export default async function OffreDetailPage({ params }: OffrePageProps) {
    const flyer = await getFlyerById(params.id);

    if (!flyer) {
        notFound();
    }

    const whatsappUrl = getFlyerWhatsAppUrl(flyer);

    return (
        <main className="min-h-screen bg-black text-white py-8 px-4 sm:px-6 relative overflow-x-hidden selection:bg-amber-500/30">
            {/* Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[140px] rounded-full" />
                <div className="absolute top-[30%] right-[-10%] w-[40%] h-[40%] bg-amber-500/10 blur-[140px] rounded-full" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto space-y-6">
                {/* Top Navigation */}
                <div className="flex items-center justify-between gap-4 py-2 border-b border-white/10">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-amber-400 transition-colors uppercase tracking-wider"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Retour à l&apos;accueil</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <Image src="/logo.png" alt="OMRAYANAIR Logo" width={28} height={28} className="rounded-lg object-contain" />
                        <span className="text-lg font-black tracking-tight text-white uppercase">
                            OMRA<span className="text-emerald-500">YANAIR</span>
                        </span>
                    </div>
                </div>

                {/* Main Offer Container (Two-column on desktop: Flyer 9:16 + Detail Box) */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start pt-4">
                    
                    {/* Left: 9:16 Flyer Artwork Preview */}
                    <div className="md:col-span-6 flex justify-center">
                        <div className="relative w-full max-w-[340px] aspect-[9/16] rounded-3xl overflow-hidden border-2 border-amber-400/60 shadow-[0_25px_60px_-15px_rgba(216,170,77,0.35)] bg-zinc-950">
                            <Image
                                src={flyer.imageUrl}
                                alt={flyer.title}
                                fill
                                unoptimized
                                priority
                                className="object-cover w-full h-full"
                            />
                        </div>
                    </div>

                    {/* Right: Offer Details & Instant WhatsApp Action */}
                    <div className="md:col-span-6 space-y-6">
                        
                        {/* Header & Badges */}
                        <div className="space-y-3">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-wider">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>{flyer.badge || 'FORMULE EXCLUSIVE'}</span>
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white leading-tight">
                                {flyer.title}
                            </h1>

                            <p className="text-sm text-zinc-300 leading-relaxed">
                                {flyer.description || 'Découvrez tous les détails de cette formule exclusive en Terre Sainte et réservez directement avec notre conciergerie.'}
                            </p>
                        </div>

                        {/* Specs Box */}
                        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-white/10 space-y-3.5">
                            <div className="flex items-center gap-3 text-sm">
                                <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                    <Plane className="w-4 h-4" />
                                </div>
                                <div>
                                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-bold">Aéroport de départ</span>
                                    <strong className="text-white text-sm">{flyer.airport}</strong>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-sm">
                                <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                    <Calendar className="w-4 h-4" />
                                </div>
                                <div>
                                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-bold">Période du séjour</span>
                                    <strong className="text-white text-sm">{flyer.dates}</strong>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-sm">
                                <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                    <Tag className="w-4 h-4" />
                                </div>
                                <div>
                                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-bold">Tarif indicatif par personne</span>
                                    <strong className="text-amber-400 text-xl font-black">{flyer.price}</strong>
                                </div>
                            </div>
                        </div>

                        {/* Primary WhatsApp Action */}
                        <div className="space-y-3">
                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-3 shadow-xl shadow-emerald-950/50 transition-all hover:scale-[1.02] active:scale-95"
                            >
                                <MessageSquare className="w-5 h-5" />
                                <span>Contacter la Conciergerie sur WhatsApp</span>
                            </a>

                            <div className="flex items-center justify-center gap-2 text-xs text-zinc-400">
                                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                <span>Réponse immédiate • Ligne officielle : {AGENCY_WHATSAPP_PHONE}</span>
                            </div>
                        </div>

                        {/* Trust & Reassurance */}
                        <div className="p-4 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-2 text-xs text-zinc-400">
                            <h4 className="text-white font-bold text-xs uppercase tracking-wider">
                                Ce qui est inclus avec OMRAYANAIR :
                            </h4>
                            <ul className="space-y-1 list-disc list-inside">
                                <li>Vols directs ou réguliers sélectionnés avec soin</li>
                                <li>Hôtels vérifiés à proximité immédiate des Lieux Saints</li>
                                <li>Transferts terrestres climatisés en Arabie Saoudite</li>
                                <li>Accompagnement spirituel &amp; conciergerie 24/7</li>
                            </ul>
                        </div>

                    </div>
                </div>
            </div>
        </main>
    );
}
