import { GraduationCap, Users, School, BookOpen, PenTool, Home } from 'lucide-react';

export interface ProjectItem {
    id: string;
    title: string;
    category: string;
    type: string;
    description: string;
    icon: any;
    image: string;
    banner: string;
    bannerFit?: string;
}

export const projects: ProjectItem[] = [
    {
        id: 'acse',
        title: 'A Chacun Son Excellence',
        category: 'Lycée',
        type: 'Culture & Orientation',
        description: "Projet Cordée de la réussite, ACSE accompagne tous les samedis des jeunes de la seconde à la terminale via des séances d'ouverture culturelle et l'aide à l'orientation.",
        icon: School,
        image: '/images/projects/acse-logo.png',
        banner: '/images/banners/acse-banner-v2.jpg'
    },
    {
        id: 'apprentis-d-auteuil',
        title: "Apprentis d'Auteuil",
        category: 'Collège',
        type: 'Ouverture Culturelle',
        description: "En partenariat avec la Fondation Apprentis d'Auteuil, AA intervient au collège Vitagliano auprès d'élèves de la 6ème à la 3ème via des séances d'ouverture culturelle.",
        icon: Users,
        image: '/images/projects/apprentis-auteuil.png',
        banner: '/images/banners/apprentis-auteuil-banner-new.jpg'
    },
    {
        id: 'arthur-rimbaud',
        title: 'Arthur Rimbaud',
        category: 'Collège',
        type: 'Cordée de la Réussite',
        description: "Projet cordée de la réussite, Rimbaud intervient dans le collège du même nom auprès d'élèves de 3ème pour faire des séances d'ouverture culturelle.",
        icon: BookOpen,
        image: '/images/projects/arthur-rimbaud-logo.png',
        banner: '/images/banners/arthur-rimbaud-banner-new.png'
    },
    {
        id: 'izzo',
        title: 'Collège Izzo',
        category: 'Collège',
        type: 'Cordée de la Réussite',
        description: "Projet cordée de la réussite, Izzo intervient au collège du même nom auprès de la classe de 3ème européenne pour faire des séances d'ouverture culturelle.",
        icon: GraduationCap,
        image: '/images/projects/izzo-logo.png',
        banner: '/images/banners/izzo-banner-new.jpg'
    },
    {
        id: 'jules-ferry',
        title: 'Jules Ferry',
        category: 'Collège',
        type: 'Soft Skills & Orientation',
        description: "Projet cordée de la réussite, Jules Ferry aide des 3ème du collège Jules Ferry à acquérir des soft skills puis les suit dans leur poursuite d'étude.",
        icon: PenTool,
        image: '/images/projects/jules-ferry-logo.png',
        banner: '/images/banners/jules-ferry-banner-new.jpg'
    },
    {
        id: 'massa-13',
        title: 'Massa 13',
        category: 'Association',
        type: 'Aide aux Devoirs',
        description: "En collaboration avec l'association Massabielle, Massa 13 fait de l'aide aux devoirs pour des élèves volontaires de troisième.",
        icon: BookOpen,
        image: '/images/projects/massa-13-logo.png',
        banner: '/images/banners/massa-13-banner-new.jpg'
    },
    {
        id: 'roy-despagne',
        title: "Roy d'Espagne",
        category: 'Collège',
        type: 'Cordée de la Réussite',
        description: "Projet cordée de la réussite, Roy d'Espagne intervient au collège du même nom pour faire des séances d'ouverture culturelle.",
        icon: Users,
        image: '/images/projects/roy-despagne-logo.png',
        banner: '/images/banners/roy-despagne-banner-new.png'
    },
    {
        id: 'saint-gabriel',
        title: 'Saint Gabriel',
        category: 'Centre Social',
        type: 'Tutorat 6e à Terminale',
        description: "En partenariat avec le centre social Saint Gabriel, on fait de l'aide aux devoirs pour des élèves de la 6ème à la terminale.",
        icon: Home,
        image: '/images/projects/saint-gabriel-logo.png',
        banner: '/images/banners/saint-gabriel-new.jpeg'
    },
    {
        id: 'sup-d-om',
        title: "Sup d'OM",
        category: 'Phoenix x OM',
        type: 'Sport & Études',
        description: "En partenariat avec le centre de formation de l'Olympique de Marseille, Sup d'OM fait de l'aide aux devoirs auprès des sections masculines et féminines.",
        icon: School,
        image: '/images/projects/sup-d-om-logo.png',
        banner: '/images/banners/sup-d-om-banner-new.jpg',
        bannerFit: 'contain'
    }
];
