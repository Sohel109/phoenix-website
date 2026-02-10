export interface Project {
    id: number;
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
        id: 1,
        name: "Sup d'OM",
        fullName: "Sup d'OM (Droit au Bac)",
        type: 'soutien',
        address: "33 Trav. de la Martine, 13012 Marseille",
        coordinates: [43.3057, 5.4442],
        chefs: ["Lise Dehedin", "Ilyes Lounane"],
        description: "PROJET 100% SOUTIEN SCOLAIRE. Le seul projet uniquement dédié à l'aide aux devoirs. Séances les mardis et jeudis soir à la Commanderie."
    },
    {
        id: 2,
        name: "ACSE",
        fullName: "A Chacun Son Excellence",
        type: 'culture',
        address: "Domaine de Luminy, Rue Antoine Bourdelle, 13009 Marseille",
        coordinates: [43.2307, 5.4380],
        chefs: ["Farah Dali", "Oumaima Mghalfi"],
        description: "PROJET CULTURE & ORIENTATION. Tutorat culturel et aide à l'orientation pour lycéens. Samedi après-midi à Kedge."
    },
    {
        id: 3,
        name: "MASSA 13",
        fullName: "MASSA 13",
        type: 'hybride',
        address: "129 Chem. du Merlan À la Rose, 13013 Marseille",
        coordinates: [43.3469, 5.4231],
        chefs: ["Fabien Boles Franso", "Idriss Bahou"],
        description: "PROJET HYBRIDE. Séance du jeudi soir : aide aux devoirs suivie d'ouverture culturelle."
    },
    {
        id: 4,
        name: "St Gabriel",
        fullName: "Projet St Gabriel",
        type: 'hybride',
        address: "12 Rue Richard, 13014 Marseille",
        coordinates: [43.3318, 5.3899],
        chefs: ["Tessa Valente", "Eline Far"],
        description: "PROJET HYBRIDE. Soutien scolaire avec développement de l'esprit critique via des débats."
    },
    {
        id: 5,
        name: "Apprentis d'Auteuil",
        fullName: "Projet Apprentis d'Auteuil",
        type: 'culture',
        address: "5 Rue Antoine Pons, 13004 Marseille",
        coordinates: [43.3059, 5.4055],
        chefs: ["Clara Boudeville"],
        description: "PROJET 100% OUVERTURE CULTURELLE. Séances sur thèmes d'actualité les lundis et vendredis."
    },
    {
        id: 6,
        name: "Collège Izzo",
        fullName: "Collège Izzo",
        type: 'hybride',
        address: "2 Rue d'Hozier, 13002 Marseille",
        coordinates: [43.3018, 5.3687],
        chefs: ["Adel Bia", "Elsa Ald"],
        description: "PROJET HYBRIDE. Présentations culturelles ludiques et approfondies suivies d'échanges autour d'un goûter."
    },
    {
        id: 7,
        name: "Jules Ferry",
        fullName: "Projet Jules Ferry",
        type: 'hybride',
        address: "2 Bd Ledru Rollin, 13015 Marseille",
        coordinates: [43.3580, 5.3620],
        chefs: ["Lou-Ann Lapointe", "Nadège Bavugilije", "Chelsea Afonso de Barros"],
        description: "PROJET HYBRIDE. Mélange de soutien scolaire et d'ouverture culturelle, 2 mercredis par mois."
    },
    {
        id: 8,
        name: "Arthur Rimbaud",
        fullName: "Projet Arthur Rimbaud",
        type: 'hybride',
        address: "19 Trav. Santi, 13015 Marseille",
        coordinates: [43.3447, 5.3535],
        chefs: ["Salwa Guernina"],
        description: "PROJET HYBRIDE. Mélange d'ouverture culturelle et d'aide aux devoirs les jeudis."
    },
    {
        id: 9,
        name: "Roy d'Espagne",
        fullName: "Projet Roy d'Espagne",
        type: 'hybride',
        address: "36 Chem. du Roy d'Espagne, 13009 Marseille",
        coordinates: [43.2498, 5.4118],
        chefs: ["Nadir Stiti"],
        description: "PROJET HYBRIDE. Alterne entre aide aux devoirs individuelle et ouverture culturelle collective le jeudi après-midi."
    }
];

export const projectTypeColors = {
    soutien: '#FF6B00',    // Orange Phoenix
    culture: '#7C3AED',    // Violet Phoenix
    hybride: '#EC4899'     // Rose (mélange)
};

export const projectTypeLabels = {
    soutien: '100% Soutien Scolaire',
    culture: '100% Ouverture Culturelle',
    hybride: 'Hybride'
};
