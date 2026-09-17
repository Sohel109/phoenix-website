export interface EventItem {
    id: string;
    title: string;
    description: string;
    fullDescription: string;
    image: string;
    headerImage: string;
    gallery?: string[];
    externalLinks?: { label: string; url: string; logo?: string }[];
    date: string;
    monthOrder?: number;
    color: string;
    location?: string;
    badge?: string;
}

export const events: EventItem[] = [
    {
        id: "jedc",
        title: "Journée d'Égalité des Chances (JEDC)",
        description: "Inscrite dans la lignée de la Journée mondiale de l'égalité des chances du 5 décembre, cette journée réunit les jeunes à KEDGE : grand concours d'éloquence, conférences interactives et ateliers stimulants.",
        fullDescription: `La "Journée Égalité des Chances" (JEDC) est un événement symbolique et fondateur de Phoenix Égalité des Chances. Elle s’inscrit dans la lignée directe de la journée mondiale de l’égalité des chances célébrée chaque année le 5 décembre.\n\nOrganisée sur le campus de KEDGE Business School, la journée accueille les élèves de nos projets pour des conférences interactives animées par des intervenants inspirants, des ateliers de prise de parole et un grand concours d'éloquence.\n\nLes jeunes y débattent avec brio sur des sujets de société majeurs, à l'image du thème marquant : « L’égalité des chances en France : idéal ou réalité ? » ou « Quartiers prioritaires : enclaves d’inégalités ou viviers de talents méconnus ? ». Un tremplin exceptionnel pour développer leur confiance et leur force de conviction.`,
        image: "/images/events/jedc-new.png",
        headerImage: "/images/events/jedc-new.png",
        gallery: [
            "/images/home/jedc-discours.png",
            "/images/events/jedc/affiche_2024.png",
            "/images/events/jedc/programme_2024.png"
        ],
        externalLinks: [
            { label: "Edition 2015", url: "https://www.facebook.com/events/183620991972582/" },
            { label: "Edition 2016", url: "https://www.facebook.com/events/655061241322692/" },
            { label: "Edition 2017", url: "https://www.facebook.com/events/134953097140968/" }
        ],
        date: "5 Décembre",
        monthOrder: 12,
        color: "from-secondary/20 to-secondary/40",
        location: "Campus KEDGE Business School",
        badge: "Concours d'Éloquence"
    },
    {
        id: "entretiens-excellence",
        title: "Les Entretiens de l'Excellence",
        description: "Journée de mentorat et d'inspiration permettant aux collégiens et lycéens d'échanger directement avec des professionnels de divers secteurs pour briser l'autocensure.",
        fullDescription: `Chaque année en mars, Phoenix mobilise ses tuteurs et ses partenaires lors des Entretiens de l'Excellence.\n\nCet événement offre l'opportunité à nos jeunes de rencontrer des professionnels accomplis (cadres dirigeants, ingénieurs, juristes, entrepreneurs, médecins, artistes...) ayant souvent des parcours atypiques.\n\nAu travers d'ateliers thématiques en petits groupes, les jeunes posent leurs questions sans filtre, découvrent les réalités des métiers et comprennent que toutes les voies d'excellence leur sont accessibles. Une démarche clé pour élargir leurs ambitions et construire un projet d'orientation solide.`,
        image: "/images/events/entretiens-excellence.png",
        headerImage: "/images/events/entretiens-excellence.png",
        date: "Mars",
        monthOrder: 3,
        color: "from-purple-500/20 to-indigo-500/20",
        location: "KEDGE BS & Établissements Partenaires",
        badge: "Orientation & Mentorat"
    },
    {
        id: "simonu",
        title: "SimONU Égalité Des Chances",
        description: "Simulation d'Assemblée Générale de l'ONU en partenariat avec SimONU Marseille. Les lycéens deviennent diplomates et négocient des résolutions sur les Objectifs de Développement Durable (ODD).",
        fullDescription: `SimONU Égalité des Chances est un événement d'envergure co-organisé par Phœnix EDC et l'association SimONU de KEDGE BS depuis 2008.\n\nPendant une journée entière, nos lycéens se glissent dans la peau de délégués diplomatiques représentant différentes nations. Ils défendent les intérêts de leur pays tout en respectant scrupuleusement le protocole des Nations Unies.\n\nL'événement les met au défi de s'exprimer devant une assemblée plénière, de négocier en commission et de bâtir des coalitions pour résoudre des problématiques mondiales cruciales (sécurité alimentaire, transition écologique, égalité des droits). Ils y développent leur éloquence, leur sens du compromis et une vision éclairée de la géopolitique contemporaine.`,
        image: "/images/events/simonu-new.png",
        headerImage: "/images/events/simonu-new.png",
        gallery: [
            "/images/events/simonu/simonu-group-argentine.jpg",
            "/images/events/simonu/simonu-speaker.jpg",
            "/images/events/simonu/img1.png",
            "/images/events/simonu/img2.png",
            "/images/events/simonu/img3.png"
        ],
        date: "Avril",
        monthOrder: 4,
        color: "from-primary/20 to-secondary/20",
        location: "Amphithéâtres KEDGE BS",
        badge: "Simulation Diplomatique ONU"
    },
    {
        id: "voyages",
        title: "Voyages de Fin d'Année",
        description: "Moments d'évasion inoubliables et d'ouverture culturelle : séjours en Espagne, découvertes européennes et grands voyages de fin d'année pour sortir de Marseille et élargir les horizons de nos jeunes.",
        fullDescription: `Les voyages que nous organisons permettent de réduire concrètement les inégalités socio-culturelles en offrant à nos tutorés l'opportunité de sortir de Marseille et de découvrir de nouveaux horizons.\n\nChaque projet bâtit son propre séjour : voyage de fin d'année pour les collégiens d'Izzo, séjour patrimonial à Arles pour Roy d'Espagne, découverte du littoral à Hyères pour Massa 13, ou voyage culturel pour les lycéens d'ACSE.\n\nCes séjours sont le fruit d'un remarquable engagement collectif tout au long de l'année pour leur autofinancement : campagnes de crowdfunding, opération papiers cadeaux (PPK) de Noël, ventes de goûters au foyer associatif et recherche de partenaires entreprises. Ils renforcent durablement la cohésion et ouvrent l'esprit des jeunes sur le monde.`,
        image: "/images/home/voyage-culturel-1.jpg",
        headerImage: "/images/home/voyage-culturel-2.jpg",
        gallery: [
            "/images/home/voyage-culturel-1.jpg",
            "/images/home/voyage-culturel-2.jpg",
            "/images/home/voyage-culturel-3.jpg"
        ],
        date: "Mai - Juin",
        monthOrder: 5,
        color: "from-emerald-500/20 to-teal-500/20",
        location: "Espagne · Séjours Européens & Évasion",
        badge: "Évasion & Culture"
    },
    {
        id: "olympiades",
        title: "Les Olympiades Phoenix",
        description: "Rassemblement sportif annuel de plus de 300 personnes dans un stade marseillais : 20 équipes mixtes de tuteurs et tutorés s'affrontent dans un esprit d'équipe et de fair-play.",
        fullDescription: `Créées en 2014, les Olympiades constituent le plus grand rassemblement de fin d'année de Phoenix Égalité Des Chances. Cet événement convivial réunit jusqu'à 300 participants (collégiens, lycéens, tuteurs et anciens) dans un grand complexe sportif marseillais.\n\nLes tutorés sont répartis en une vingtaine d'équipes mixtes inter-projets et s'affrontent tout au long de la journée dans une dizaine d'épreuves sportives et ludiques (football, relais, tir à la corde, basket, parcours d'agilité, béret).\n\nEn clôture de l'événement, toutes les équipes sont récompensées selon leur classement, avec un accent tout particulier porté sur le trophée du Fair-play, illustrant les valeurs cardinales de l'association : respect, solidarité, dépassement de soi et fraternité.`,
        image: "/images/events/olympiades-new.png",
        headerImage: "/images/events/olympiades-banner-new.jpg",
        gallery: [
            "/images/events/olympiades/olympiades-group-2.jpg",
            "/images/events/olympiades/olympiades-group-1.png",
            "/images/events/olympiades/olympiades-group-3.jpg",
            "/images/events/olympiades/img1.png",
            "/images/events/olympiades/img2.png"
        ],
        externalLinks: [
            {
                label: "Retrouvez l'article sur les olympiades par L'Express",
                url: "https://www.lexpress.fr/societe/education/les-grandes-ecoles-de-commerce-dans-le-grand-bain-de-l-innovation_1963416.html",
                logo: "/partners/lexpress.png"
            }
        ],
        date: "Juin",
        monthOrder: 6,
        color: "from-primary/20 to-primary/40",
        location: "Stade & Complexe Sportif (Marseille)",
        badge: "Sport & Esprit d'Équipe"
    },
    {
        id: "ceremonies",
        title: "Cérémonies de Fin de Parcours",
        description: "Clôture solennelle de l'année scolaire : célébration des progrès des jeunes, remise des certificats de tutorat et cadeaux en présence des familles et partenaires.",
        fullDescription: `Organisées à la fin du mois de juin, les Cérémonies de Fin de Parcours marquent l'aboutissement d'une année d'efforts, d'apprentissage et de dépassement de soi pour nos 300 élèves.\n\nDans chaque projet et au sein des établissements partenaires, tuteurs, tutorés, parents d'élèves, professeurs et responsables associatifs se réunissent pour célébrer les réussites individuelles et collectives.\n\nChaque jeune reçoit son certificat d'assiduité et d'engagement Phoenix, ainsi que des cadeaux symboliques préparés par le pôle partenariats. Ce moment d'émotion partagée consacre la fierté des familles et encourage les jeunes à poursuivre leur trajectoire vers l'excellence.`,
        image: "/images/events/ceremonie-fin-parcours.jpg",
        headerImage: "/images/events/ceremonie-fin-parcours.jpg",
        date: "Fin Juin",
        monthOrder: 6.5,
        color: "from-amber-500/20 to-orange-500/20",
        location: "KEDGE BS & Centres Partenaires",
        badge: "Diplômes & Célébration"
    }
];
