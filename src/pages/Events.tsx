import { useRef } from 'react';
import { motion, useScroll } from 'framer-motion';
import { Calendar, ArrowRight } from 'lucide-react';
import { events } from '../data/events';
import { Link } from 'react-router-dom';

export function Events() {
    const containerRef = useRef<HTMLDivElement>(null);
    useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    return (
        <div ref={containerRef} className="min-h-screen bg-transparent overflow-hidden relative transition-colors duration-300">

            <div className="relative z-10 container mx-auto px-4 pt-32 pb-20">
                <div className="text-center mb-20">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-bold mb-4 uppercase tracking-wider relative inline-block text-gray-900 dark:text-white"
                    >
                        Événements
                        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-1 bg-orange-500 rounded-full"></span>
                    </motion.h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {events.map((event, index) => (
                        <EventCard key={event.id} event={event} index={index} />
                    ))}
                </div>
            </div>
        </div>
    );
}

function EventCard({ event, index }: { event: any, index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            className="group relative h-full"
        >
            <div className="absolute inset-0 bg-white dark:bg-current-card rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm transition-all duration-500 group-hover:shadow-lg group-hover:-translate-y-1" />

            <div className="relative p-6 h-full flex flex-col z-10">
                {/* Image Container */}
                <div className="relative h-64 w-full rounded-xl overflow-hidden mb-8 shadow-sm">
                    <img
                        src={event.image}
                        alt={event.title}
                        className={`w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out ${event.id === 'jedc' ? 'object-left' : 'object-center'}`}
                    />
                    {/* Floating Date Badge */}
                    <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-semibold text-gray-800 dark:text-white border border-white/40 dark:border-white/10 shadow-sm flex items-center gap-2">
                        <Calendar size={14} className="text-primary" />
                        {event.date}
                    </div>
                </div>

                {/* Content */}
                <div className="px-2 pb-2 flex-grow flex flex-col text-center items-center">
                    <Link to={`/evenements/${event.id}`} className="block mb-4">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white font-display hover:text-primary transition-colors duration-300 cursor-pointer">
                            {event.title}
                        </h3>
                    </Link>

                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-medium mb-8 flex-grow">
                        {event.description}
                    </p>

                    <Link
                        to={`/evenements/${event.id}`}
                        className="px-8 py-3 rounded-full bg-primary hover:bg-primary-dark text-white font-semibold text-sm shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-2"
                    >
                        En savoir plus
                        <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}
