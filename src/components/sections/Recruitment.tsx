import { ArrowRight, Users, GraduationCap, Briefcase } from 'lucide-react';

export function Recruitment() {
    return (
        <section className="pt-14 pb-10 relative overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="max-w-4xl mx-auto">

                    {/* Header */}
                    <div className="text-center mb-8 sm:mb-12">
                        <div className="flex justify-center items-center gap-3 mb-4">
                            <span className="h-px w-8 bg-[#EC602B]"></span>
                            <span className="text-xs uppercase tracking-widest font-semibold text-[#904990]">
                                Étudiants KEDGE · On recrute !
                            </span>
                            <span className="h-px w-8 bg-[#EC602B]"></span>
                        </div>
                        <h2 className="text-3xl sm:text-5xl font-display text-phoenix-dark mb-3">
                            Rejoignez{' '}
                            <span className="marker-highlight text-[#EC602B]">
                                <span>l'Aventure</span>
                            </span>
                        </h2>
                        <p className="text-slate-600 font-sans text-base max-w-2xl mx-auto leading-relaxed">
                            Vous êtes étudiant à KEDGE Business School et vous souhaitez vous engager concrètement pour l'égalité des chances ?
                            Phœnix recrute ses nouveaux tuteurs et membres actifs !
                        </p>
                    </div>

                    {/* Cards Grid */}
                    <div className="grid md:grid-cols-3 gap-6 mb-10 sm:mb-12">
                        <Card icon={Users} title="Esprit d'Équipe" description="Intégrez une famille soudée et passionnée par l'impact social." />
                        <Card icon={Briefcase} title="Compétences" description="Développez des soft skills, le sens des responsabilités et une expérience humaine valorisante." />
                        <Card icon={GraduationCap} title="Engagement" description="Participez concrètement à la réussite scolaire et culturelle de jeunes marseillais." />
                    </div>

                    {/* CTA */}
                    <div className="text-center">
                        <a
                            href="https://m.facebook.com/groups/1045459488302373/?ref=share"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex items-center gap-3 px-8 py-3.5 btn-phoenix-orange btn-glow-orange text-white rounded-lg font-school uppercase tracking-wider text-xs shadow-glow-orange hover:-translate-y-0.5 active:scale-95 transition-all duration-200 touch-tactile"
                        >
                            <span>Postuler Maintenant</span>
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </a>
                        <p className="mt-4 text-xs font-school text-slate-500 uppercase tracking-widest">
                            Prochaine session de recrutement : Octobre 2026
                        </p>
                    </div>

                </div>
            </div>
        </section>
    );
}

function Card({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
    return (
        <div className="bg-white border border-[#6F2B75]/15 p-8 rounded-organic-sm hover:shadow-phoenix-colored-lg hover:-translate-y-2 transition-all duration-300 text-center group shadow-phoenix-colored flex flex-col items-center will-change-transform">
            <div className="w-14 h-14 mx-auto bg-[#ECDDFD]/50 text-[#6F2B75] rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#6F2B75] group-hover:text-white transition-all duration-300 border border-[#6F2B75]/15 shadow-soft">
                <Icon size={24} strokeWidth={1.8} />
            </div>
            <h3 className="text-base font-school font-bold text-phoenix-dark mb-2 uppercase tracking-wide">{title}</h3>
            <p className="text-sm font-sans text-slate-600 leading-relaxed font-normal">{description}</p>
        </div>
    );
}
