import { useState } from 'react';
import { Calendar, ArrowRight, Edit3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/common/SEO';
import { useEvents } from '../hooks/useEvents';
import { usePlanning } from '../context/PlanningContext';
import { EditEventModal } from '../components/common/EditEventModal';
import type { EventItem } from '../data/events';

const eventsBreadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
        {
            "@type": "ListItem",
            "position": 1,
            "name": "Accueil",
            "item": "https://www.phoenix-egalite-des-chances.com/"
        },
        {
            "@type": "ListItem",
            "position": 2,
            "name": "Événements",
            "item": "https://www.phoenix-egalite-des-chances.com/evenements"
        }
    ]
};

export function Events() {
    const { events, updateEvent } = useEvents();
    const { currentUser, isEditModeActive } = usePlanning();
    const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

    const canEdit = currentUser?.role === 'bureau' && isEditModeActive;

    return (
        <div className="pt-page-safe pb-24 min-h-screen bg-[#FFFBF4] bg-bird-pattern">
            <SEO
                title="Événements & Concours d'Éloquence – Ouverture Culturelle Jeunesse – Marseille (13)"
                description="Participez aux événements phares de Phœnix EDC : Concours d'Éloquence KEDGE, simulation diplomatique SIMONU Marseille, Journée de l'Égalité des Chances."
                schema={eventsBreadcrumbSchema}
            />
            <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
                {/* Header */}
                <div className="text-center mb-14 sm:mb-18">
                    <div className="flex justify-center items-center gap-3 mb-4">
                        <span className="h-px w-8 bg-[#EC602B]"></span>
                        <span className="text-xs uppercase tracking-widest font-semibold text-[#904990]">
                            Moments Forts &amp; Vie Associative
                        </span>
                        <span className="h-px w-8 bg-[#EC602B]"></span>
                    </div>
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-display text-[#2A082D] tracking-tight mb-4">
                        Nos{' '}
                        <span className="marker-highlight text-[#EC602B]">
                            <span>Événements Phares</span>
                        </span>
                    </h1>
                    <p className="text-[#2A082D]/80 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed font-medium">
                        Chaque année, Phoenix EDC organise et participe à des événements majeurs pour stimuler l'éloquence, la négociation diplomatique, le sport et la cohésion de nos jeunes.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {events.map((event, index) => (
                        <EventCard
                            key={event.id}
                            event={event}
                            index={index}
                            canEdit={canEdit}
                            onEdit={() => setEditingEvent(event)}
                        />
                    ))}
                </div>
            </div>

            {/* Modal de modification */}
            <EditEventModal
                isOpen={!!editingEvent}
                onClose={() => setEditingEvent(null)}
                event={editingEvent}
                onSave={async (updated) => {
                    await updateEvent(updated);
                }}
            />
        </div>
    );
}

function EventCard({
    event,
    index,
    canEdit,
    onEdit
}: {
    event: EventItem;
    index: number;
    canEdit: boolean;
    onEdit: () => void;
}) {
    return (
        <div
            className="bg-white border border-[#6F2B75]/15 rounded-organic-sm p-7 flex flex-col h-full shadow-phoenix-colored hover:shadow-phoenix-colored-lg hover:-translate-y-2 transition-all duration-300 group relative will-change-transform"
        >
            {/* Image Container with strict 16:9 fixed aspect ratio */}
            <div className={`relative aspect-video w-full rounded-organic-sm overflow-hidden mb-6 shadow-soft flex items-center justify-center ${
                event.id === 'entretiens-excellence' ? 'bg-white p-5' : 'bg-slate-900'
            }`}>
                <img
                    src={event.image}
                    alt={`Événement jeunesse et égalité des chances à Marseille : ${event.title} – Phœnix EDC`}
                    loading={index < 3 ? "eager" : "lazy"}
                    decoding="async"
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
                <div className="absolute top-3.5 right-3.5 bg-white/95 backdrop-blur-xs px-3 py-1 rounded text-xs font-school font-bold text-[#2A082D] shadow-soft flex items-center gap-1.5">
                    <Calendar size={13} className="text-[#EC602B]" />
                    <span>{event.date}</span>
                </div>

                {/* Event Category Badge */}
                {event.badge && (
                    <div className="absolute top-3.5 left-3.5 bg-[#6F2B75] text-white px-2.5 py-1 rounded text-[10px] font-school font-bold uppercase tracking-wider shadow-soft">
                        {event.badge}
                    </div>
                )}

                {/* Bureau Edit Button on Image */}
                {canEdit && (
                    <button
                        type="button"
                        onClick={onEdit}
                        title="Modifier cet événement"
                        className="absolute bottom-3.5 right-3.5 bg-[#EC602B] hover:bg-[#d54e1b] text-white px-3 py-1 rounded-full text-xs font-school font-bold uppercase tracking-wider shadow-soft transition-all flex items-center gap-1.5 z-20 cursor-pointer"
                    >
                        <Edit3 size={12} />
                        <span>Modifier</span>
                    </button>
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

                <div className="w-full flex items-center justify-center gap-3 mt-auto">
                    <Link
                        to={`/evenements/${event.id}`}
                        className="btn-phoenix-orange btn-glow-orange w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-white font-school font-bold text-xs shadow-soft transition-all touch-tactile"
                    >
                        <span>En savoir plus</span>
                        <ArrowRight size={15} />
                    </Link>

                    {canEdit && (
                        <button
                            type="button"
                            onClick={onEdit}
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-[#EC602B] text-[#EC602B] hover:bg-[#EC602B] hover:text-white font-school font-bold text-xs transition-all cursor-pointer"
                        >
                            <Edit3 size={13} />
                            <span>Éditer</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

