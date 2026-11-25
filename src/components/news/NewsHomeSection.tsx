import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { NewsCard } from './NewsCard';
import { usePublicNews } from '../../hooks/usePublicNews';

/** Bande de l'accueil : les 3 derniers articles. Rien tant qu'aucun article n'est publié. */
export function NewsHomeSection() {
    const { data } = usePublicNews();
    const latest = (data?.articles ?? []).slice(0, 3);
    if (latest.length === 0) return null;

    return (
        <section aria-labelledby="home-news-title" className="relative bg-[#FFFBF4] py-16 sm:py-20">
            <div className="container mx-auto max-w-6xl px-4 sm:px-6">
                <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
                    <div>
                        <p className="text-xs font-school font-bold uppercase tracking-[0.2em] text-[#904990]">La vie de l'asso</p>
                        <h2 id="home-news-title" className="mt-2 font-display text-4xl sm:text-5xl text-[#2A082D]">
                            Les dernières <span className="marker-highlight text-[#EC602B]">actus</span>
                        </h2>
                    </div>
                    <Link to="/actualites" className="inline-flex items-center gap-2 px-6 py-3 rounded-full btn-phoenix-gradient text-white font-school text-xs font-bold uppercase tracking-wider">
                        Toutes les actus
                        <ArrowRight size={15} />
                    </Link>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {latest.map((article, i) => (
                        <li key={article.slug} className={i === 2 ? 'sm:hidden lg:block' : undefined}>
                            <NewsCard article={article} />
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
