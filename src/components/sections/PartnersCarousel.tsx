import { useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const partnersList = [
    { name: "Olympique de Marseille", src: "/partners/om.webp", alt: "Logo officiel Olympique de Marseille" },
    { name: "KEDGE Business School", src: "/partners/kedge.webp", alt: "Logo institutionnel KEDGE Business School" },
    { name: "Decathlon", src: "/partners/decathlon.webp", alt: "Logo partenaire officiel Decathlon" },
    { name: "Deloitte", src: "/partners/deloitte.webp", alt: "Logo partenaire officiel Deloitte" },
    { name: "Apprentis d'Auteuil", src: "/partners/apprentis-auteuil.webp", alt: "Logo partenaire officiel Apprentis d'Auteuil" },
    { name: "Darty", src: "/partners/darty.webp", alt: "Logo partenaire officiel Darty" },
    { name: "Lydia", src: "/partners/lydia.webp", alt: "Logo partenaire digital Lydia" },
    { name: "L'Express", src: "/partners/lexpress.webp", alt: "Logo partenaire presse L'Express" },
];

export function PartnersCarousel() {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollContainerRef.current) return;
        const scrollAmount = direction === 'left' ? -320 : 320;
        scrollContainerRef.current.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
    };

    return (
        <section className="py-16 md:py-20 bg-white border-y border-[#ECDDFD]/60 relative z-10 overflow-hidden">
            <div className="w-full max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12">
                {/* Header Section inspiré de la maquette (Screen 1) */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="flex flex-col gap-1 w-4 shrink-0" aria-hidden="true">
                            <span className="h-[2px] w-full bg-[#EC602B] rounded-full" />
                            <span className="h-[2px] w-full bg-[#EC602B] rounded-full" />
                        </div>
                        <span className="text-sm font-bold tracking-wide text-[#EC602B] uppercase">
                            Partenaires
                        </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-display text-[#2A082D] tracking-tight">
                            Ils nous ont fait{' '}
                            <span className="marker-highlight text-[#EC602B]">
                                <span>confiance</span>
                            </span>
                        </h2>

                        <Link
                            to="/partenaires"
                            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#6F2B75] hover:text-[#EC602B] transition-colors group"
                        >
                            <span>Voir tous nos partenaires &amp; collèges</span>
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>

                {/* Carrousel avec flèches latérales < et > */}
                <div className="relative flex items-center group/carousel">
                    {/* Bouton flèche gauche */}
                    <button
                        type="button"
                        onClick={() => scroll('left')}
                        aria-label="Défiler les partenaires vers la gauche"
                        className="w-10 h-10 -ml-3 sm:ml-0 rounded-full flex items-center justify-center text-[#EC602B] hover:text-[#2A082D] hover:bg-orange-50 active:scale-95 transition-all shrink-0 z-10 cursor-pointer"
                    >
                        <ChevronLeft size={30} strokeWidth={2.5} />
                    </button>

                    {/* Conteneur défilant des logos */}
                    <div
                        ref={scrollContainerRef}
                        className="flex-1 flex items-center gap-6 sm:gap-10 md:gap-14 overflow-x-auto scrollbar-none scroll-smooth px-2 py-4"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {/* 2 sets of logos for ample horizontal scrolling */}
                        {[...partnersList, ...partnersList].map((partner, index) => (
                            <div
                                key={`${partner.name}-${index}`}
                                className="shrink-0 h-16 sm:h-20 w-32 sm:w-40 flex items-center justify-center grayscale hover:grayscale-0 opacity-80 hover:opacity-100 hover:scale-105 transition-all duration-300 select-none p-2"
                            >
                                <img
                                    src={partner.src}
                                    alt={partner.alt}
                                    className="max-h-12 sm:max-h-14 max-w-full object-contain"
                                    loading="lazy"
                                />
                            </div>
                        ))}
                    </div>

                    {/* Bouton flèche droite */}
                    <button
                        type="button"
                        onClick={() => scroll('right')}
                        aria-label="Défiler les partenaires vers la droite"
                        className="w-10 h-10 -mr-3 sm:mr-0 rounded-full flex items-center justify-center text-[#EC602B] hover:text-[#2A082D] hover:bg-orange-50 active:scale-95 transition-all shrink-0 z-10 cursor-pointer"
                    >
                        <ChevronRight size={30} strokeWidth={2.5} />
                    </button>
                </div>
            </div>
        </section>
    );
}
