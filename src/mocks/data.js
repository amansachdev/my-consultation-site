export let mockAvailability = {
  id: 'default',
  timezone: 'Asia/Kolkata',
  durationMinutes: 30,
  enabled: true,
  weekly: {
    monday: [{ start: '09:00', end: '21:00' }],
    tuesday: [{ start: '09:00', end: '21:00' }],
    wednesday: [{ start: '09:00', end: '21:00' }],
    thursday: [{ start: '09:00', end: '21:00' }],
    friday: [{ start: '09:00', end: '21:00' }],
    saturday: [{ start: '09:00', end: '21:00' }],
    sunday: [{ start: '09:00', end: '21:00' }],
  },
  blockedDates: [],
  blockedSlots: [],
  updatedAt: new Date().toISOString(),
};

export function updateAvailability(next) {
  mockAvailability = { ...mockAvailability, ...next, updatedAt: new Date().toISOString() };
}

export let mockProfile = {
  fullName: 'Aman Test',
  age: 30,
  city: 'Bengaluru',
  state: 'Karnataka',
  phone: '+91 80888 92105',
};

export function updateProfile(next) {
  mockProfile = { ...mockProfile, ...next };
}

export const mockBookings = [];

export const mockAssessments = [
  {
    id: 'mock-phq9',
    userId: 'mock-user',
    assessmentType: 'PHQ-9',
    score: 7,
    severity: 'Mild depression',
    isHighRisk: false,
    completedAt: new Date().toISOString(),
  },
];

export const reservedSlotKeys = new Set();
