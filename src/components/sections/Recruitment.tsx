import { ArrowRight, Users, GraduationCap, Briefcase } from 'lucide-react';

export function Recruitment() {
    return (
        <section className="pt-14 pb-10 relative overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="max-w-4xl mx-auto">

                    {/* Header */}
                    <div className="text-center mb-8 sm:mb-10">
                        <div className="flex justify-center mb-3">
                            <span className="badge-blockletter">
                                Étudiants KEDGE · On recrute !
                            </span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-display text-phoenix-dark mb-3">
                            Rejoignez l'Aventure
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
                            className="group inline-flex items-center gap-3 px-8 py-4 btn-phoenix-orange text-white rounded-full font-school uppercase tracking-wider text-xs shadow-glow-orange hover:scale-105 active:scale-95 transition-all duration-200"
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
        <div className="bg-white border border-phoenix-lilac/50 p-8 rounded-[2.5rem] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center group shadow-sm flex flex-col items-center">
            <div className="w-16 h-16 mx-auto bg-phoenix-cream text-phoenix-purple rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-gradient-to-tr group-hover:from-phoenix-purple group-hover:to-phoenix-orange group-hover:text-white transition-all duration-300 border border-phoenix-lilac/60">
                <Icon size={26} strokeWidth={1.8} />
            </div>
            <h3 className="text-lg font-school font-bold text-phoenix-dark mb-2 uppercase tracking-wide">{title}</h3>
            <p className="text-sm font-sans text-slate-600 leading-relaxed">{description}</p>
        </div>
    );
}
