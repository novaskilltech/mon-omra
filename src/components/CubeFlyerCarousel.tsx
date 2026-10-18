'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { 
    ChevronLeft, 
    ChevronRight, 
    MessageSquare, 
    Maximize2, 
    Sparkles, 
    Calendar, 
    Plane, 
    Share2, 
    X,
    Check
} from 'lucide-react';
import { FlyerOffer } from '@/lib/utils/flyers';
import { getFlyerWhatsAppUrl } from '@/lib/utils/phone';

interface CubeFlyerCarouselProps {
    initialFlyers: FlyerOffer[];
}

export default function CubeFlyerCarousel({ initialFlyers }: CubeFlyerCarouselProps) {
    const flyers = initialFlyers && initialFlyers.length > 0 ? initialFlyers : [];
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [zoomedFlyer, setZoomedFlyer] = useState<FlyerOffer | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    // Ratios (width / height) détectés dynamiquement à partir des dimensions réelles de chaque flyer
    const [detectedRatios, setDetectedRatios] = useState<Record<string, number>>({});

    // Touch & Drag state for swipe gesture
    const touchStartX = useRef<number | null>(null);
    const touchEndX = useRef<number | null>(null);

    const totalFlyers = flyers.length;

    useEffect(() => {
        const checkViewport = () => {
            setIsMobile(window.innerWidth < 640);
        };
        checkViewport();
        window.addEventListener('resize', checkViewport);
        return () => window.removeEventListener('resize', checkViewport);
    }, []);

    const nextSlide = useCallback(() => {
        if (totalFlyers <= 1) return;
        setCurrentIndex(prev => prev + 1);
    }, [totalFlyers]);

    const prevSlide = useCallback(() => {
        if (totalFlyers <= 1) return;
        setCurrentIndex(prev => prev - 1);
    }, [totalFlyers]);

    // Autoplay (every 6 seconds unless hovered or zoomed)
    useEffect(() => {
        if (isHovered || zoomedFlyer || totalFlyers <= 1) return;
        const interval = setInterval(() => {
            nextSlide();
        }, 6000);
        return () => clearInterval(interval);
    }, [isHovered, zoomedFlyer, totalFlyers, nextSlide]);

    // Touch event handlers
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
        if (touchStartX.current === null || touchEndX.current === null) return;
        const distance = touchStartX.current - touchEndX.current;
        const minSwipeDistance = 45;
        if (distance > minSwipeDistance) {
            nextSlide();
        } else if (distance < -minSwipeDistance) {
            prevSlide();
        }
        touchStartX.current = null;
        touchEndX.current = null;
    };

    // Copy link helper
    const handleCopyLink = (e: React.MouseEvent, flyer: FlyerOffer) => {
        e.stopPropagation();
        const url = `${window.location.origin}/offres/${flyer.id}`;
        navigator.clipboard.writeText(url);
        setCopiedId(flyer.id);
        setTimeout(() => setCopiedId(null), 2500);
    };

    if (totalFlyers === 0) return null;

    // Active flyer index in circular array
    const activeIndex = ((currentIndex % totalFlyers) + totalFlyers) % totalFlyers;
    const activeFlyer = flyers[activeIndex];

    // Ratio adaptatif du flyer actif (largeur / hauteur)
    const activeRatio =
        detectedRatios[activeFlyer.id] ||
        (activeFlyer.aspectRatio && activeFlyer.aspectRatio > 0 ? activeFlyer.aspectRatio : 0.75);

    // Calcul des dimensions exactes du cube 3D selon les proportions du flyer envoyé
    const maxWidth = isMobile ? 310 : 420;
    const maxHeight = isMobile ? 460 : 550;

    let cubeWidth = maxWidth;
    let cubeHeight = Math.round(cubeWidth / activeRatio);

    if (cubeHeight > maxHeight) {
        cubeHeight = maxHeight;
        cubeWidth = Math.round(cubeHeight * activeRatio);
    }

    cubeWidth = Math.max(240, cubeWidth);
    cubeHeight = Math.max(220, cubeHeight);
    const halfWidth = Math.round(cubeWidth / 2);

    // Cube rotation angle
    const rotationAngle = currentIndex * -90;

    // Mapping 4 cubic faces (0: Front, 1: Right, 2: Back, 3: Left)
    const faces = [0, 1, 2, 3].map(faceIdx => {
        const offset = faceIdx - (((currentIndex % 4) + 4) % 4);
        const flyerIdx = (((activeIndex + offset) % totalFlyers) + totalFlyers) % totalFlyers;
        return {
            faceIdx,
            flyer: flyers[flyerIdx],
            rotateY: faceIdx * 90
        };
    });

    return (
        <section 
            aria-label="Carrousel 3D des Flyers et Offres"
            className="mb-14 w-full max-w-5xl mx-auto relative select-none"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Ambient Background Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-amber-500/15 via-emerald-500/10 to-transparent blur-[120px] rounded-full pointer-events-none" />

            {/* Section Header Title & Subtitle */}
            <div className="text-center mb-6 space-y-2 relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-amber-500/20 border border-amber-400/40 text-[#F2CE79] text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] shadow-lg shadow-amber-500/10 animate-fade-in">
                    <Sparkles className="w-3.5 h-3.5 fill-amber-400 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
                    <span>🔥 OFFRES FLASH &amp; FLYERS EXCLUSIFS</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white">
                    NOS <span className="text-amber-400">FLYERS &amp; FORMULES</span> DU MOMENT
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto font-medium">
                    Cliquez directement sur le flyer qui vous intéresse pour ouvrir WhatsApp avec toutes les informations de l&apos;offre.
                </p>
            </div>

            {/* 3D CUBE STAGE (PERSPECTIVE VIEWPORT ADAPTATIF) */}
            <div 
                className="relative mx-auto flex items-center justify-center py-6"
                style={{ 
                    perspective: '1500px',
                    perspectiveOrigin: '50% 50%'
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* 3D CUBE CONTAINER ADAPTÉ AUX DIMENSIONS DU FLYER */}
                <div
                    className="relative transition-all duration-700 ease-[cubic-bezier(0.2,0.85,0.25,1)]"
                    style={{
                        width: `${cubeWidth}px`,
                        height: `${cubeHeight}px`,
                        transformStyle: 'preserve-3d',
                        transform: `rotateY(${rotationAngle}deg)`
                    }}
                >
                    {faces.map(({ faceIdx, flyer, rotateY }) => {
                        const isCurrentFront = (faceIdx === (((currentIndex % 4) + 4) % 4));

                        return (
                            <article
                                key={faceIdx}
                                className={`absolute inset-0 rounded-3xl overflow-hidden border-2 transition-all duration-300 ${
                                    isCurrentFront
                                        ? 'border-amber-400/70 shadow-[0_25px_60px_-15px_rgba(216,170,77,0.45)]'
                                        : 'border-white/10 opacity-70 blur-[0.5px]'
                                } bg-zinc-950`}
                                style={{
                                    transform: `rotateY(${rotateY}deg) translateZ(${halfWidth}px)`,
                                    backfaceVisibility: 'hidden',
                                    WebkitBackfaceVisibility: 'hidden'
                                }}
                            >
                                {/* Flyer Artwork intégral sans recadrage */}
                                <div className="relative w-full h-full group">
                                    <a
                                        href={getFlyerWhatsAppUrl(flyer)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title={`Cliquez pour vous renseigner sur ${flyer.title} via WhatsApp`}
                                        className="block relative w-full h-full cursor-pointer"
                                    >
                                        <Image
                                            src={flyer.imageUrl}
                                            alt={flyer.title}
                                            fill
                                            unoptimized
                                            priority={isCurrentFront}
                                            sizes="(max-width: 640px) 320px, 440px"
                                            className="object-contain w-full h-full select-none"
                                            onLoad={(e) => {
                                                const img = e.currentTarget;
                                                if (img.naturalWidth && img.naturalHeight) {
                                                    const ratio = Number((img.naturalWidth / img.naturalHeight).toFixed(4));
                                                    setDetectedRatios(prev =>
                                                        prev[flyer.id] === ratio ? prev : { ...prev, [flyer.id]: ratio }
                                                    );
                                                }
                                            }}
                                        />
                                    </a>

                                    {/* Boutons discrets en haut à droite (Partager & Plein écran) */}
                                    <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20 opacity-90 group-hover:opacity-100 transition-opacity">
                                        <button
                                            type="button"
                                            onClick={(e) => handleCopyLink(e, flyer)}
                                            title="Copier le lien de cette offre"
                                            className="w-8 h-8 rounded-full bg-black/75 hover:bg-amber-500/20 text-zinc-200 hover:text-amber-400 border border-white/15 flex items-center justify-center transition-all backdrop-blur-md"
                                        >
                                            {copiedId === flyer.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setZoomedFlyer(flyer);
                                            }}
                                            title="Agrandir le flyer en plein écran"
                                            className="w-8 h-8 rounded-full bg-black/75 hover:bg-amber-500/20 text-zinc-200 hover:text-amber-400 border border-white/15 flex items-center justify-center transition-all backdrop-blur-md"
                                        >
                                            <Maximize2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>

                {/* 3D Floor Shadow / Reflection Effect */}
                <div 
                    className="absolute bottom-2 h-[35px] bg-amber-500/15 blur-2xl rounded-full pointer-events-none -z-10 transition-all duration-500"
                    style={{
                        width: `${Math.round(cubeWidth * 0.85)}px`,
                        transform: 'translateY(15px) scaleY(0.4)'
                    }}
                />

                {/* Left Navigation Chevron */}
                {totalFlyers > 1 && (
                    <button
                        type="button"
                        onClick={prevSlide}
                        aria-label="Flyer précédent"
                        className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/85 hover:bg-amber-500 text-amber-400 hover:text-black border border-amber-500/40 flex items-center justify-center shadow-2xl backdrop-blur-md transition-all hover:scale-110 active:scale-95 z-30 cursor-pointer"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                )}

                {/* Right Navigation Chevron */}
                {totalFlyers > 1 && (
                    <button
                        type="button"
                        onClick={nextSlide}
                        aria-label="Flyer suivant"
                        className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/85 hover:bg-amber-500 text-amber-400 hover:text-black border border-amber-500/40 flex items-center justify-center shadow-2xl backdrop-blur-md transition-all hover:scale-110 active:scale-95 z-30 cursor-pointer"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* BARRE D'INFORMATION & CONVERSION WHATSAPP SOUS LE CUBE (NE MASQUE AUCUN DÉTAIL DU FLYER) */}
            <div 
                className="mx-auto mt-2 p-4 rounded-2xl bg-zinc-950/90 backdrop-blur-xl border border-amber-500/30 text-left space-y-2.5 relative z-20 shadow-2xl transition-all duration-500"
                style={{ maxWidth: `${Math.max(320, cubeWidth)}px` }}
            >
                <div className="flex flex-wrap items-center justify-between gap-1.5 text-[10px] font-bold">
                    <div className="flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-200">
                            <Plane className="w-3 h-3 text-amber-400" />
                            {activeFlyer.airport}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-emerald-300">
                            <Calendar className="w-3 h-3 text-emerald-400" />
                            {activeFlyer.dates}
                        </span>
                    </div>
                    {activeFlyer.badge && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-[9px] font-black uppercase tracking-wider">
                            {activeFlyer.badge}
                        </span>
                    )}
                </div>

                <div className="flex items-center justify-between gap-3 pt-1">
                    <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-black text-white leading-tight uppercase truncate">
                            {activeFlyer.title}
                        </h3>
                        <span className="text-base font-black text-amber-400">{activeFlyer.price}</span>
                    </div>

                    <a
                        href={getFlyerWhatsAppUrl(activeFlyer)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-emerald-950/50 transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
                    >
                        <MessageSquare className="w-4 h-4" />
                        <span>Réserver sur WhatsApp</span>
                    </a>
                </div>
            </div>

            {/* Bottom Pagination & Dots */}
            {totalFlyers > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4 relative z-10">
                    {flyers.map((f, idx) => (
                        <button
                            key={f.id}
                            type="button"
                            onClick={() => {
                                const diff = idx - activeIndex;
                                setCurrentIndex(prev => prev + diff);
                            }}
                            aria-label={`Afficher le flyer ${idx + 1}`}
                            className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                                idx === activeIndex
                                    ? 'w-8 bg-gradient-to-r from-amber-400 to-[#D8AA4D] shadow-[0_0_12px_rgba(216,170,77,0.6)]'
                                    : 'w-2 bg-white/20 hover:bg-white/40'
                            }`}
                        />
                    ))}
                </div>
            )}

            {/* FULLSCREEN ZOOM MODAL ADAPTATIVE */}
            {zoomedFlyer && (
                <div 
                    role="dialog"
                    aria-modal="true"
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
                    onClick={() => setZoomedFlyer(null)}
                >
                    <div 
                        className="relative max-w-lg w-full max-h-[90vh] rounded-3xl overflow-hidden border-2 border-amber-400 shadow-2xl bg-zinc-950 flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="relative w-full flex-1 min-h-[360px] max-h-[75vh] flex items-center justify-center p-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={zoomedFlyer.imageUrl}
                                alt={zoomedFlyer.title}
                                className="max-w-full max-h-[72vh] w-auto h-auto object-contain rounded-2xl"
                            />
                        </div>

                        {/* Close button */}
                        <button
                            type="button"
                            onClick={() => setZoomedFlyer(null)}
                            className="absolute top-4 right-4 p-2.5 rounded-full bg-black/80 hover:bg-black text-white border border-white/20 shadow-xl transition-colors cursor-pointer z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Bottom CTA in Zoom Mode */}
                        <div className="flex items-center justify-between gap-3 p-4 bg-black/95 border-t border-amber-400/30">
                            <div>
                                <span className="text-[10px] text-amber-300 font-bold block">{zoomedFlyer.airport} • {zoomedFlyer.dates}</span>
                                <span className="text-sm font-black text-white">{zoomedFlyer.price}</span>
                            </div>

                            <a
                                href={getFlyerWhatsAppUrl(zoomedFlyer)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-emerald-500/30"
                            >
                                <MessageSquare className="w-4 h-4" />
                                <span>Réserver</span>
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
