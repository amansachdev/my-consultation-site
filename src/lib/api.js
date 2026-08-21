const API_BASE = '/api';

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
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

