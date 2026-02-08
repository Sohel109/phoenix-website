import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export function Header() {
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6">
            <Link to="/" className="flex items-center gap-2 group">
                <span className="text-2xl font-black uppercase tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-purple-600 to-violet-600 drop-shadow-sm font-sans">
                    PHOENIX
                </span>
            </Link>

            <button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-colors shadow-lg"
                aria-label="Toggle Dark Mode"
            >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
        </header>
    );
}
