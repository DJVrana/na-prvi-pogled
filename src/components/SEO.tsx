import { useEffect } from 'react';

export interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogType?: 'website' | 'article';
  ogImage?: string;
  structuredData?: Record<string, any> | Record<string, any>[];
  keywords?: string;
}

export default function SEO({
  title,
  description,
  canonical = 'https://naprvipogled.com/',
  ogType = 'website',
  ogImage = `${import.meta.env.BASE_URL}images/hero-speed-dating.jpg`,
  structuredData,
  keywords = 'speed dating zagreb, upoznavanje zagreb, na prvi pogled, izlasci zagreb, dejtanje zagreb, ljubav, druženje'
}: SEOProps) {
  useEffect(() => {
    // Dynamic document title
    document.title = title;

    // Helper to update or create meta tag
    const setMetaTag = (attr: string, key: string, content: string) => {
      let element = document.querySelector(`meta[${attr}="${key}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, key);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    setMetaTag('name', 'description', description);
    setMetaTag('name', 'keywords', keywords);
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:url', canonical);
    setMetaTag('property', 'og:image', ogImage.startsWith('http') ? ogImage : `https://naprvipogled.com${ogImage}`);
    setMetaTag('property', 'og:site_name', 'Na prvi pogled');
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', ogImage.startsWith('http') ? ogImage : `https://naprvipogled.com${ogImage}`);

    // Update canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonical);

    // Update or insert structured data JSON-LD
    const existingScript = document.getElementById('json-ld-structured-data');
    if (existingScript) {
      existingScript.remove();
    }

    if (structuredData) {
      const script = document.createElement('script');
      script.id = 'json-ld-structured-data';
      script.type = 'application/ld+json';
      script.text = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }

    return () => {
      const s = document.getElementById('json-ld-structured-data');
      if (s) s.remove();
    };
  }, [title, description, canonical, ogType, ogImage, structuredData, keywords]);

  return null;
}
