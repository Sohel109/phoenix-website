import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Award, X } from 'lucide-react';
import { usePublicNominees } from '../../hooks/usePublicNominees';
import { formatNomineeMonth } from '../../data/nominees';

const dismissKey = (id: string) => `tuteur-du-mois-bandeau-${id}`;

function wasDismissed(id: string): boolean {
    try {
        return sessionStorage.getItem(dismissKey(id)) === '1';
    } catch {
        return false;
    }
}

/**
 * Fine barre orange en haut du site public : le vote du tuteur du mois en cours, puis le gagnant publié.
 * Sa hauteur est exposée en --spotlight-bar pour que le contenu des pages ne passe pas dessous.
 */
export function NomineeSpotlightBar() {
    const { spotlight } = usePublicNominees();
    const location = useLocation();
    const ref = useRef<HTMLDivElement>(null);
    const id = spotlight ? `${spotlight.kind}-${spotlight.monthKey}` : '';
    const [dismissed, setDismissed] = useState<string | null>(null);
    const onNomineesPage = location.pathname.startsWith('/tuteur-du-mois');
    const visible = Boolean(spotlight) && !onNomineesPage && dismissed !== id && !wasDismissed(id);

    useEffect(() => {
        const root = document.documentElement;
        const el = ref.current;
        if (!visible || !el) {
            root.style.setProperty('--spotlight-bar', '0px');
            return;
        }
        const update = () => root.style.setProperty('--spotlight-bar', `${el.offsetHeight}px`);
        update();
        const observer = new ResizeObserver(update);
        observer.observe(el);
        return () => {
            observer.disconnect();
            root.style.setProperty('--spotlight-bar', '0px');
        };
    }, [visible]);

    if (!spotlight || !visible) return null;

    const month = formatNomineeMonth(spotlight.monthKey).split(' ')[0];
    const href = spotlight.kind === 'vote' ? '/tuteur-du-mois' : `/tuteur-du-mois/${spotlight.winner.slug}`;
    const text =
        spotlight.kind === 'vote' ? (
            <>
                <span className="font-bold">Tuteur du mois :</span> <span className="sm:hidden">voir les nommés</span>
                <span className="hidden sm:inline">découvrez les {spotlight.nominees.length} nommés de {month}</span>
            </>
        ) : (
            <>
                <span className="font-bold">
                    Tuteur du mois<span className="hidden sm:inline"> de {month}</span> :
                </span>{' '}
                {spotlight.winner.displayName}
            </>
        );

    const dismiss = () => {
        setDismissed(id);
        try {
            sessionStorage.setItem(dismissKey(id), '1');
        } catch {
            // Stockage indisponible : la barre revient à la prochaine page, sans gravité.
        }
    };

    return (
        <div ref={ref} className="bg-[#EC602B] text-white">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-2 flex items-center justify-center gap-3 text-[13px] sm:text-sm">
                <Award size={16} className="shrink-0 hidden sm:block" aria-hidden="true" />
                <Link to={href} className="min-w-0 flex-1 sm:flex-none flex items-center gap-2 hover:underline underline-offset-4">
                    <span className="truncate">{text}</span>
                    <ArrowRight size={15} className="shrink-0" aria-hidden="true" />
                </Link>
                <button type="button" onClick={dismiss} aria-label="Masquer le bandeau" className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                    <X size={15} />
                </button>
            </div>
        </div>
    );
}
