import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';

interface Flight {
    id: number;
    start: DOMRect;
    end: DOMRect;
}

export function FlyingHeart() {
    const [flights, setFlights] = useState<Flight[]>([]);

    useEffect(() => {
        const handleFly = (e: Event) => {
            const customEvent = e as CustomEvent;
            const { startRect, targetId } = customEvent.detail;
            
            // On cherche la cible demandée, sinon on se rabat sur le menu en bas
            let targetEl = document.getElementById(targetId);
            if (!targetEl || targetEl.offsetParent === null) {
                targetEl = document.getElementById('menu-heart');
            }
            
            if (!targetEl) return;
            
            const endRect = targetEl.getBoundingClientRect();
            
            const newFlight = {
                id: Date.now(),
                start: startRect,
                end: endRect
            };
            
            setFlights(prev => [...prev, newFlight]);
            
            // Nettoyage après l'animation (800ms)
            setTimeout(() => {
                setFlights(prev => prev.filter(f => f.id !== newFlight.id));
            }, 1000);
        };

        window.addEventListener('fly-heart', handleFly);
        return () => window.removeEventListener('fly-heart', handleFly);
    }, []);

    return (
        <AnimatePresence>
            {flights.map(flight => (
                <motion.div
                    key={flight.id}
                    initial={{ 
                        position: 'fixed',
                        top: flight.start.top,
                        left: flight.start.left,
                        width: flight.start.width,
                        height: flight.start.height,
                        zIndex: 9999999, // Au-dessus de tout
                        scale: 1,
                        opacity: 1
                    }}
                    animate={{ 
                        top: flight.end.top + (flight.end.height / 2) - (flight.start.height / 2),
                        left: flight.end.left + (flight.end.width / 2) - (flight.start.width / 2),
                        scale: [1, 1.5, 0.5],
                        opacity: [1, 1, 0]
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="pointer-events-none flex items-center justify-center text-pink-500 drop-shadow-2xl"
                >
                    <Heart className="w-full h-full" fill="currentColor" />
                </motion.div>
            ))}
        </AnimatePresence>
    );
}
