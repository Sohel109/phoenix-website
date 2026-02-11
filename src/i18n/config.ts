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
            }
        }
    },
    en: {
        translation: {
            "nav": {
                "home": "Home",
                "projects": "Projects",
                "map": "Map",
                "events": "Events",
                "partners": "Partners",
                "documents": "Documents",
                "transparency": "Transparency",
                "contact": "Contact"
            },
            "hero": {
                "since": "Since 2011 • Kedge Business School",
                "title1": "Equal",
                "title2": "Opportunities",
                "cta1": "Discover our projects",
                "cta2": "Join us"
            }
        }
    },
    ar: {
        translation: {
            "nav": {
                "home": "الرئيسية",
                "projects": "المشاريع",
                "map": "الخريطة",
                "events": "الفعاليات",
                "partners": "الشركاء",
                "documents": "الوثائق",
                "transparency": "الشفافية",
                "contact": "اتصل بنا"
            },
            "hero": {
                "since": "منذ 2011 • كلية كيدج للأعمال",
                "title1": "تكافؤ",
                "title2": "الفرص",
                "cta1": "اكتشف مشاريعنا",
                "cta2": "انضم إلينا"
            }
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'fr',
        supportedLngs: ['fr', 'en', 'ar'],
        interpolation: {
            escapeValue: false
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage']
        }
    });

export default i18n;
