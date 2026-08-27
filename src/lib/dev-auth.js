const USER_KEY = 'antaran-dev-user';
const TOKEN_KEY = 'antaran-dev-token';

function base64UrlEncode(value) {
  return globalThis
    .btoa(value)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function createMockToken(email) {
  const header = base64UrlEncode(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const payload = base64UrlEncode(
    JSON.stringify({ sub: 'mock-user', email, iat: Math.floor(Date.now() / 1000) }),
  );
  return `${header}.${payload}.`;
}

export function isMockMode() {
  return import.meta.env.VITE_ENABLE_MSW === 'true';
}

export function getMockUser() {
  if (!isMockMode()) return null;
  try {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function setMockUser(user) {
  if (!isMockMode()) return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(TOKEN_KEY, createMockToken(user.email));
}

export function clearMockUser() {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

export function getMockToken() {
  if (!isMockMode()) return null;
  return localStorage.getItem(TOKEN_KEY);
}
