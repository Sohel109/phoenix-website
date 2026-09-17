import { motion } from 'framer-motion';
import { Calendar, ArrowRight } from 'lucide-react';
import { events } from '../data/events';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export function Events() {
    return (
        <div className="pt-28 sm:pt-32 pb-24 min-h-screen bg-transparent">
            <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
                {/* Header */}
                <div className="text-center mb-14 sm:mb-16">
                    <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-orange-600 bg-orange-50 border border-orange-200/60 px-4 py-1.5 rounded-full inline-block mb-3">
                        Moments Forts & Vie Associative
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-black text-slate-900 uppercase tracking-tight mb-4">
                        Nos Événements Phares
                    </h1>
                    <p className="text-slate-500 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
                        Chaque année, Phoenix EDC organise et participe à des événements majeurs pour stimuler l'éloquence, la négociation diplomatique, le sport et la cohésion de nos jeunes.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {events.map((event, index) => (
                        <EventCard key={event.id} event={event} index={index} />
                    ))}
                </div>
            </div>
        </div>
    );
}


function EventCard({ event, index }: { event: any, index: number }) {
    const [isMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

    return (
        <motion.div
            initial={isMobile ? false : { opacity: 0, y: 25 }}
            whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className="bg-white border-2 border-slate-200 hover:border-orange-400 rounded-2xl p-6 flex flex-col h-full shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 ease-out group"
        >
            {/* Image Container with strict 16:9 fixed aspect ratio */}
            <div className={`relative aspect-video w-full rounded-xl overflow-hidden mb-6 border border-slate-100 shadow-xs flex items-center justify-center ${
                event.id === 'entretiens-excellence' ? 'bg-white p-5' : 'bg-slate-100'
            }`}>
                <img
                    src={event.image}
                    alt={event.title}
                    className={`w-full h-full transform group-hover:scale-105 transition-transform duration-500 ease-out ${
                        event.id === 'entretiens-excellence'
                            ? 'object-contain'
                            : event.id === 'jedc'
                            ? 'object-cover object-left'
                            : 'object-cover object-center'
                    }`}
                />
                {/* Date Badge */}
                <div className="absolute top-3.5 right-3.5 bg-white/95 backdrop-blur-xs px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-800 border border-slate-200/90 shadow-xs flex items-center gap-1.5">
                    <Calendar size={13} className="text-orange-500" />
                    <span>{event.date}</span>
                </div>

                {/* Event Category Badge */}
                {event.badge && (
                    <div className="absolute top-3.5 left-3.5 bg-slate-900/90 backdrop-blur-xs text-white px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-xs">
                        {event.badge}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex flex-col flex-grow text-center items-center">
                <Link to={`/evenements/${event.id}`} className="block mb-2">
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-orange-600 transition-colors tracking-tight">
                        {event.title}
                    </h3>
                </Link>

                {event.location && (
                    <div className="text-xs text-slate-400 font-medium mb-3">
                        {event.location}
                    </div>
                )}

                <p className="text-slate-500 leading-relaxed text-sm font-normal mb-6 flex-grow line-clamp-3">
                    {event.description}
                </p>

                <Link
                    to={`/evenements/${event.id}`}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm border-2 border-orange-500 shadow-sm hover:shadow-md hover:shadow-orange-500/20 active:scale-95 transition-all mt-auto"
                >
                    <span>En savoir plus</span>
                    <ArrowRight size={15} />
                </Link>
            </div>
        </motion.div>
    );
}
