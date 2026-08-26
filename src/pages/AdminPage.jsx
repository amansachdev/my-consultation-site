import { useEffect, useState } from 'react';
import { CalendarDays, Check, Trash2 } from 'lucide-react';
import { PrescriptionWorkspace } from './ClinicianPage';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/useAuth';

const DAYS = [
  ['monday', 'Monday'],
  ['tuesday', 'Tuesday'],
  ['wednesday', 'Wednesday'],
  ['thursday', 'Thursday'],
  ['friday', 'Friday'],
  ['saturday', 'Saturday'],
  ['sunday', 'Sunday'],
];

const emptyWeekly = () => Object.fromEntries(DAYS.map(([key]) => [key, []]));

function blankAvailability() {
  return { enabled: false, durationMinutes: 30, timezone: 'Asia/Kolkata', weekly: emptyWeekly(), blockedDates: [], blockedSlots: [] };
}

export function AdminPage() {
  const { isAuthenticated, signIn, status, user } = useAuth();
  const [access, setAccess] = useState('checking');
  const [tab, setTab] = useState('availability');
  const [availability, setAvailability] = useState(blankAvailability);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (!isAuthenticated) {
      setAccess('signed-out');
      setLoading(false);
      return;
    }
    apiRequest('/admin-access')
      .then(() => {
        setAccess('allowed');
        return apiRequest('/admin-availability');
      })
      .then((response) => setAvailability({ ...blankAvailability(), ...response.availability, weekly: { ...emptyWeekly(), ...response.availability?.weekly } }))
      .catch((requestError) => setAccess(requestError.status === 403 ? 'forbidden' : 'error'))
      .finally(() => setLoading(false));
  }, [isAuthenticated, status]);

  if (status === 'loading' || loading) return <AdminShell><p>Checking admin access...</p></AdminShell>;
  if (access === 'signed-out') return <AdminShell><AccessPanel title="Admin sign-in required" text="Sign in with one of the authorized Antaran admin accounts." action={<button type="button" className="btn-primary" onClick={signIn}>Sign in with Google</button>} /></AdminShell>;
  if (access === 'forbidden') return <AdminShell><AccessPanel title="Access restricted" text={`The signed-in account (${user?.email}) is not an Antaran admin.`} /></AdminShell>;
  if (access === 'error') return <AdminShell><AccessPanel title="Could not verify access" text="Please try again after signing in." /></AdminShell>;

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const response = await apiRequest('/admin-availability', { method: 'PUT', body: JSON.stringify(availability) });
      setAvailability({ ...availability, ...response.availability });
      setMessage('Availability saved. New booking slots are now based on this schedule.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell>
      <div className="section-heading text-left">
        <p className="eyebrow">Admin workspace</p>
        <h1>Run the clinic from one place.</h1>
        <p>Manage the shared consultation schedule and create prescription PDFs for your clinical work.</p>
      </div>
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap gap-2 border-b border-line pb-3" role="tablist" aria-label="Admin sections">
          <TabButton active={tab === 'availability'} onClick={() => setTab('availability')}><CalendarDays size={17} /> Availability</TabButton>
          <TabButton active={tab === 'prescriptions'} onClick={() => setTab('prescriptions')}>Prescriptions</TabButton>
        </div>
        {tab === 'availability' ? <AvailabilityEditor availability={availability} setAvailability={setAvailability} onSave={save} saving={saving} message={message} error={error} /> : <PrescriptionWorkspace accessPath="/admin-access" accessLabel="Admin" />}
      </div>
    </AdminShell>
  );
}

function AvailabilityEditor({ availability, setAvailability, onSave, saving, message, error }) {
  const selectedDays = DAYS.filter(([key]) => availability.weekly[key]?.length).map(([key]) => key);
  const [blockedSlotDate, setBlockedSlotDate] = useState('');
  const [blockedSlotTime, setBlockedSlotTime] = useState('');
  const setDayRange = (day, value) => setAvailability((current) => ({ ...current, weekly: { ...current.weekly, [day]: value ? [{ start: value.start, end: value.end }] : [] } }));
  const applyPreset = (preset) => {
    const days = preset === 'all' ? DAYS.map(([key]) => key) : preset === 'weekdays' ? DAYS.slice(0, 5).map(([key]) => key) : selectedDays;
    setAvailability((current) => ({ ...current, weekly: Object.fromEntries(DAYS.map(([key]) => [key, days.includes(key) ? (current.weekly[key]?.length ? current.weekly[key] : [{ start: '10:00', end: '18:00' }]) : []])) }));
  };
  const addBlockedDate = (event) => {
    const date = event.target.value;
    if (date && !availability.blockedDates.includes(date)) setAvailability((current) => ({ ...current, blockedDates: [...current.blockedDates, date].sort() }));
    event.target.value = '';
  };
  const addBlockedSlot = () => {
    if (!blockedSlotDate || !blockedSlotTime) return;
    const slotKey = `${blockedSlotDate}|${blockedSlotTime}`;
    if (!availability.blockedSlots.includes(slotKey)) setAvailability((current) => ({ ...current, blockedSlots: [...current.blockedSlots, slotKey].sort() }));
    setBlockedSlotDate('');
    setBlockedSlotTime('');
  };

  return (
    <form className="booking-form mt-6" onSubmit={onSave}>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><h2 className="text-xl font-bold">Booking availability</h2><p className="mt-1 text-sm text-ink/60">One shared schedule, in India Standard Time. Each slot is 30 minutes.</p></div><label className="flex items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={availability.enabled} onChange={(event) => setAvailability({ ...availability, enabled: event.target.checked })} className="h-4 w-4 accent-brand-forest" /> Accept booking requests</label></div>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <label className="field"><span>Schedule preset</span><select defaultValue="custom" onChange={(event) => applyPreset(event.target.value)}><option value="custom">Custom days</option><option value="all">All days</option><option value="weekdays">Monday to Friday</option></select></label>
        <label className="field"><span>Duration</span><input value="30 minutes" readOnly /></label>
        <label className="field"><span>Timezone</span><input value="Asia/Kolkata" readOnly /></label>
      </div>
      <div className="mt-6 grid gap-3"><h3 className="font-semibold">Available days and time</h3>{DAYS.map(([key, label]) => { const range = availability.weekly[key]?.[0]; return <div className="grid items-end gap-3 rounded-md border border-line bg-mist p-3 sm:grid-cols-[1fr_1fr_1fr]" key={key}><label className="flex items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={Boolean(range)} onChange={(event) => setDayRange(key, event.target.checked ? { start: '10:00', end: '18:00' } : null)} className="h-4 w-4 accent-brand-forest" /> {label}</label><label className="field"><span>From</span><input type="time" disabled={!range} value={range?.start || ''} onChange={(event) => setDayRange(key, { start: event.target.value, end: range?.end || '18:00' })} /></label><label className="field"><span>To</span><input type="time" disabled={!range} value={range?.end || ''} onChange={(event) => setDayRange(key, { start: range?.start || '10:00', end: event.target.value })} /></label></div>; })}</div>
      <div className="mt-6"><h3 className="font-semibold">Blocked dates</h3><p className="mt-1 text-sm text-ink/60">Use this for leave, holidays, or a day that should not accept requests.</p><div className="mt-3 flex flex-wrap gap-3"><input type="date" min={new Date().toISOString().slice(0, 10)} onChange={addBlockedDate} aria-label="Add blocked date" />{availability.blockedDates.map((date) => <span className="status-pill inline-flex items-center gap-2" key={date}>{date}<button type="button" onClick={() => setAvailability({ ...availability, blockedDates: availability.blockedDates.filter((item) => item !== date) })} aria-label={`Remove blocked date ${date}`}><Trash2 size={13} /></button></span>)}</div></div>
      <div className="mt-6"><h3 className="font-semibold">Blocked individual slots</h3><p className="mt-1 text-sm text-ink/60">Use this when one appointment time needs to be held back without closing the whole day.</p><div className="mt-3 flex flex-wrap items-end gap-3"><label className="field"><span>Date</span><input type="date" min={new Date().toISOString().slice(0, 10)} value={blockedSlotDate} onChange={(event) => setBlockedSlotDate(event.target.value)} /></label><label className="field"><span>Time</span><input type="time" value={blockedSlotTime} onChange={(event) => setBlockedSlotTime(event.target.value)} /></label><button type="button" className="btn-secondary min-h-10" onClick={addBlockedSlot}><PlusIcon /> Block slot</button>{availability.blockedSlots.map((slot) => <span className="status-pill inline-flex items-center gap-2" key={slot}>{slot.replace('|', ' at ')}<button type="button" onClick={() => setAvailability({ ...availability, blockedSlots: availability.blockedSlots.filter((item) => item !== slot) })} aria-label={`Remove blocked slot ${slot}`}><Trash2 size={13} /></button></span>)}</div></div>
      {(message || error) && <p className={`mt-6 rounded-md p-3 text-sm font-medium ${error ? 'bg-semantic-danger/10 text-semantic-danger' : 'bg-semantic-success/10 text-semantic-success'}`} role="status">{message || error}</p>}
      <button type="submit" className="btn-primary mt-6" disabled={saving}>{saving ? 'Saving...' : 'Save availability'}<Check size={17} /></button>
    </form>
  );
}

function TabButton({ active, children, onClick }) { return <button type="button" role="tab" aria-selected={active} onClick={onClick} className={`inline-flex min-h-10 items-center gap-2 rounded-md px-4 text-sm font-semibold ${active ? 'bg-ink text-white' : 'bg-mist text-ink/70 hover:text-ink'}`}>{children}</button>; }
function PlusIcon() { return <span aria-hidden="true">+</span>; }
function AdminShell({ children }) { return <div className="section min-h-[calc(100vh-4rem)]">{children}</div>; }
function AccessPanel({ title, text, action }) { return <section className="section"><div className="mx-auto max-w-xl rounded-lg border border-line bg-mist p-8 text-center shadow-sm"><h1 className="font-serif text-3xl font-semibold">{title}</h1><p className="mt-3 leading-7 text-ink/70">{text}</p>{action && <div className="mt-6 flex justify-center">{action}</div>}</div></section>; }
