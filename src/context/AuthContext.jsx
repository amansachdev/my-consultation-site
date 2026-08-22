import { useEffect, useMemo, useState } from 'react';
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { AuthContext } from './auth-context';
import { firebaseAuth, firebaseConfigured } from '../lib/firebase';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(firebaseConfigured ? 'loading' : 'ready');

  useEffect(() => {
    if (!firebaseAuth) return undefined;
    return onAuthStateChanged(firebaseAuth, (nextUser) => {
      setUser(nextUser);
      setStatus('ready');
    });
  }, []);

  const signIn = async () => {
    if (!firebaseAuth) throw new Error('Google sign-in is not configured yet.');
    await signInWithPopup(firebaseAuth, new GoogleAuthProvider());
  };

  const signOut = async () => {
    if (firebaseAuth) await firebaseSignOut(firebaseAuth);
  };

  const value = useMemo(
    () => ({
      user,
      status,
      isAuthenticated: Boolean(user),
      signIn,
      signOut,
    }),
    [status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
