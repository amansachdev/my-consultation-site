import { useCallback, useEffect, useMemo, useState } from 'react';
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { AuthContext } from './auth-context';
import { firebaseAuth, firebaseConfigured } from '../lib/firebase';
import { clearMockUser, getMockUser, isMockMode, setMockUser } from '../lib/dev-auth';
import { apiRequest } from '../lib/api';

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [mockUser, setMockUserState] = useState(() => getMockUser());
  const [roles, setRoles] = useState([]);
  const [status, setStatus] = useState(firebaseConfigured ? 'loading' : 'ready');

  useEffect(() => {
    if (!firebaseAuth) {
      setStatus('ready');
      return undefined;
    }
    return onAuthStateChanged(firebaseAuth, (nextUser) => {
      setFirebaseUser(nextUser);
      setStatus('ready');
    });
  }, []);

  useEffect(() => {
    if (!firebaseUser && !mockUser) {
      setRoles([]);
      return undefined;
    }
    let cancelled = false;
    apiRequest('/me')
      .then((response) => {
        if (!cancelled) setRoles(response.user?.roles || []);
      })
      .catch(() => {
        if (!cancelled) setRoles([]);
      });
    return () => { cancelled = true; };
  }, [firebaseUser, mockUser]);

  const signIn = useCallback(async () => {
    if (!firebaseAuth) throw new Error('Google sign-in is not configured yet.');
    await signInWithPopup(firebaseAuth, new GoogleAuthProvider());
  }, []);

  const signOut = useCallback(async () => {
    if (firebaseAuth) await firebaseSignOut(firebaseAuth);
    clearMockUser();
    setMockUserState(null);
  }, []);

  const devSignIn = useCallback(async (email) => {
    if (!isMockMode()) return;
    if (firebaseAuth && firebaseUser) await firebaseSignOut(firebaseAuth);
    const user = { email };
    setMockUser(user);
    setMockUserState(user);
  }, [firebaseUser]);

  const devSignOut = useCallback(async () => {
    if (firebaseAuth && firebaseUser) await firebaseSignOut(firebaseAuth);
    clearMockUser();
    setMockUserState(null);
  }, [firebaseUser]);

  const value = useMemo(() => {
    const user = firebaseUser
      || (mockUser ? { email: mockUser.email, displayName: 'Dev User', uid: 'mock-user' } : null);
    return {
      user,
      status,
      isAuthenticated: Boolean(user),
      signIn,
      signOut,
      devSignIn,
      devSignOut,
      isMockUser: Boolean(mockUser) && !firebaseUser,
      roles,
    };
  }, [firebaseUser, mockUser, roles, status, signIn, signOut, devSignIn, devSignOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
