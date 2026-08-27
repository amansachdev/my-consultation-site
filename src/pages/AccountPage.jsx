import { useEffect, useState } from 'react';
import { ArrowRight, ExternalLink, LogOut, UserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { apiRequest } from '../lib/api';
import { LoadingState } from '../components/LoadingState';

const EMPTY_PROFILE = { fullName: '', age: '', city: '', state: '', phone: '' };

export function AccountPage() {
  const { user, status, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [bookings, setBookings] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [portalLoading, setPortalLoading] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);

  useEffect(() => {
    if (status === 'ready' && !isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate, status]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;

    Promise.all([apiRequest('/profile'), apiRequest('/bookings'), apiRequest('/assessments')])
      .then(([profileResponse, bookingsResponse, assessmentsResponse]) => {
        if (cancelled) return;
        setProfile({ ...EMPTY_PROFILE, ...(profileResponse.profile || {}) });
        setBookings(bookingsResponse.bookings || []);
        setAssessments(assessmentsResponse.assessments || []);
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError.message);
      })
      .finally(() => {
        if (!cancelled) setPortalLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  if (status === 'loading') {
    return <AccountShell><LoadingState /></AccountShell>;
  }

  if (!isAuthenticated) return null;

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const response = await apiRequest('/profile', {
        method: 'PUT',
        body: JSON.stringify({ ...profile, age: profile.age ? Number(profile.age) : '', consentGiven, consentVersion: 'account-storage-v1' }),
      });
      setProfile({ ...EMPTY_PROFILE, ...(response.profile || {}) });
      setMessage('Profile saved.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AccountShell>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Your account</p>
          <h1 className="font-serif text-4xl font-semibold md:text-5xl">A private place to keep track.</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-ink/70">
            Your public browsing and booking access stays open. Sign in when you want to save your details and view your care history.
          </p>
        </div>
        <button type="button" onClick={signOut} className="btn-secondary shrink-0">
          <LogOut size={17} />
          Sign out
        </button>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="account-panel">
          <div className="flex items-center gap-3">
            <UserRound className="text-clay" size={22} />
            <div>
              <h2 className="text-xl font-bold">Profile</h2>
              <p className="text-sm text-ink/60">Signed in as {user.email}</p>
            </div>
          </div>
          <form className="mt-6 grid gap-4" onSubmit={saveProfile}>
            <AccountField label="Full name" value={profile.fullName} onChange={(value) => setProfile({ ...profile, fullName: value })} />
            <div className="grid gap-4 sm:grid-cols-2">
              <AccountField label="Age" type="number" min="18" max="120" value={profile.age} onChange={(value) => setProfile({ ...profile, age: value })} />
              <AccountField label="Phone / WhatsApp" value={profile.phone} onChange={(value) => setProfile({ ...profile, phone: value })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <AccountField label="City" value={profile.city} onChange={(value) => setProfile({ ...profile, city: value })} />
              <AccountField label="State" value={profile.state} onChange={(value) => setProfile({ ...profile, state: value })} />
            </div>
            <label className="flex gap-3 text-sm leading-6 text-ink/80">
              <input type="checkbox" checked={consentGiven} onChange={(event) => setConsentGiven(event.target.checked)} className="mt-1 h-4 w-4 accent-brand-forest" />
              <span>I consent to Antaran storing my profile and booking history in this account so I can use the patient portal.</span>
            </label>
            <button className="btn-primary mt-2" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save profile'}
              <ArrowRight size={17} />
            </button>
          </form>
        </section>

        <div className="grid gap-6">
          <PortalList loading={portalLoading} title="Booking history" empty="No booking requests yet." action={<Link className="text-sm font-semibold text-moss" to="/book">Request a slot</Link>}>
            {bookings.map((booking) => (
              <div key={booking.id} className="account-list-item">
                <div>
                  <p className="font-semibold">{booking.consultationType}</p>
                  <p className="mt-1 text-sm text-ink/60">{booking.preferredDate} at {booking.preferredTime}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="status-pill">{booking.status}</span>
                  {booking.meetingUrl && (isJoinAvailable(booking, now) ? (
                    <a className="inline-flex items-center gap-1 text-sm font-semibold text-moss" href={booking.meetingUrl} target="_blank" rel="noreferrer">
                      Join meeting <ExternalLink size={14} />
                    </a>
                  ) : <span className="text-xs text-ink/50">Join opens 15 minutes before</span>)}
                  {(booking.calendarAddUrl || booking.calendarEventUrl) && <a className="inline-flex items-center gap-1 text-xs font-semibold text-ink/60" href={booking.calendarAddUrl || booking.calendarEventUrl} target="_blank" rel="noreferrer">
                    Add to calendar <ExternalLink size={12} />
                  </a>}
                </div>
              </div>
            ))}
          </PortalList>
          <PortalList loading={portalLoading} title="Saved assessments" empty="Complete an assessment and choose to save it here." action={<Link className="text-sm font-semibold text-moss" to="/assessment">Take an assessment</Link>}>
            {assessments.map((assessment) => (
              <div key={assessment.id} className="account-list-item">
                <div>
                  <p className="font-semibold">{assessment.assessmentType}</p>
                  <p className="mt-1 text-sm text-ink/60">{new Date(assessment.completedAt).toLocaleDateString()} · {assessment.severity}</p>
                </div>
                <span className="font-semibold text-moss">{assessment.score}</span>
              </div>
            ))}
          </PortalList>
        </div>
      </div>

      {(message || error) && <p className={`mt-6 rounded-md p-4 text-sm font-medium ${error ? 'bg-semantic-danger/10 text-semantic-danger' : 'bg-semantic-success/10 text-semantic-success'}`} role="status">{message || error}</p>}
    </AccountShell>
  );
}

function isJoinAvailable(booking, now) {
  return booking.meetingStartAt && now >= new Date(booking.meetingStartAt).getTime() - 15 * 60 * 1000;
}

function AccountShell({ children }) {
  return <div className="section min-h-[calc(100vh-4rem)]">{children}</div>;
}

function AccountField({ label, type = 'text', value, onChange, ...props }) {
  return <label className="field"><span>{label}</span><input type={type} value={value || ''} onChange={(event) => onChange(event.target.value)} {...props} /></label>;
}

function PortalList({ title, empty, action, children, loading }) {
  const hasItems = Array.isArray(children) ? children.length > 0 : Boolean(children);
  return <section className="account-panel"><div className="flex items-center justify-between gap-4"><h2 className="text-xl font-bold">{title}</h2>{action}</div><div className="mt-5 grid gap-3">{loading ? <p className="flex items-center gap-2 rounded-md bg-mist p-4 text-sm text-ink/60"><RefreshCw className="animate-spin" size={16} /> Loading...</p> : hasItems ? children : <p className="rounded-md bg-mist p-4 text-sm text-ink/60">{empty}</p>}</div></section>;
}
