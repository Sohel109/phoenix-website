import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Instagram } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { NewsCard, projectTitle } from '../components/news/NewsCard';
import { NewsBody } from '../components/news/NewsBody';
import { NewsDialog } from '../components/news/NewsDialog';
import { ReelStrip } from '../components/news/ReelStrip';
import { publicImageUrl } from '../data/planningData';
import { excerpt, formatNewsDate, type PublicArticle } from '../data/news';
import { usePublicNews } from '../hooks/usePublicNews';

const INSTAGRAM = 'https://www.instagram.com/phoenixedc/';

function ArticleView({ article, others }: { article: PublicArticle; others: PublicArticle[] }) {
    const [zoom, setZoom] = useState<string | null>(null);
    // Photo supprimée à la main dans Drive : l'image ne charge plus, on la retire de la galerie.
    const [broken, setBroken] = useState<string[]>([]);
    const gallery = article.photoIds.filter((id) => !broken.includes(id));
    const project = projectTitle(article.projectId);
    return (
        <article className="max-w-3xl mx-auto">
            <Link to="/actualites" className="inline-flex items-center gap-2 text-xs font-school font-bold uppercase tracking-widest text-[#904990] hover:text-[#EC602B] transition-colors">
                <ArrowLeft size={14} />
                Toutes les actus
            </Link>
            <header className="mt-6">
                <p className="flex flex-wrap items-center gap-2 text-xs font-school font-bold uppercase tracking-[0.2em] text-[#904990]">
                    <time dateTime={article.publishedAt}>{formatNewsDate(article.publishedAt)}</time>
                    {project && article.projectId && (
                        <Link to={`/projets/${article.projectId}`} className="ml-1 px-3 py-1 rounded-full bg-[#ECDDFD] text-[#6F2B75] tracking-wider hover:bg-[#EC602B] hover:text-white transition-colors">
                            {project}
                        </Link>
                    )}
                </p>
                <h1 className="mt-3 font-display text-4xl sm:text-6xl leading-[1.02] text-[#2A082D] break-words">{article.title}</h1>
            </header>

            <figure className="mt-8 -mx-4 sm:mx-0">
                <img src={publicImageUrl(article.coverId)} alt="" className="w-full max-h-[70vh] object-cover sm:rounded-organic-sm shadow-soft" />
            </figure>

            <NewsBody body={article.body} className="mt-8 text-base sm:text-lg leading-relaxed text-[#2A082D]/85" />

            {gallery.length > 0 && (
                <section className="mt-12" aria-label="Photos">
                    <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {gallery.map((id, i) => (
                            <li key={id}>
                                <button
                                    type="button"
                                    onClick={() => setZoom(id)}
                                    aria-label={`Agrandir la photo ${i + 1}`}
                                    className="block w-full aspect-square overflow-hidden rounded-lg bg-[#ECDDFD] focus-visible:ring-2 focus-visible:ring-[#EC602B]"
                                >
                                    <img src={publicImageUrl(id)} alt="" loading="lazy" decoding="async" onError={() => setBroken((b) => [...b, id])} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                                </button>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {zoom && (
                <NewsDialog label="Photo en grand" onClose={() => setZoom(null)}>
                    <img src={publicImageUrl(zoom)} alt="" className="max-w-[92vw] max-h-[80vh] object-contain rounded-lg" />
                </NewsDialog>
            )}

            {others.length > 0 && (
                <nav className="mt-16 pt-10 border-t border-[#2A082D]/10" aria-labelledby="others-title">
                    <h2 id="others-title" className="font-display text-3xl text-[#2A082D]">
                        Les autres <span className="text-[#EC602B]">actus</span>
                    </h2>
                    <ul className="mt-6 grid gap-6 sm:grid-cols-3">
                        {others.map((other) => (
                            <li key={other.slug}>
                                <NewsCard article={other} />
                            </li>
                        ))}
                    </ul>
                </nav>
            )}
        </article>
    );
}

export function Actualites() {
    const { slug } = useParams<{ slug?: string }>();
    const { data, loading } = usePublicNews();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [slug]);

    const articles = data?.articles ?? [];
    const reels = data?.reels ?? [];
    const current = slug ? articles.find((a) => a.slug === slug) : undefined;
    const [first, ...rest] = articles;

    return (
        <div className="pt-page-safe pb-24 min-h-screen bg-[#FFFBF4] bg-bird-pattern">
            <SEO
                title={current ? `${current.title} – Actualités – Phœnix EDC` : "Actualités de l'association – Phœnix EDC"}
                description={
                    current
                        ? excerpt(current.body, 155)
                        : "Sorties, voyages, projets et vie de l'association : les dernières nouvelles de Phœnix Égalité des Chances et nos réels Instagram."
                }
                ogImage={current ? `https://www.phoenix-egalite-des-chances.com/api/planning?photo=${encodeURIComponent(current.coverId)}` : undefined}
                type={current ? 'article' : 'website'}
            />
            <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative z-10">
                {loading && <p className="text-center text-[#2A082D]/70 text-sm py-24">Chargement des actualités...</p>}

                {!loading && slug && !current && (
                    <div className="text-center py-24">
                        <h1 className="font-display text-4xl text-[#2A082D]">Cette actualité n'existe pas</h1>
                        <p className="mt-3 text-[#2A082D]/70">Elle a peut-être été retirée.</p>
                        <Link to="/actualites" className="mt-6 inline-block px-6 py-3 rounded-full btn-phoenix-gradient text-white font-school text-xs font-bold uppercase tracking-wider">
                            Voir les actualités
                        </Link>
                    </div>
                )}

                {!loading && current && <ArticleView article={current} others={articles.filter((a) => a.slug !== current.slug).slice(0, 3)} />}

                {!loading && !slug && (
                    <>
                        <header className="text-center mb-12 sm:mb-16">
                            <div className="flex justify-center items-center gap-3 mb-4">
                                <span className="h-px w-8 bg-[#EC602B]"></span>
                                <span className="text-xs uppercase tracking-widest font-semibold text-[#904990]">La vie de l'asso</span>
                                <span className="h-px w-8 bg-[#EC602B]"></span>
                            </div>
                            <h1 className="text-4xl sm:text-6xl md:text-7xl font-display text-[#2A082D] tracking-tight">
                                Les <span className="marker-highlight text-[#EC602B]">actualités</span>
                            </h1>
                            <p className="mt-5 text-[#2A082D]/80 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed font-medium">
                                Sorties, voyages, projets et coulisses : ce qui se passe chez Phœnix, raconté par l'équipe.
                            </p>
                        </header>

                        <ReelStrip reels={reels} />

                        {articles.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-[#2A082D]/75">Les premières actualités arrivent bientôt.</p>
                                <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#EC602B] hover:underline underline-offset-4">
                                    <Instagram size={16} />
                                    En attendant, suivez-nous sur Instagram
                                </a>
                            </div>
                        ) : (
                            <section aria-labelledby="articles-title">
                                <h2 id="articles-title" className={reels.length > 0 ? 'font-display text-3xl sm:text-4xl text-[#2A082D] mb-8' : 'sr-only'}>
                                    Les dernières <span className="text-[#EC602B]">actus</span>
                                </h2>
                                <NewsCard article={first} featured />
                                {rest.length > 0 && (
                                    <ul className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                                        {rest.map((article) => (
                                            <li key={article.slug}>
                                                <NewsCard article={article} />
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </section>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
