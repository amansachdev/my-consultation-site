import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_URL = 'https://antaran.online';
const SITE_NAME = 'Antaran';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

const pageMetadata = {
  '/': {
    title: 'Online Psychiatric Consultation in India | Antaran',
    description: 'Private online psychiatric consultations with Dr Medha for adults across India, with thoughtful support for anxiety, low mood, sleep, stress, and ongoing care.',
    schemaType: 'MedicalClinic',
  },
  '/book': {
    title: 'Book an Online Psychiatric Consultation | Antaran',
    description: 'Request a private online psychiatric consultation with Antaran. Choose an available appointment slot and receive your next steps.',
  },
  '/assessment': {
    title: 'PHQ-9 and GAD-7 Self-Check | Antaran',
    description: 'Reflect on recent mood and anxiety symptoms with Antaran’s PHQ-9 and GAD-7 self-check tools. These screens are not a diagnosis.',
  },
  '/team': {
    title: 'Meet Dr. Medha, Psychiatrist in Bengaluru and Online | Antaran',
    description: 'Learn about Dr Medha, her psychiatric training, clinical experience, and thoughtful approach to online mental-health care.',
  },
  '/symptoms': {
    title: 'Symptoms and Mental-Health Concerns | Antaran',
    description: 'Explore common mental-health concerns including anxiety, low mood, sleep difficulties, attention, and stress. Educational information, not diagnosis.',
  },
  '/resources': {
    title: 'Mental-Health Resources and Guides | Antaran',
    description: 'Read practical mental-health guides about starting care, stress, sleep, privacy, and online psychiatric consultations.',
  },
  '/prepare': {
    title: 'Prepare for an Online Psychiatric Consultation | Antaran',
    description: 'Use Antaran’s simple checklist to prepare for an online psychiatric consultation, from privacy and technology to useful health information.',
  },
  '/privacy': {
    title: 'Privacy Policy | Antaran',
    description: 'Draft privacy policy for Antaran Mental Healthcare. Pending legal review.',
  },
  '/terms': {
    title: 'Terms of Use | Antaran',
    description: 'Draft terms of use for Antaran Mental Healthcare. Pending legal review.',
  },
  '/account': {
    title: 'Your Antaran Account',
    description: 'View your Antaran profile, booking history, and saved assessments.',
    robots: 'noindex, nofollow',
  },
  '/admin': {
    title: 'Antaran Admin Workspace',
    description: 'Restricted Antaran administration workspace.',
    robots: 'noindex, nofollow',
  },
  '/clinician/prescriptions': {
    title: 'Antaran Clinician Workspace',
    description: 'Restricted Antaran clinician workspace.',
    robots: 'noindex, nofollow',
  },
};

export function Seo() {
  const { pathname } = useLocation();
  const route = normalizeRoute(pathname);

  useEffect(() => {
    const metadata = pageMetadata[route] || {
      title: 'Antaran | Mental Health Consultations',
      description: 'Thoughtful online mental-health consultations for adults across India.',
      robots: 'noindex, nofollow',
    };
    const isPublic = metadata.robots !== 'noindex, nofollow';
    const canonical = isPublic ? `${SITE_URL}${route === '/' ? '/' : route}` : null;

    document.title = metadata.title;
    setMeta('name', 'description', metadata.description);
    setMeta('name', 'robots', metadata.robots || 'index, follow');
    setMeta('property', 'og:title', metadata.title);
    setMeta('property', 'og:description', metadata.description);
    setMeta('property', 'og:type', route === '/' ? 'website' : 'article');
    setMeta('property', 'og:url', canonical || SITE_URL);
    setMeta('property', 'og:image', DEFAULT_IMAGE);
    setMeta('property', 'og:site_name', SITE_NAME);
    setMeta('name', 'twitter:title', metadata.title);
    setMeta('name', 'twitter:description', metadata.description);
    setMeta('name', 'twitter:image', DEFAULT_IMAGE);
    setMeta('name', 'twitter:card', 'summary_large_image');
    setCanonical(canonical);
    setSchema(route, metadata, canonical);
  }, [route]);

  return null;
}

function normalizeRoute(pathname) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const route = base && pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
  const normalized = route.replace(/\/$/, '');
  return normalized || '/';
}

function setMeta(attribute, key, content) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function setCanonical(url) {
  let element = document.head.querySelector('link[rel="canonical"]');
  if (!url) {
    element?.remove();
    return;
  }
  if (!element) {
    element = document.createElement('link');
    element.rel = 'canonical';
    document.head.appendChild(element);
  }
  element.href = url;
}

function setSchema(route, metadata, canonical) {
  let element = document.head.querySelector('#route-schema');
  if (!element) {
    element = document.createElement('script');
    element.id = 'route-schema';
    element.type = 'application/ld+json';
    document.head.appendChild(element);
  }

  if (!canonical) {
    element.textContent = '';
    return;
  }

  const page = {
    '@context': 'https://schema.org',
    '@type': metadata.schemaType || 'WebPage',
    '@id': `${canonical}#page`,
    url: canonical,
    name: metadata.title,
    description: metadata.description,
    isPartOf: { '@id': `${SITE_URL}/#website` },
  };
  const schema = route === '/'
    ? {
      ...page,
      name: 'Antaran Mental Healthcare',
      url: SITE_URL,
      logo: `${SITE_URL}/favicon.jpeg`,
      image: DEFAULT_IMAGE,
      areaServed: 'IN',
      medicalSpecialty: 'Psychiatric',
      sameAs: ['https://www.instagram.com/antaran.health/'],
    }
    : page;
  element.textContent = JSON.stringify(schema);
}
