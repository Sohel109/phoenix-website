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
            {categories.map((cat) => (
                <Card key={cat.id} category={cat} onSelect={onSelect} />
            ))}
        </div>
    );
}

function Card({ category, onSelect }: { category: any, onSelect: (id: string) => void }) {
    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => onSelect(category.id)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect(category.id);
                }
            }}
            className="flex-1 group cursor-pointer relative active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#EC602B] rounded-[2.5rem] outline-none"
            aria-label={`Sélectionner la catégorie ${category.label} : ${category.description}`}
        >
            {/* Card Container */}
            <div className="relative h-64 md:h-80 bg-white rounded-[2.5rem] border border-phoenix-lilac/50 hover:border-phoenix-purple overflow-hidden flex flex-col items-center justify-center p-8 transition-all duration-300 shadow-md hover:shadow-2xl hover:-translate-y-1">

                {/* Background blob on hover */}
                <div className="absolute inset-0 bg-gradient-to-b from-phoenix-cream/50 to-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center space-y-4">
                    {/* Circular Icon Container */}
                    <div className="w-20 h-20 rounded-full bg-phoenix-cream border border-phoenix-lilac/60 text-phoenix-purple flex items-center justify-center group-hover:scale-110 group-hover:bg-gradient-to-tr group-hover:from-phoenix-purple group-hover:to-phoenix-orange group-hover:text-white group-hover:border-transparent transition-all duration-300 shadow-sm">
                        <category.icon strokeWidth={1.8} size={32} />
                    </div>

                    <div className="text-center">
                        <h3 className="text-xl sm:text-2xl font-school uppercase tracking-wider text-phoenix-dark mb-1.5 group-hover:text-phoenix-purple transition-colors">
                            {category.label}
                        </h3>

                        <p className="text-xs font-sans font-medium text-slate-500 max-w-[220px]">
                            {category.description}
                        </p>
                    </div>

                    <span className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full border border-phoenix-lilac/80 bg-phoenix-cream/50 group-hover:bg-phoenix-purple group-hover:text-white group-hover:border-phoenix-purple text-xs font-school uppercase tracking-wider text-phoenix-dark transition-all">
                        Sélectionner →
                    </span>
                </div>

                {/* Bottom decorative bar */}
                <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-phoenix-purple to-phoenix-orange transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </div>
        </div>
    );
}
