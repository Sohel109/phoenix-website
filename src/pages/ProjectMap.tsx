import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import { Icon, type LatLngExpression } from 'leaflet';
import { motion } from 'framer-motion';
import { MapPin, Users, ArrowLeft } from 'lucide-react';
import { projectsData, projectTypeColors, projectTypeLabels } from '../data/projectsData';
import { useNavigate } from 'react-router-dom';
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

export function ProjectMap() {
    const navigate = useNavigate();
    const marseilleCenter: LatLngExpression = [43.2965, 5.3698]; // Centre de Marseille

    useEffect(() => {
        // Force map to recalculate size on mount
        window.dispatchEvent(new Event('resize'));
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0A0118] via-[#1A103C] to-[#0A0118] pt-20 pb-12">
            <div className="container mx-auto px-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-4 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Retour
                    </button>

                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-gradient-to-br from-orange-500 to-purple-600 rounded-2xl">
                            <MapPin className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-white">Carte des Projets</h1>
                            <p className="text-gray-400 mt-1">Découvrez nos 9 projets à travers Marseille</p>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: projectTypeColors.soutien }} />
                            <span className="text-sm text-gray-300">{projectTypeLabels.soutien}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: projectTypeColors.culture }} />
                            <span className="text-sm text-gray-300">{projectTypeLabels.culture}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: projectTypeColors.hybride }} />
                            <span className="text-sm text-gray-300">{projectTypeLabels.hybride}</span>
                        </div>
                    </div>
                </motion.div>

                {/* Map */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
                    style={{ height: '600px' }}
                >
                    <MapContainer
                        center={marseilleCenter}
                        zoom={12}
                        style={{ height: '100%', width: '100%' }}
                        scrollWheelZoom={true}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {projectsData.map((project) => (
                            <Marker
                                key={project.id}
                                position={project.coordinates}
                            >
                                <Tooltip direction="top" offset={[0, -20]} opacity={0.9}>
                                    <div className="font-semibold">{project.fullName}</div>
                                </Tooltip>

                                <Popup>
                                    <div className="p-2 min-w-[250px]">
                                        <h3 className="text-lg font-bold mb-2 text-gray-900">
                                            {project.fullName}
                                        </h3>

                                        <div className="flex items-center gap-2 mb-3">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: projectTypeColors[project.type] }}
                                            />
                                            <span className="text-sm font-medium text-gray-700">
                                                {projectTypeLabels[project.type]}
                                            </span>
                                        </div>

                                        <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                                            {project.description}
                                        </p>

                                        <div className="flex items-start gap-2 mb-2">
                                            <MapPin size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
                                            <p className="text-xs text-gray-500">{project.address}</p>
                                        </div>

                                        <div className="flex items-start gap-2">
                                            <Users size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
                                            <div className="text-xs text-gray-500">
                                                <span className="font-medium">Chefs de projet :</span>
                                                <br />
                                                {project.chefs.join(', ')}
                                            </div>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                    <div className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                        <div className="text-3xl font-bold text-orange-500 mb-1">9</div>
                        <div className="text-sm text-gray-400">Projets actifs</div>
                    </div>
                    <div className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                        <div className="text-3xl font-bold text-purple-500 mb-1">~300</div>
                        <div className="text-sm text-gray-400">Jeunes accompagnés/an</div>
                    </div>
                    <div className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                        <div className="text-3xl font-bold text-pink-500 mb-1">~140</div>
                        <div className="text-sm text-gray-400">Bénévoles Kedge</div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
