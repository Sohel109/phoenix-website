import { motion } from 'framer-motion';
import { Sparkles, MessageSquareText, BrainCircuit, Rocket } from 'lucide-react';

export function AISection() {
    return (
        <section id="ai-section" className="py-24 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-500/5 to-transparent -z-10" />
            <div className="absolute top-1/2 left-0 w-64 h-64 bg-orange-500/10 rounded-full blur-[100px] -translate-y-1/2 -z-10" />
            <div className="absolute top-1/3 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-[100px] -z-10" />

            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

                    {/* Left Content */}
                    <div className="flex-1 text-center lg:text-left">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600/10 to-orange-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 mb-6"
                        >
                            <Sparkles size={16} className="text-violet-600" />
                            <span className="text-sm font-semibold text-violet-700 dark:text-violet-300">
                                NOUVEAU : PHOENIX AI
                            </span>
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-6"
                        >
                            DISCUTEZ AVEC <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-orange-500">
                                NOTRE INTELLIGENCE
                            </span>
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed"
                        >
                            Une question sur nos programmes ? Besoin d'aide pour votre orientation ?
                            Notre assistant virtuel est là pour vous répondre instantanément, 24h/24 et 7j/7.
                            C'est totalement gratuit et accessible à tous.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
                        >
                            <button
                                onClick={() => document.querySelector<HTMLButtonElement>('.fixed.bottom-6.right-6')?.click()}
                                className="group relative inline-flex items-center gap-3 bg-gray-900 dark:bg-white text-white dark:text-black px-8 py-4 rounded-full font-bold hover:scale-105 hover:bg-violet-600 dark:hover:bg-violet-400 dark:hover:text-white transition-all duration-300"
                            >
                                <span>Essayer maintenant</span>
                                <MessageSquareText size={20} className="group-hover:rotate-12 transition-transform" />
                            </button>
                        </motion.div>
                    </div>

                    {/* Right Visual */}
                    <div className="flex-1 relative">
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="relative z-10 p-2"
                        >
                            <div className="relative bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl p-6 shadow-2xl rotate-3 hover:rotate-0 transition-all duration-500">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="p-3 bg-violet-600 rounded-2xl text-white">
                                        <BrainCircuit size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg">Pourquoi Phoenix AI ?</h4>
                                        <p className="text-sm text-gray-500">Assistant Intelligent</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-500/10 flex items-center gap-3">
                                        <Rocket size={18} className="text-violet-600" />
                                        <span className="text-sm font-medium">Réponses instantanées</span>
                                    </div>
                                    <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-500/10 flex items-center gap-3">
                                        <Sparkles size={18} className="text-orange-500" />
                                        <span className="text-sm font-medium">Disponible 24h/24</span>
                                    </div>
                                    <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-500/10 flex items-center gap-3">
                                        <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-[10px] text-white">€</div>
                                        <span className="text-sm font-medium">100% Gratuit</span>
                                    </div>
                                </div>
                            </div>



                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
