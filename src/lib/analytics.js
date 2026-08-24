const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-NW21N7NEE4';
const clarityProjectId = import.meta.env.VITE_CLARITY_PROJECT_ID || 'y7e1v349sz';

let analyticsLoaded = false;
let clarityLoaded = false;

export function loadAnalytics() {
  if (analyticsLoaded || !measurementId || typeof document === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', measurementId, { send_page_view: false });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);
  analyticsLoaded = true;
}

export function trackPageView(pathname) {
  if (!analyticsLoaded || typeof window.gtag !== 'function') return;
  window.gtag('event', 'page_view', {
    page_path: pathname,
    page_title: document.title,
  });
}

export function loadClarity() {
  if (clarityLoaded || !clarityProjectId || typeof document === 'undefined') return;

  window.clarity = window.clarity || function clarity() {
    (window.clarity.q = window.clarity.q || []).push(arguments);
  };
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${clarityProjectId}`;
  document.head.appendChild(script);
  clarityLoaded = true;
}

export function trackEvent(name) {
  if (!analyticsLoaded || typeof window.gtag !== 'function') return;
  window.gtag('event', name);
}
