import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Award } from 'lucide-react';
import { NomineeCollage } from './NomineeCollage';
import type { NomineeStat } from '../../data/nominees';

interface NomineeProfileViewProps {
    name: string;
    photoUrl: string | null;
    accomplishments: string[];
    stats: NomineeStat[];
    isWinner?: boolean;
    monthLabel: string;
    tone: 'light' | 'dark';
    backHref: string;
    backLabel: string;
    /** Boutons sous la photo (vote dans l'espace membre). */
    actions?: ReactNode;
    others?: { name: string; href: string }[];
}

/** Fiche d'un nommé : nom en très gros, collage qui tremble, bandeau de stats, accomplissements. */
export function NomineeProfileView({ name, photoUrl, accomplishments, stats, isWinner = false, monthLabel, tone, backHref, backLabel, actions, others = [] }: NomineeProfileViewProps) {
    const light = tone === 'light';
    const text = light ? 'text-[#2A082D]' : 'text-white';
    const muted = light ? 'text-[#2A082D]/70' : 'text-[#ECDDFD]/75';
    const accent = light ? 'text-[#904990]' : 'text-[#ECDDFD]/70';
    const statBox = light ? 'bg-white border-[#2A082D]/15' : 'bg-[#2D0A32]/90 border-[#6F2B75]/50';
    const chip = light
        ? 'bg-white text-[#2A082D] border-[#6F2B75]/20 hover:border-[#EC602B] hover:text-[#EC602B]'
        : 'bg-[#2D0A32]/80 text-[#ECDDFD] border-[#6F2B75]/40 hover:border-[#EC602B] hover:text-white';

    return (
        <article>
            <Link to={backHref} className={`inline-flex items-center gap-2 text-xs font-school font-bold uppercase tracking-widest ${accent} hover:text-[#EC602B] transition-colors`}>
                <ArrowLeft size={14} />
                {backLabel}
            </Link>

            <header className="mt-6">
                <p className={`flex flex-wrap items-center gap-2 text-xs font-school font-bold uppercase tracking-[0.2em] ${accent}`}>
                    <span>Nommé au tuteur du mois</span>
                    <span aria-hidden="true">·</span>
                    <span>{monthLabel}</span>
                    {isWinner && (
                        <span className="ml-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EC602B] text-white tracking-wider">
                            <Award size={13} />
                            Tuteur du mois
                        </span>
                    )}
                </p>
                <h1 className={`mt-3 font-display text-5xl sm:text-7xl lg:text-8xl leading-[0.95] break-words ${text}`}>{name}</h1>
            </header>

            {stats.length > 0 && (
                <dl className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {stats.map((stat, index) => (
                        <div key={`${stat.label}-${index}`} className={`px-4 py-3 rounded-xl border border-dashed ${statBox}`}>
                            <dt className={`text-[11px] font-school font-bold uppercase tracking-widest ${accent}`}>{stat.label}</dt>
                            <dd className={`mt-1 text-xl sm:text-2xl font-bold ${text} break-words`}>{stat.value}</dd>
                        </div>
                    ))}
                </dl>
            )}

            <div className="mt-10 grid gap-10 md:grid-cols-12 md:items-start">
                <div className="md:col-span-5 max-w-sm w-full mx-auto md:mx-0">
                    <div className="px-4 pt-4">
                        <NomineeCollage photoUrl={photoUrl} name={name} tone={tone} animated />
                    </div>
                    {actions && <div className="mt-8 px-4">{actions}</div>}
                </div>

                <section className="md:col-span-7" aria-labelledby="nominee-accomplishments">
                    <h2 id="nominee-accomplishments" className={`font-display text-3xl sm:text-4xl ${text}`}>
                        Ses <span className="marker-highlight text-[#EC602B]">accomplissements</span>
                    </h2>
                    {accomplishments.length > 0 ? (
                        <ol className="mt-6 space-y-4">
                            {accomplishments.map((item, index) => (
                                <li key={index} className="flex gap-4">
                                    <span className="font-display text-2xl leading-none text-[#EC602B] tabular-nums w-8 shrink-0" aria-hidden="true">
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                    <p className={`text-base sm:text-lg leading-relaxed ${muted}`}>{item}</p>
                                </li>
                            ))}
                        </ol>
                    ) : (
                        <p className={`mt-6 text-sm ${muted}`}>Le Bureau n'a pas encore rempli cette partie.</p>
                    )}
                </section>
            </div>

            {others.length > 0 && (
                <nav className="mt-14" aria-label="Les autres nommés">
                    <p className={`text-xs font-school font-bold uppercase tracking-widest ${accent}`}>Les autres nommés</p>
                    <ul className="mt-3 flex flex-wrap gap-2">
                        {others.map((other) => (
                            <li key={other.href}>
                                <Link to={other.href} className={`inline-block px-4 py-2 rounded-full border text-sm font-semibold transition-colors ${chip}`}>
                                    {other.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            )}
        </article>
    );
}
