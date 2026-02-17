import { motion } from 'framer-motion';
import { Info, Handshake, Users } from 'lucide-react';

interface SelectionViewProps {
    onSelect: (category: string) => void;
}

const categories = [
    {
        id: 'information',
        label: 'Information',
        icon: Info,
        gradient: 'from-blue-500 to-cyan-400',
        description: 'Découvrir notre vision'
    },
    {
        id: 'partenariat',
        label: 'Partenariat',
        icon: Handshake,
        gradient: 'from-purple-600 to-pink-500',
        description: 'Soutenir l\'ambition'
    },
    {
        id: 'recrutement',
        label: 'Recrutement',
        icon: Users,
        gradient: 'from-orange-500 to-red-500',
        description: 'Rejoindre l\'équipe'
    }
];

export function SelectionView({ onSelect }: SelectionViewProps) {
    return (
        <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 w-full max-w-6xl mx-auto px-4">
            {categories.map((cat, index) => (
                <Card key={cat.id} category={cat} index={index} onSelect={onSelect} />
            ))}
        </div>
    );
}

function Card({ category, index, onSelect }: { category: any, index: number, onSelect: (id: string) => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.5,
                delay: index * 0.1
            }}
            onClick={() => onSelect(category.id)}
            className="flex-1 group cursor-pointer relative"
        >
            {/* Card Container - Correct Deep Violet Background */}
            <div className="relative h-72 md:h-96 bg-[#1A103C]/90 backdrop-blur-md rounded-3xl border border-white/5 overflow-hidden flex flex-col items-center justify-center p-8 transition-all duration-300 group-hover:border-white/20 shadow-xl shadow-black/20 group-hover:shadow-violet-900/10">

                {/* Subtle Inner Glow on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 -z-10`} />

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center space-y-6">

                    {/* Icon Container - Darker, less flashy */}
                    <div className={`p-5 rounded-2xl bg-white/5 border border-white/5 group-hover:scale-110 transition-transform duration-500 group-hover:border-white/20 shadow-inner group-hover:bg-white/10`}>
                        <category.icon strokeWidth={1.5} size={36} className="text-gray-300 group-hover:text-white transition-colors" />
                    </div>

                    <div className="text-center">
                        {/* Title - Gradient on Hover only */}
                        <h3 className={`text-2xl font-bold uppercase tracking-wider text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${category.gradient} transition-all duration-300 font-display`}>
                            {category.label}
                        </h3>

                        <p className="text-xs font-medium text-gray-400 group-hover:text-gray-300 transition-colors uppercase tracking-widest">
                            {category.description}
                        </p>
                    </div>
                </div>

                {/* Bottom decorative bar - Thinner */}
                <div className={`absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r ${category.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`} />

            </div>
        </motion.div>
    );
}
