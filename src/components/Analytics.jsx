import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { loadAnalytics, loadClarity, trackPageView } from '../lib/analytics';

export function Analytics() {
  const location = useLocation();

  useEffect(() => {
    const route = normalizeRoute(location.pathname);
    if (!isPublicAnalyticsPath(route)) return;
    loadAnalytics();
    loadClarity();
    trackPageView(route);
  }, [location.pathname, location.search]);

  return null;
}

function isPublicAnalyticsPath(pathname) {
  return ['/', '/book', '/assessment', '/team', '/symptoms', '/resources', '/prepare'].includes(pathname);
}

function normalizeRoute(pathname) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const route = base && pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
  return route.replace(/\/$/, '') || '/';
}
