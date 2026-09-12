import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Check, ClipboardCheck, Plus, Trash2 } from 'lucide-react';
import { PrescriptionWorkspace } from './ClinicianPage';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/useAuth';
import { LoadingState } from '../components/LoadingState';

const DAYS = [
  ['monday', 'Mon'],
  ['tuesday', 'Tue'],
  ['wednesday', 'Wed'],
  ['thursday', 'Thu'],
  ['friday', 'Fri'],
  ['saturday', 'Sat'],
  ['sunday', 'Sun'],
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
  const [providers, setProviders] = useState([]);
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
    apiRequest('/workspace-access')
      .then(() => {
        setAccess('allowed');
        return Promise.all([apiRequest('/workspace-availability'), apiRequest('/providers')]);
      })
      .then(([availabilityResponse, providersResponse]) => {
        setAvailability({ ...blankAvailability(), ...availabilityResponse.availability, weekly: { ...emptyWeekly(), ...availabilityResponse.availability?.weekly } });
        setProviders(providersResponse.providers || []);
      })
      .catch((requestError) => setAccess(requestError.status === 403 ? 'forbidden' : 'error'))
      .finally(() => setLoading(false));
  }, [isAuthenticated, status]);

  if (status === 'loading' || loading) return <AdminShell><LoadingState text="Checking admin access..." /></AdminShell>;
  if (access === 'signed-out') return <AdminShell><AccessPanel title="Admin sign-in required" text="Sign in with one of the authorized Antaran admin accounts." action={<button type="button" className="btn-primary" onClick={signIn}>Sign in with Google</button>} /></AdminShell>;
  if (access === 'forbidden') return <AdminShell><AccessPanel title="Access restricted" text={`The signed-in account (${user?.email}) is not an Antaran admin.`} /></AdminShell>;
  if (access === 'error') return <AdminShell><AccessPanel title="Could not verify access" text="Please try again after signing in." /></AdminShell>;

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const response = await apiRequest('/workspace-availability', { method: 'PUT', body: JSON.stringify(availability) });
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
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap gap-2 border-b border-line pb-3" role="tablist" aria-label="Admin sections">
          <TabButton active={tab === 'availability'} onClick={() => setTab('availability')}><CalendarDays size={17} /> Availability</TabButton>
          <TabButton active={tab === 'providers'} onClick={() => setTab('providers')}><ClipboardCheck size={17} /> Providers</TabButton>
          <TabButton active={tab === 'prescriptions'} onClick={() => setTab('prescriptions')}>Prescriptions</TabButton>
        </div>
        {tab === 'availability' && <AvailabilityEditor availability={availability} setAvailability={setAvailability} onSave={save} saving={saving} message={message} error={error} />}
        {tab === 'providers' && <ProviderWorkspace providers={providers} setProviders={setProviders} />}
        {tab === 'prescriptions' && <PrescriptionWorkspace accessPath="/workspace-access" accessLabel="Admin" embedded />}
      </div>
    </AdminShell>
  );
}

const PROVIDER_TYPES = [
  ['psychiatrist', 'Psychiatrist'],
  ['psychologist', 'Psychologist'],
  ['therapist', 'Therapist'],
  ['counsellor', 'Counsellor'],
  ['other', 'Other'],
];

const EMPTY_PROVIDER = {
  fullName: '', email: '', phone: '', professionalType: 'psychiatrist', registrationNumber: '', registrationCouncil: '', qualifications: '', specializations: '',
};

function ProviderWorkspace({ providers, setProviders }) {
  const [form, setForm] = useState(EMPTY_PROVIDER);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const addProvider = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const response = await apiRequest('/providers', { method: 'POST', body: JSON.stringify(form) });
      setProviders((current) => [response.provider, ...current]);
      setForm(EMPTY_PROVIDER);
      setMessage('Provider added for verification. They cannot access clinician tools until approved.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (provider, status) => {
    setError('');
    try {
      const response = await apiRequest(`/providers/${provider.id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
      setProviders((current) => current.map((item) => item.id === provider.id ? response.provider : item));
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <form className="booking-form h-fit" onSubmit={addProvider}>
        <div className="flex items-start gap-3">
          <Plus className="mt-1 text-brand-forest" size={20} />
          <div><h2 className="text-xl font-bold">Add a provider</h2><p className="mt-1 text-sm leading-6 text-ink/60">Create a review record for a psychiatrist, psychologist, therapist, or counsellor.</p></div>
        </div>
        <div className="mt-5 grid gap-4">
          <ProviderField label="Full name *" value={form.fullName} onChange={(value) => setForm({ ...form, fullName: value })} />
          <ProviderField label="Email *" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} />
          <ProviderField label="Phone" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} />
          <label className="field"><span>Professional type *</span><select value={form.professionalType} onChange={(event) => setForm({ ...form, professionalType: event.target.value })}>{PROVIDER_TYPES.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
          <ProviderField label="Registration number *" value={form.registrationNumber} onChange={(value) => setForm({ ...form, registrationNumber: value })} />
          <ProviderField label="Registration council *" value={form.registrationCouncil} onChange={(value) => setForm({ ...form, registrationCouncil: value })} />
          <ProviderField label="Qualifications *" value={form.qualifications} onChange={(value) => setForm({ ...form, qualifications: value })} />
          <ProviderField label="Specializations" value={form.specializations} onChange={(value) => setForm({ ...form, specializations: value })} />
        </div>
        {message && <p className="mt-5 rounded-md bg-semantic-success/10 p-3 text-sm font-medium text-semantic-success" role="status">{message}</p>}
        {error && <p className="mt-5 rounded-md bg-semantic-danger/10 p-3 text-sm font-medium text-semantic-danger" role="alert">{error}</p>}
        <button className="btn-primary mt-5" type="submit" disabled={saving}>{saving ? 'Adding...' : 'Add for review'}<Plus size={17} /></button>
      </form>
      <section className="account-panel h-fit">
        <div><h2 className="text-xl font-bold">Provider onboarding</h2><p className="mt-1 text-sm leading-6 text-ink/60">Only verified providers can use clinician tools. Credential uploads and formal verification remain part of the next review step.</p></div>
        <div className="mt-5 grid gap-3">
          {providers.length === 0 && <p className="rounded-md bg-mist p-4 text-sm text-ink/60">No providers have been added yet.</p>}
          {providers.map((provider) => <ProviderRow key={provider.id} provider={provider} onStatusChange={updateStatus} />)}
        </div>
      </section>
    </div>
  );
}

function ProviderRow({ provider, onStatusChange }) {
  const statusLabels = { pending_review: 'Pending review', verified: 'Verified', rejected: 'Rejected', suspended: 'Suspended' };
  return <article className="rounded-lg border border-line bg-white p-4 shadow-sm">
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
      <div><h3 className="font-semibold">{provider.fullName}</h3><p className="mt-1 text-sm text-ink/60">{provider.professionalType} · {provider.email}</p><p className="mt-2 text-sm text-ink/70">{provider.qualifications} · {provider.registrationNumber}</p>{provider.specializations && <p className="mt-1 text-xs text-ink/50">{provider.specializations}</p>}</div>
      <span className={`status-pill shrink-0 ${provider.status === 'verified' ? 'bg-semantic-success/10 text-semantic-success' : provider.status === 'rejected' || provider.status === 'suspended' ? 'bg-semantic-danger/10 text-semantic-danger' : 'bg-semantic-warning/10 text-semantic-warning'}`}>{statusLabels[provider.status]}</span>
    </div>
    <div className="mt-4 flex flex-wrap gap-2">
      {provider.status === 'pending_review' && <><button type="button" className="btn-secondary min-h-9 px-3 text-sm" onClick={() => onStatusChange(provider, 'verified')}>Verify</button><button type="button" className="btn-secondary min-h-9 px-3 text-sm text-semantic-danger" onClick={() => onStatusChange(provider, 'rejected')}>Reject</button></>}
      {provider.status === 'rejected' && <button type="button" className="btn-secondary min-h-9 px-3 text-sm" onClick={() => onStatusChange(provider, 'verified')}>Verify</button>}
      {provider.status === 'verified' && <button type="button" className="btn-secondary min-h-9 px-3 text-sm text-semantic-danger" onClick={() => onStatusChange(provider, 'suspended')}>Suspend</button>}
      {provider.status === 'suspended' && <button type="button" className="btn-secondary min-h-9 px-3 text-sm" onClick={() => onStatusChange(provider, 'verified')}>Reactivate</button>}
    </div>
  </article>;
}

function ProviderField({ label, type = 'text', value, onChange }) {
  return <label className="field"><span>{label}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} required={label.endsWith('*')} /></label>;
}

function AvailabilityEditor({ availability, setAvailability, onSave, saving, message, error }) {
  const [blockedSlotDate, setBlockedSlotDate] = useState('');
  const [blockedSlotTime, setBlockedSlotTime] = useState('');

  const selectedDays = useMemo(
    () => DAYS.filter(([key]) => availability.weekly[key]?.length).map(([key]) => key),
    [availability.weekly],
  );

  const [draftRange, setDraftRange] = useState({ start: '09:00', end: '21:00' });

  useEffect(() => {
    const activeDay = DAYS.find(([key]) => availability.weekly[key]?.length)?.[0];
    if (activeDay) {
      setDraftRange(availability.weekly[activeDay][0]);
    }
  }, [availability.weekly]);

  const toggleDay = (day) => {
    const isSelected = selectedDays.includes(day);
    setAvailability((current) => ({
      ...current,
      weekly: { ...current.weekly, [day]: isSelected ? [] : [draftRange] },
    }));
  };

  const updateRange = (range) => {
    setDraftRange(range);
    if (selectedDays.length === 0) return;
    setAvailability((current) => ({
      ...current,
      weekly: {
        ...current.weekly,
        ...Object.fromEntries(selectedDays.map((day) => [day, [range]])),
      },
    }));
  };

  const applyPreset = (preset) => {
    const days = preset === 'all'
      ? DAYS.map(([key]) => key)
      : preset === 'weekdays'
        ? DAYS.slice(0, 5).map(([key]) => key)
        : selectedDays;
    setAvailability((current) => ({
      ...current,
      weekly: Object.fromEntries(DAYS.map(([key]) => [key, days.includes(key) ? [draftRange] : []])),
    }));
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
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h2 className="text-xl font-bold">Booking availability</h2>
          <p className="mt-1 text-sm text-ink/60">30-minute slots · Asia/Kolkata</p>
        </div>
        <label className="flex items-center gap-3 text-sm font-semibold">
          <input type="checkbox" checked={availability.enabled} onChange={(event) => setAvailability({ ...availability, enabled: event.target.checked })} className="h-4 w-4 accent-brand-forest" />
          Accept booking requests
        </label>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <label className="field">
          <span>Schedule preset</span>
          <select defaultValue="custom" onChange={(event) => applyPreset(event.target.value)}>
            <option value="custom">Custom days</option>
            <option value="all">All days</option>
            <option value="weekdays">Monday to Friday</option>
          </select>
        </label>
        <label className="field">
          <span>From</span>
          <input
            type="time"
            value={draftRange.start}
            onChange={(event) => updateRange({ ...draftRange, start: event.target.value })}
          />
        </label>
        <label className="field">
          <span>To</span>
          <input
            type="time"
            value={draftRange.end}
            onChange={(event) => updateRange({ ...draftRange, end: event.target.value })}
          />
        </label>
      </div>

      <div className="mt-5">
        <span className="text-sm font-semibold">Available days</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {DAYS.map(([key, label]) => {
            const active = selectedDays.includes(key);
            return (
              <button
                key={key}
                type="button"
                role="switch"
                aria-checked={active}
                onClick={() => toggleDay(key)}
                className={`min-h-10 rounded-full border px-4 text-sm font-semibold transition ${active ? 'border-ink bg-ink text-white' : 'border-line bg-mist text-ink/80 hover:border-moss hover:text-ink'}`}
              >
                {label}
              </button>
            );
          })}
        </div>
        {selectedDays.length === 0 && <p className="mt-2 text-sm text-ink/60">Select at least one day to open slots.</p>}
      </div>

      <div className="mt-6">
        <h3 className="font-semibold">Blocked dates</h3>
        <p className="mt-1 text-sm text-ink/60">Use this for leave, holidays, or a day that should not accept requests.</p>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <label className="field w-auto">
            <span>Add date</span>
            <input type="date" min={new Date().toISOString().slice(0, 10)} onChange={addBlockedDate} aria-label="Add blocked date" />
          </label>
          {availability.blockedDates.map((date) => (
            <span className="status-pill inline-flex items-center gap-2" key={date}>
              {date}
              <button type="button" onClick={() => setAvailability({ ...availability, blockedDates: availability.blockedDates.filter((item) => item !== date) })} aria-label={`Remove blocked date ${date}`}>
                <Trash2 size={13} />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold">Blocked individual slots</h3>
        <p className="mt-1 text-sm text-ink/60">Use this when one appointment time needs to be held back without closing the whole day.</p>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <label className="field">
            <span>Date</span>
            <input type="date" min={new Date().toISOString().slice(0, 10)} value={blockedSlotDate} onChange={(event) => setBlockedSlotDate(event.target.value)} />
          </label>
          <label className="field">
            <span>Time</span>
            <input type="time" value={blockedSlotTime} onChange={(event) => setBlockedSlotTime(event.target.value)} />
          </label>
          <button type="button" className="btn-secondary min-h-10" onClick={addBlockedSlot}><PlusIcon /> Block slot</button>
          {availability.blockedSlots.map((slot) => (
            <span className="status-pill inline-flex items-center gap-2" key={slot}>
              {slot.replace('|', ' at ')}
              <button type="button" onClick={() => setAvailability({ ...availability, blockedSlots: availability.blockedSlots.filter((item) => item !== slot) })} aria-label={`Remove blocked slot ${slot}`}>
                <Trash2 size={13} />
              </button>
            </span>
          ))}
        </div>
      </div>

      {(message || error) && <p className={`mt-6 rounded-md p-3 text-sm font-medium ${error ? 'bg-semantic-danger/10 text-semantic-danger' : 'bg-semantic-success/10 text-semantic-success'}`} role="status">{message || error}</p>}
      <button type="submit" className="btn-primary mt-6" disabled={saving}>{saving ? 'Saving...' : 'Save availability'}<Check size={17} /></button>
    </form>
  );
}

function TabButton({ active, children, onClick }) { return <button type="button" role="tab" aria-selected={active} onClick={onClick} className={`inline-flex min-h-10 items-center gap-2 rounded-md px-4 text-sm font-semibold ${active ? 'bg-ink text-white' : 'bg-mist text-ink/70 hover:text-ink'}`}>{children}</button>; }
function PlusIcon() { return <span aria-hidden="true">+</span>; }
function AdminShell({ children }) { return <div className="section min-h-[calc(100vh-4rem)]">{children}</div>; }
function AccessPanel({ title, text, action }) { return <section className="section"><div className="mx-auto max-w-xl rounded-lg border border-line bg-mist p-8 text-center shadow-sm"><h1 className="font-serif text-3xl font-semibold">{title}</h1><p className="mt-3 leading-7 text-ink/70">{text}</p>{action && <div className="mt-6 flex justify-center">{action}</div>}</div></section>; }
