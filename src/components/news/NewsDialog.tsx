import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface NewsDialogProps {
    label: string;
    onClose: () => void;
    children: ReactNode;
}

/** Fenêtre plein écran sombre (réel Instagram, photo en grand) : Échap, clic à côté, focus gardé à l'intérieur. */
export function NewsDialog({ label, onClose, children }: NewsDialogProps) {
    const panel = useRef<HTMLDivElement>(null);
    const closeButton = useRef<HTMLButtonElement>(null);
    const closeRef = useRef(onClose);
    closeRef.current = onClose;

    useEffect(() => {
        const previous = document.activeElement as HTMLElement | null;
        const overflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        closeButton.current?.focus();
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                closeRef.current();
                return;
            }
            if (e.key !== 'Tab' || !panel.current) return;
            const focusables = panel.current.querySelectorAll<HTMLElement>('a[href], button, iframe, [tabindex]:not([tabindex="-1"])');
            if (focusables.length === 0) return;
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = overflow;
            previous?.focus();
        };
    }, []);

    // Rendu dans <body> : le conteneur de la page crée son propre empilement et laisserait le menu du site par-dessus.
    return createPortal(
        <div
            className="fixed inset-0 z-[120] bg-[#1F0422]/90 backdrop-blur-sm flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label={label}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div ref={panel} className="relative flex flex-col items-center max-h-full">
                <button
                    ref={closeButton}
                    type="button"
                    onClick={onClose}
                    aria-label="Fermer"
                    className="self-end mb-3 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors"
                >
                    <X size={20} />
                </button>
                {children}
            </div>
        </div>,
        document.body
    );
}
