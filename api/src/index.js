import { app } from '@azure/functions';
import { CosmosClient } from '@azure/cosmos';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const DATABASE_NAME = process.env.COSMOS_DB_DATABASE || 'antaran';
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const BOOKING_NOTIFICATION_TO = process.env.BOOKING_NOTIFICATION_TO || 'antaran.health@gmail.com';
const BOOKING_FROM_EMAIL = process.env.BOOKING_FROM_EMAIL || '';
const GOOGLE_CALENDAR_CLIENT_ID = process.env.GOOGLE_CALENDAR_CLIENT_ID || '';
const GOOGLE_CALENDAR_CLIENT_SECRET = process.env.GOOGLE_CALENDAR_CLIENT_SECRET || '';
const GOOGLE_CALENDAR_REFRESH_TOKEN = process.env.GOOGLE_CALENDAR_REFRESH_TOKEN || '';
const GOOGLE_CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'primary';
const ASSESSMENT_CONSENT_VERSION = 'assessment-storage-v1';
const ACCOUNT_CONSENT_VERSION = 'account-storage-v1';
const BOOKING_CONSENT_VERSION = 'booking-contact-v1';

let cosmosDatabase;
let firebaseAuth;
let googleAccessToken;
let googleAccessTokenExpiresAt = 0;

function json(body, status = 200) {
  return {
    status,
    headers: { 'Content-Type': 'application/json' },
    jsonBody: body,
  };
}

function getFirebaseAuth() {
  if (firebaseAuth) return firebaseAuth;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!projectId || !clientEmail || !privateKey) throw new Error('Firebase Auth is not configured.');
  const firebaseApp = getApps().length ? getApps()[0] : initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  firebaseAuth = getAuth(firebaseApp);
  return firebaseAuth;
}

async function getPrincipal(request) {
  const header = request.headers.get('x-firebase-token')
    ? `Bearer ${request.headers.get('x-firebase-token')}`
    : request.headers.get('authorization') || '';
  if (!header.startsWith('Bearer ')) return null;
  try {
    const decoded = await getFirebaseAuth().verifyIdToken(header.slice(7));
    return {
      userId: decoded.uid,
      userDetails: decoded.email || '',
      identityProvider: decoded.firebase?.sign_in_provider || 'google.com',
    };
  } catch {
    return null;
  }
}

async function requirePrincipal(request) {
  const principal = await getPrincipal(request);
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
  if (error.message === 'Firebase Auth is not configured.') {
    return json({ error: 'Sign-in is not configured yet.' }, 503);
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

async function notifyBooking(booking) {
  if (!RESEND_API_KEY || !BOOKING_FROM_EMAIL) return 'not_configured';
  const messages = [
    {
      to: BOOKING_NOTIFICATION_TO,
      subject: `New booking request: ${booking.fullName}`,
      text: [
        'A new booking request was submitted on antaran.online.',
        '',
        `Name: ${booking.fullName}`,
        `Phone: ${booking.phone}`,
        `Email: ${booking.email}`,
        `Consultation: ${booking.consultationType}`,
        `Preferred date: ${booking.preferredDate}`,
        `Preferred time: ${booking.preferredTime} IST`,
        `Add to calendar: ${booking.calendarEventUrl || 'Not available yet'}`,
        `Meeting link: ${booking.meetingUrl || 'Not created yet'}`,
        `Booking ID: ${booking.id}`,
      ].join('\n'),
    },
    {
      to: booking.email,
      subject: 'Your Antaran consultation request',
      text: [
        'Your consultation request has been received by Antaran.',
        '',
        `Consultation: ${booking.consultationType}`,
        `Requested date: ${booking.preferredDate}`,
        `Requested time: ${booking.preferredTime} IST`,
        '',
        booking.calendarEventUrl ? `Add to your Google Calendar: ${booking.calendarEventUrl}` : '',
        booking.meetingUrl ? `Join your Google Meet: ${booking.meetingUrl}` : 'The clinic team will follow up with your meeting details.',
        '',
        'The clinic team will confirm the timing with you.',
      ].join('\n'),
    },
  ];
  const responses = await Promise.all(messages.map((message) => fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `Antaran bookings <${BOOKING_FROM_EMAIL}>`,
      to: [message.to],
      reply_to: 'antaran.health@gmail.com',
      subject: message.subject,
      text: message.text,
    }),
  })));
  if (responses.some((response) => !response.ok)) return responses.every((response) => !response.ok) ? 'failed' : 'partial';
  return 'sent';
}

async function getGoogleAccessToken() {
  if (googleAccessToken && Date.now() < googleAccessTokenExpiresAt) return googleAccessToken;
  if (!GOOGLE_CALENDAR_CLIENT_ID || !GOOGLE_CALENDAR_CLIENT_SECRET || !GOOGLE_CALENDAR_REFRESH_TOKEN) return null;
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_CALENDAR_CLIENT_ID,
      client_secret: GOOGLE_CALENDAR_CLIENT_SECRET,
      refresh_token: GOOGLE_CALENDAR_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });
  if (!response.ok) throw new Error(`Google token refresh failed with status ${response.status}.`);
  const payload = await response.json();
  googleAccessToken = payload.access_token;
  googleAccessTokenExpiresAt = Date.now() + Math.max((payload.expires_in || 3600) - 60, 60) * 1000;
  return googleAccessToken;
}

function getMeetingTimes(booking) {
  const start = new Date(`${booking.preferredDate}T${booking.preferredTime}:00+05:30`);
  if (Number.isNaN(start.getTime())) return null;
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  return { start: start.toISOString(), end: end.toISOString() };
}

async function createGoogleMeeting(booking) {
  const accessToken = await getGoogleAccessToken();
  if (!accessToken) return { meetingStatus: 'not_configured' };
  const times = getMeetingTimes(booking);
  if (!times) throw new Error('Booking date or time is invalid for Google Calendar.');
  const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(GOOGLE_CALENDAR_ID)}/events?conferenceDataVersion=1&sendUpdates=all`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      summary: `Antaran Psychiatric Consultation - ${booking.fullName}`,
      description: 'Antaran online psychiatric consultation.',
      start: { dateTime: times.start, timeZone: 'Asia/Kolkata' },
      end: { dateTime: times.end, timeZone: 'Asia/Kolkata' },
      attendees: [{ email: booking.email }],
      conferenceData: { createRequest: { requestId: crypto.randomUUID(), conferenceSolutionKey: { type: 'hangoutsMeet' } } },
    }),
  });
  if (!response.ok) throw new Error(`Google Calendar event creation failed with status ${response.status}.`);
  const event = await response.json();
  const meetingUrl = event.conferenceData?.entryPoints?.find((entry) => entry.entryPointType === 'video')?.uri;
  if (!meetingUrl) throw new Error('Google Calendar created an event without a Meet link.');
  return { meetingStatus: 'created', meetingUrl, calendarEventId: event.id, calendarEventUrl: event.htmlLink || null, meetingStartAt: times.start, meetingEndAt: times.end };
}

app.http('me', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'me',
  handler: async (request) => {
    const principal = await getPrincipal(request);
    return json({ authenticated: Boolean(principal), user: principal ? { id: principal.userId, email: principal.userDetails, provider: principal.identityProvider } : null });
  },
});

app.http('profile', {
  methods: ['GET', 'PUT'],
  authLevel: 'anonymous',
  route: 'profile',
  handler: async (request, context) => {
    const auth = await requirePrincipal(request);
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
    const principal = await getPrincipal(request);
    try {
      const bookings = container('bookingRequests');
      if (request.method === 'GET') {
        if (!principal) return json({ error: 'Sign-in is required.' }, 401);
        const { resources } = await bookings.items.query({ query: 'SELECT * FROM c WHERE c.userId = @userId ORDER BY c.createdAt DESC', parameters: [{ name: '@userId', value: principal.userId }] }).fetchAll();
        return json({ bookings: resources });
      }
      const body = await request.json();
      if (body.bookingConsentGiven !== true || body.bookingConsentVersion !== BOOKING_CONSENT_VERSION) return json({ error: 'Booking contact consent is required.' }, 400);
      if (principal && (body.consentGiven !== true || body.consentVersion !== ACCOUNT_CONSENT_VERSION)) return json({ error: 'Account storage consent is required.' }, 400);
      const booking = validateBooking(body);
      if (!booking) return json({ error: 'Please complete the required booking fields.' }, 400);
      const userId = principal?.userId || 'guest';
      const record = { id: crypto.randomUUID(), userId, isGuest: !principal, ...booking, status: 'requested', meetingStatus: 'pending', notificationStatus: 'pending', bookingConsentVersion: BOOKING_CONSENT_VERSION, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      if (principal) await recordConsent(principal.userId, ACCOUNT_CONSENT_VERSION);
      await bookings.items.create(record);
      let meetingStatus = 'failed';
      try {
        const meeting = await createGoogleMeeting(record);
        meetingStatus = meeting.meetingStatus;
        if (meetingStatus === 'created') Object.assign(record, meeting);
      } catch (error) { context.warn(`Booking ${record.id} was saved but meeting creation failed.`); }
      let notificationStatus = 'failed';
      try { notificationStatus = await notifyBooking(record); } catch (error) { context.warn(`Booking ${record.id} was saved but notification failed.`); }
      record.meetingStatus = meetingStatus;
      record.notificationStatus = notificationStatus;
      record.updatedAt = new Date().toISOString();
      await bookings.items.upsert(record);
      return json({ booking: { id: record.id, status: record.status, meetingStatus, meetingUrl: record.meetingUrl || null, calendarEventUrl: record.calendarEventUrl || null, meetingStartAt: record.meetingStartAt || null, notificationStatus }, message: 'Your booking request has been received.' }, 201);
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
    const auth = await requirePrincipal(request);
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
