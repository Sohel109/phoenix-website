import { FileDown } from 'lucide-react';

export function GuideFloatingTab() {
    return (
        <aside
            aria-label="Téléchargement rapide de documentation"
            className="hidden md:block fixed right-0 top-1/2 -translate-y-1/2 z-40 select-none print:hidden pointer-events-auto"
        >
            <a
                href="/documents/Guide du phoenicien 2026-2027.pdf"
                target="_blank"
                rel="noopener noreferrer"
                download="Guide-du-Phoenicien-2026-2027.pdf"
                aria-label="Télécharger le Guide du Phœnicien 2026-2027 (PDF officiel)"
                className="group relative flex flex-col items-center justify-center gap-3 py-5 px-3.5 bg-white hover:bg-[#EC602B] border-2 border-[#EC602B] border-r-0 rounded-l-2xl shadow-md hover:shadow-xl hover:shadow-orange-500/25 -translate-x-0 hover:-translate-x-2 transition-all duration-200 ease-out cursor-pointer after:content-[''] after:absolute after:inset-y-[-2px] after:left-full after:w-8 after:bg-inherit after:border-y-2 after:border-[#EC602B]"
            >
                {/* Icône de téléchargement avec inversion propre au survol */}
                <div className="w-8 h-8 rounded-full bg-[#EC602B]/10 text-[#EC602B] group-hover:bg-white group-hover:text-[#EC602B] flex items-center justify-center transition-all duration-200 shadow-2xs group-hover:scale-105">
                    <FileDown size={16} strokeWidth={2.4} />
                </div>

                {/* Texte vertical - fluide et net sans décalage */}
                <span
                    style={{ writingMode: 'vertical-rl' }}
                    className="rotate-180 text-[11px] font-school font-bold tracking-wider uppercase whitespace-nowrap text-[#EC602B] group-hover:text-white transition-colors duration-200"
                >
                    Télécharger le guide du phœnicien
                </span>
            </a>
        </aside>
    );
}
