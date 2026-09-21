import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calendar, ExternalLink, ChevronLeft, ChevronRight, Edit3 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { SEO } from '../components/common/SEO';
import { useEvents } from '../hooks/useEvents';
import { usePlanning } from '../context/PlanningContext';
import { EditEventModal } from '../components/common/EditEventModal';

export function EventDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { events, updateEvent } = useEvents();
    const { currentUser, isEditModeActive } = usePlanning();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const event = events.find(e => e.id === id);
    const canEdit = currentUser?.role === 'bureau' && isEditModeActive;
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        if (!event) {
            navigate('/evenements');
        }
    }, [event, navigate]);

    // Timer resets every time currentImageIndex changes (auto or manual)
    useEffect(() => {
        if (!event?.gallery || event.gallery.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % event.gallery!.length);
        }, 5000);

        return () => clearInterval(timer);
    }, [event, currentImageIndex]);

    if (!event) return null;

    const nextImage = () => {
        if (event.gallery) {
            setCurrentImageIndex((prev) => (prev + 1) % event.gallery!.length);
        }
    };

    const prevImage = () => {
        if (event.gallery) {
            setCurrentImageIndex((prev) => (prev === 0 ? event.gallery!.length - 1 : prev - 1));
        }
    };

    const eventSchema = [
        {
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
                },
                {
                    "@type": "ListItem",
                    "position": 3,
                    "name": event.title,
                    "item": `https://www.phoenix-egalite-des-chances.com/evenements/${event.id}`
                }
            ]
        },
        {
            "@context": "https://schema.org",
            "@type": "Event",
            "name": event.title,
            "description": event.description,
            "image": event.headerImage || event.image,
            "organizer": {
                "@type": "NonProfitOrganization",
                "name": "Phœnix Égalité des Chances",
                "url": "https://www.phoenix-egalite-des-chances.com"
            },
            "location": {
                "@type": "Place",
                "name": "KEDGE Business School Marseille",
                "address": {
                    "@type": "PostalAddress",
                    "streetAddress": "Domaine de Luminy",
                    "addressLocality": "Marseille",
                    "postalCode": "13009",
                    "addressCountry": "FR"
                }
            }
        }
    ];

    return (
        <div className="min-h-screen bg-[#FFFBF4] bg-bird-pattern pt-page-safe pb-20">
            <SEO
                title={`${event.title} – Événement & Éloquence – Marseille / KEDGE BS`}
                description={`${event.description.slice(0, 140)}... Événement organisé par l'association Phœnix EDC à Marseille.`}
                ogImage={event.headerImage || event.image}
                schema={eventSchema}
            />
            {/* Background Elements */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-50 dark:opacity-30">
                <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-secondary/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-primary/10 rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto px-4 relative z-10 max-w-6xl">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <Link to="/evenements" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-phoenix-lilac/60 text-phoenix-dark font-school text-xs tracking-wider uppercase hover:text-phoenix-purple hover:border-phoenix-purple transition-all shadow-xs group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Retour aux événements</span>
                    </Link>

                    {canEdit && (
                        <button
                            type="button"
                            onClick={() => setIsEditModalOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#EC602B] hover:bg-[#d54e1b] text-white font-school text-xs tracking-wider uppercase transition-all shadow-soft cursor-pointer"
                        >
                            <Edit3 size={15} />
                            <span>Modifier cet événement</span>
                        </button>
                    )}
                </div>

                <div className="bg-white rounded-organic shadow-phoenix-colored overflow-hidden border border-[#6F2B75]/15 mt-6">
                    {/* Header Image */}
                    <div className={`relative h-64 md:h-[420px] w-full ${event.id === 'entretiens-excellence' ? 'bg-white' : 'bg-phoenix-dark'}`}>
                        <img
                            src={event.headerImage || event.image}
                            alt={`Affiche officielle de l'événement ${event.title} – Phœnix Égalité des Chances Marseille`}
                            className={`w-full h-full ${
                                event.id === 'entretiens-excellence'
                                    ? 'object-contain p-6 md:p-12 max-h-[90%]'
                                    : event.id === 'jedc'
                                    ? 'object-cover object-top'
                                    : 'object-cover'
                            }`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-phoenix-dark/90 via-phoenix-dark/40 to-transparent pointer-events-none" />
                        <div className="absolute bottom-0 left-0 p-8 md:p-12 text-white">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-phoenix-purple/90 backdrop-blur-md border border-white/20 text-xs font-school uppercase tracking-wider mb-4">
                                <Calendar size={14} className="text-phoenix-orange-light" />
                                <span>{event.date}</span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-display leading-tight">{event.title}</h1>
                        </div>
                    </div>

                    <div className="p-8 md:p-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="prose prose-lg max-w-none text-slate-700 leading-relaxed font-sans">
                                {event.fullDescription ? (
                                    event.fullDescription.split('\n').map((paragraph, idx) => (
                                        <p key={idx} className="mb-4">
                                            {paragraph}
                                        </p>
                                    ))
                                ) : (
                                    <p>{event.description}</p>
                                )}
                            </div>

                            {/* External Links / Editions */}
                            {event.externalLinks && (
                                <div className="mt-8 border-t border-phoenix-lilac/30 pt-8">
                                    <h3 className="text-xl font-school uppercase tracking-wide text-phoenix-dark mb-6">Éditions précédentes</h3>
                                    <div className="flex flex-wrap gap-4">
                                        {event.externalLinks.map((link, idx) => (
                                            <a
                                                key={idx}
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-3 px-6 py-3 bg-phoenix-cream/80 hover:bg-white border border-phoenix-lilac/60 hover:border-phoenix-purple rounded-full text-phoenix-dark hover:text-phoenix-purple font-school text-xs uppercase tracking-wider transition-all shadow-xs hover:shadow-md group h-auto"
                                            >
                                                {/* @ts-ignore */}
                                                {(link as any).logo && (
                                                    <img
                                                        /* @ts-ignore */
                                                        src={(link as any).logo}
                                                        alt={`Logo partenaire ${link.label}`}
                                                        className="h-5 w-auto object-contain"
                                                    />
                                                )}
                                                <span>{link.label}</span>
                                                <ExternalLink size={14} className="text-phoenix-purple/70 group-hover:text-phoenix-purple transition-colors shrink-0" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar / Gallery */}
                        <div className="lg:col-span-1 space-y-8">
                            {event.gallery && event.gallery.length > 0 && (
                                <div className="bg-phoenix-cream/60 rounded-3xl p-6 border border-phoenix-lilac/40">
                                    <h3 className="text-lg font-school uppercase tracking-wide text-phoenix-dark mb-4">Galerie Photos</h3>
                                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden group shadow-inner">
                                        <AnimatePresence mode="wait" initial={false}>
                                            <motion.img
                                                key={currentImageIndex}
                                                src={event.gallery[currentImageIndex]}
                                                alt={`Galerie de l'événement ${event.title} - photo ${currentImageIndex + 1}`}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.5 }}
                                                className="absolute inset-0 w-full h-full object-contain bg-white"
                                            />
                                        </AnimatePresence>

                                        {event.gallery.length > 1 && (
                                            <>
                                                <button
                                                    onClick={prevImage}
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-white/90 hover:bg-white rounded-full shadow-md text-phoenix-dark transition-all cursor-pointer"
                                                >
                                                    <ChevronLeft size={18} />
                                                </button>
                                                <button
                                                    onClick={nextImage}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-white/90 hover:bg-white rounded-full shadow-md text-phoenix-dark transition-all cursor-pointer"
                                                >
                                                    <ChevronRight size={18} />
                                                </button>

                                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 px-3 py-1 bg-black/40 backdrop-blur-sm rounded-full">
                                                    {event.gallery.map((_, idx) => (
                                                        <button
                                                             key={idx}
                                                             onClick={() => setCurrentImageIndex(idx)}
                                                             className={`h-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-phoenix-orange w-5' : 'bg-white/70 w-2'
                                                                 }`}
                                                        />
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bureau Edit Modal */}
            <EditEventModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                event={event}
                onSave={async (updated) => {
                    await updateEvent(updated);
                }}
            />
        </div>
    );
}
