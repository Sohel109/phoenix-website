import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const PAGE_TITLES: Record<string, string> = {
    '/': 'Phoenix Égalité des Chances | Accueil',
    '/projets': 'Nos Projets de Tutorat | Phoenix',
    '/carte-des-projets': 'Carte des Projets | Phoenix',
    '/evenements': 'Nos Événements | Phoenix',
    '/partenaires': 'Nos Partenaires | Phoenix',
    '/documents': 'Documents & Fiches | Phoenix',
    '/mentions-legales': 'Mentions Légales | Phoenix',
    '/transparence': 'Transparence & Rapports | Phoenix',
    '/contact': 'Contact & Recrutement | Phoenix',
    '/planning': 'Tableau de bord | Phoenix Planning',
    '/planning/login': 'Connexion | Phoenix Planning',
    '/planning/disponibilites': 'Mes Disponibilités | Phoenix Planning',
    '/planning/horaire': 'Mon Horaire | Phoenix Planning',
    '/planning/compte': 'Mon Compte | Phoenix Planning',
    '/planning/validation': 'Validation Présences | Phoenix Planning',
    '/planning/recap': 'Récapitulatif des Heures | Phoenix Planning',
    '/planning/events': 'Validation Événements | Phoenix Planning',
    '/planning/mes-evenements': 'Mes Événements | Phoenix Planning',
    '/planning/notifications': 'Notifications | Phoenix Planning',
};

export function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (PAGE_TITLES[pathname]) {
            document.title = PAGE_TITLES[pathname];
        } else if (pathname.startsWith('/projets/')) {
            document.title = 'Détail du Projet | Phoenix';
        } else if (pathname.startsWith('/evenements/')) {
            document.title = 'Détail de l’Événement | Phoenix';
        }
    }, [pathname]);

    return null;
}
