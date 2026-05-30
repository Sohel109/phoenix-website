import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';


export function Header() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 pt-3 pb-6 bg-transparent">
            <Link to="/" className="flex items-center gap-2 group">
                <span className="text-2xl font-black uppercase tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-purple-600 to-violet-600 drop-shadow-sm font-sans">
                    PHOENIX
                </span>
            </Link>

            <a
                href="https://www.helloasso.com/associations/egalite-des-chances-phoenix/collectes/a"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-purple-600 text-white font-bold text-sm shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
            >
                <Heart size={15} fill="currentColor" />
                Faire un don
            </a>
        </header>
    );
}
