const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function istTodayString() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

function istWeekday(date) {
  return date.toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata', weekday: 'long' }).toLowerCase();
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function dateKey(date) {
  return date.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

function timeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes) {
  const h = String(Math.floor(minutes / 60)).padStart(2, '0');
  const m = String(minutes % 60).padStart(2, '0');
  return `${h}:${m}`;
}

export function generateSlots(availability, horizonDays = 60) {
  if (!availability.enabled) return [];

  const slots = [];
  const today = new Date(istTodayString());
  const nowIst = new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });

  for (let offset = 0; offset < horizonDays; offset += 1) {
    const date = addDays(today, offset);
    const key = dateKey(date);
    if (availability.blockedDates?.includes(key)) continue;

    const weekday = istWeekday(date);
    const ranges = availability.weekly?.[weekday] || [];

    for (const range of ranges) {
      if (!range?.start || !range?.end || range.start >= range.end) continue;
      let cursor = timeToMinutes(range.start);
      const end = timeToMinutes(range.end);
      const duration = availability.durationMinutes || 30;

      while (cursor + duration <= end && cursor + duration <= 24 * 60) {
        const time = minutesToTime(cursor);
        const slotKey = `${key}|${time}`;
        const isToday = key === dateKey(today);
        const isPast = isToday && time <= nowIst;
        if (!isPast && !availability.blockedSlots?.includes(slotKey)) {
          slots.push({ date: key, time, slotKey });
        }
        cursor += duration;
      }
    }
  }

  return slots.sort((a, b) => (a.slotKey > b.slotKey ? 1 : -1));
}
