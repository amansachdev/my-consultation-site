import { app } from '@azure/functions';
import { CosmosClient } from '@azure/cosmos';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { scoreAssessment } from './scoring.js';
import { verifySignature, validateBooking, cleanText, cleanPayment } from './validation.js';

const DATABASE_NAME = process.env.COSMOS_DB_DATABASE || 'antaran';
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const BOOKING_NOTIFICATION_TO = process.env.BOOKING_NOTIFICATION_TO || 'antaran.health@gmail.com';
const BOOKING_FROM_EMAIL = process.env.BOOKING_FROM_EMAIL || '';
const GOOGLE_CALENDAR_CLIENT_ID = process.env.GOOGLE_CALENDAR_CLIENT_ID || '';
const GOOGLE_CALENDAR_CLIENT_SECRET = process.env.GOOGLE_CALENDAR_CLIENT_SECRET || '';
const GOOGLE_CALENDAR_REFRESH_TOKEN = process.env.GOOGLE_CALENDAR_REFRESH_TOKEN || '';
const GOOGLE_CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'primary';
const PAYMENTS_ENABLED = process.env.PAYMENTS_ENABLED === 'true';
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || '';
const CONSULTATION_AMOUNT_PAISE = 50000;
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'sachdevaman7@gmail.com,10medha@gmail.com,antaran.health@gmail.com')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);
const AVAILABILITY_ID = 'default';
const AVAILABILITY_TIMEZONE = 'Asia/Kolkata';
const AVAILABILITY_HORIZON_DAYS = 60;
const CLINICIAN_EMAILS = (process.env.CLINICIAN_EMAILS || 'antaran.health@gmail.com')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);
const ASSESSMENT_CONSENT_VERSION = 'assessment-storage-v1';
const ACCOUNT_CONSENT_VERSION = 'account-storage-v1';
const BOOKING_CONSENT_VERSION = 'booking-contact-v1';

let cosmosDatabase;
let firebaseAuth;
let googleAccessToken;
let googleAccessTokenExpiresAt = 0;

const FOUNDER_CLINICIAN = { name: 'Dr. Medha', registrationNumber: 'KMC: 143480' };
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_TRACKED_KEYS = 5000;
const rateLimitBuckets = new Map();

function json(body, status = 200, headers = {}) {
  return {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
    jsonBody: body,
  };
}

function getClientIp(request) {
  const forwarded = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim();
  return forwarded || request.headers.get('x-azure-clientip') || 'unknown';
}

function pruneRateLimitBuckets(now) {
  if (rateLimitBuckets.size <= RATE_LIMIT_MAX_TRACKED_KEYS) return;
  for (const [key, bucket] of rateLimitBuckets) {
    if (now - bucket.windowStart >= RATE_LIMIT_WINDOW_MS) rateLimitBuckets.delete(key);
  }
  if (rateLimitBuckets.size > RATE_LIMIT_MAX_TRACKED_KEYS) rateLimitBuckets.clear();
}

function rateLimit(request, scope, limit) {
  const now = Date.now();
  pruneRateLimitBuckets(now);
  const key = `${scope}|${getClientIp(request)}`;
  const bucket = rateLimitBuckets.get(key);
  if (!bucket || now - bucket.windowStart >= RATE_LIMIT_WINDOW_MS) {
    rateLimitBuckets.set(key, { windowStart: now, count: 1 });
    return null;
  }
  bucket.count += 1;
  if (bucket.count <= limit) return null;
  const retryAfter = Math.max(1, Math.ceil((bucket.windowStart + RATE_LIMIT_WINDOW_MS - now) / 1000));
  return json({ error: 'Too many requests. Please wait a few minutes and try again.' }, 429, { 'Retry-After': String(retryAfter) });
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

async function readProviderByEmail(email) {
  const { resources } = await (await providerStore()).items.query({
    query: 'SELECT TOP 1 * FROM c WHERE c.email = @email',
    parameters: [{ name: '@email', value: email.toLowerCase() }],
  }).fetchAll();
  return resources[0] || null;
}

async function requirePrincipal(request) {
  const principal = await getPrincipal(request);
  if (!principal) return { response: json({ error: 'Sign-in is required.' }, 401) };
  return { principal };
}

function isClinician(principal) {
  return principal && CLINICIAN_EMAILS.includes(principal.userDetails.toLowerCase());
}

function isAdmin(principal) {
  return principal && ADMIN_EMAILS.includes(principal.userDetails.toLowerCase());
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

let providersContainer;

async function providerStore() {
  if (providersContainer) return providersContainer;
  const { container: store } = await getDatabase().containers.createIfNotExists({ id: 'providers', partitionKey: '/id' });
  providersContainer = store;
  return providersContainer;
}

function emptyAvailability() {
  return {
    id: AVAILABILITY_ID,
    timezone: AVAILABILITY_TIMEZONE,
    durationMinutes: 30,
    enabled: false,
    weekly: {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    },
    blockedDates: [],
    blockedSlots: [],
  };
}

async function readAvailability() {
  try {
    const { resource } = await container('availability').item(AVAILABILITY_ID, AVAILABILITY_ID).read();
    return resource || emptyAvailability();
  } catch (error) {
    if (error.code === 404) return emptyAvailability();
    throw error;
  }
}

function isTime(value) {
  return typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function cleanAvailability(body) {
  const source = body || {};
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const weekly = Object.fromEntries(days.map((day) => {
    const ranges = Array.isArray(source.weekly?.[day]) ? source.weekly[day].slice(0, 1) : [];
    const validRanges = ranges.filter((range) => isTime(range?.start) && isTime(range?.end) && range.start < range.end)
      .map((range) => ({ start: range.start, end: range.end }));
    return [day, validRanges];
  }));
  return {
    id: AVAILABILITY_ID,
    timezone: AVAILABILITY_TIMEZONE,
    durationMinutes: 30,
    enabled: source.enabled === true,
    weekly,
    blockedDates: Array.isArray(source.blockedDates) ? source.blockedDates.filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date)).slice(0, 366) : [],
    blockedSlots: Array.isArray(source.blockedSlots) ? source.blockedSlots.filter((slot) => /^\d{4}-\d{2}-\d{2}\|([01]\d|2[0-3]):[0-5]\d$/.test(slot)).slice(0, 1000) : [],
    updatedAt: new Date().toISOString(),
  };
}

function istDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: AVAILABILITY_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  return Object.fromEntries(parts.filter(({ type }) => type !== 'literal').map(({ type, value }) => [type, value]));
}

function dateFromParts(year, month, day) {
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function getSlotsForDate(availability, date, reservedKeys) {
  if (!availability.enabled || availability.blockedDates.includes(date)) return [];
  const weekday = new Intl.DateTimeFormat('en-US', { timeZone: AVAILABILITY_TIMEZONE, weekday: 'long' }).format(date).toLowerCase();
  const ranges = availability.weekly[weekday] || [];
  const now = istDateParts();
  const todayString = `${now.year}-${now.month}-${now.day}`;
  const nowTime = `${now.hour}:${now.minute}`;
  const dateString = formatDate(date);
  const slots = [];
  for (const range of ranges) {
    let cursor = range.start;
    while (cursor < range.end) {
      const nextMinutes = Number(cursor.slice(0, 2)) * 60 + Number(cursor.slice(3)) + availability.durationMinutes;
      if (nextMinutes > 24 * 60 || nextMinutes > Number(range.end.slice(0, 2)) * 60 + Number(range.end.slice(3))) break;
      const slotKey = `${dateString}|${cursor}`;
      const isPast = dateString === todayString && cursor <= nowTime;
      if (!isPast && !availability.blockedSlots.includes(slotKey) && !reservedKeys.has(slotKey)) {
        slots.push({ date: dateString, time: cursor, slotKey });
      }
      const hours = String(Math.floor(nextMinutes / 60)).padStart(2, '0');
      const minutes = String(nextMinutes % 60).padStart(2, '0');
      cursor = `${hours}:${minutes}`;
    }
  }
  return slots;
}

async function readReservedSlotKeys(fromDate, toDate, context) {
  try {
    const { resources } = await container('slotReservations').items.query({
      query: 'SELECT c.slotKey FROM c WHERE c.slotKey >= @from AND c.slotKey <= @to',
      parameters: [
        { name: '@from', value: `${fromDate}|` },
        { name: '@to', value: `${toDate}|~` },
      ],
    }).fetchAll();
    return new Set(resources.map((item) => item.slotKey).filter(Boolean));
  } catch (error) {
    if (error.code === 404) return new Set();
    context?.warn('Reserved slot lookup failed; availability may show slots that are already requested.');
    return new Set();
  }
}

async function getAvailableSlots(context) {
  const availability = await readAvailability();
  const todayParts = istDateParts();
  const today = dateFromParts(todayParts.year, todayParts.month, todayParts.day);
  const lastDay = new Date(today);
  lastDay.setUTCDate(today.getUTCDate() + AVAILABILITY_HORIZON_DAYS - 1);
  const reservedKeys = await readReservedSlotKeys(formatDate(today), formatDate(lastDay), context);
  const slots = [];
  for (let offset = 0; offset < AVAILABILITY_HORIZON_DAYS; offset += 1) {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() + offset);
    slots.push(...getSlotsForDate(availability, date, reservedKeys));
  }
  return { availability, slots };
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

function paymentError() {
  return new Error('Payments are not configured for this environment.');
}

async function razorpayRequest(path, body) {
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) throw paymentError();
  const response = await fetch(`https://api.razorpay.com/v1${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Razorpay request failed with status ${response.status}.`);
  return response.json();
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

const PROVIDER_TYPES = ['psychiatrist', 'psychologist', 'therapist', 'counsellor', 'other'];
const PROVIDER_STATUSES = ['pending_review', 'verified', 'rejected', 'suspended'];

function cleanProvider(body) {
  const email = cleanText(body.email, 160).toLowerCase();
  const professionalType = cleanText(body.professionalType, 40).toLowerCase();
  return {
    fullName: cleanText(body.fullName, 120),
    email,
    phone: cleanText(body.phone, 30),
    professionalType: PROVIDER_TYPES.includes(professionalType) ? professionalType : 'other',
    registrationNumber: cleanText(body.registrationNumber, 80),
    registrationCouncil: cleanText(body.registrationCouncil, 120),
    qualifications: cleanText(body.qualifications, 240),
    specializations: cleanText(body.specializations, 240),
  };
}

function isValidProvider(provider) {
  return provider.fullName && provider.email.includes('@') && provider.registrationNumber && provider.registrationCouncil && provider.qualifications;
}

async function readVerifiedProvider(principal) {
  const provider = await readProviderByEmail(principal.userDetails);
  return provider?.status === 'verified' ? provider : null;
}

async function canAccessClinicianTools(principal) {
  return isClinician(principal) || isAdmin(principal) || Boolean(await readVerifiedProvider(principal));
}

const PRESCRIPTION_MEDICINE_FIELDS = ['name', 'strength', 'frequency', 'duration', 'instructions'];
const PRESCRIPTION_MEDICINE_LIMITS = { name: 120, strength: 60, frequency: 80, duration: 60, instructions: 240 };
let prescriptionsContainer;

async function prescriptionStore() {
  if (prescriptionsContainer) return prescriptionsContainer;
  const { container: store } = await getDatabase().containers.createIfNotExists({ id: 'prescriptions', partitionKey: '/id' });
  prescriptionsContainer = store;
  return prescriptionsContainer;
}

function cleanPrescription(body) {
  const source = body || {};
  const patientName = cleanText(source.patient?.name, 120);
  const age = Number(source.patient?.age);
  const prescribedFor = cleanText(source.date, 10);
  const history = cleanText(source.history, 1000);
  const medicines = Array.isArray(source.medicines) ? source.medicines.slice(0, 20) : [];
  const cleanedMedicines = medicines.map((medicine) => Object.fromEntries(
    PRESCRIPTION_MEDICINE_FIELDS.map((field) => [field, cleanText(medicine?.[field], PRESCRIPTION_MEDICINE_LIMITS[field])]),
  ));
  const complete = cleanedMedicines.every((medicine) => PRESCRIPTION_MEDICINE_FIELDS.every((field) => medicine[field]));
  if (!patientName || !Number.isInteger(age) || age < 18 || age > 120 || !/^\d{4}-\d{2}-\d{2}$/.test(prescribedFor) || cleanedMedicines.length === 0 || !complete) return null;
  return { patientName, patientAge: age, prescribedFor, history, medicines: cleanedMedicines };
}

function bookingResponsePayload(record) {
  return {
    id: record.id,
    status: record.status,
    meetingStatus: record.meetingStatus,
    meetingUrl: record.meetingUrl || null,
    calendarAddUrl: record.calendarAddUrl || null,
    meetingStartAt: record.meetingStartAt || null,
    notificationStatus: record.notificationStatus,
  };
}

async function readBookingById(bookingId) {
  const { resources } = await container('bookingRequests').items.query({
    query: 'SELECT TOP 1 * FROM c WHERE c.id = @id',
    parameters: [{ name: '@id', value: bookingId }],
  }).fetchAll();
  return resources[0] || null;
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
        `Add to calendar: ${booking.calendarAddUrl || 'Not available yet'}`,
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
        booking.calendarAddUrl ? `Add to your Google Calendar: ${booking.calendarAddUrl}` : '',
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

function getMeetingTimes(booking, durationMinutes) {
  const start = new Date(`${booking.preferredDate}T${booking.preferredTime}:00+05:30`);
  if (Number.isNaN(start.getTime())) return null;
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
  return { start: start.toISOString(), end: end.toISOString() };
}

function getCalendarAddUrl(booking, times, meetingUrl) {
  const format = (value) => value.replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const url = new globalThis.URL('https://calendar.google.com/calendar/render');
  url.searchParams.set('action', 'TEMPLATE');
  url.searchParams.set('text', `Antaran Psychiatric Consultation - ${booking.fullName}`);
  url.searchParams.set('dates', `${format(times.start)}/${format(times.end)}`);
  url.searchParams.set('details', `Antaran online psychiatric consultation.\n\nGoogle Meet: ${meetingUrl}`);
  url.searchParams.set('location', meetingUrl);
  return url.toString();
}

async function createGoogleMeeting(booking, durationMinutes) {
  const accessToken = await getGoogleAccessToken();
  if (!accessToken) return { meetingStatus: 'not_configured' };
  const times = getMeetingTimes(booking, durationMinutes);
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
  return { meetingStatus: 'created', meetingUrl, calendarEventId: event.id, calendarEventUrl: event.htmlLink || null, calendarAddUrl: getCalendarAddUrl(booking, times, meetingUrl), meetingStartAt: times.start, meetingEndAt: times.end };
}

app.http('me', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'me',
  handler: async (request) => {
    const principal = await getPrincipal(request);
    if (!principal) return json({ authenticated: false, user: null });
    const roles = [];
    if (isAdmin(principal)) roles.push('admin');
    if (isClinician(principal)) {
      roles.push('clinician');
    } else {
      try {
        if (await readVerifiedProvider(principal)) roles.push('clinician');
      } catch {
        // Role enrichment must not make the identity endpoint unavailable.
      }
    }
    return json({
      authenticated: true,
      user: { id: principal.userId, email: principal.userDetails, provider: principal.identityProvider, roles },
    });
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

app.http('clinicianAccess', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'clinician/access',
  handler: async (request) => {
    const principal = await getPrincipal(request);
    if (!principal) return json({ error: 'Sign-in is required.' }, 401);
    if (isClinician(principal)) {
      return json({ clinician: { email: principal.userDetails, name: FOUNDER_CLINICIAN.name, registrationNumber: FOUNDER_CLINICIAN.registrationNumber } });
    }
    try {
      const provider = await readVerifiedProvider(principal);
      if (provider) return json({ clinician: provider });
      return json({ error: 'Verified clinician access is required.' }, 403);
    } catch (error) {
      return json({ error: error.message === 'Cosmos DB is not configured.' ? 'Provider access is not configured yet.' : 'Could not verify clinician access.' }, 503);
    }
  },
});

app.http('workspaceAccess', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'workspace-access',
  handler: async (request) => {
    const principal = await getPrincipal(request);
    if (!principal) return json({ error: 'Sign-in is required.' }, 401);
    if (!isAdmin(principal)) return json({ error: 'Admin access is required.' }, 403);
    return json({ admin: { email: principal.userDetails } });
  },
});

app.http('workspaceAvailability', {
  methods: ['GET', 'PUT'],
  authLevel: 'anonymous',
  route: 'workspace-availability',
  handler: async (request, context) => {
    const principal = await getPrincipal(request);
    if (!principal) return json({ error: 'Sign-in is required.' }, 401);
    if (!isAdmin(principal)) return json({ error: 'Admin access is required.' }, 403);
    try {
      if (request.method === 'GET') return json({ availability: await readAvailability() });
      const availability = cleanAvailability(await request.json());
      await container('availability').items.upsert(availability);
      return json({ availability });
    } catch (error) {
      return handleServerError(context, error);
    }
  },
});

app.http('providers', {
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  route: 'providers',
  handler: async (request, context) => {
    const principal = await getPrincipal(request);
    if (!principal || !isAdmin(principal)) return json({ error: 'Admin access is required.' }, 403);
    try {
      const providers = await providerStore();
      if (request.method === 'GET') {
        const { resources } = await providers.items.query('SELECT * FROM c ORDER BY c.createdAt DESC').fetchAll();
        return json({ providers: resources });
      }
      const provider = cleanProvider(await request.json());
      if (!isValidProvider(provider)) return json({ error: 'Name, email, registration details, and qualifications are required.' }, 400);
      const existing = await readProviderByEmail(provider.email);
      if (existing) return json({ error: 'A provider with this email already exists.' }, 409);
      const now = new Date().toISOString();
      const record = {
        id: crypto.randomUUID(),
        ...provider,
        status: 'pending_review',
        createdBy: principal.userId,
        createdAt: now,
        updatedAt: now,
      };
      await providers.items.create(record);
      return json({ provider: record }, 201);
    } catch (error) {
      return handleServerError(context, error);
    }
  },
});

app.http('providerStatus', {
  methods: ['PATCH'],
  authLevel: 'anonymous',
  route: 'providers/{id}/status',
  handler: async (request, context) => {
    const principal = await getPrincipal(request);
    if (!principal || !isAdmin(principal)) return json({ error: 'Admin access is required.' }, 403);
    try {
      const status = cleanText((await request.json()).status, 30);
      if (!PROVIDER_STATUSES.includes(status)) return json({ error: 'Invalid provider status.' }, 400);
      const providers = container('providers');
      const { resource } = await providers.item(request.params.id, request.params.id).read();
      if (!resource) return json({ error: 'Provider not found.' }, 404);
      const provider = { ...resource, status, updatedAt: new Date().toISOString(), reviewedBy: principal.userId };
      await providers.items.upsert(provider);
      return json({ provider });
    } catch (error) {
      if (error.code === 404) return json({ error: 'Provider not found.' }, 404);
      return handleServerError(context, error);
    }
  },
});

app.http('publicAvailability', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'availability',
  handler: async (request, context) => {
    try {
      const { availability, slots } = await getAvailableSlots(context);
      return json({ enabled: availability.enabled, timezone: availability.timezone, durationMinutes: availability.durationMinutes, slots });
    } catch (error) {
      return handleServerError(context, error);
    }
  },
});

app.http('paymentConfig', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'payments/config',
  handler: async () => json({ enabled: PAYMENTS_ENABLED, currency: 'INR', amount: CONSULTATION_AMOUNT_PAISE }),
});

app.http('paymentOrder', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'payments/order',
  handler: async (request, context) => {
    if (!PAYMENTS_ENABLED) return json({ error: 'Payments are currently disabled.' }, 404);
    const limited = rateLimit(request, 'payments-order', 10);
    if (limited) return limited;
    try {
      const order = await razorpayRequest('/orders', {
        amount: CONSULTATION_AMOUNT_PAISE,
        currency: 'INR',
        receipt: `antaran-${crypto.randomUUID().replaceAll('-', '').slice(0, 24)}`,
        notes: { product: 'psychiatric-consultation', amountInr: '500' },
      });
      return json({ keyId: RAZORPAY_KEY_ID, orderId: order.id, amount: order.amount, currency: order.currency });
    } catch (error) {
      return handleServerError(context, error);
    }
  },
});

app.http('paymentVerify', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'payments/verify',
  handler: async (request) => {
    if (!PAYMENTS_ENABLED) return json({ error: 'Payments are currently disabled.' }, 404);
    const limited = rateLimit(request, 'payments-verify', 20);
    if (limited) return limited;
    const body = await request.json();
    const orderId = cleanText(body.orderId, 80);
    const paymentId = cleanText(body.paymentId, 80);
    const signature = cleanText(body.signature, 160);
    if (!orderId || !paymentId || !verifySignature(`${orderId}|${paymentId}`, signature, RAZORPAY_KEY_SECRET)) return json({ verified: false, error: 'Payment verification failed.' }, 400);
    return json({ verified: true, orderId, paymentId, amount: CONSULTATION_AMOUNT_PAISE, currency: 'INR' });
  },
});

app.http('paymentWebhook', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'payments/webhook',
  handler: async (request) => {
    if (!PAYMENTS_ENABLED) return json({ error: 'Payments are currently disabled.' }, 404);
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');
    if (!verifySignature(rawBody, signature, RAZORPAY_WEBHOOK_SECRET)) return json({ error: 'Webhook verification failed.' }, 401);
    JSON.parse(rawBody);
    return json({ received: true });
  },
});

app.http('bookings', {
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  route: 'bookings',
  handler: async (request, context) => {
    const principal = await getPrincipal(request);
    if (request.method === 'POST') {
      const limited = rateLimit(request, 'bookings', 5);
      if (limited) return limited;
    }
    try {
      const bookings = container('bookingRequests');
      if (request.method === 'GET') {
        if (!principal) return json({ error: 'Sign-in is required.' }, 401);
        const { resources } = await bookings.items.query({ query: 'SELECT * FROM c WHERE c.userId = @userId ORDER BY c.createdAt DESC', parameters: [{ name: '@userId', value: principal.userId }] }).fetchAll();
        return json({ bookings: resources });
      }
      const body = await request.json();
      if (body.bookingConsentGiven !== true || body.bookingConsentVersion !== BOOKING_CONSENT_VERSION) return json({ error: 'Booking contact consent is required.' }, 400);
      if (principal && (body.consentGiven !== true || body.consentVersion !== ACCOUNT_CONSENT_VERSION)) return json({ error: 'To save this booking to your signed-in account, please confirm account storage consent and submit again.' }, 400);
      const payment = cleanPayment(body);
      if (PAYMENTS_ENABLED && (!payment || !verifySignature(`${payment.orderId}|${payment.paymentId}`, payment.signature, RAZORPAY_KEY_SECRET))) return json({ error: 'A successful payment is required before confirming your booking.' }, 400);
      const booking = validateBooking(body);
      if (!booking) return json({ error: 'Please complete the required booking fields.' }, 400);
      const slotKey = `${booking.preferredDate}|${booking.preferredTime}`;
      const userId = principal?.userId || 'guest';
      const idempotencyKey = cleanText(body.idempotencyKey, 100);
      const existingReservation = await readUserItem('slotReservations', slotKey);
      if (existingReservation) {
        const ownsReservation = (idempotencyKey && existingReservation.idempotencyKey === idempotencyKey)
          || (userId !== 'guest' && existingReservation.userId === userId);
        if (ownsReservation) {
          const existingBooking = await readBookingById(existingReservation.bookingId);
          if (existingBooking) {
            return json({ booking: bookingResponsePayload(existingBooking), duplicate: true, message: 'This booking request was already received.' });
          }
          return json({ error: 'Your previous booking request is still being processed. Please try again shortly.' }, 409);
        }
        return json({ error: 'That slot has just been requested by someone else. Please choose another slot.' }, 409);
      }
      const { availability, slots } = await getAvailableSlots(context);
      if (!availability.enabled || !slots.some((slot) => slot.slotKey === slotKey)) return json({ error: 'That time is not currently available. Please choose another slot.' }, 409);
      const record = { id: crypto.randomUUID(), userId, isGuest: !principal, slotKey, ...booking, ...(payment ? { payment: { orderId: payment.orderId, paymentId: payment.paymentId, amount: CONSULTATION_AMOUNT_PAISE, currency: 'INR', status: 'verified' } } : {}), status: 'requested', meetingStatus: 'pending', notificationStatus: 'pending', bookingConsentVersion: BOOKING_CONSENT_VERSION, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      try {
        await container('slotReservations').items.create({ id: slotKey, slotKey, bookingId: record.id, userId, idempotencyKey, createdAt: record.createdAt });
        if (principal) await recordConsent(principal.userId, ACCOUNT_CONSENT_VERSION);
        await bookings.items.create(record);
      } catch (error) {
        if (error.code === 409) {
          const reservation = await readUserItem('slotReservations', slotKey);
          const ownsReservation = reservation && ((idempotencyKey && reservation.idempotencyKey === idempotencyKey) || (userId !== 'guest' && reservation.userId === userId));
          if (ownsReservation) {
            const existingBooking = await readBookingById(reservation.bookingId);
            if (existingBooking) return json({ booking: bookingResponsePayload(existingBooking), duplicate: true, message: 'This booking request was already received.' });
          }
          return json({ error: 'That slot has just been requested by someone else. Please choose another slot.' }, 409);
        }
        try { await container('slotReservations').item(slotKey, slotKey).delete(); } catch { /* Keep the original booking error. */ }
        throw error;
      }
      let meetingStatus = 'failed';
      try {
        const meeting = await createGoogleMeeting(record, availability.durationMinutes);
        meetingStatus = meeting.meetingStatus;
        if (meetingStatus === 'created') Object.assign(record, meeting);
      } catch (error) { context.warn(`Booking ${record.id} was saved but meeting creation failed.`); }
      let notificationStatus = 'failed';
      try { notificationStatus = await notifyBooking(record); } catch (error) { context.warn(`Booking ${record.id} was saved but notification failed.`); }
      record.meetingStatus = meetingStatus;
      record.notificationStatus = notificationStatus;
      record.updatedAt = new Date().toISOString();
      await bookings.items.upsert(record);
      return json({ booking: bookingResponsePayload(record), message: 'Your booking request has been received.' }, 201);
    } catch (error) {
      return handleServerError(context, error);
    }
  },
});

app.http('prescriptions', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'prescriptions',
  handler: async (request, context) => {
    const auth = await requirePrincipal(request);
    if (auth.response) return auth.response;
    try {
      if (!await canAccessClinicianTools(auth.principal)) return json({ error: 'Verified clinician access is required.' }, 403);
      const prescription = cleanPrescription(await request.json());
      if (!prescription) return json({ error: 'Patient details and complete medicine fields are required.' }, 400);
      const record = {
        id: crypto.randomUUID(),
        ...prescription,
        clinicianUserId: auth.principal.userId,
        clinicianEmail: auth.principal.userDetails,
        createdAt: new Date().toISOString(),
      };
      await (await prescriptionStore()).items.create(record);
      return json({ prescription: { id: record.id, createdAt: record.createdAt } }, 201);
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
