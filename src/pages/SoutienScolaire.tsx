import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, Clock, GraduationCap, MapPin } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { MaskingTape } from '../components/common/HandDrawnElements';
import { projects } from '../data/projects';
import {
    ACCESS_PARAGRAPHS,
    DIRECT_ANSWER,
    FAQ_ITEMS,
    LAST_UPDATED_LABEL,
    MYKEDGE_URL,
    PAUSED_PROJECT_IDS,
    SOUTIEN_DESCRIPTION,
    SOUTIEN_TITLE,
    breadcrumbSchema,
    faqSchema,
} from '../data/soutienScolaire';

export function SoutienScolaire() {
    return (
        <div className="min-h-screen bg-[#FFFBF4] bg-bird-pattern pt-page-safe pb-24">
            <SEO
                title={SOUTIEN_TITLE}
                description={SOUTIEN_DESCRIPTION}
                schema={[faqSchema, breadcrumbSchema]}
            />
            <div className="container mx-auto px-4 sm:px-6 max-w-5xl relative z-10">

                <header className="text-center mb-10 sm:mb-14">
                    <div className="flex justify-center items-center gap-3 mb-4">
                        <span className="h-px w-8 bg-[#EC602B]"></span>
                        <span className="text-xs uppercase tracking-widest font-semibold text-[#904990]">
                            Aide aux devoirs · Ouverture culturelle · Marseille
                        </span>
                        <span className="h-px w-8 bg-[#EC602B]"></span>
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-display text-[#2A082D] leading-[1.15] mb-4 text-balance">
                        Soutien scolaire et{' '}
                        <span className="marker-highlight text-[#EC602B]">
                            <span>ouverture culturelle</span>
                        </span>{' '}
                        pour les jeunes des quartiers de Marseille
                    </h1>
                    <p className="text-xs font-semibold text-[#7C677E]">Mis à jour : {LAST_UPDATED_LABEL}</p>
                </header>

                <section className="relative max-w-3xl mx-auto mb-14">
                    <MaskingTape variant="warm" angle="left" className="-top-3 left-8 z-20" />
                    <div className="bg-white border border-[#6F2B75]/15 rounded-organic-sm card-polaroid p-7 sm:p-9">
                        <p className="text-[#2A082D] text-base sm:text-lg leading-relaxed font-medium">{DIRECT_ANSWER}</p>
                    </div>
                </section>

                <section className="max-w-3xl mx-auto mb-16">
                    <h2 className="text-2xl sm:text-3xl font-display text-[#2A082D] mb-4">Qui est accompagné, et comment ?</h2>
                    {ACCESS_PARAGRAPHS.map((paragraph) => (
                        <p key={paragraph} className="text-slate-700 leading-relaxed mb-3">{paragraph}</p>
                    ))}
                    <Link
                        to="/contact?category=information"
                        className="mt-3 inline-flex items-center gap-2 px-6 py-3 btn-phoenix-orange text-white rounded-lg font-school uppercase tracking-wider text-xs"
                    >
                        <span>Nous écrire</span>
                        <ArrowRight size={14} />
                    </Link>
                </section>

                <section className="mb-16">
                    <h2 className="text-2xl sm:text-3xl font-display text-[#2A082D] mb-2 text-center">Les {projects.length} projets de terrain</h2>
                    <p className="text-slate-600 text-center mb-8 text-sm">Niveau, lieu et rythme de chaque projet.</p>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => {
                            const isPaused = PAUSED_PROJECT_IDS.includes(project.id);
                            return (
                                <Link
                                    key={project.id}
                                    to={`/projets/${project.id}`}
                                    className="bg-white border border-[#6F2B75]/15 rounded-organic-sm card-polaroid p-6 flex flex-col gap-3 hover:-translate-y-1 transition-transform"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <h3 className="font-display text-lg text-[#2A082D] leading-snug">{project.title}</h3>
                                        {isPaused && (
                                            <span className="shrink-0 text-[10px] font-school font-bold uppercase tracking-wider px-2 py-1 rounded bg-[#ECDDFD] text-[#6F2B75]">
                                                En pause
                                            </span>
                                        )}
                                    </div>
                                    <ul className="text-sm text-slate-700 space-y-1.5">
                                        <li className="flex items-start gap-2"><GraduationCap size={15} className="mt-0.5 shrink-0 text-[#EC602B]" />{project.targetAudience}</li>
                                        <li className="flex items-start gap-2"><MapPin size={15} className="mt-0.5 shrink-0 text-[#EC602B]" />{project.locationName}</li>
                                        <li className="flex items-start gap-2"><Clock size={15} className="mt-0.5 shrink-0 text-[#EC602B]" />{project.schedule}</li>
                                    </ul>
                                </Link>
                            );
                        })}
                    </div>
                </section>

                <section className="max-w-3xl mx-auto mb-16 relative">
                    <MaskingTape variant="lilac" angle="right" className="-top-3 right-10 z-20" />
                    <div className="bg-[#ECDDFD]/50 border border-[#6F2B75]/20 rounded-organic-sm p-7 sm:p-9">
                        <h2 className="text-2xl sm:text-3xl font-display text-[#2A082D] mb-3">Étudiant KEDGE : deviens tuteur</h2>
                        <p className="text-slate-700 leading-relaxed mb-5">
                            Les tuteurs sont des étudiants de KEDGE Business School Marseille. L'engagement permet de valider les 50 heures du Pro Act.
                        </p>
                        <a
                            href={MYKEDGE_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 btn-phoenix-orange text-white rounded-lg font-school uppercase tracking-wider text-xs"
                        >
                            <span>Postuler sur MyKedge Asso</span>
                            <ArrowRight size={14} />
                        </a>
                    </div>
                </section>

                <section className="max-w-3xl mx-auto">
                    <h2 className="text-2xl sm:text-3xl font-display text-[#2A082D] mb-6">Questions fréquentes</h2>
                    <div className="space-y-3">
                        {FAQ_ITEMS.map((item) => (
                            <details key={item.question} className="group bg-white border border-[#6F2B75]/15 rounded-xl px-5 py-4">
                                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none font-bold text-[#2A082D] text-sm sm:text-base">
                                    {item.question}
                                    <ChevronDown size={18} className="shrink-0 text-[#6F2B75] transition-transform group-open:rotate-180" />
                                </summary>
                                <p className="mt-3 text-slate-700 text-sm leading-relaxed">{item.answer}</p>
                            </details>
                        ))}
                    </div>
                </section>

            </div>
        </div>
    );
}
