import { createContext, useContext, useEffect } from 'react';

type Theme = 'light';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Force light mode permanently on public site.
        // Planning pages use their own dark background via inline classes in PlanningLayout.
        const root = window.document.documentElement;
        const body = window.document.body;

        root.classList.remove('dark');
        root.classList.add('light');

        body.classList.remove('dark');
        body.classList.add('light');

        // Clear any stale dark theme from localStorage
        localStorage.removeItem('theme');
    }, []);

    const toggleTheme = () => {
        // No-op: public site is always light mode.
        // Planning dark mode is handled by PlanningLayout's own classes.
    };

    return (
        <ThemeContext.Provider value={{ theme: 'light', toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
