import { motion } from 'framer-motion';
import { ArrowRight, Users, GraduationCap, Briefcase } from 'lucide-react';


export function Recruitment() {
    return (
        <section className="py-20 relative overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="max-w-4xl mx-auto">

                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="text-center mb-16"
                    >
                        <span className="text-xs font-school uppercase tracking-widest text-phoenix-purple bg-phoenix-lilac/40 border border-phoenix-lilac/70 px-4 py-1.5 rounded-full inline-block mb-4">
                            On recrute !
                        </span>
                        <h2 className="text-4xl md:text-5xl font-display text-phoenix-dark mb-2">
                            Rejoignez l'Aventure
                        </h2>
                        <p className="font-script text-2xl text-phoenix-purple mb-4">
                            ~ Deviens acteur du changement à Marseille ~
                        </p>
                        <p className="text-slate-600 font-sans text-base max-w-2xl mx-auto leading-relaxed">
                            Vous êtes étudiant à KEDGE Business School et vous souhaitez vous engager concrètement pour l'égalité des chances ?
                            Phœnix recrute ses nouveaux tuteurs et membres actifs !
                        </p>
                    </motion.div>

                    {/* Cards Grid */}
                    <div className="grid md:grid-cols-3 gap-6 mb-16">
                        <Card icon={Users} title="Esprit d'Équipe" description="Intégrez une famille soudée et passionnée par l'impact social." delay={0.1} />
                        <Card icon={Briefcase} title="Compétences" description="Développez des soft skills, le sens des responsabilités et une expérience humaine valorisante." delay={0.2} />
                        <Card icon={GraduationCap} title="Engagement" description="Participez concrètement à la réussite scolaire et culturelle de jeunes marseillais." delay={0.3} />
                    </div>

                    {/* CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="text-center"
                    >
                        <a
                            href="https://m.facebook.com/groups/1045459488302373/?ref=share"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex items-center gap-3 px-8 py-4 btn-phoenix-gradient text-white rounded-full font-school uppercase tracking-wider text-xs shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
                        >
                            <span>Postuler Maintenant</span>
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </a>
                        <p className="mt-4 text-xs font-school text-slate-500 uppercase tracking-widest">
                            Prochaine session de recrutement : Octobre 2026
                        </p>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}

function Card({ icon: Icon, title, description, delay }: { icon: any, title: string, description: string, delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white border border-phoenix-lilac/50 p-8 rounded-[2.5rem] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center group shadow-sm flex flex-col items-center"
        >
            <div className="w-16 h-16 mx-auto bg-phoenix-cream text-phoenix-purple rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-gradient-to-tr group-hover:from-phoenix-purple group-hover:to-phoenix-orange group-hover:text-white transition-all duration-300 border border-phoenix-lilac/60">
                <Icon size={26} strokeWidth={1.8} />
            </div>
            <h3 className="text-lg font-school font-bold text-phoenix-dark mb-2 uppercase tracking-wide">{title}</h3>
            <p className="text-sm font-sans text-slate-600 leading-relaxed">{description}</p>
        </motion.div>
    );
}
