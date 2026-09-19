import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export interface SEOProps {
    title: string;
    description: string;
    image?: string;
    ogImage?: string;
    type?: string;
}

const DEFAULT_IMAGE = 'https://phoenixedc.fr/logo-badge.jpg';
const BASE_URL = 'https://phoenixedc.fr';

/**
 * SEO Component — Met à jour dynamiquement les balises documentaires et Open Graph
 * par page sans dépendance externe.
 */
export function SEO({
    title,
    description,
    image,
    ogImage,
    type = 'website',
}: SEOProps) {
    const finalImage = ogImage || image || DEFAULT_IMAGE;
    const location = useLocation();
    const currentUrl = `${BASE_URL}${location.pathname}`;

    useEffect(() => {
        // Document Title
        document.title = title;

        const updateMeta = (name: string, content: string, isProperty = false) => {
            const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
            let element = document.querySelector(selector) as HTMLMetaElement | null;
            if (!element) {
                element = document.createElement('meta');
                if (isProperty) {
                    element.setAttribute('property', name);
                } else {
                    element.setAttribute('name', name);
                }
                document.head.appendChild(element);
            }
            element.setAttribute('content', content);
        };

        const updateCanonical = (url: string) => {
            let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
            if (!canonical) {
                canonical = document.createElement('link');
                canonical.setAttribute('rel', 'canonical');
                document.head.appendChild(canonical);
            }
            canonical.setAttribute('href', url);
        };

        // Update Meta Tags
        updateMeta('description', description);
        updateMeta('og:title', title, true);
        updateMeta('og:description', description, true);
        updateMeta('og:image', finalImage, true);
        updateMeta('og:url', currentUrl, true);
        updateMeta('og:type', type, true);
        updateMeta('twitter:title', title);
        updateMeta('twitter:description', description);
        updateMeta('twitter:image', finalImage);
        updateCanonical(currentUrl);
    }, [title, description, finalImage, type, currentUrl]);

    return null;
}
