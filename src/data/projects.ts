import { GraduationCap, Users, School, BookOpen, PenTool, Home } from 'lucide-react';

export interface ProjectItem {
    id: string;
    title: string;
    category: string;
    type: string;
    description: string;
    fullDescription: string;
    icon: any;
    image: string;
    banner: string;
    bannerFit?: string;
    creationYear: number;
    tutorCount: number;
    isCordee: boolean;
    targetAudience: string;
    locationName: string;
    schedule: string;
    axes: string[];
    chefs: string[];
    instagram?: string;
    facebook?: string;
    trip?: string;
}

export const projects: ProjectItem[] = [
    {
        id: 'acse',
        title: 'À Chacun Son Excellence',
        category: 'Lycée',
        type: 'Culture & Orientation',
        description: "Projet Cordée de la Réussite phare, ACSE accompagne 60 lycéens marseillais chaque samedi à Kedge BS : ouverture culturelle, développement personnel et préparation aux études supérieures.",
        fullDescription: "À Chacun Son Excellence est un projet de tutorat culturel qui s'adresse à des lycéens volontaires de la seconde à la terminale issus notamment des lycées Saint-Exupéry et Saint-Charles. Les jeunes intègrent le projet en seconde et sont suivis jusqu'à l'obtention de leur baccalauréat. Chaque tuteur accompagne deux tutorés et les encourage à poursuivre leurs études supérieures. Chaque samedi après-midi de 14h à 17h30 sur le campus de Kedge BS, les séances s'articulent autour de 3 axes : l'ouverture culturelle, le développement personnel et l'aide à l'orientation. Des sorties culturelles et un voyage culturel sont organisés chaque année afin de préparer le baccalauréat et d'enrichir la culture générale des élèves.",
        icon: School,
        image: '/images/projects/acse-logo.webp',
        banner: '/images/banners/acse-banner-v2.jpg',
        creationYear: 2006,
        tutorCount: 60,
        isCordee: true,
        targetAudience: "Lycéens (2nde à Terminale) · Lycées Saint-Exupéry et Saint-Charles",
        locationName: "Campus KEDGE Business School (Marseille 9e)",
        schedule: "Chaque samedi après-midi de 14h00 à 17h30",
        axes: ["Ouverture culturelle", "Aide à l'orientation", "Développement personnel"],
        chefs: ["Elyas BOURHIS", "Ryadh ABDELMALEK"],
        instagram: "a_chacun_son_excellence",
        trip: "Voyage culturel & sorties annuelles"
    },
    {
        id: 'apprentis-d-auteuil',
        title: "Apprentis d'Auteuil",
        category: 'Collège',
        type: 'Ouverture Culturelle',
        description: "En étroite collaboration avec la fondation Apprentis d'Auteuil, ce projet dispense des ateliers et présentations d'ouverture culturelle à 35 collégiens au collège Vitagliano.",
        fullDescription: "Apprentis d'Auteuil, en étroite collaboration avec la fondation du même nom, intervient dans le collège Vitagliano (13004). Ce projet de tutorat est destiné à aider 35 collégiens de 6ème et 5ème. Des séances d'ouverture culturelle sont dispensées sur des thèmes d'actualité pour éveiller la curiosité intellectuelle des tuteurés. Les séances sont organisées sous deux formats : ateliers interactifs et présentations stimulantes. Des sorties culturelles et sportives ainsi qu'un voyage culturel sont également organisés chaque année.",
        icon: Users,
        image: '/images/projects/apprentis-auteuil.webp',
        banner: '/images/banners/apprentis-auteuil-banner-new.jpg',
        creationYear: 2009,
        tutorCount: 35,
        isCordee: false,
        targetAudience: "Collégiens de 6ème et 5ème",
        locationName: "Collège Vitagliano (13004 Marseille)",
        schedule: "Mardi et jeudi après-midi",
        axes: ["Ouverture culturelle", "Actualités & Société"],
        chefs: ["Damya AKILI", "Amani ZAMIT"],
        instagram: "phoenixapprentisdauteuil",
        trip: "Sorties culturelles & sportives, voyage culturel annuel"
    },
    {
        id: 'arthur-rimbaud',
        title: 'Arthur Rimbaud',
        category: 'Collège',
        type: 'Cordée de la Réussite',
        description: "Labellisé Cordée de la Réussite, ce projet accompagne 25 élèves de 3ème du collège Arthur Rimbaud (13015) pour élargir leur horizon culturel et renforcer leur esprit critique.",
        fullDescription: "Le projet Arthur Rimbaud accompagne 25 élèves de 3ème du collège du même nom, situé dans le 15ème arrondissement de Marseille. Ce projet œuvre pour aider les élèves à comprendre le monde qui les entoure, au travers de séances dynamiques d'ouverture culturelle et d'échanges d'actualité. Des sorties culturelles régulières ont lieu tout au long de l'année, ainsi qu'un voyage de fin d'année pour élargir leurs horizons.",
        icon: BookOpen,
        image: '/images/projects/arthur-rimbaud-logo.webp',
        banner: '/images/banners/arthur-rimbaud-banner-new.png',
        creationYear: 2018,
        tutorCount: 25,
        isCordee: true,
        targetAudience: "Collégiens de 3ème",
        locationName: "Collège Arthur Rimbaud (13015 Marseille)",
        schedule: "Chaque jeudi après-midi",
        axes: ["Ouverture culturelle", "Esprit critique & Débat"],
        chefs: ["Haïtam BEBBI"],
        instagram: "arthurrimbaud_phoenix",
        trip: "Sorties culturelles et voyage en fin d'année"
    },
    {
        id: 'izzo',
        title: 'Jean-Claude Izzo',
        category: 'Collège',
        type: 'Cordée de la Réussite',
        description: "Lauréat du Trophée Pro-Act, Izzo accompagne 30 élèves de 4e et 3e au collège Jean-Claude Izzo (13002) : présentations ludiques, ouverture culturelle et voyage de fin d'année.",
        fullDescription: "IZZO intervient auprès de 30 collégiens de 4ème et de 3ème au collège Jean-Claude Izzo (13002). Bien que ces élèves n'aient pas de difficultés scolaires majeures, ils ont une véritable soif d'apprendre et ont besoin d'un accompagnement personnalisé dans leur orientation. Chaque jeudi après-midi de 16h30 à 18h30, une dizaine de tuteurs animent des présentations ludiques et approfondies sur un thème culturel, suivies d'un échange privilégié tuteur-tutoré autour d'un goûter. Le projet organise aussi des sorties sportives et culturelles et un voyage de fin d'année.",
        icon: GraduationCap,
        image: '/images/projects/izzo-logo.webp',
        banner: '/images/banners/izzo-banner-new.jpg',
        creationYear: 2011,
        tutorCount: 30,
        isCordee: true,
        targetAudience: "Collégiens de 4ème et 3ème",
        locationName: "Collège Jean-Claude Izzo (13002 Marseille)",
        schedule: "Chaque jeudi après-midi de 16h30 à 18h30",
        axes: ["Ouverture culturelle", "Aide à l'orientation", "Développement personnel"],
        chefs: ["Ryan BENYELLES", "Donia TNANI"],
        facebook: "phoenix.izzo",
        trip: "Voyage de fin d’année & sorties culturelles"
    },
    {
        id: 'jules-ferry',
        title: 'Jules Ferry',
        category: 'Collège',
        type: 'Cordée de la Réussite',
        description: "Accueillis directement sur le campus de KEDGE, 20 collégiens motivés de Jules Ferry (13015) développent leurs soft skills, l'aisance à l'oral et la maîtrise de PowerPoint.",
        fullDescription: "Projet labellisé Cordée de la Réussite, Jules Ferry accompagne 20 élèves de 4ème et 3ème du collège Jules Ferry (13015), sélectionnés sur leur motivation. Les séances ont lieu sur le campus de KEDGE BS afin de désacraliser les études supérieures. Les tuteurs leur transmettent les compétences transversales clés (soft skills, conception de présentations PowerPoint percutantes, éloquence et prise de parole en public), indispensables pour réussir le brevet et aborder le lycée avec confiance.",
        icon: PenTool,
        image: '/images/projects/jules-ferry-logo.webp',
        banner: '/images/banners/jules-ferry-banner-new.jpg',
        creationYear: 2017,
        tutorCount: 20,
        isCordee: true,
        targetAudience: "Collégiens de 4ème et 3ème",
        locationName: "Campus KEDGE Business School (élèves du collège 13015)",
        schedule: "2 mercredis après-midi par mois à KEDGE",
        axes: ["Soft skills & Éloquence", "Aide à l'orientation", "Outils numériques"],
        chefs: ["Nelly RANDRIAMIHAJA"],
        instagram: "julesferry.phoenix",
        trip: "Sorties de cohésion et ateliers d'éloquence"
    },
    {
        id: 'massa-13',
        title: 'Massa 13',
        category: 'Association',
        type: 'Aide aux Devoirs & Culture',
        description: "En partenariat avec l'association Massabielle, Massa 13 offre chaque mercredi soir 2h d'accompagnement (devoirs + actualités) et un voyage à Hyères pour 20 lycéens du 13e.",
        fullDescription: "En étroite collaboration avec l'association Massabielle, Massa 13 intervient dans la maison de quartier Bernadette du 13ème arrondissement. Chaque tuteur accompagne un lycéen volontaire de la 2nde à la terminale pour l'aider dans ses cours et lui apporter une solide ouverture culturelle. Chaque mercredi soir de 18h à 20h, la séance comprend une heure d'aide aux devoirs méthodologique suivie d'une heure dédiée aux sujets d'actualité et au débat. De nombreuses sorties et un voyage annuel à Hyères sont également organisés.",
        icon: BookOpen,
        image: '/images/projects/massa-13-logo.webp',
        banner: '/images/banners/massa-13-banner-new.jpg',
        creationYear: 2008,
        tutorCount: 20,
        isCordee: false,
        targetAudience: "Lycéens de la 2nde à la Terminale",
        locationName: "Maison de quartier Bernadette (13013 Marseille)",
        schedule: "Mercredi soir de 18h00 à 20h00",
        axes: ["Soutien scolaire & Méthodologie", "Ouverture culturelle & Débat"],
        chefs: ["Équipe Phoenix EDC (projet en relance)"],
        instagram: "massa13_phoenix",
        trip: "Voyage annuel à Hyères et sorties culturelles"
    },
    {
        id: 'roy-despagne',
        title: "Roy d'Espagne",
        category: 'Collège',
        type: 'Cordée de la Réussite',
        description: "Labellisé Cordée de la Réussite, Roy d'Espagne prépare 20 collégiens de 3ème au brevet et à l'orientation, avec sorties culturelles mensuelles et voyage à Arles.",
        fullDescription: "Le projet Roy d'Espagne intervient auprès de 20 élèves de 3ème au collège Roy d'Espagne (13009) pour les soutenir dans leur orientation et les préparer aux épreuves du brevet. Chaque jeudi après-midi, les élèves bénéficient de séances alternant aide aux devoirs individualisée et ateliers collectifs d'ouverture culturelle. Dès le mois d'avril, les séances sont entièrement dédiées à la préparation intensive des épreuves écrites et orales du brevet, complétées par des sorties mensuelles et un voyage à Arles.",
        icon: Users,
        image: '/images/projects/roy-despagne-logo.webp',
        banner: '/images/banners/roy-despagne-banner-new.png',
        creationYear: 2006,
        tutorCount: 20,
        isCordee: true,
        targetAudience: "Collégiens de 3ème",
        locationName: "Collège Roy d'Espagne (13009 Marseille)",
        schedule: "Jeudi après-midi (séances individuelles & collectives)",
        axes: ["Préparation Brevet", "Ouverture culturelle", "Aide à l'orientation", "Développement personnel"],
        chefs: ["Lina EL KEDDAH"],
        instagram: "roy_espagne",
        trip: "Voyage annuel à Arles et sorties culturelles mensuelles"
    },
    {
        id: 'saint-gabriel',
        title: 'Saint Gabriel',
        category: 'Centre Social',
        type: 'Tutorat 6e à Terminale',
        description: "4 soirs par semaine au centre social Saint-Gabriel (13014), les tuteurs accompagnent 40 jeunes de la 6e à la Terminale : aide aux devoirs, débats mensuels et voyage annuel.",
        fullDescription: "Le projet Saint Gabriel intervient au cœur du centre social Saint-Gabriel dans le 14ème arrondissement de Marseille. Chaque lundi, mardi, jeudi et vendredi soir, les tuteurs de Kedge BS accompagnent 40 élèves de la 6ème à la Terminale pour surmonter leurs difficultés scolaires et consolider leurs acquis. En plus du soutien scolaire quotidien, une séance hebdomadaire d'ouverture culturelle et un grand débat mensuel stimulent leur esprit critique. Des sorties mensuelles et un voyage complètent le programme.",
        icon: Home,
        image: '/images/projects/saint-gabriel-logo.webp',
        banner: '/images/banners/saint-gabriel-new.jpeg',
        creationYear: 2008,
        tutorCount: 40,
        isCordee: false,
        targetAudience: "Élèves de la 6ème à la Terminale",
        locationName: "Centre social Saint-Gabriel (13014 Marseille)",
        schedule: "Lundi, mardi, jeudi et vendredi soir",
        axes: ["Soutien scolaire 4x/semaine", "Ouverture culturelle", "Débats d'actualité mensuels"],
        chefs: ["Abdollah JOUNOUDI", "Cannelle JUVENTIN"],
        instagram: "saint_gabriel_phoenix",
        trip: "Sorties mensuelles et voyage de fin d'année"
    },
    {
        id: 'sup-d-om',
        title: "Sup d'OM",
        category: 'Phoenix x OM',
        type: 'Sport & Études',
        description: "Projet historique fondé en 1998 en partenariat avec l'Olympique de Marseille : accompagnement scolaire de 30 jeunes footballeurs à La Commanderie et OM Campus.",
        fullDescription: "Pionnier de l'égalité des chances dès 1998, Sup d'OM intervient au centre de formation de l'Olympique de Marseille pour les sections masculines. Les tuteurs accompagnent les lycéens au centre d'entraînement Robert Louis-Dreyfus (La Commanderie) chaque mardi et jeudi après-midi ainsi que certains samedis matin, et les collégiens au centre OM Campus chaque mercredi. L'objectif est d'assurer un double projet d'excellence : réussir scolairement tout en poursuivant une formation sportive de haut niveau, en préparant sereinement leur avenir professionnel.",
        icon: School,
        image: '/images/projects/sup-d-om-clean-logo.webp',
        banner: '/images/banners/sup-d-om-banner-white.jpg',
        creationYear: 1998,
        tutorCount: 30,
        isCordee: false,
        targetAudience: "Jeunes sportifs en formation (collégiens & lycéens)",
        locationName: "La Commanderie (13012) & OM Campus",
        schedule: "Mardi, mercredi, jeudi (Commanderie & OM Campus) et samedi",
        axes: ["Soutien scolaire", "Double projet Sport & Réussite", "Avenir professionnel"],
        chefs: ["Samy RABHI", "Eve SAMA"],
        instagram: "supd.om",
        trip: "Accompagnement pédagogique et orientation professionnelle"
    }
];
