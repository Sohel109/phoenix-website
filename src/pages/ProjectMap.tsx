import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon, type LatLngExpression } from 'leaflet';
import { MapPin, Users, ArrowLeft, Navigation, ArrowUpRight } from 'lucide-react';
import { projectsData, projectTypeColors, projectTypeLabels } from '../data/projectsData';
import { useNavigate, Link } from 'react-router-dom';
import { SEO } from '../components/common/SEO';
import { MaskingTape } from '../components/common/HandDrawnElements';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in production
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

const mapBreadcrumbSchema = {
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
            "name": "Carte des Projets",
            "item": "https://www.phoenix-egalite-des-chances.com/carte-des-projets"
        }
    ]
};

export function ProjectMap() {
    const navigate = useNavigate();
    const marseilleCenter: LatLngExpression = [43.2965, 5.3698]; // Centre de Marseille

    useEffect(() => {
        // Force map to recalculate size on mount
        window.dispatchEvent(new Event('resize'));
    }, []);

    const getDirectionsUrl = (address: string) => {
        return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
    };

    // Pin façon "épingle plantée sur la carte" (esprit carnet de terrain), avec ombre portée
    const createCustomIcon = (color: string) => {
        const svgIcon = `
            <svg width="36" height="48" viewBox="0 0 36 48" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <filter id="pin-shadow" x="-60%" y="-20%" width="220%" height="180%">
                        <feDropShadow dx="0" dy="3" stdDeviation="2.2" flood-color="#2A082D" flood-opacity="0.38"/>
                    </filter>
                </defs>
                <path
                    filter="url(#pin-shadow)"
                    d="M18 2C9.72 2 3 8.72 3 17c0 11.5 15 27.5 15 27.5S33 28.5 33 17c0-8.28-6.72-15-15-15z"
                    fill="${color}"
                    stroke="#FFFBF4"
                    stroke-width="2.5"
                />
                <circle cx="18" cy="17" r="7" fill="#FFFBF4"/>
                <circle cx="18" cy="17" r="3.2" fill="${color}"/>
            </svg>
        `;

        return new Icon({
            iconUrl: `data:image/svg+xml;base64,${btoa(svgIcon)}`,
            iconSize: [36, 48],
            iconAnchor: [18, 46],
            popupAnchor: [0, -42],
        });
    };

    return (
        <div className="min-h-screen bg-[#FFFBF4] bg-bird-pattern pt-page-safe pb-24">
            <SEO
                title="Carte des Antennes – Collèges & Lycées Partenaires – Marseille / KEDGE BS"
                description="Explorez la carte interactive des 9 antennes de tutorat de Phœnix EDC réparties dans les collèges, lycées et quartiers prioritaires de Marseille."
                schema={mapBreadcrumbSchema}
            />
            <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-phoenix-lilac/70 text-xs font-school uppercase tracking-wider text-phoenix-dark hover:text-phoenix-purple transition-all shadow-xs group cursor-pointer"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Retour</span>
                    </button>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-lg bg-[#6F2B75] text-white flex items-center justify-center shadow-md shrink-0">
                                <MapPin className="w-7 h-7" />
                            </div>
                            <div>
                                <h1 className="text-3xl sm:text-5xl font-display text-phoenix-dark tracking-tight">
                                    Carte des{' '}
                                    <span className="marker-highlight text-[#EC602B]">
                                        <span>Projets</span>
                                    </span>
                                </h1>
                                <p className="font-script text-2xl text-[#6F2B75]">9 projets ancrés dans Marseille</p>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="flex flex-wrap items-center gap-4 p-3 px-5 bg-white rounded-lg border border-phoenix-lilac/50 shadow-sm self-start sm:self-auto">
                            <div className="flex items-center gap-2">
                                <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: projectTypeColors.soutien }} />
                                <span className="text-xs font-school uppercase tracking-wider text-slate-700">{projectTypeLabels.soutien}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: projectTypeColors.culture }} />
                                <span className="text-xs font-school uppercase tracking-wider text-slate-700">{projectTypeLabels.culture}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: projectTypeColors.hybride }} />
                                <span className="text-xs font-school uppercase tracking-wider text-slate-700">{projectTypeLabels.hybride}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Map */}
                <div className="relative pt-3">
                    <MaskingTape variant="lilac" angle="center" className="-top-0.5 left-1/2 -translate-x-1/2 z-[500]" />
                    <div
                        className="phoenix-map relative rounded-organic overflow-hidden border-2 border-white shadow-phoenix-colored-lg"
                        style={{ height: '600px' }}
                    >
                    <MapContainer
                        center={marseilleCenter}
                        zoom={12}
                        style={{ height: '100%', width: '100%' }}
                        scrollWheelZoom={true}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {projectsData.map((project) => (
                            <Marker
                                key={project.id}
                                position={project.coordinates}
                                icon={createCustomIcon(projectTypeColors[project.type])}
                            >
                                <Popup className="custom-popup">
                                    <div className="max-w-xs font-sans">
                                        {/* Bandeau coloré selon le type de projet */}
                                        <div className="h-1.5 w-full" style={{ backgroundColor: projectTypeColors[project.type] }} />

                                        <div className="p-4">
                                        <h3 className="font-display text-xl text-phoenix-dark mb-1.5 leading-tight">
                                            {project.name}
                                        </h3>

                                        <div className="inline-flex items-center gap-1.5 mb-3 px-2.5 py-1 rounded-full" style={{ backgroundColor: `${projectTypeColors[project.type]}18` }}>
                                            <div
                                                className="w-2 h-2 rounded-full shrink-0"
                                                style={{ backgroundColor: projectTypeColors[project.type] }}
                                            />
                                            <span className="text-[10px] font-school font-bold uppercase tracking-wide" style={{ color: projectTypeColors[project.type] }}>
                                                {projectTypeLabels[project.type]}
                                            </span>
                                        </div>

                                        <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                                            {project.description}
                                        </p>

                                        <div className="flex items-start gap-2 mb-2">
                                            <MapPin size={15} className="text-phoenix-orange mt-0.5 flex-shrink-0" />
                                            <p className="text-xs text-slate-600">{project.address}</p>
                                        </div>

                                        <div className="flex items-start gap-2 mb-3">
                                            <Users size={15} className="text-phoenix-purple mt-0.5 flex-shrink-0" />
                                            <div className="text-xs text-slate-600">
                                                <span className="font-school font-bold uppercase tracking-wider text-phoenix-dark text-[11px]">Chefs de projet :</span>
                                                <br />
                                                {project.chefs.join(' & ')}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col gap-2 mt-3 pt-2 border-t border-phoenix-lilac/30">
                                            <Link
                                                to={`/projets/${project.slug || project.id}`}
                                                className="flex items-center justify-center gap-1.5 w-full px-4 py-2.5 btn-phoenix-gradient text-white rounded-full transition-all font-school uppercase tracking-wider text-xs shadow-xs"
                                            >
                                                <span>Voir la fiche du projet</span>
                                                <ArrowUpRight size={14} />
                                            </Link>

                                            <a
                                                href={getDirectionsUrl(project.address)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-1.5 w-full px-4 py-2 bg-phoenix-cream/80 hover:bg-white text-phoenix-dark rounded-full transition-all font-school uppercase tracking-wider text-xs border border-phoenix-lilac/60"
                                            >
                                                <Navigation size={13} className="text-phoenix-purple" />
                                                <span>Itinéraire</span>
                                            </a>
                                        </div>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                    </div>
                </div>

                {/* Stats */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="p-6 bg-white rounded-organic-sm border border-[#6F2B75]/15 shadow-phoenix-colored hover:shadow-phoenix-colored-lg hover:-translate-y-1.5 transition-all duration-300 text-center will-change-transform">
                        <div className="text-4xl font-display text-phoenix-purple mb-1">9</div>
                        <div className="text-xs font-school uppercase tracking-wider text-slate-600 font-bold">Projets actifs à Marseille</div>
                    </div>
                    <div className="p-6 bg-white rounded-organic-sm border border-[#6F2B75]/15 shadow-phoenix-colored hover:shadow-phoenix-colored-lg hover:-translate-y-1.5 transition-all duration-300 text-center will-change-transform">
                        <div className="text-4xl font-display text-phoenix-orange mb-1">~300</div>
                        <div className="text-xs font-school uppercase tracking-wider text-slate-600 font-bold">Jeunes accompagnés / an</div>
                    </div>
                    <div className="p-6 bg-white rounded-organic-sm border border-[#6F2B75]/15 shadow-phoenix-colored hover:shadow-phoenix-colored-lg hover:-translate-y-1.5 transition-all duration-300 text-center will-change-transform">
                        <div className="text-4xl font-display text-phoenix-purple-light mb-1">+100</div>
                        <div className="text-xs font-school uppercase tracking-wider text-slate-600 font-bold">Bénévoles Kedge mobilisés</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
