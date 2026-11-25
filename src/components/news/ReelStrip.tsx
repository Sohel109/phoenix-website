import { useState } from 'react';
import { Instagram, Play } from 'lucide-react';
import { NewsDialog } from './NewsDialog';
import { publicImageUrl } from '../../data/planningData';
import type { PublicReel } from '../../data/news';

const INSTAGRAM = 'https://www.instagram.com/phoenixedc/';

/**
 * Bande des derniers réels : seules les images de couverture sont chargées. Le lecteur d'Instagram, lourd,
 * n'est inséré qu'à l'ouverture d'un réel.
 */
export function ReelStrip({ reels }: { reels: PublicReel[] }) {
    const [open, setOpen] = useState<PublicReel | null>(null);
    if (reels.length === 0) return null;

    return (
        <section aria-labelledby="reels-title" className="mb-16">
            <div className="flex items-end justify-between gap-4 mb-5">
                <h2 id="reels-title" className="font-display text-3xl sm:text-4xl text-[#2A082D]">
                    Nos derniers <span className="text-[#EC602B]">réels</span>
                </h2>
                <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" className="shrink-0 inline-flex items-center gap-1.5 text-xs font-school font-bold uppercase tracking-widest text-[#904990] hover:text-[#EC602B] transition-colors">
                    <Instagram size={14} />
                    @phoenixedc
                </a>
            </div>
            <ul className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
                {reels.map((reel, i) => (
                    <li key={reel.shortcode} className="snap-start shrink-0 w-[42%] min-[480px]:w-[30%] md:w-[22%] lg:w-[15.5%]">
                        <button
                            type="button"
                            onClick={() => setOpen(reel)}
                            aria-label={`Lire le réel ${reel.caption ? `« ${reel.caption.slice(0, 60)} »` : i + 1}`}
                            className={`group relative block w-full aspect-[9/16] rounded-xl overflow-hidden bg-[#2A082D] shadow-soft border-4 border-white transition-transform duration-300 hover:-translate-y-1 ${i % 2 ? 'rotate-1' : '-rotate-1'}`}
                        >
                            <img src={publicImageUrl(reel.coverId)} alt="" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover" />
                            <span className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" aria-hidden="true" />
                            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 text-[#EC602B] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform" aria-hidden="true">
                                <Play size={20} className="ml-0.5" fill="currentColor" />
                            </span>
                        </button>
                    </li>
                ))}
            </ul>
            {open && (
                <NewsDialog label="Réel Instagram" onClose={() => setOpen(null)}>
                    <div className="w-[min(92vw,400px)] h-[min(72vh,710px)] rounded-xl overflow-hidden bg-white">
                        <iframe
                            src={`https://www.instagram.com/reel/${open.shortcode}/embed`}
                            title="Réel Instagram de Phœnix EDC"
                            className="w-full h-full border-0"
                            allow="autoplay; encrypted-media; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                    <a href={open.permalink || INSTAGRAM} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[#2A082D] font-school text-xs font-bold uppercase tracking-wider hover:bg-[#ECDDFD] transition-colors">
                        <Instagram size={14} />
                        Voir sur Instagram
                    </a>
                </NewsDialog>
            )}
        </section>
    );
}
