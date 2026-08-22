const API_BASE = '/api';
import { firebaseAuth } from './firebase';

export async function apiRequest(path, options = {}) {
  const token = firebaseAuth?.currentUser ? await firebaseAuth.currentUser.getIdToken() : null;
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? {
        Authorization: `Bearer ${token}`,
        'X-Firebase-Token': token,
      } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  let body = null;
  try {
    body = await response.json();
  } catch {
    // Some platform errors do not return JSON.
  }

  if (!response.ok) {
    const error = new Error(body?.error || 'Something went wrong. Please try again.');
    error.status = response.status;
    throw error;
  }

  return body;
}
