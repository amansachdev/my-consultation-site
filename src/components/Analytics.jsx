import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { loadAnalytics, loadClarity, trackPageView } from '../lib/analytics';

export function Analytics() {
  const location = useLocation();

  useEffect(() => {
    if (!isPublicAnalyticsPath(location.pathname)) return;
    loadAnalytics();
    loadClarity();
    trackPageView(location.pathname);
  }, [location.pathname, location.search]);

  return null;
}

function isPublicAnalyticsPath(pathname) {
  return pathname === '/' || pathname === '/team';
}
