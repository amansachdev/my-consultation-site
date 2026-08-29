import { http, HttpResponse } from 'msw';
import { doctor } from '../constants';
import { getPrincipal, requireAdmin, requireAuth, requireClinician } from './auth';
import { mockAssessments, mockAvailability, mockBookings, mockProfile, reservedSlotKeys, updateAvailability, updateProfile } from './data';
import { generateSlots } from './slots';

const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

function isTime(value) {
  return typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function cleanAvailability(body) {
  const weekly = {};
  for (const day of DAY_KEYS) {
    const ranges = Array.isArray(body.weekly?.[day]) ? body.weekly[day].slice(0, 1) : [];
    weekly[day] = ranges
      .filter((range) => isTime(range?.start) && isTime(range?.end) && range.start < range.end)
      .map((range) => ({ start: range.start, end: range.end }));
  }
  return {
    enabled: body.enabled === true,
    weekly,
    blockedDates: Array.isArray(body.blockedDates)
      ? body.blockedDates.filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date)).slice(0, 366)
      : [],
    blockedSlots: Array.isArray(body.blockedSlots)
      ? body.blockedSlots.filter((slot) => /^\d{4}-\d{2}-\d{2}\|([01]\d|2[0-3]):[0-5]\d$/.test(slot)).slice(0, 1000)
      : [],
  };
}

function cleanProfile(body) {
  const age = body.age === '' || body.age === undefined ? '' : Number(body.age);
  return {
    fullName: String(body.fullName || '').trim().slice(0, 120),
    age: Number.isInteger(age) && age >= 18 && age <= 120 ? age : '',
    city: String(body.city || '').trim().slice(0, 80),
    state: String(body.state || '').trim().slice(0, 80),
    phone: String(body.phone || '').trim().slice(0, 30),
  };
}

function cleanText(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
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
  const isValid =
    booking.fullName &&
    Number.isInteger(booking.age) && booking.age >= 18 && booking.age <= 120 &&
    booking.phone &&
    booking.email &&
    booking.consultationType &&
    booking.preferredDate &&
    booking.preferredTime;
  return isValid ? booking : null;
}

function scoreAssessment(type, responses) {
  const expected = type === 'PHQ-9' ? 9 : type === 'GAD-7' ? 7 : 0;
  if (!expected || !Array.isArray(responses) || responses.length !== expected || responses.some((value) => !Number.isInteger(value) || value < 0 || value > 3)) {
    return null;
  }
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

export const handlers = [
  http.get('/api/availability', () => {
    const slots = generateSlots(mockAvailability);
    return HttpResponse.json({
      enabled: mockAvailability.enabled,
      timezone: mockAvailability.timezone,
      durationMinutes: mockAvailability.durationMinutes,
      slots,
    });
  }),

  http.get('/api/me', ({ request }) => {
    const principal = getPrincipal(request);
    return HttpResponse.json({
      authenticated: Boolean(principal),
      user: principal ? { id: principal.userId, email: principal.email, provider: 'google.com' } : null,
    });
  }),

  http.get('/api/workspace-access', ({ request }) => {
    const auth = requireAdmin(request);
    if (auth.response) return HttpResponse.json(auth.response, { status: auth.status });
    return HttpResponse.json({ admin: { email: auth.principal.email } });
  }),

  http.get('/api/workspace-availability', ({ request }) => {
    const auth = requireAdmin(request);
    if (auth.response) return HttpResponse.json(auth.response, { status: auth.status });
    return HttpResponse.json({ availability: mockAvailability });
  }),

  http.put('/api/workspace-availability', async ({ request }) => {
    const auth = requireAdmin(request);
    if (auth.response) return HttpResponse.json(auth.response, { status: auth.status });
    const body = await request.json();
    updateAvailability(cleanAvailability(body));
    return HttpResponse.json({ availability: mockAvailability });
  }),

  http.get('/api/clinician/access', ({ request }) => {
    const auth = requireClinician(request);
    if (auth.response) return HttpResponse.json(auth.response, { status: auth.status });
    return HttpResponse.json({
      clinician: {
        email: auth.principal.email,
        name: doctor.name,
        registrationNumber: 'KMC: 143480',
      },
    });
  }),

  http.get('/api/profile', ({ request }) => {
    const auth = requireAuth(request);
    if (auth.response) return HttpResponse.json(auth.response, { status: auth.status });
    return HttpResponse.json({ profile: mockProfile });
  }),

  http.put('/api/profile', async ({ request }) => {
    const auth = requireAuth(request);
    if (auth.response) return HttpResponse.json(auth.response, { status: auth.status });
    const body = await request.json();
    if (body.consentGiven !== true || body.consentVersion !== 'account-storage-v1') {
      return HttpResponse.json({ error: 'Account storage consent is required.' }, { status: 400 });
    }
    updateProfile(cleanProfile(body));
    return HttpResponse.json({ profile: mockProfile });
  }),

  http.get('/api/bookings', ({ request }) => {
    const auth = requireAuth(request);
    if (auth.response) return HttpResponse.json(auth.response, { status: auth.status });
    return HttpResponse.json({ bookings: mockBookings.filter((booking) => booking.userId === auth.principal.userId) });
  }),

  http.post('/api/bookings', async ({ request }) => {
    const principal = getPrincipal(request);
    const body = await request.json();
    if (body.bookingConsentGiven !== true || body.bookingConsentVersion !== 'booking-contact-v1') {
      return HttpResponse.json({ error: 'Booking contact consent is required.' }, { status: 400 });
    }
    if (principal && (body.consentGiven !== true || body.consentVersion !== 'account-storage-v1')) {
      return HttpResponse.json({ error: 'Account storage consent is required.' }, { status: 400 });
    }
    const booking = validateBooking(body);
    if (!booking) {
      return HttpResponse.json({ error: 'Please complete the required booking fields.' }, { status: 400 });
    }

    const slots = generateSlots(mockAvailability);
    const slotKey = `${booking.preferredDate}|${booking.preferredTime}`;
    if (!mockAvailability.enabled || !slots.some((slot) => slot.slotKey === slotKey)) {
      return HttpResponse.json({ error: 'That time is not currently available. Please choose another slot.' }, { status: 409 });
    }
    if (reservedSlotKeys.has(slotKey)) {
      return HttpResponse.json({ error: 'That slot has just been requested by someone else. Please choose another slot.' }, { status: 409 });
    }

    reservedSlotKeys.add(slotKey);
    const record = {
      id: crypto.randomUUID(),
      userId: principal?.userId || 'guest',
      isGuest: !principal,
      slotKey,
      ...booking,
      status: 'requested',
      meetingStatus: 'not_configured',
      notificationStatus: 'not_configured',
      meetingUrl: null,
      calendarAddUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockBookings.push(record);
    return HttpResponse.json({
      booking: {
        id: record.id,
        status: record.status,
        meetingStatus: record.meetingStatus,
        meetingUrl: record.meetingUrl,
        calendarAddUrl: record.calendarAddUrl,
        meetingStartAt: null,
        notificationStatus: record.notificationStatus,
      },
      message: 'Your booking request has been received.',
    }, { status: 201 });
  }),

  http.get('/api/assessments', ({ request }) => {
    const auth = requireAuth(request);
    if (auth.response) return HttpResponse.json(auth.response, { status: auth.status });
    return HttpResponse.json({ assessments: mockAssessments.filter((a) => a.userId === auth.principal.userId) });
  }),

  http.post('/api/assessments', async ({ request }) => {
    const auth = requireAuth(request);
    if (auth.response) return HttpResponse.json(auth.response, { status: auth.status });
    const body = await request.json();
    if (body.consentGiven !== true || body.consentVersion !== 'assessment-storage-v1') {
      return HttpResponse.json({ error: 'Assessment storage consent is required.' }, { status: 400 });
    }
    const result = scoreAssessment(body.assessmentType, body.responses);
    if (!result) {
      return HttpResponse.json({ error: 'Assessment responses are invalid.' }, { status: 400 });
    }
    const record = {
      id: crypto.randomUUID(),
      userId: auth.principal.userId,
      assessmentType: body.assessmentType,
      responses: body.responses,
      ...result,
      consentVersion: 'assessment-storage-v1',
      completedAt: new Date().toISOString(),
    };
    mockAssessments.push(record);
    return HttpResponse.json({ assessment: record }, { status: 201 });
  }),

  http.get('/api/payments/config', () => HttpResponse.json({ enabled: false, currency: 'INR', amount: 500 })),
];
