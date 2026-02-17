import { motion } from 'framer-motion';
import { ArrowRight, Users, GraduationCap, Briefcase } from 'lucide-react';


export function Recruitment() {
    return (
        <section className="py-20 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-1/4 -left-64 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[128px]" />
                <div className="absolute bottom-1/4 -right-64 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[128px]" />
            </div>

            <div className="container mx-auto px-6">
                <div className="max-w-4xl mx-auto">

                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-6">
                            Rejoignez <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-purple-600">l'Aventure</span>
                        </h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
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
                        />
                        <Card
                            icon={Briefcase}
                            title="Compétences"
                            description="Développez des soft skills et une expérience valorisante."
                            delay={0.2}
                        />
                        <Card
                            icon={GraduationCap}
                            title="Engagement"
                            description="Participez concrètement à la réussite scolaire de jeunes marseillais."
                            delay={0.3}
                        />
                    </div>

                    {/* CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                        className="text-center"
                    >
                        <div className="inline-block p-[1px] rounded-full bg-gradient-to-r from-orange-500 via-purple-600 to-violet-600">
                            <button
                                onClick={() => {
                                    // Scroll to top to select recruitment category
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="group relative px-8 py-4 bg-[#130b2e] rounded-full transition-all duration-300 hover:bg-[#1A103C] flex items-center gap-3"
                            >
                                <span className="text-white font-bold uppercase tracking-wider">Postuler Maintenant</span>
                                <ArrowRight className="text-white group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                        <p className="mt-4 text-xs text-gray-500 uppercase tracking-widest">
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
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-colors duration-300 text-center group"
        >
            <div className="w-12 h-12 mx-auto bg-gradient-to-br from-orange-500/20 to-purple-600/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Icon className="text-white group-hover:text-orange-400 transition-colors duration-300" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-wide">{title}</h3>
            <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
        </motion.div>
    );
}
