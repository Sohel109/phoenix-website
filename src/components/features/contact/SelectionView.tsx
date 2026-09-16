import { motion } from 'framer-motion';
import { Info, Handshake } from 'lucide-react';

interface SelectionViewProps {
    onSelect: (category: string) => void;
}

const categories = [
    {
        id: 'information',
        label: 'Information',
        icon: Info,
        gradient: 'from-orange-500 to-amber-500',
        description: 'Découvrir nos actions et projets'
    },
    {
        id: 'partenariat',
        label: 'Partenariat',
        icon: Handshake,
        gradient: 'from-orange-600 to-violet-600',
        description: 'Soutenir notre engagement'
    }
];

export function SelectionView({ onSelect }: SelectionViewProps) {
    return (
        <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 w-full max-w-3xl mx-auto px-4">
            {categories.map((cat, index) => (
                <Card key={cat.id} category={cat} index={index} onSelect={onSelect} />
            ))}
        </div>
    );
}

function Card({ category, index, onSelect }: { category: any, index: number, onSelect: (id: string) => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.4,
                delay: index * 0.1
            }}
            onClick={() => onSelect(category.id)}
            className="flex-1 group cursor-pointer relative"
        >
            {/* Card Container */}
            <div className="relative h-64 md:h-80 bg-white rounded-3xl border-2 border-slate-300/80 hover:border-orange-500 overflow-hidden flex flex-col items-center justify-center p-8 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1">

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center space-y-4">
                    {/* Icon Container */}
                    <div className="p-4 rounded-2xl bg-orange-50 text-orange-600 border-2 border-orange-200/80 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white group-hover:border-orange-500 transition-all duration-300 shadow-xs">
                        <category.icon strokeWidth={2} size={32} />
                    </div>

                    <div className="text-center">
                        <h3 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-slate-900 mb-1 group-hover:text-orange-600 transition-colors">
                            {category.label}
                        </h3>

                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                            {category.description}
                        </p>
                    </div>

                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border-2 border-slate-200 group-hover:border-orange-500 group-hover:bg-orange-50 text-xs font-bold text-slate-700 group-hover:text-orange-600 transition-all">
                        Sélectionner →
                    </span>
                </div>

                {/* Bottom decorative bar */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-amber-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </div>
        </motion.div>
    );
}
