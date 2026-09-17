import { motion } from 'framer-motion';
import { Calendar, ArrowRight } from 'lucide-react';
import { events } from '../data/events';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export function Events() {
    return (
        <div className="pt-page-safe pb-24 min-h-screen bg-[#FFFBF4]">
            <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
                {/* Header */}
                <div className="text-center mb-14 sm:mb-18">
                    <span className="text-xs sm:text-sm font-school font-bold uppercase tracking-widest text-[#6F2B75] bg-[#ECDDFD] shadow-soft px-5 py-2 rounded-full inline-block mb-4">
                        Moments Forts & Vie Associative
                    </span>
                    <p className="font-script text-2xl md:text-3xl text-[#EC602B] mb-1">
                        ~ L'émulation et l'éloquence en action ~
                    </p>
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-display text-[#2A082D] tracking-tight mb-4">
                        Nos Événements Phares
                    </h1>
                    <p className="text-[#2A082D]/80 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed font-medium">
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
            className="bg-white border border-[#ECDDFD] rounded-[2.5rem] p-7 flex flex-col h-full shadow-soft hover:shadow-soft-lg hover:-translate-y-1.5 transition-all duration-300 group"
        >
            {/* Image Container with strict 16:9 fixed aspect ratio */}
            <div className={`relative aspect-video w-full rounded-[2rem] overflow-hidden mb-6 shadow-soft flex items-center justify-center ${
                event.id === 'entretiens-excellence' ? 'bg-white p-5' : 'bg-slate-900'
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
                <div className="absolute inset-0 bg-gradient-to-t from-[#2A082D]/80 via-transparent to-transparent pointer-events-none" />

                {/* Date Badge */}
                <div className="absolute top-3.5 right-3.5 bg-white/95 backdrop-blur-xs px-3.5 py-1.5 rounded-full text-xs font-school font-bold text-[#2A082D] shadow-soft flex items-center gap-1.5">
                    <Calendar size={13} className="text-[#EC602B]" />
                    <span>{event.date}</span>
                </div>

                {/* Event Category Badge */}
                {event.badge && (
                    <div className="absolute top-3.5 left-3.5 bg-[#6F2B75] text-white px-3 py-1 rounded-full text-[10px] font-school font-bold uppercase tracking-wider shadow-soft">
                        {event.badge}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex flex-col flex-grow text-center items-center">
                <Link to={`/evenements/${event.id}`} className="block mb-2">
                    <h3 className="text-xl sm:text-2xl font-display text-[#2A082D] group-hover:text-[#EC602B] transition-colors tracking-tight">
                        {event.title}
                    </h3>
                </Link>

                {event.location && (
                    <div className="text-xs text-slate-400 font-school font-bold mb-3">
                        {event.location}
                    </div>
                )}

                <p className="text-slate-600 leading-relaxed text-sm font-normal mb-6 flex-grow line-clamp-3">
                    {event.description}
                </p>

                <Link
                    to={`/evenements/${event.id}`}
                    className="btn-phoenix-gradient w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-white font-school font-bold text-xs shadow-soft transition-all mt-auto"
                >
                    <span>En savoir plus</span>
                    <ArrowRight size={15} />
                </Link>
            </div>
        </motion.div>
    );
}

