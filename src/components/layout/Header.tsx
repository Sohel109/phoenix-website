import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';


export function Header() {
    return (
        <header 
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-6 pb-3 md:pb-6 bg-transparent pointer-events-none"
            style={{ paddingTop: 'calc(max(0.75rem, env(safe-area-inset-top, 0px)) + 0.35rem)' }}
        >
            <Link to="/" className="flex items-center gap-2 group pointer-events-auto">
                <span translate="no" className="notranslate text-xl md:text-2xl font-black uppercase tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-purple-600 to-violet-600 drop-shadow-sm font-sans">
                    PHOENIX
                </span>
            </Link>

            <a
                href="https://www.helloasso.com/associations/egalite-des-chances-phoenix/collectes/a"
                target="_blank"
                rel="noopener noreferrer"
                className="pointer-events-auto flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-violet-500 text-white font-bold text-xs md:text-sm hover:scale-105 active:scale-95 transition-all duration-200"
            >
                <Heart size={13} fill="currentColor" />
                <span className="hidden xs:inline">Faire un don</span>
                <span className="xs:hidden">Don</span>
            </a>
        </header>
    );
}
