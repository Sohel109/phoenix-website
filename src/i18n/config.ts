import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
    fr: {
        translation: {
            "nav": {
                "home": "Accueil",
                "projects": "Projets",
                "map": "Carte",
                "events": "Événements",
                "partners": "Partenaires",
                "documents": "Documents",
                "transparency": "Transparence",
                "contact": "Contact"
            },
            "hero": {
                "since": "Depuis 2011 • Kedge Business School",
                "title1": "L'Égalité",
                "title2": "des Chances",
                "cta1": "Découvrir nos projets",
                "cta2": "Nous rejoindre"
            },
            "missions": {
                "title": "NOS",
                "titleHighlight": "MISSIONS",
                "tutoring": {
                    "title": "Tutorat Académique",
                    "desc": "Aide aux devoirs et soutien scolaire hebdomadaire pour renforcer les acquis et la confiance en soi."
                },
                "culture": {
                    "title": "Ouverture Culturelle",
                    "desc": "Sorties, voyages et ateliers pour éveiller la curiosité et découvrir de nouveaux horizons."
                },
                "orientation": {
                    "title": "Orientation",
                    "desc": "Accompagnement dans le choix des études et découverte du monde professionnel."
                }
            },
            "partners": {
                "title": "ILS NOUS",
                "titleHighlight": "SOUTIENNENT",
                "viewAll": "Voir tous nos partenaires"
            },
            "footer": {
                "contact": "Contact",
                "address": "KEDGE Business School\nDomaine de Luminy\n13009 Marseille",
                "quickLinks": "Liens Rapides",
                "ourProjects": "Nos Projets",
                "events": "Événements",
                "becomePartner": "Devenir Partenaire",
                "legalMentions": "Mentions Légales",
                "transparency": "Transparence",
                "followUs": "Suivez-nous",
                "rights": "Tous droits réservés.",
                "description": "L'association étudiante de KEDGE Business School qui lutte pour l'égalité des chances et l'accès à l'éducation pour tous."
            },
            "contact": {
                "hero": {
                    "title": "Contactez-nous",
                    "subtitle": "Une question, une suggestion ou envie de rejoindre l'aventure Phoenix ?"
                },
                "categories": {
                    "information": {
                        "label": "Information",
                        "description": "Découvrir notre vision"
                    },
                    "partnership": {
                        "label": "Partenariat",
                        "description": "Soutenir l'ambition"
                    }
                }
            },
            "transparency": {
                "title": "Transparence Financière",
                "subtitle": "Découvrez comment vos dons sont utilisés pour transformer la vie de 300 jeunes chaque année",
                "commitment": {
                    "title": "Notre engagement",
                    "text1": "Phoenix Égalité des Chances est une association",
                    "highlight1": "reconnue d'intérêt général",
                    "text2": "Vos dons sont",
                    "highlight2": "déductibles des impôts à hauteur de 66%",
                    "text3": "Nous nous engageons à une",
                    "highlight3": "transparence totale",
                    "text4": "sur l'utilisation de chaque euro reçu."
                },
                "breakdown": {
                    "title": "Répartition des Dons",
                    "events": "Événements & sorties culturelles",
                    "eventsDesc": "Olympiades, SimONU, sorties culturelles, Marseille Cité Éloquente et JEDC.",
                    "education": "Matériel pédagogique & activités",
                    "educationDesc": "Fournitures scolaires, livres, matériel éducatif et supports d'activités pour les jeunes.",
                    "admin": "Frais administratifs",
                    "adminDesc": "Assurances, outils de gestion, communication et frais de fonctionnement minimal."
                },
                "details": "Détails par Catégorie",
                "impact": {
                    "title": "Impact Concret de Vos Dons",
                    "examples": {
                        "25": "Kit complet de matériel pédagogique pour un projet",
                        "100": "Matériel pour une activité culturelle collective",
                        "250": "Organisation d'une sortie culturelle pour un groupe",
                        "500": "Financement d'un événement majeur (SimONU, Olympiades)"
                    }
                },
                "cta": {
                    "title": "Soutenez Notre Mission",
                    "subtitle": "Chaque don compte. Ensemble, donnons à tous les jeunes les mêmes chances de réussir.",
                    "button": "Faire un don déductible",
                    "taxInfo": "66% de réduction d'impôts • Reçu fiscal automatique"
                },
                "back": "Retour"
            },
            "home": {
                "missions": {
                    "title": "NOS",
                    "titleHighlight": "MISSIONS",
                    "academic": {
                        "title": "Tutorat Académique",
                        "desc": "Aide aux devoirs et soutien scolaire hebdomadaire pour renforcer les acquis et la confiance en soi."
                    },
                    "culture": {
                        "title": "Ouverture Culturelle",
                        "desc": "Sorties, voyages et ateliers pour éveiller la curiosité et découvrir de nouveaux horizons."
                    },
                    "orientation": {
                        "title": "Orientation",
                        "desc": "Accompagnement dans le choix des études et découverte du monde professionnel."
                    }
                },
                "impact": {
                    "title": "Notre Impact sous",
                    "titleHighlight": "toutes ses formes",
                    "youth": "Jeunes accompagnés",
                    "volunteers": "Étudiants bénévoles",
                    "projects": "Projets actifs",
                    "creation": "Date de création"
                },
                "ai": {
                    "badge": "NOUVEAU : PHOENIX AI",
                    "title": "DISCUTEZ AVEC",
                    "titleHighlight": "NOTRE INTELLIGENCE",
                    "description": "Une question sur nos programmes ? Besoin d'aide pour votre orientation ? Notre assistant virtuel est là pour vous répondre instantanément, 24h/24 et 7j/7. C'est totalement gratuit et accessible à tous.",
                    "cta": "Essayer maintenant",
                    "features": {
                        "title": "Pourquoi Phoenix AI ?",
                        "subtitle": "Assistant Intelligent",
                        "instant": "Réponses instantanées",
                        "available": "Disponible 24h/24",
                        "free": "100% Gratuit"
                    }
                }
            }
        }
    }
};

// Debugging
console.log('i18n Resources (FR Only):', resources);

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        lng: 'fr',
        fallbackLng: 'fr',
        debug: true,
        supportedLngs: ['fr'],
        interpolation: {
            escapeValue: false
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage']
        }
    });

export default i18n;
