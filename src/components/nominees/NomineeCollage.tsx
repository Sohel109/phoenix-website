import { MaskingTape } from '../common/HandDrawnElements';

interface NomineeCollageProps {
    photoUrl: string | null;
    name: string;
    /** Collage qui tremble par à-coups (coupé si l'appareil demande moins d'animations). */
    animated?: boolean;
    tone: 'light' | 'dark';
    className?: string;
}

function initials(name: string): string {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('');
}

/** Photo d'un nommé posée comme un découpage : bord blanc, léger angle, morceau de scotch. */
export function NomineeCollage({ photoUrl, name, animated = false, tone, className = '' }: NomineeCollageProps) {
    const paper = tone === 'light' ? 'bg-white shadow-[0_18px_40px_-18px_rgba(42,8,45,0.45)]' : 'bg-[#FFFBF4] shadow-[0_18px_40px_-14px_rgba(0,0,0,0.6)]';
    return (
        <div className={`relative ${className}`}>
            <div className={`relative p-2.5 sm:p-3 pb-8 sm:pb-10 ${paper} ${animated ? 'nominee-jitter' : '-rotate-2'}`}>
                <MaskingTape variant={tone === 'light' ? 'lilac' : 'warm'} angle="right" className="-top-3 left-1/2 -translate-x-1/2" />
                <div className="aspect-[4/5] w-full overflow-hidden bg-[#2A082D]">
                    {photoUrl ? (
                        <img src={photoUrl} alt={`Photo de ${name}`} className="h-full w-full object-cover [filter:contrast(1.06)_saturate(0.92)]" loading="lazy" decoding="async" />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-[#6F2B75] to-[#2A082D]">
                            <span className="font-display text-5xl text-[#FFFBF4]/90" aria-hidden="true">{initials(name)}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
