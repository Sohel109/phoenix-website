import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Award } from 'lucide-react';
import { NomineeCollage } from './NomineeCollage';

interface NomineeCardProps {
    name: string;
    photoUrl: string | null;
    subtitle?: string;
    isWinner?: boolean;
    tone: 'light' | 'dark';
    href: string;
    /** Petit texte sous le nom (par exemple « Votre vote »). */
    footer?: ReactNode;
}

/** Carte portrait d'un nommé dans la grille : collage, nom en gros, projet. */
export function NomineeCard({ name, photoUrl, subtitle, isWinner = false, tone, href, footer }: NomineeCardProps) {
    const text = tone === 'light' ? 'text-[#2A082D]' : 'text-white';
    const sub = tone === 'light' ? 'text-[#904990]' : 'text-[#ECDDFD]/70';
    return (
        <Link
            to={href}
            className="group block rounded-2xl p-3 sm:p-4 transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#EC602B]"
        >
            <div className="relative px-3 pt-4">
                <NomineeCollage photoUrl={photoUrl} name={name} tone={tone} className="transition-transform duration-300 group-hover:rotate-1" />
                {isWinner && (
                    <span className="absolute -right-1 top-1 z-40 rotate-6 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EC602B] text-white text-xs font-school font-bold uppercase tracking-wider shadow-soft">
                        <Award size={13} />
                        Tuteur du mois
                    </span>
                )}
            </div>
            <div className="mt-4 px-1">
                <h2 className={`font-display text-2xl sm:text-3xl leading-tight ${text} group-hover:text-[#EC602B] transition-colors`}>{name}</h2>
                {subtitle && <p className={`mt-1 text-xs font-school font-semibold uppercase tracking-widest ${sub}`}>{subtitle}</p>}
                {footer}
            </div>
        </Link>
    );
}
