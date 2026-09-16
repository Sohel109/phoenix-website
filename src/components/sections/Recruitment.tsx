import { motion } from 'framer-motion';
import { ArrowRight, Users, GraduationCap, Briefcase } from 'lucide-react';
import { useState } from 'react';


export function Recruitment() {
    const [isMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

    return (
        <section className="py-20 relative overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="max-w-4xl mx-auto">

                    {/* Header */}
                    <motion.div
                        initial={isMobile ? false : { opacity: 0, y: 20 }}
                        whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-orange-600 bg-orange-50 border border-orange-200/60 px-4 py-1.5 rounded-full inline-block mb-4">
                            On recrute !
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-6 text-slate-900">
                            Rejoignez <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">l'Aventure</span>
                        </h2>
                        <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
                            Vous êtes étudiant à KEDGE et vous souhaitez vous engager pour l'égalité des chances ?
                            Phoenix EDC recrute ses nouveaux membres !
                        </p>
                    </motion.div>

                    {/* Cards Grid */}
                    <div className="grid md:grid-cols-3 gap-6 mb-16">
                        <Card
                            icon={Users}
                            title="Esprit d'Équipe"
                            description="Intégrez une famille soudée et passionnée par l'impact social."
                            delay={0.1}
                            isMobile={isMobile}
                        />
                        <Card
                            icon={Briefcase}
                            title="Compétences"
                            description="Développez des soft skills et une expérience valorisante."
                            delay={0.2}
                            isMobile={isMobile}
                        />
                        <Card
                            icon={GraduationCap}
                            title="Engagement"
                            description="Participez concrètement à la réussite scolaire de jeunes marseillais."
                            delay={0.3}
                            isMobile={isMobile}
                        />
                    </div>

                    {/* CTA */}
                    <motion.div
                        initial={isMobile ? false : { opacity: 0, y: 20 }}
                        whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={isMobile ? undefined : { delay: 0.4 }}
                        className="text-center"
                    >
                        <a
                            href="https://m.facebook.com/groups/1045459488302373/?ref=share"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex items-center gap-3 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-bold uppercase tracking-wider shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105 active:scale-95 transition-all duration-200"
                        >
                            <span>Postuler Maintenant</span>
                            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </a>
                        <p className="mt-4 text-xs text-slate-500 uppercase tracking-widest font-semibold">
                            Prochaine session de recrutement : Octobre 2026
                        </p>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}

function Card({ icon: Icon, title, description, delay, isMobile }: { icon: any, title: string, description: string, delay: number, isMobile?: boolean }) {
    return (
        <motion.div
            initial={isMobile ? false : { opacity: 0, y: 20 }}
            whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={isMobile ? undefined : { delay }}
            className="bg-white border border-slate-200 p-8 rounded-2xl hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 text-center group shadow-xs"
        >
            <div className="w-12 h-12 mx-auto bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300 border border-orange-100">
                <Icon size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3 uppercase tracking-wide">{title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
        </motion.div>
    );
}
