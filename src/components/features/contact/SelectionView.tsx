import { useRef, useState } from 'react';
import { Info, Handshake } from 'lucide-react';
import { MaskingTape, HandDrawnCircle } from '../../common/HandDrawnElements';

// Durée du tracé du cercle au feutre avant l'ouverture de la page (cf. transition CSS de HandDrawnCircle)
const DRAW_DURATION_MS = 420;

interface SelectionViewProps {
    onSelect: (category: string) => void;
}

const categories = [
    {
        id: 'information',
        label: 'Information',
        icon: Info,
        tape: 'warm' as const,
        angle: 'left' as const,
        rotation: '-rotate-[1.5deg]',
        description: 'Découvrir nos actions et projets',
        note: 'Curieux ?',
    },
    {
        id: 'partenariat',
        label: 'Partenariat',
        icon: Handshake,
        tape: 'lilac' as const,
        angle: 'right' as const,
        rotation: 'rotate-[1.5deg]',
        description: 'Soutenir notre engagement',
        note: 'Envie d\'aider ?',
    }
];

export function SelectionView({ onSelect }: SelectionViewProps) {
    return (
        <div className="relative">
            {/* Annotation manuscrite d'introduction, esprit carnet de bord */}
            <p className="hidden sm:block text-center font-script text-2xl text-[#6F2B75] -rotate-1 mb-6 select-none">
                Choisis ta voie ✦
            </p>

            <div className="flex flex-col md:flex-row items-stretch justify-center gap-8 md:gap-10 w-full max-w-3xl mx-auto px-4 pattern-notebook-grid rounded-organic py-8 md:py-10">
                {categories.map((cat) => (
                    <Card key={cat.id} category={cat} onSelect={onSelect} />
                ))}
            </div>
        </div>
    );
}

function Card({ category, onSelect }: { category: any, onSelect: (id: string) => void }) {
    // Seule animation autorisée par la DA : le cercle au feutre qui se dessine (survol desktop / tap mobile).
    // Le clic n'ouvre la page qu'une fois le tracé terminé — pas de navigation instantanée.
    const [isDrawn, setIsDrawn] = useState(false);
    const navigateTimeout = useRef<number | null>(null);

    const activate = () => {
        const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            onSelect(category.id);
            return;
        }
        setIsDrawn(true);
        if (navigateTimeout.current) window.clearTimeout(navigateTimeout.current);
        navigateTimeout.current = window.setTimeout(() => onSelect(category.id), DRAW_DURATION_MS);
    };

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={activate}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    activate();
                }
            }}
            onMouseEnter={() => setIsDrawn(true)}
            onMouseLeave={() => setIsDrawn(false)}
            className={`flex-1 cursor-pointer relative focus-visible:ring-2 focus-visible:ring-[#EC602B] rounded-organic-sm outline-none ${category.rotation}`}
            aria-label={`Sélectionner la catégorie ${category.label} : ${category.description}`}
        >
            {/* Ruban adhésif posé à la main sur la fiche */}
            <MaskingTape variant={category.tape} angle={category.angle} className="-top-3 left-1/2 -translate-x-1/2 z-30" />

            {/* Card Container — fiche cartonnée façon carnet de terrain, fixe (aucune animation de carte) */}
            <div className="relative h-64 md:h-80 bg-white card-polaroid rounded-organic-sm border border-[#6F2B75]/15 overflow-hidden flex flex-col items-center justify-center p-8">

                {/* Micro-tampon manuscrit en coin */}
                <span className="absolute top-4 right-5 font-script text-lg text-[#EC602B] rotate-3 select-none pointer-events-none">
                    {category.note}
                </span>

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center space-y-4">
                    {/* Icône entourée d'un tracé feutre à main levée qui se dessine au survol / au clic */}
                    <div className="relative w-20 h-20 flex items-center justify-center">
                        <HandDrawnCircle stroke="#EC602B" strokeWidth={2.5} className="inset-0 w-full h-full" animated drawn={isDrawn} />
                        <div className="w-14 h-14 rounded-full bg-white text-[#2A082D] flex items-center justify-center border border-[#2A082D]/10 shadow-soft">
                            <category.icon strokeWidth={1.8} size={26} />
                        </div>
                    </div>

                    <div className="text-center">
                        <h3 className="text-2xl font-display text-phoenix-dark mb-1.5">
                            {category.label}
                        </h3>

                        <p className="text-xs font-sans font-medium text-[#7C677E] max-w-[220px]">
                            {category.description}
                        </p>
                    </div>

                    <span className="badge-stamp text-[10px]">
                        Sélectionner →
                    </span>
                </div>
            </div>
        </div>
    );
}
