import { projects } from './projects';

export const SITE_URL = 'https://www.phoenix-egalite-des-chances.com';
export const SOUTIEN_PATH = '/soutien-scolaire-marseille';
export const MYKEDGE_URL = 'https://mykedgeasso.fr/association/phoenix-edc';

// À mettre à jour à chaque modification du contenu de la page (signal de fraîcheur pour les moteurs et les IA).
export const LAST_UPDATED_ISO = '2026-10-08';
export const LAST_UPDATED_LABEL = 'octobre 2026';

// Projets actuellement à l'arrêt : affichés comme tels pour ne pas orienter les familles vers un projet qui ne tourne pas.
export const PAUSED_PROJECT_IDS: string[] = ['massa-13'];

export const SOUTIEN_TITLE = 'Soutien scolaire et ouverture culturelle à Marseille | Phœnix EDC';
export const SOUTIEN_DESCRIPTION =
    "Phœnix EDC, association d'étudiants KEDGE : aide aux devoirs, orientation et sorties culturelles gratuites pour 300 jeunes de quartiers prioritaires de Marseille.";

export const SOUTIEN_H1 = 'Soutien scolaire et ouverture culturelle pour les jeunes des quartiers de Marseille';

export const DIRECT_ANSWER =
    "Phœnix Égalité des Chances est une association d'étudiants de KEDGE Business School. Depuis 2011, elle accompagne gratuitement environ 300 collégiens et lycéens de quartiers prioritaires de Marseille : aide aux devoirs, orientation, débats d'actualité, sorties et voyages culturels, répartis dans 9 projets de terrain.";

export const ACCESS_PARAGRAPHS = [
    "Phœnix EDC n'est pas un service ouvert à tous sur inscription libre. Chaque projet s'adresse à un public précis : les élèves d'un collège ou d'un lycée partenaire, ou les jeunes d'un centre social.",
    "Vous cherchez une solution pour un jeune ? Écrivez-nous en indiquant son établissement et son quartier : nous vous dirons quel projet peut l'accueillir.",
];

const cordeeCount = projects.filter((p) => p.isCordee).length;

export interface FaqItem {
    question: string;
    answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
    {
        question: 'Le soutien scolaire de Phœnix EDC est-il gratuit ?',
        answer:
            "Oui. L'accompagnement est entièrement gratuit pour les familles. Les tuteurs sont des étudiants bénévoles de KEDGE Business School, et les sorties culturelles et les voyages sont financés grâce aux dons et aux partenaires de l'association.",
    },
    {
        question: "Qui sont les tuteurs de l'association Phœnix EDC ?",
        answer:
            "Ce sont des étudiants bénévoles de KEDGE Business School Marseille, plus d'une centaine chaque année. Ils interviennent chaque semaine dans les collèges, lycées et centres sociaux partenaires pour l'aide aux devoirs, la méthodologie, l'orientation et l'ouverture culturelle.",
    },
    {
        question: "Quels niveaux scolaires l'association accompagne-t-elle à Marseille ?",
        answer:
            "Surtout des collégiens, de la 6e à la 3e. Le projet ACSE accompagne des lycéens de la seconde à la terminale, et le centre social Saint-Gabriel des jeunes de la 6e à la terminale. Le projet Sup d'OM suit de jeunes sportifs en formation.",
    },
    {
        question: 'Dans quels quartiers de Marseille intervient Phœnix EDC ?',
        answer:
            "Dans les 2e, 4e, 9e, 12e, 14e et 15e arrondissements, au sein de collèges, d'un centre social et du centre de formation de l'OM, ainsi que sur le campus de KEDGE Business School à Luminy.",
    },
    {
        question: 'Comment inscrire un jeune à un projet de soutien scolaire ?',
        answer:
            "Chaque projet s'adresse à un public précis : un collège ou un lycée partenaire, ou un centre social. Contactez-nous en indiquant l'établissement et le quartier du jeune. Pour le centre social Saint-Gabriel, les démarches se font directement auprès du centre.",
    },
    {
        question: "Quelles activités propose Phœnix EDC en plus de l'aide aux devoirs ?",
        answer:
            "Des sorties culturelles (musées, théâtre), un voyage de fin d'année, des débats sur l'actualité et un accompagnement à l'orientation. L'association organise aussi la simulation de l'ONU SimONU, un concours d'éloquence et les Olympiades.",
    },
    {
        question: 'Comment devenir tuteur et valider son Pro Act à KEDGE ?',
        answer:
            "Il faut être étudiant à KEDGE Business School Marseille. La candidature se fait sur MyKedge Asso, suivie d'un entretien avec le bureau. Phœnix EDC fait partie des rares associations permettant de valider les 50 heures du Pro Act.",
    },
    {
        question: 'Phœnix EDC est-elle une association reconnue d\'intérêt général ?',
        answer: `Oui. Les dons ouvrent droit à une réduction d'impôt de 66 % pour les particuliers et de 60 % pour les entreprises. ${cordeeCount} des ${projects.length} projets sont labellisés Cordées de la réussite par l'État.`,
    },
    {
        question: "Où se trouve l'association et comment la contacter ?",
        answer:
            "Elle est installée sur le campus de KEDGE Business School, Domaine de Luminy, 13009 Marseille. Vous pouvez la contacter via la page Contact du site ou par e-mail à phoenixedc.asso@gmail.com.",
    },
];

export const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    url: `${SITE_URL}${SOUTIEN_PATH}`,
    inLanguage: 'fr',
    dateModified: LAST_UPDATED_ISO,
    mainEntity: FAQ_ITEMS.map(({ question, answer }) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
};

export const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Soutien scolaire à Marseille', item: `${SITE_URL}${SOUTIEN_PATH}` },
    ],
};
