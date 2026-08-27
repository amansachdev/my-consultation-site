const ADMIN_EMAILS = new Set(
  (import.meta.env.VITE_ADMIN_EMAILS || 'sachdevaman7@gmail.com,10medha@gmail.com,antaran.health@gmail.com')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
);

const CLINICIAN_EMAILS = new Set(
  (import.meta.env.VITE_CLINICIAN_EMAILS || 'antaran.health@gmail.com')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
);

function getBearerToken(request) {
  const auth = request.headers.get('authorization') || request.headers.get('x-firebase-token') || '';
  return auth.startsWith('Bearer ') ? auth.slice(7) : auth;
}

function decodeJwt(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(globalThis.atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

export function getPrincipal(request) {
  const token = getBearerToken(request);
  if (!token) return null;
  const payload = decodeJwt(token);
  if (!payload?.email) return null;
  return {
    userId: payload.sub || payload.user_id || 'mock-user',
    email: payload.email,
  };
}

export function requireAuth(request) {
  const principal = getPrincipal(request);
  if (!principal) {
    return { response: { error: 'Sign-in is required.' }, status: 401 };
  }
  return { principal };
}

export function requireAdmin(request) {
  const auth = requireAuth(request);
  if (auth.response) return auth;
  if (!ADMIN_EMAILS.has(auth.principal.email.toLowerCase())) {
    return { response: { error: 'Admin access is required.' }, status: 403 };
  }
  return auth;
}

export function requireClinician(request) {
  const auth = requireAuth(request);
  if (auth.response) return auth;
  if (!CLINICIAN_EMAILS.has(auth.principal.email.toLowerCase())) {
    return { response: { error: 'Clinician access is required.' }, status: 403 };
  }
  return auth;
}
