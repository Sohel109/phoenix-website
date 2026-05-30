import { Link } from 'react-router-dom';


export function Header() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 pt-3 pb-6">
            <Link to="/" className="flex items-center gap-2 group">
                <span className="text-2xl font-black uppercase tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-purple-600 to-violet-600 drop-shadow-sm font-sans">
                    PHOENIX
                </span>
            </Link>
        </header>
    );
}
