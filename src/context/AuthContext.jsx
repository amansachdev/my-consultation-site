import { useEffect, useMemo, useState } from 'react';
import { AuthContext } from './auth-context';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading');

  const refresh = async () => {
    setStatus('loading');
    try {
      const response = await fetch('/.auth/me', { credentials: 'include' });
      const payload = response.ok ? await response.json() : null;
      setUser(payload?.clientPrincipal || null);
    } catch {
      setUser(null);
    } finally {
      setStatus('ready');
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const value = useMemo(
    () => ({
      user,
      status,
      isAuthenticated: Boolean(user),
      signInUrl: '/.auth/login/github?post_login_redirect_uri=/account',
      signOutUrl: '/.auth/logout?post_logout_redirect_uri=/',
      refresh,
    }),
    [status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
