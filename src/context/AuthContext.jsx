import { useCallback, useEffect, useMemo, useState } from 'react';
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { AuthContext } from './auth-context';
import { firebaseAuth, firebaseConfigured } from '../lib/firebase';
import { clearMockUser, getMockUser, isMockMode, setMockUser } from '../lib/dev-auth';

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [mockUser, setMockUserState] = useState(() => getMockUser());
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

  const signIn = useCallback(async () => {
    if (!firebaseAuth) throw new Error('Google sign-in is not configured yet.');
    await signInWithPopup(firebaseAuth, new GoogleAuthProvider());
  }, []);

  const signOut = useCallback(async () => {
    if (firebaseAuth) await firebaseSignOut(firebaseAuth);
    clearMockUser();
    setMockUserState(null);
  }, []);

  const devSignIn = useCallback((email) => {
    if (!isMockMode()) return;
    const user = { email };
    setMockUser(user);
    setMockUserState(user);
  }, []);

  const devSignOut = useCallback(() => {
    clearMockUser();
    setMockUserState(null);
  }, []);

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
    };
  }, [firebaseUser, mockUser, status, signIn, signOut, devSignIn, devSignOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
