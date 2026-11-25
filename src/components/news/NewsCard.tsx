import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { MaskingTape } from '../common/HandDrawnElements';
import { publicImageUrl } from '../../data/planningData';
import { excerpt, formatNewsDate, type PublicArticle } from '../../data/news';
import { projects } from '../../data/projects';

export const projectTitle = (id: string | null) => (id ? projects.find((p) => p.id === id)?.title ?? null : null);

interface NewsCardProps {
    article: PublicArticle;
    /** Grande carte en tête de liste : photo à gauche sur ordinateur, texte plus long. */
    featured?: boolean;
}

export function NewsCard({ article, featured = false }: NewsCardProps) {
    const project = projectTitle(article.projectId);
    return (
        <Link
            to={`/actualites/${article.slug}`}
            className={`group relative block h-full bg-white border border-[#2A082D]/10 rounded-organic-sm shadow-soft hover:shadow-phoenix-colored transition-shadow ${
                featured ? 'md:grid md:grid-cols-2 md:items-stretch' : 'flex flex-col'
            }`}
        >
            {featured && <MaskingTape className="absolute -top-3 left-8 z-10 w-24 h-6" angle="left" />}
            <div className={`relative overflow-hidden bg-[#ECDDFD] rounded-tl-[2rem] rounded-tr-[0.75rem] ${featured ? 'aspect-[4/3] md:aspect-auto md:min-h-[320px] md:rounded-tr-none md:rounded-bl-[0.75rem]' : 'aspect-[4/3]'}`}>
                <img
                    src={publicImageUrl(article.coverId)}
                    alt=""
                    loading={featured ? 'eager' : 'lazy'}
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
            </div>
            <div className={`flex flex-col flex-1 ${featured ? 'p-6 sm:p-10 justify-center' : 'p-5 sm:p-6'}`}>
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-school font-bold uppercase tracking-widest text-[#904990]">
                    <time dateTime={article.publishedAt}>{formatNewsDate(article.publishedAt)}</time>
                    {project && (
                        <>
                            <span aria-hidden="true">·</span>
                            <span>{project}</span>
                        </>
                    )}
                </p>
                <h3 className={`mt-2 font-display text-[#2A082D] leading-tight break-words group-hover:text-[#EC602B] transition-colors ${featured ? 'text-3xl sm:text-4xl' : 'text-2xl'}`}>
                    {article.title}
                </h3>
                <p className={`mt-3 text-[#2A082D]/75 leading-relaxed ${featured ? 'text-base' : 'text-sm'}`}>{excerpt(article.body, featured ? 260 : 140)}</p>
                <span className="mt-auto pt-5 inline-flex items-center gap-1.5 text-xs font-school font-bold uppercase tracking-wider text-[#EC602B]">
                    Lire l'article
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </span>
            </div>
        </Link>
    );
}
