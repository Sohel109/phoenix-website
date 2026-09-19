export interface Project {
    id: number;
    slug: string;
    name: string;
    fullName: string;
    type: 'soutien' | 'culture' | 'hybride';
    address: string;
    coordinates: [number, number]; // [latitude, longitude]
    chefs: string[];
    description: string;
}

export const projectsData: Project[] = [
    {
        id: 2,
        slug: "acse",
        name: "ACSE",
        fullName: "A Chacun Son Excellence",
        type: 'culture',
        address: "Domaine de Luminy, Rue Antoine Bourdelle, 13009 Marseille",
        coordinates: [43.2307, 5.4380],
        chefs: ["Elyas BOURHIS", "Ryadh ABDELMALEK"],
        description: "PROJET CULTURE & ORIENTATION. Tutorat culturel et aide à l'orientation pour lycéens. Samedi après-midi à Kedge."
    },
    {
        id: 5,
        slug: "apprentis-d-auteuil",
        name: "Apprentis d'Auteuil",
        fullName: "Projet Apprentis d'Auteuil",
        type: 'culture',
        address: "5 Rue Antoine Pons, 13004 Marseille",
        coordinates: [43.3059, 5.4055],
        chefs: ["Damya AKILI", "Amani ZAMIT"],
        description: "PROJET 100% OUVERTURE CULTURELLE. Séances sur thèmes d'actualité les mardis et jeudis après-midi."
    },
    {
        id: 8,
        slug: "arthur-rimbaud",
        name: "Arthur Rimbaud",
        fullName: "Projet Arthur Rimbaud",
        type: 'hybride',
        address: "19 Trav. Santi, 13015 Marseille",
        coordinates: [43.3447, 5.3535],
        chefs: ["Haïtam BEBBI"],
        description: "PROJET HYBRIDE. Mélange d'ouverture culturelle et d'aide aux devoirs les jeudis."
    },
    {
        id: 6,
        slug: "izzo",
        name: "Collège Izzo",
        fullName: "Collège Izzo",
        type: 'hybride',
        address: "2 Rue d'Hozier, 13002 Marseille",
        coordinates: [43.3018, 5.3687],
        chefs: ["Ryan BENYELLES", "Donia TNANI"],
        description: "PROJET HYBRIDE. Présentations culturelles ludiques et approfondies suivies d'échanges autour d'un goûter."
    },
    {
        id: 7,
        slug: "jules-ferry",
        name: "Jules Ferry",
        fullName: "Projet Jules Ferry",
        type: 'hybride',
        address: "2 Bd Ledru Rollin, 13015 Marseille",
        coordinates: [43.3580, 5.3620],
        chefs: ["Nelly RANDRIAMIHAJA"],
        description: "PROJET HYBRIDE. Mélange de soutien scolaire et d'ouverture culturelle, les mercredis après-midi."
    },
    {
        id: 3,
        slug: "massa-13",
        name: "MASSA 13",
        fullName: "MASSA 13",
        type: 'hybride',
        address: "129 Chem. du Merlan À la Rose, 13013 Marseille",
        coordinates: [43.3469, 5.4231],
        chefs: ["Position vacante"],
        description: "PROJET HYBRIDE. Séance du mercredi soir : aide aux devoirs suivie d'ouverture culturelle."
    },
    {
        id: 9,
        slug: "roy-despagne",
        name: "Roy d'Espagne",
        fullName: "Projet Roy d'Espagne",
        type: 'hybride',
        address: "36 Chem. du Roy d'Espagne, 13009 Marseille",
        coordinates: [43.2498, 5.4118],
        chefs: ["Lina EL KEDDAH"],
        description: "PROJET HYBRIDE. Alterne entre aide aux devoirs individuelle et ouverture culturelle collective le jeudi après-midi."
    },
    {
        id: 4,
        slug: "saint-gabriel",
        name: "St Gabriel",
        fullName: "Projet St Gabriel",
        type: 'hybride',
        address: "12 Rue Richard, 13014 Marseille",
        coordinates: [43.3318, 5.3899],
        chefs: ["Abdollah JOUNOUDI", "Cannelle JUVENTIN"],
        description: "PROJET HYBRIDE. Soutien scolaire 4 soirs par semaine (lundi, mardi, jeudi, vendredi) avec débats réguliers."
    },
    {
        id: 1,
        slug: "sup-d-om",
        name: "Sup d'OM",
        fullName: "Sup d'OM (Droit au Bac)",
        type: 'soutien',
        address: "33 Trav. de la Martine, 13012 Marseille",
        coordinates: [43.3057, 5.4442],
        chefs: ["Samy RABHI", "Eve SAMA"],
        description: "PROJET SPORT & ÉTUDES. Accompagnement scolaire des jeunes de l'OM les mardis, mercredis, jeudis et samedis."
    }
];

export const projectTypeColors = {
    soutien: '#EC602B',    // Orange Braise Charte
    culture: '#6F2B75',    // Violet Phœnix Charte
    hybride: '#904990'     // Violet Phœnix Clair Charte
};

export const projectTypeLabels = {
    soutien: '100% Soutien Scolaire',
    culture: '100% Ouverture Culturelle',
    hybride: 'Hybride'
};
