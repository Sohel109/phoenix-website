import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Award } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { NomineeCard } from '../components/nominees/NomineeCard';
import { NomineeProfileView } from '../components/nominees/NomineeProfileView';
import { nomineePhotoUrl } from '../data/planningData';
import { formatNomineeMonth, type PublicNominee } from '../data/nominees';
import { usePublicNominees } from '../hooks/usePublicNominees';

const projectOf = (nominee: PublicNominee) => nominee.stats.find((s) => s.label === 'Projet')?.value;
const photoOf = (nominee: PublicNominee) => (nominee.photoId ? nomineePhotoUrl(nominee.photoId) : null);

export function TuteurDuMois() {
    const { slug } = useParams<{ slug?: string }>();
    const { loading, data, spotlight } = usePublicNominees();
    const voteOpen = spotlight?.kind === 'vote';
    const closesLabel = spotlight?.kind === 'vote'
        ? new Date(`${spotlight.closesOn}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
        : '';

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [slug]);

    const nominees = data?.nominees ?? [];
    const monthLabel = data?.monthKey ? formatNomineeMonth(data.monthKey) : '';
    const current = slug ? nominees.find((n) => n.slug === slug) : undefined;

    return (
        <div className="pt-page-safe pb-24 min-h-screen bg-[#FFFBF4] bg-bird-pattern">
            <SEO
                title={current ? `${current.displayName}, nommé au tuteur du mois – Phœnix EDC` : 'Tuteur du mois – Les nommés – Phœnix EDC'}
                description={
                    current
                        ? `${current.displayName} est nommé au tuteur du mois de Phœnix EDC (${monthLabel}). Découvrez ses accomplissements.`
                        : 'Chaque mois, le Bureau de Phœnix EDC nomme les tuteurs qui se sont le plus investis. Découvrez les nommés du mois et leurs accomplissements.'
                }
            />
            <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative z-10">
                {loading && <p className="text-center text-[#2A082D]/70 text-sm py-24">Chargement des nommés...</p>}

                {!loading && slug && !current && (
                    <div className="text-center py-24">
                        <h1 className="font-display text-4xl text-[#2A082D]">Ce nommé n'existe pas</h1>
                        <p className="mt-3 text-[#2A082D]/70">Il n'est peut-être plus dans la liste du mois.</p>
                        <Link to="/tuteur-du-mois" className="mt-6 inline-block px-6 py-3 rounded-full btn-phoenix-gradient text-white font-school text-xs font-bold uppercase tracking-wider">
                            Voir les nommés
                        </Link>
                    </div>
                )}

                {!loading && current && (
                    <NomineeProfileView
                        name={current.displayName}
                        photoUrl={photoOf(current)}
                        accomplishments={current.accomplishments}
                        stats={current.stats}
                        quote={current.quote}
                        isWinner={current.isWinner}
                        actions={
                            voteOpen ? (
                                <div>
                                    <Link
                                        to={`/planning/vote/${current.slug}`}
                                        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full btn-phoenix-gradient text-white font-school text-sm font-bold uppercase tracking-wider shadow-soft"
                                    >
                                        <Award size={16} />
                                        Voter pour {current.displayName.split(/\s+/)[0]}
                                    </Link>
                                    <p className="mt-2 text-center text-xs text-[#2A082D]/65">Réservé aux membres de Phœnix, jusqu'au {closesLabel}. Connexion à l'espace membre demandée.</p>
                                </div>
                            ) : undefined
                        }
                        monthLabel={monthLabel}
                        tone="light"
                        backHref="/tuteur-du-mois"
                        backLabel="Tous les nommés"
                        others={nominees.filter((n) => n.slug !== current.slug).map((n) => ({ name: n.displayName, href: `/tuteur-du-mois/${n.slug}` }))}
                    />
                )}

                {!loading && !slug && (
                    <>
                        <header className="text-center mb-12 sm:mb-16">
                            <div className="flex justify-center items-center gap-3 mb-4">
                                <span className="h-px w-8 bg-[#EC602B]"></span>
                                <span className="text-xs uppercase tracking-widest font-semibold text-[#904990]">Tuteur du mois</span>
                                <span className="h-px w-8 bg-[#EC602B]"></span>
                            </div>
                            <h1 className="text-4xl sm:text-6xl md:text-7xl font-display text-[#2A082D] tracking-tight">
                                Les <span className="marker-highlight text-[#EC602B]">nommés</span>
                                {monthLabel && <span className="block mt-2 text-2xl sm:text-3xl text-[#2A082D]/80">de {monthLabel}</span>}
                            </h1>
                            <p className="mt-5 text-[#2A082D]/80 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed font-medium">
                                Chaque mois, le Bureau nomme les tuteurs qui se sont le plus investis, puis les membres votent. Cliquez sur un nommé pour découvrir ce qu'il a accompli.
                            </p>
                            {voteOpen && nominees.length > 0 && (
                                <div className="mt-8 inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-5 px-6 py-4 rounded-2xl bg-white border border-[#EC602B]/30 shadow-soft">
                                    <p className="text-sm text-[#2A082D]/85">
                                        <span className="font-bold text-[#EC602B]">Vote en cours</span> jusqu'au {closesLabel}. Membre de Phœnix ?
                                    </p>
                                    <Link to="/planning/vote" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full btn-phoenix-gradient text-white font-school text-xs font-bold uppercase tracking-wider">
                                        Voter dans l'espace membre
                                        <ArrowRight size={14} />
                                    </Link>
                                </div>
                            )}
                        </header>

                        {nominees.length === 0 ? (
                            <p className="text-center text-[#2A082D]/75 py-10">Les nommés du mois arrivent bientôt.</p>
                        ) : (
                            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                                {nominees.map((nominee) => (
                                    <li key={nominee.slug}>
                                        <NomineeCard
                                            name={nominee.displayName}
                                            photoUrl={photoOf(nominee)}
                                            subtitle={projectOf(nominee)}
                                            isWinner={nominee.isWinner}
                                            tone="light"
                                            href={`/tuteur-du-mois/${nominee.slug}`}
                                        />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
