import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calendar, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { events } from '../data/events';
import { useState, useEffect } from 'react';

export function EventDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const event = events.find(e => e.id === id);
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

    return (
        <div className="min-h-screen bg-transparent pt-24 pb-20 transition-colors duration-300">
            {/* Background Elements */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-50 dark:opacity-30">
                <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-secondary/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-primary/10 rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <Link to="/evenements" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors group">
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    Retour aux événements
                </Link>

                <div className="bg-white dark:bg-current-card rounded-[2rem] shadow-xl dark:shadow-none overflow-hidden border border-gray-100 dark:border-white/5 mt-8">
                    {/* Header Image */}
                    <div className="relative h-64 md:h-96 w-full">
                        <img
                            src={event.headerImage || event.image}
                            alt={event.title}
                            className={`w-full h-full object-cover ${event.id === 'jedc' ? 'object-top' : ''}`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                        <div className="absolute bottom-0 left-0 p-8 text-white">
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-sm font-semibold mb-4`}>
                                <Calendar size={16} />
                                {event.date}
                            </div>
                            <h1 className="text-3xl md:text-5xl font-bold">{event.title}</h1>
                        </div>
                    </div>

                    <div className="p-8 md:p-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="prose prose-lg max-w-none text-gray-600 dark:text-gray-300">
                                {event.fullDescription ? (
                                    event.fullDescription.split('\n').map((paragraph, idx) => (
                                        <p key={idx} className="mb-4 leading-relaxed">
                                            {paragraph}
                                        </p>
                                    ))
                                ) : (
                                    <p>{event.description}</p>
                                )}
                            </div>

                            {/* External Links / Editions */}
                            {event.externalLinks && (
                                <div className="mt-8 border-t border-gray-100 dark:border-gray-800 pt-8">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Éditions précédentes</h3>
                                    <div className="flex flex-wrap gap-4">
                                        {event.externalLinks.map((link, idx) => (
                                            <a
                                                key={idx}
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-3 px-6 py-3 bg-gray-50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 hover:border-primary/50 rounded-xl text-gray-700 dark:text-gray-200 hover:text-primary transition-all shadow-sm hover:shadow-md group h-auto"
                                            >
                                                {/* @ts-ignore */}
                                                {(link as any).logo && (
                                                    <img
                                                        /* @ts-ignore */
                                                        src={(link as any).logo}
                                                        alt="Logo"
                                                        className="h-6 w-auto object-contain"
                                                    />
                                                )}
                                                <span className="font-medium">{link.label}</span>
                                                <ExternalLink size={16} className="text-gray-400 group-hover:text-primary transition-colors shrink-0" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar / Gallery */}
                        <div className="lg:col-span-1 space-y-8">
                            {event.gallery && event.gallery.length > 0 && (
                                <div className="bg-gray-50 dark:bg-current-bg/50 rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Galerie Photos</h3>
                                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden group">
                                        <AnimatePresence mode="wait">
                                            <motion.img
                                                key={currentImageIndex}
                                                src={event.gallery[currentImageIndex]}
                                                alt={`Gallery image ${currentImageIndex + 1}`}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.5 }}
                                                className="absolute inset-0 w-full h-full object-contain bg-white dark:bg-black"
                                            />
                                        </AnimatePresence>

                                        {event.gallery.length > 1 && (
                                            <>
                                                <button
                                                    onClick={prevImage}
                                                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity text-gray-800"
                                                >
                                                    <ChevronLeft size={20} />
                                                </button>
                                                <button
                                                    onClick={nextImage}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity text-gray-800"
                                                >
                                                    <ChevronRight size={20} />
                                                </button>

                                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                                    {event.gallery.map((_, idx) => (
                                                        <button
                                                            key={idx}
                                                            onClick={() => setCurrentImageIndex(idx)}
                                                            className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-primary w-4' : 'bg-gray-300'
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
        </div>
    );
}
