interface MaskingTapeProps {
    variant?: 'default' | 'lilac' | 'warm';
    angle?: 'left' | 'right' | 'center';
    className?: string;
}

/**
 * Ruban adhésif semi-transparent avec bords dentelés / déchirés style washi tape authentique.
 * Simule un scotch posé à la main sur les photos et polaroids de fanzine.
 */
export function MaskingTape({
    variant = 'default',
    angle = 'left',
    className = ''
}: MaskingTapeProps) {
    const angleClass = {
        left: '-rotate-2 sm:-rotate-3',
        right: 'rotate-2 sm:rotate-3',
        center: '-rotate-[0.5deg]'
    }[angle];

    // IDs uniques de dégradés pour le SVG
    const fillGradient = {
        default: 'url(#tape-grad-default)',
        lilac: 'url(#tape-grad-lilac)',
        warm: 'url(#tape-grad-warm)'
    }[variant];

    return (
        <span
            aria-hidden="true"
            className={`absolute block pointer-events-none select-none z-30 transition-transform ${angleClass} ${className}`}
            style={{ width: '5.5rem', height: '1.5rem' }}
        >
            <svg
                viewBox="0 0 120 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
                className="w-full h-full drop-shadow-[0_2px_4px_rgba(42,8,45,0.12)]"
            >
                <defs>
                    {/* Dégradé papier washi chaud / ivoire naturel */}
                    <linearGradient id="tape-grad-warm" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFFDF5" stopOpacity="0.90" />
                        <stop offset="35%" stopColor="#FAF1E0" stopOpacity="0.84" />
                        <stop offset="70%" stopColor="#F5E8D2" stopOpacity="0.80" />
                        <stop offset="100%" stopColor="#FFFDF7" stopOpacity="0.88" />
                    </linearGradient>

                    {/* Dégradé washi lilas doux */}
                    <linearGradient id="tape-grad-lilac" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FAF5FE" stopOpacity="0.90" />
                        <stop offset="50%" stopColor="#ECDDFD" stopOpacity="0.85" />
                        <stop offset="100%" stopColor="#F5EDFC" stopOpacity="0.88" />
                    </linearGradient>

                    {/* Dégradé blanc cassé translucide standard */}
                    <linearGradient id="tape-grad-default" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.92" />
                        <stop offset="50%" stopColor="#F7F4EE" stopOpacity="0.82" />
                        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.90" />
                    </linearGradient>
                </defs>

                {/* Tracé ruban adhésif avec extrémités déchirées / dentelées (torn edges) */}
                <path
                    d="M 6 3 L 114 3 L 117 7 L 113 11 L 118 16 L 114 21 L 117 25 L 114 29 L 6 29 L 3 25 L 7 21 L 2 16 L 6 11 L 3 7 Z"
                    fill={fillGradient}
                    stroke="rgba(255, 255, 255, 0.65)"
                    strokeWidth="0.8"
                />

                {/* Fines nervures et reflets de transparence */}
                <line x1="18" y1="4" x2="20" y2="28" stroke="rgba(255, 255, 255, 0.45)" strokeWidth="0.8" />
                <line x1="60" y1="3" x2="61" y2="29" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1" />
                <line x1="102" y1="4" x2="104" y2="28" stroke="rgba(42, 8, 45, 0.04)" strokeWidth="0.8" />
            </svg>
        </span>
    );
}

interface HandDrawnCircleProps {
    stroke?: string;
    className?: string;
    strokeWidth?: number;
    /** Si true, le tracé se dessine progressivement (feutre qui trace) au lieu d'être visible en permanence. */
    animated?: boolean;
    /** Avec animated=true : contrôle l'état dessiné (true) / non-dessiné (false) du tracé. */
    drawn?: boolean;
}

/**
 * Tracé SVG ovale imparfait style cercle dessiné à main levée au feutre orange #EC602B
 * Entoure les chiffres clés ou mots d impact avec un esprit carnet de terrain authentique
 */
export function HandDrawnCircle({
    stroke = '#EC602B',
    strokeWidth = 2.5,
    className = '',
    animated = false,
    drawn = true,
}: HandDrawnCircleProps) {
    return (
        <svg
            viewBox="0 0 160 70"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            className={`absolute pointer-events-none select-none z-10 ${className}`}
            aria-hidden="true"
        >
            {/* Tracé ovale à main levée avec léger chevauchement aux extrémités */}
            <path
                d="M 22 36 C 18 16 48 7 92 8 C 136 9 154 22 151 43 C 148 59 116 64 72 63 C 30 62 11 49 13 34 C 14 20 38 12 70 10"
                stroke={stroke}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                pathLength={animated ? 100 : undefined}
                style={{
                    filter: 'drop-shadow(0px 1px 2px rgba(236, 96, 43, 0.25))',
                    ...(animated && {
                        strokeDasharray: 100,
                        strokeDashoffset: drawn ? 0 : 100,
                        transition: 'stroke-dashoffset 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
                    }),
                }}
            />
        </svg>
    );
}

interface HandDrawnUnderlineProps {
    stroke?: string;
    className?: string;
    strokeWidth?: number;
}

/**
 * Tracé ondulé feutre artisanal pour souligner des mots clés
 */
export function HandDrawnUnderline({
    stroke = '#EC602B',
    strokeWidth = 3,
    className = ''
}: HandDrawnUnderlineProps) {
    return (
        <svg
            viewBox="0 0 120 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            className={`absolute pointer-events-none select-none ${className}`}
            aria-hidden="true"
        >
            <path
                d="M 3 11 C 28 5, 52 14, 82 8 C 96 5, 108 9, 117 7"
                stroke={stroke}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
            />
        </svg>
    );
}
