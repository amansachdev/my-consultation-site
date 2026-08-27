const API_BASE = '/api';
import { firebaseAuth } from './firebase';
import { getMockToken } from './dev-auth';

export async function apiRequest(path, options = {}) {
  let token = null;
  if (firebaseAuth?.currentUser) {
    token = await firebaseAuth.currentUser.getIdToken();
  }
  if (!token) {
    token = getMockToken();
  }
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
