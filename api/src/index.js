import { app } from '@azure/functions';
import { CosmosClient } from '@azure/cosmos';

const DATABASE_NAME = process.env.COSMOS_DB_DATABASE || 'antaran';
const GOOGLE_FORM_RESPONSE_URL = process.env.GOOGLE_FORM_RESPONSE_URL || '';
const ASSESSMENT_CONSENT_VERSION = 'assessment-storage-v1';
const ACCOUNT_CONSENT_VERSION = 'account-storage-v1';

let cosmosDatabase;

function json(body, status = 200) {
  return {
    status,
    headers: { 'Content-Type': 'application/json' },
    jsonBody: body,
  };
}

function getPrincipal(request) {
  const encodedPrincipal = request.headers.get('x-ms-client-principal');
  if (!encodedPrincipal) return null;

  try {
    const principal = JSON.parse(Buffer.from(encodedPrincipal, 'base64').toString('utf8'));
    return principal?.userId && principal?.userDetails ? principal : null;
  } catch {
    return null;
  }
}

function requirePrincipal(request) {
  const principal = getPrincipal(request);
  if (!principal) return { response: json({ error: 'Sign-in is required.' }, 401) };
  return { principal };
}

function getDatabase() {
  if (cosmosDatabase) return cosmosDatabase;
  const endpoint = process.env.COSMOS_DB_ENDPOINT;
  const key = process.env.COSMOS_DB_KEY;
  if (!endpoint || !key) throw new Error('Cosmos DB is not configured.');
  cosmosDatabase = new CosmosClient({ endpoint, key }).database(DATABASE_NAME);
  return cosmosDatabase;
}

function container(name) {
  return getDatabase().container(name);
}

async function readUserItem(name, userId) {
  try {
    const { resource } = await container(name).item(userId, userId).read();
    return resource || null;
  } catch (error) {
    if (error.code === 404) return null;
    throw error;
  }
}

async function recordConsent(userId, version) {
  await container('consents').items.upsert({
    id: `${userId}:${version}`,
    userId,
    consentVersion: version,
    consentedAt: new Date().toISOString(),
  });
}

function handleServerError(context, error) {
  context.error(error);
  if (error.message === 'Cosmos DB is not configured.') {
    return json({ error: 'Account storage is not configured yet.' }, 503);
  }
  return json({ error: 'We could not complete that request. Please try again.' }, 500);
}

function cleanText(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

function cleanProfile(body) {
  const age = body.age === '' || body.age === undefined ? '' : Number(body.age);
  return {
    fullName: cleanText(body.fullName, 120),
    age: Number.isInteger(age) && age >= 18 && age <= 120 ? age : '',
    city: cleanText(body.city, 80),
    state: cleanText(body.state, 80),
    phone: cleanText(body.phone, 30),
  };
}

function validateBooking(body) {
  const booking = {
    fullName: cleanText(body.fullName, 120),
    age: Number(body.age),
    phone: cleanText(body.phone, 30),
    email: cleanText(body.email, 160),
    consultationType: cleanText(body.consultationType, 80),
    preferredDate: cleanText(body.preferredDate, 20),
    preferredTime: cleanText(body.preferredTime, 20),
    message: cleanText(body.message, 1000),
  };
  const error = !booking.fullName || !Number.isInteger(booking.age) || booking.age < 18 || booking.age > 120 || !booking.phone || !booking.consultationType || !booking.preferredDate || !booking.preferredTime;
  return error ? null : booking;
}

function scoreAssessment(type, responses) {
  const expected = type === 'PHQ-9' ? 9 : type === 'GAD-7' ? 7 : 0;
  if (!expected || !Array.isArray(responses) || responses.length !== expected || responses.some((value) => !Number.isInteger(value) || value < 0 || value > 3)) return null;

  const score = responses.reduce((sum, value) => sum + value, 0);
  let severity = type === 'PHQ-9' ? 'Minimal depression' : 'Minimal anxiety';
  if (type === 'PHQ-9') {
    if (score >= 5) severity = 'Mild depression';
    if (score >= 10) severity = 'Moderate depression';
    if (score >= 15) severity = 'Moderately severe depression';
    if (score >= 20) severity = 'Severe depression';
  } else {
    if (score >= 5) severity = 'Mild anxiety';
    if (score >= 10) severity = 'Moderate anxiety';
    if (score >= 15) severity = 'Severe anxiety';
  }

  return {
    score,
    severity,
    isHighRisk: type === 'PHQ-9' ? responses[8] > 0 : score >= 15,
  };
}

async function forwardBooking(booking, user) {
  if (!GOOGLE_FORM_RESPONSE_URL) return false;
  const form = new URLSearchParams({
    'entry.1757509789': booking.fullName,
    'entry.1385558754': String(booking.age),
    'entry.272098946': booking.phone,
    'entry.1222143642': booking.email,
    'entry.1226581237': booking.consultationType,
    'entry.1538227956': booking.preferredDate,
    'entry.2033637864': booking.preferredTime,
    'entry.1615957077': booking.message,
  });
  form.set('entry.1615957077', `${booking.message}\nAccount email: ${user.userDetails}`.trim());
  const response = await fetch(GOOGLE_FORM_RESPONSE_URL, { method: 'POST', body: form, redirect: 'manual' });
  return response.ok || response.status === 302 || response.status === 303;
}

app.http('me', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'me',
  handler: async (request) => {
    const principal = getPrincipal(request);
    return json({ authenticated: Boolean(principal), user: principal ? { id: principal.userId, email: principal.userDetails, provider: principal.identityProvider } : null });
  },
});

app.http('profile', {
  methods: ['GET', 'PUT'],
  authLevel: 'anonymous',
  route: 'profile',
  handler: async (request, context) => {
    const auth = requirePrincipal(request);
    if (auth.response) return auth.response;
    try {
      if (request.method === 'GET') return json({ profile: await readUserItem('profiles', auth.principal.userId) });
      const body = await request.json();
      if (body.consentGiven !== true || body.consentVersion !== ACCOUNT_CONSENT_VERSION) return json({ error: 'Account storage consent is required.' }, 400);
      const profile = { id: auth.principal.userId, userId: auth.principal.userId, ...cleanProfile(body), updatedAt: new Date().toISOString() };
      await recordConsent(auth.principal.userId, ACCOUNT_CONSENT_VERSION);
      await container('profiles').items.upsert(profile);
      return json({ profile });
    } catch (error) {
      return handleServerError(context, error);
    }
  },
});

app.http('bookings', {
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  route: 'bookings',
  handler: async (request, context) => {
    const auth = requirePrincipal(request);
    if (auth.response) return auth.response;
    try {
      const bookings = container('bookingRequests');
      if (request.method === 'GET') {
        const { resources } = await bookings.items.query({ query: 'SELECT * FROM c WHERE c.userId = @userId ORDER BY c.createdAt DESC', parameters: [{ name: '@userId', value: auth.principal.userId }] }).fetchAll();
        return json({ bookings: resources });
      }
      const body = await request.json();
      if (body.consentGiven !== true || body.consentVersion !== ACCOUNT_CONSENT_VERSION) return json({ error: 'Account storage consent is required.' }, 400);
      const booking = validateBooking(body);
      if (!booking) return json({ error: 'Please complete the required booking fields.' }, 400);
      const record = { id: crypto.randomUUID(), userId: auth.principal.userId, ...booking, status: 'requested', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      await recordConsent(auth.principal.userId, ACCOUNT_CONSENT_VERSION);
      await bookings.items.create(record);
      let forwarded = false;
      try { forwarded = await forwardBooking(record, auth.principal); } catch (error) { context.warn(`Booking ${record.id} was saved but forwarding failed.`); }
      return json({ booking: record, forwarded });
    } catch (error) {
      return handleServerError(context, error);
    }
  },
});

app.http('assessments', {
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  route: 'assessments',
  handler: async (request, context) => {
    const auth = requirePrincipal(request);
    if (auth.response) return auth.response;
    try {
      const assessments = container('assessments');
      if (request.method === 'GET') {
        const { resources } = await assessments.items.query({ query: 'SELECT c.id, c.userId, c.assessmentType, c.responses, c.score, c.severity, c.isHighRisk, c.completedAt FROM c WHERE c.userId = @userId ORDER BY c.completedAt DESC', parameters: [{ name: '@userId', value: auth.principal.userId }] }).fetchAll();
        return json({ assessments: resources });
      }
      const body = await request.json();
      if (body.consentGiven !== true || body.consentVersion !== ASSESSMENT_CONSENT_VERSION) return json({ error: 'Assessment storage consent is required.' }, 400);
      const result = scoreAssessment(body.assessmentType, body.responses);
      if (!result) return json({ error: 'Assessment responses are invalid.' }, 400);
      const record = { id: crypto.randomUUID(), userId: auth.principal.userId, assessmentType: body.assessmentType, responses: body.responses, ...result, consentVersion: ASSESSMENT_CONSENT_VERSION, completedAt: new Date().toISOString() };
      await recordConsent(auth.principal.userId, ASSESSMENT_CONSENT_VERSION);
      await assessments.items.create(record);
      return json({ assessment: record }, 201);
    } catch (error) {
      return handleServerError(context, error);
    }
  },
});
