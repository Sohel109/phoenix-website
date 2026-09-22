import { useRef, useState } from 'react';

/**
 * État + handlers pour un tracé au feutre (HandDrawnCircle) qui se dessine à l'interaction :
 * survol sur desktop, tap maintenu / court sur mobile (le tracé reste visible un instant après relâchement).
 * Centralise la logique pour que toutes les icônes "carnet" du site aient le même comportement.
 */
export function useDrawnOnInteract(resetDelayMs = 600) {
    const [isDrawn, setIsDrawn] = useState(false);
    const resetTimeout = useRef<number | null>(null);

    const clearResetTimeout = () => {
        if (resetTimeout.current !== null) {
            window.clearTimeout(resetTimeout.current);
            resetTimeout.current = null;
        }
    };

    return {
        isDrawn,
        interactionProps: {
            onMouseEnter: () => { clearResetTimeout(); setIsDrawn(true); },
            onMouseLeave: () => { clearResetTimeout(); setIsDrawn(false); },
            onTouchStart: () => { clearResetTimeout(); setIsDrawn(true); },
            onTouchEnd: () => {
                clearResetTimeout();
                resetTimeout.current = window.setTimeout(() => setIsDrawn(false), resetDelayMs);
            },
            onFocus: () => { clearResetTimeout(); setIsDrawn(true); },
            onBlur: () => { clearResetTimeout(); setIsDrawn(false); },
        },
    };
}
