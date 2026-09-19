import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon, type LatLngExpression } from 'leaflet';
import { MapPin, Users, ArrowLeft, Navigation, ArrowUpRight } from 'lucide-react';
import { projectsData, projectTypeColors, projectTypeLabels } from '../data/projectsData';
import { useNavigate, Link } from 'react-router-dom';
import { SEO } from '../components/common/SEO';
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

    // Create custom minimalist marker icons
    const createCustomIcon = (color: string) => {
        const svgIcon = `
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="12" fill="${color}" opacity="0.95"/>
                <circle cx="16" cy="16" r="8" fill="white" opacity="0.35"/>
                <circle cx="16" cy="16" r="5" fill="white"/>
            </svg>
        `;

        return new Icon({
            iconUrl: `data:image/svg+xml;base64,${btoa(svgIcon)}`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            popupAnchor: [0, -16],
        });
    };

    return (
        <div className="min-h-screen bg-[#FFFBF4] bg-bird-pattern pt-page-safe pb-24">
            <SEO
                title="Carte des Collèges & Lycées Partenaires – Tutorat Scolaire à Marseille – Phœnix EDC"
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
                                <h1 className="text-3xl sm:text-5xl font-display text-phoenix-dark tracking-tight">Carte des Projets</h1>
                                <p className="font-script text-2xl text-[#2A082D]">9 projets ancrés dans Marseille</p>
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
                <div
                    className="rounded-xl overflow-hidden border border-phoenix-lilac/50 shadow-xl"
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
                                    <div className="p-3 max-w-xs font-sans">
                                        <h3 className="font-school font-bold text-lg text-phoenix-dark mb-1">
                                            {project.name}
                                        </h3>

                                        <div className="flex items-center gap-2 mb-3">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: projectTypeColors[project.type] }}
                                            />
                                            <span className="text-xs font-school uppercase tracking-wide text-slate-600">
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
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>

                {/* Stats */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="p-6 bg-white rounded-xl border border-phoenix-lilac/50 shadow-sm text-center">
                        <div className="text-4xl font-display text-phoenix-purple mb-1">9</div>
                        <div className="text-xs font-school uppercase tracking-wider text-slate-600">Projets actifs à Marseille</div>
                    </div>
                    <div className="p-6 bg-white rounded-xl border border-phoenix-lilac/50 shadow-sm text-center">
                        <div className="text-4xl font-display text-phoenix-orange mb-1">~300</div>
                        <div className="text-xs font-school uppercase tracking-wider text-slate-600">Jeunes accompagnés / an</div>
                    </div>
                    <div className="p-6 bg-white rounded-xl border border-phoenix-lilac/50 shadow-sm text-center">
                        <div className="text-4xl font-display text-phoenix-purple-light mb-1">+100</div>
                        <div className="text-xs font-school uppercase tracking-wider text-slate-600">Bénévoles Kedge mobilisés</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
