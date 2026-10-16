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
    Tag, 
    Share2, 
    X,
    Check,
    Volume2,
    VolumeX
} from 'lucide-react';
import { FlyerOffer } from '@/lib/actions/flyers';
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

    // Touch & Drag state for swipe gesture
    const touchStartX = useRef<number | null>(null);
    const touchEndX = useRef<number | null>(null);

    const totalFlyers = flyers.length;

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

    // Cube rotation angle
    const rotationAngle = currentIndex * -90;

    // Dimensions: 9:16 aspect ratio
    // Width = 320px on mobile, 340px on tablet/desktop. Half-width translateZ = 160px / 170px
    const cubeWidth = 330;
    const halfWidth = cubeWidth / 2;

    // Mapping 4 cubic faces (0: Front, 1: Right, 2: Back, 3: Left)
    // To ensure any arbitrary number of flyers (N items) rotates seamlessly on a 4-face 3D cube:
    const faces = [0, 1, 2, 3].map(faceIdx => {
        // Calculate which flyer should be on this face given the current cube rotation
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
                    CARROUSEL 3D DES <span className="text-amber-400">FLYERS DE VOYAGE</span>
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto font-medium">
                    Faites pivoter le cube pour découvrir nos formules au format Story 9:16 et réservez instantanément via WhatsApp avec prévisualisation complète.
                </p>
            </div>

            {/* 3D CUBE STAGE (PERSPECTIVE VIEWPORT) */}
            <div 
                className="relative mx-auto flex items-center justify-center py-6"
                style={{ 
                    perspective: '1400px',
                    perspectiveOrigin: '50% 50%'
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* 3D CUBE CONTAINER */}
                <div
                    className="relative transition-transform duration-700 ease-[cubic-bezier(0.2,0.85,0.25,1)]"
                    style={{
                        width: `${cubeWidth}px`,
                        height: `${Math.round(cubeWidth * (16 / 9))}px`,
                        transformStyle: 'preserve-3d',
                        transform: `rotateY(${rotationAngle}deg)`
                    }}
                >
                    {faces.map(({ faceIdx, flyer, rotateY }) => {
                        const isCurrentFront = (faceIdx === (((currentIndex % 4) + 4) % 4));

                        return (
                            <article
                                key={faceIdx}
                                className={`absolute inset-0 rounded-[2.2rem] overflow-hidden border-2 transition-all duration-300 ${
                                    isCurrentFront
                                        ? 'border-amber-400/60 shadow-[0_25px_60px_-15px_rgba(216,170,77,0.45)]'
                                        : 'border-white/10 opacity-70 blur-[0.5px]'
                                } bg-gradient-to-b from-zinc-950 via-zinc-900 to-black`}
                                style={{
                                    transform: `rotateY(${rotateY}deg) translateZ(${halfWidth}px)`,
                                    backfaceVisibility: 'hidden',
                                    WebkitBackfaceVisibility: 'hidden'
                                }}
                            >
                                {/* Flyer Artwork (9:16) */}
                                <div className="relative w-full h-full group">
                                    <Image
                                        src={flyer.imageUrl}
                                        alt={flyer.title}
                                        fill
                                        priority={isCurrentFront}
                                        sizes="(max-width: 640px) 320px, 340px"
                                        className="object-cover w-full h-full select-none"
                                    />

                                    {/* Subtle Top & Bottom Gradient Overlay for text readability */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-black/60 pointer-events-none" />

                                    {/* Top Bar on Card: Badge & Quick Action Icons */}
                                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-20">
                                        <span className="px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-amber-400/40 text-amber-300 text-[10px] font-black uppercase tracking-wider shadow-md">
                                            {flyer.badge || 'OFFRE OMRA'}
                                        </span>

                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={(e) => handleCopyLink(e, flyer)}
                                                title="Copier le lien de cette offre"
                                                className="w-8 h-8 rounded-full bg-black/75 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-400 border border-white/15 flex items-center justify-center transition-all backdrop-blur-md"
                                            >
                                                {copiedId === flyer.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setZoomedFlyer(flyer)}
                                                title="Agrandir en plein écran"
                                                className="w-8 h-8 rounded-full bg-black/75 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-400 border border-white/15 flex items-center justify-center transition-all backdrop-blur-md"
                                            >
                                                <Maximize2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Bottom Information Glassmorphic Card */}
                                    <div className="absolute bottom-4 left-3 right-3 p-4 rounded-2xl bg-black/85 backdrop-blur-xl border border-amber-500/30 text-left space-y-2.5 z-20 shadow-2xl">
                                        {/* Airport & Dates Tags */}
                                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-amber-200">
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30">
                                                <Plane className="w-3 h-3 text-amber-400" />
                                                {flyer.airport}
                                            </span>
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-emerald-300">
                                                <Calendar className="w-3 h-3 text-emerald-400" />
                                                {flyer.dates}
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-sm font-black text-white leading-tight uppercase line-clamp-1">
                                            {flyer.title}
                                        </h3>

                                        {/* Price & Primary WhatsApp Button */}
                                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/10">
                                            <div>
                                                <span className="text-[9px] uppercase tracking-wider text-zinc-400 block font-semibold">À partir de</span>
                                                <span className="text-base font-black text-amber-400">{flyer.price}</span>
                                            </div>

                                            <a
                                                href={getFlyerWhatsAppUrl(flyer)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-[11px] uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-emerald-950/50 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                                            >
                                                <MessageSquare className="w-3.5 h-3.5" />
                                                <span>Réserver</span>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>

                {/* 3D Floor Shadow / Reflection Effect */}
                <div 
                    className="absolute bottom-2 w-[280px] h-[35px] bg-amber-500/15 blur-2xl rounded-full pointer-events-none -z-10"
                    style={{ transform: 'translateY(15px) scaleY(0.4)' }}
                />

                {/* Left Navigation Chevron */}
                {totalFlyers > 1 && (
                    <button
                        type="button"
                        onClick={prevSlide}
                        aria-label="Flyer précédent"
                        className="absolute left-2 sm:-left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/85 hover:bg-amber-500 text-amber-400 hover:text-black border border-amber-500/40 flex items-center justify-center shadow-2xl backdrop-blur-md transition-all hover:scale-110 active:scale-95 z-30 cursor-pointer"
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
                        className="absolute right-2 sm:-right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/85 hover:bg-amber-500 text-amber-400 hover:text-black border border-amber-500/40 flex items-center justify-center shadow-2xl backdrop-blur-md transition-all hover:scale-110 active:scale-95 z-30 cursor-pointer"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Bottom Pagination & Dots */}
            {totalFlyers > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2 relative z-10">
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

            {/* FULLSCREEN ZOOM MODAL */}
            {zoomedFlyer && (
                <div 
                    role="dialog"
                    aria-modal="true"
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
                    onClick={() => setZoomedFlyer(null)}
                >
                    <div 
                        className="relative max-w-sm w-full aspect-[9/16] rounded-3xl overflow-hidden border-2 border-amber-400 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Image
                            src={zoomedFlyer.imageUrl}
                            alt={zoomedFlyer.title}
                            fill
                            className="object-contain w-full h-full"
                        />

                        {/* Close button */}
                        <button
                            type="button"
                            onClick={() => setZoomedFlyer(null)}
                            className="absolute top-4 right-4 p-2.5 rounded-full bg-black/80 hover:bg-black text-white border border-white/20 shadow-xl transition-colors cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Floating CTA in Zoom Mode */}
                        <div className="absolute bottom-5 left-4 right-4 flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-black/90 backdrop-blur-md border border-amber-400/50">
                            <div>
                                <span className="text-[10px] text-amber-300 font-bold block">{zoomedFlyer.airport}</span>
                                <span className="text-sm font-black text-white">{zoomedFlyer.price}</span>
                            </div>

                            <a
                                href={getFlyerWhatsAppUrl(zoomedFlyer)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-emerald-500/30"
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
