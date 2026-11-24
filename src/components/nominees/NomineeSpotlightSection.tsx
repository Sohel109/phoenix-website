import { Link } from 'react-router-dom';
import { ArrowRight, Award } from 'lucide-react';
import { NomineeCollage } from './NomineeCollage';
import { usePublicNominees } from '../../hooks/usePublicNominees';
import { nomineePhotoUrl } from '../../data/planningData';
import { formatNomineeMonth, type PublicNominee } from '../../data/nominees';

const photoOf = (n: PublicNominee) => (n.photoId ? nomineePhotoUrl(n.photoId) : null);

function formatDay(key: string): string {
    const [y, m, d] = key.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
}

// Éventail de photos : rotation et décalage de chaque collage, du premier au cinquième.
const FAN = ['-rotate-6', 'rotate-3', '-rotate-2', 'rotate-6', '-rotate-3'];

interface NomineeSpotlightSectionProps {
    /** « home » : bande pleine largeur sous l'accueil ; « events » : carte en tête de la page Événements. */
    variant: 'home' | 'events';
}

/** Mise en avant du tuteur du mois : les nommés pendant le vote, puis le gagnant publié. Rien en dehors. */
export function NomineeSpotlightSection({ variant }: NomineeSpotlightSectionProps) {
    const { spotlight, data } = usePublicNominees();
    if (!spotlight) return null;

    const month = formatNomineeMonth(spotlight.monthKey);
    const isVote = spotlight.kind === 'vote';
    const shown = isVote ? spotlight.nominees.slice(0, 5) : [spotlight.winner];
    const count = data?.nominees.length ?? shown.length;

    const eyebrow = `Tuteur du mois · ${month}`;
    const title = isVote ? (
        <>
            Qui sera le <span className="text-[#EC602B]">tuteur du mois</span>{'\u00a0'}?
        </>
    ) : (
        <>
            Bravo <span className="text-[#EC602B]">{spotlight.winner.displayName}</span>
        </>
    );
    const text = isVote
        ? `Le Bureau a nommé ${count} tuteurs pour leur engagement ce mois-ci. Les membres de Phœnix votent jusqu'au ${formatDay(spotlight.closesOn)}. Découvrez qui ils sont et ce qu'ils ont accompli.`
        : `Les membres de Phœnix ont voté parmi ${count} nommés : voici le tuteur du mois de ${month.split(' ')[0]}. Découvrez sa fiche et ses accomplissements.`;
    const cta = isVote ? 'Découvrir les nommés' : 'Voir sa fiche';
    const href = isVote ? '/tuteur-du-mois' : `/tuteur-du-mois/${spotlight.winner.slug}`;

    const collages = (
        <div className={`flex items-end justify-center max-w-full ${isVote ? '-space-x-5 sm:-space-x-8' : ''}`}>
            {shown.map((n, i) => (
                <Link
                    key={n.slug}
                    to={`/tuteur-du-mois/${n.slug}`}
                    aria-label={`Fiche de ${n.displayName}`}
                    className={`relative block shrink-0 transition-transform duration-300 hover:-translate-y-2 hover:z-20 ${
                        isVote ? `${variant === 'home' ? 'w-[4.75rem] min-[400px]:w-24 sm:w-28 xl:w-32' : 'w-16 min-[400px]:w-[4.75rem] sm:w-24 md:w-20 lg:w-24 xl:w-28'} ${FAN[i % FAN.length]} ${i % 2 ? 'mb-4' : ''}` : 'w-48 sm:w-60'
                    }`}
                    style={{ zIndex: 10 - i }}
                >
                    <NomineeCollage photoUrl={photoOf(n)} name={n.displayName} tone={variant === 'home' ? 'dark' : 'light'} animated={!isVote || i === 0} />
                </Link>
            ))}
        </div>
    );

    if (variant === 'events') {
        return (
            <section aria-labelledby="spotlight-events-title" className="mb-12 bg-white border border-[#6F2B75]/15 rounded-organic-sm shadow-phoenix-colored p-6 sm:p-8 grid grid-cols-1 gap-8 md:grid-cols-2 md:items-center">
                <div className="min-w-0">
                    <p className="flex items-center gap-2 text-xs font-school font-bold uppercase tracking-widest text-[#904990]">
                        <Award size={14} className="text-[#EC602B]" />
                        {eyebrow}
                        {isVote && <span className="ml-1 px-2 py-0.5 rounded-full bg-[#EC602B] text-white text-[10px]">Vote en cours</span>}
                    </p>
                    <h2 id="spotlight-events-title" className="mt-3 font-display text-3xl sm:text-4xl text-[#2A082D] leading-tight">{title}</h2>
                    <p className="mt-4 text-[#2A082D]/75 leading-relaxed">{text}</p>
                    <Link to={href} className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full btn-phoenix-gradient text-white font-school text-xs font-bold uppercase tracking-wider">
                        {cta}
                        <ArrowRight size={15} />
                    </Link>
                </div>
                <div className="min-w-0 pt-4 pb-2">{collages}</div>
            </section>
        );
    }

    return (
        <section aria-labelledby="spotlight-home-title" className="relative bg-[#2A082D] text-white overflow-hidden">
            <div className="absolute inset-0 bg-bird-pattern-dark opacity-60 pointer-events-none" aria-hidden="true" />
            <div className="relative container mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
                <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 text-xs font-school font-bold uppercase tracking-[0.2em] text-[#ECDDFD]/75">
                        <Award size={14} className="text-[#EC602B]" />
                        {eyebrow}
                        {isVote && <span className="ml-1 px-2.5 py-0.5 rounded-full bg-[#EC602B] text-white tracking-wider">Vote en cours</span>}
                    </p>
                    <h2 id="spotlight-home-title" className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.02]">{title}</h2>
                    <p className="mt-5 max-w-xl text-[#ECDDFD]/85 text-base sm:text-lg leading-relaxed">{text}</p>
                    <Link to={href} className="mt-8 inline-flex items-center gap-2 px-7 py-3.5 rounded-full btn-phoenix-gradient text-white font-school text-sm font-bold uppercase tracking-wider shadow-soft">
                        {cta}
                        <ArrowRight size={16} />
                    </Link>
                </div>
                <div className="min-w-0 pt-6 pb-4">{collages}</div>
            </div>
        </section>
    );
}
