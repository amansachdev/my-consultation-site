import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { loadAnalytics, loadClarity, trackPageView } from '../lib/analytics';

const CONSENT_KEY = 'antaran-analytics-consent';

export function Analytics() {
  const location = useLocation();
  const [consent, setConsent] = useState(() => {
    try {
      return window.localStorage.getItem(CONSENT_KEY);
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (consent !== 'granted') return;
    loadAnalytics();
    if (isClaritySafePath(location.pathname)) loadClarity();
    trackPageView(location.pathname);
  }, [consent, location.pathname, location.search]);

  if (consent) return null;

  const chooseConsent = (nextConsent) => {
    try {
      window.localStorage.setItem(CONSENT_KEY, nextConsent);
    } catch {
      // Continue without persistence when browser storage is unavailable.
    }
    setConsent(nextConsent);
  };

  return (
    <aside className="fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-2xl rounded-lg border border-line bg-white p-4 shadow-lg sm:inset-x-auto sm:flex sm:items-center sm:gap-5">
      <p className="text-sm leading-6 text-ink/75">
        We use anonymous analytics and privacy-masked session insights to understand which public pages are useful and improve Antaran. We do not send health, booking, or account details to analytics tools.
      </p>
      <div className="mt-3 flex shrink-0 gap-2 sm:mt-0">
        <button type="button" className="btn-secondary min-h-10 px-4 text-sm" onClick={() => chooseConsent('denied')}>
          Not now
        </button>
        <button type="button" className="btn-primary min-h-10 px-4 text-sm" onClick={() => chooseConsent('granted')}>
          Allow analytics
        </button>
      </div>
    </aside>
  );
}

function isClaritySafePath(pathname) {
  return pathname === '/' || pathname === '/team';
}
