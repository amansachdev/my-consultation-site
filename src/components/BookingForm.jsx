import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Mail, MapPin, Phone } from 'lucide-react';
import { consultationTypes, doctor } from '../constants';
import { useAuth } from '../context/useAuth';
import { apiRequest } from '../lib/api';

const CONSULTATION_TYPE = consultationTypes[0]?.title || 'Psychiatric Consultation';

export function BookingForm() {
  const { isAuthenticated } = useAuth();

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookingConsentGiven, setBookingConsentGiven] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [availability, setAvailability] = useState({ enabled: false, slots: [] });
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');

  const todayString = useMemo(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().split('T')[0];
  }, []);

  const availableDates = useMemo(() => {
    const dates = [...new Set((availability.slots || []).map((slot) => slot.date))];
    return dates.sort();
  }, [availability.slots]);

  const availableTimesForDate = useMemo(() => {
    if (!selectedDate) return [];
    return (availability.slots || [])
      .filter((slot) => slot.date === selectedDate)
      .map((slot) => slot.time)
      .sort();
  }, [availability.slots, selectedDate]);

  useEffect(() => {
    let cancelled = false;
    apiRequest('/availability')
      .then((response) => { if (!cancelled) setAvailability(response); })
      .catch(() => { if (!cancelled) setAvailability({ enabled: false, slots: [] }); })
      .finally(() => { if (!cancelled) setAvailabilityLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    setSubmitError('');

    const validationErrors = validate(data, todayString, availability.slots, selectedDate);
    setErrors(validationErrors);
    setTouched({
      name: true,
      age: true,
      phone: true,
      email: true,
      date: true,
      time: true,
    });

    if (Object.keys(validationErrors).length > 0) {
      const firstErrorField = form.querySelector('[aria-invalid="true"]');
      firstErrorField?.focus();
      return;
    }

    if (!bookingConsentGiven) {
      setSubmitError('Please confirm that Antaran may use these details to contact you about this booking request.');
      return;
    }
    submitBooking(data, form);
  };

  const submitBooking = async (data, form) => {
    setSubmitting(true);
    setSubmitError('');
    try {
      await apiRequest('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          fullName: data.name,
          age: data.age ? Number(data.age) : '',
          phone: data.phone,
          email: data.email,
          consultationType: CONSULTATION_TYPE,
          preferredDate: data.date,
          preferredTime: data.time,
          message: data.message || '',
          bookingConsentGiven,
          bookingConsentVersion: 'booking-contact-v1',
          consentGiven,
          consentVersion: 'account-storage-v1',
        }),
      });
      form.reset();
      setErrors({});
      setTouched({});
      setBookingConsentGiven(false);
      setConsentGiven(false);
      setSelectedDate('');
      setSubmitted(true);
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBlur = (event) => {
    const { name, value } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const fieldErrors = validateField(name, value, todayString, availability.slots, selectedDate);
    setErrors((prev) => ({ ...prev, [name]: fieldErrors[name] }));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (touched[name]) {
      const fieldErrors = validateField(name, value, todayString, availability.slots, selectedDate);
      setErrors((prev) => ({ ...prev, [name]: fieldErrors[name] }));
    }
  };

  const dateInputDisabled = availabilityLoading || !availability.enabled || availableDates.length === 0;
  const timeInputDisabled = dateInputDisabled || !selectedDate || availableTimesForDate.length === 0;

  return (
    <section id="booking" className="bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:px-8">
        <div className="max-w-xl">
          <p className="eyebrow">Book</p>
          <h2 className="font-serif text-4xl font-semibold leading-tight md:text-5xl">
            Request a consultation.
          </h2>
          <p className="mt-5 text-lg leading-8 text-ink/70">
            Fill in your details below. Your request will be saved securely and the clinic team will contact you to confirm availability.
          </p>
          <div className="mt-8 space-y-4 text-sm text-ink/72">
            <ContactRow icon={Phone} label="Phone" value={doctor.phone} />
            <ContactRow icon={Mail} label="Email" value={doctor.email} />
            <ContactRow icon={MapPin} label="Location" value={doctor.city} />
          </div>
        </div>
        {submitted ? (
          <div className="booking-form">
            <p className="eyebrow">Request received</p>
            <h2 className="font-serif text-3xl font-semibold">We have your request.</h2>
            <p className="leading-7 text-ink/70">The clinic team will review your preferred time and contact you to confirm availability.</p>
            <p className="leading-7 text-ink/70">Your booking details and meeting information have been sent to your email. The meeting link will be available to join 15 minutes before the consultation.</p>
            {isAuthenticated && <p className="text-sm text-ink/60">You can also review this booking anytime from My account.</p>}
            <button type="button" className="btn-secondary justify-self-start" onClick={() => setSubmitted(false)}>Send another request</button>
          </div>
        ) : <form className="booking-form" onSubmit={handleSubmit} noValidate>
          <input type="hidden" name="consultationType" value={CONSULTATION_TYPE} />
          <div className="grid items-start gap-4 md:grid-cols-2">
            <Field
              label="Full name"
              name="name"
              required
              error={errors.name}
              touched={touched.name}
              onBlur={handleBlur}
              onChange={handleChange}
            />
            <Field
              label="Age"
              name="age"
              type="number"
              min="1"
              max="120"
              required
              error={errors.age}
              touched={touched.age}
              onBlur={handleBlur}
              onChange={handleChange}
            />
            <Field
              label="Phone / WhatsApp"
              name="phone"
              required
              placeholder="+91 99999 99999"
              error={errors.phone}
              touched={touched.phone}
              onBlur={handleBlur}
              onChange={handleChange}
            />
            <Field
              label="Email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              error={errors.email}
              touched={touched.email}
              onBlur={handleBlur}
              onChange={handleChange}
            />
            <label className="field">
              <span>Preferred date<span className="text-semantic-danger"> *</span></span>
              <input
                type="date"
                name="date"
                min={todayString}
                max={availableDates[availableDates.length - 1] || ''}
                disabled={dateInputDisabled}
                aria-invalid={touched.date && errors.date ? 'true' : 'false'}
                aria-describedby={touched.date && errors.date ? 'date-error' : undefined}
                className={touched.date && errors.date ? 'border-semantic-danger focus:border-semantic-danger focus:ring-semantic-danger/15' : ''}
                onBlur={handleBlur}
                onChange={(event) => { setSelectedDate(event.target.value); handleChange(event); }}
              />
              {touched.date && errors.date && (
                <span id="date-error" className="text-xs font-medium text-semantic-danger">{errors.date}</span>
              )}
            </label>
            <label className="field">
              <span>Preferred time<span className="text-semantic-danger"> *</span></span>
              <select
                key={selectedDate}
                name="time"
                disabled={timeInputDisabled}
                defaultValue=""
                aria-invalid={touched.time && errors.time ? 'true' : 'false'}
                aria-describedby={touched.time && errors.time ? 'time-error' : undefined}
                className={touched.time && errors.time ? 'border-semantic-danger focus:border-semantic-danger focus:ring-semantic-danger/15' : ''}
                onBlur={handleBlur}
                onChange={handleChange}
              >
                <option value="" disabled>
                  {timeInputDisabled ? 'Select a date first' : 'Select a time'}
                </option>
                {availableTimesForDate.map((time) => (
                  <option key={time} value={time}>
                    {formatTime(time)}
                  </option>
                ))}
              </select>
              {touched.time && errors.time && (
                <span id="time-error" className="text-xs font-medium text-semantic-danger">{errors.time}</span>
              )}
            </label>
          </div>
          <label className="field">
            <span>What would you like help with?</span>
            <textarea
              name="message"
              rows="4"
              placeholder="Share a short note. Avoid emergency details here."
            />
          </label>
          <label className="flex gap-3 text-sm leading-6 text-ink/80">
            <input type="checkbox" checked={bookingConsentGiven} onChange={(event) => setBookingConsentGiven(event.target.checked)} className="mt-1 h-4 w-4 accent-brand-forest" />
            <span>I consent to Antaran using these details to contact me about this booking request.</span>
          </label>
          {isAuthenticated && (
            <label className="flex gap-3 text-sm leading-6 text-ink/80">
              <input type="checkbox" checked={consentGiven} onChange={(event) => setConsentGiven(event.target.checked)} className="mt-1 h-4 w-4 accent-brand-forest" />
              <span>I consent to Antaran storing this booking request in my account so I can view its status later.</span>
            </label>
          )}
          {submitError && <p className="rounded-md bg-semantic-danger/10 p-3 text-sm font-medium text-semantic-danger" role="alert">{submitError}</p>}
          {!availabilityLoading && !availability.enabled && <p className="rounded-md bg-mist p-3 text-sm text-ink/70">Booking is temporarily unavailable. Please check back soon.</p>}
          <button className="btn-primary w-full justify-center" type="submit" disabled={submitting || availabilityLoading || !availability.enabled}>
            {submitting ? 'Sending...' : 'Send booking request'}
            <ArrowRight size={18} />
          </button>
        </form>}
      </div>
    </section>
  );
}

function Field({ label, name, type = 'text', error, touched, ...props }) {
  const showError = touched && error;
  return (
    <label className="field">
      <span>
        {label}
        {props.required && <span className="text-semantic-danger"> *</span>}
      </span>
      <input
        name={name}
        type={type}
        aria-invalid={showError ? 'true' : 'false'}
        aria-describedby={showError ? `${name}-error` : undefined}
        className={showError ? 'border-semantic-danger focus:border-semantic-danger focus:ring-semantic-danger/15' : ''}
        {...props}
      />
      {showError && (
        <span id={`${name}-error`} className="text-xs font-medium text-semantic-danger">
          {error}
        </span>
      )}
    </label>
  );
}

function ContactRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <Icon size={18} className="text-clay" />
      <span className="font-semibold text-ink">{label}:</span>
      <span>{value}</span>
    </div>
  );
}

function validate(data, todayString, slots, selectedDate) {
  const errors = {};
  Object.entries(data).forEach(([name, value]) => {
    const fieldErrors = validateField(name, value, todayString, slots, selectedDate);
    if (fieldErrors[name]) errors[name] = fieldErrors[name];
  });
  return errors;
}

function validateField(name, value, todayString, slots, selectedDate) {
  const errors = {};

  if (name === 'name') {
    const trimmed = String(value || '').trim();
    if (!trimmed) {
      errors[name] = 'Please enter your full name.';
    } else if (trimmed.length < 2) {
      errors[name] = 'Name must be at least 2 characters.';
    } else if (!/[\p{L}\s.'-]+/u.test(trimmed)) {
      errors[name] = 'Please use only letters, spaces, and common name characters.';
    }
  }

  if (name === 'age') {
    const age = value ? Number(value) : NaN;
    if (value && (Number.isNaN(age) || age < 1 || age > 120 || !Number.isInteger(age))) {
      errors[name] = 'Please enter a valid age between 1 and 120.';
    }
  }

  if (name === 'phone') {
    const trimmed = String(value || '').replace(/\s/g, '');
    if (!trimmed) {
      errors[name] = 'Please enter your phone number.';
    } else {
      const digits = trimmed.replace(/\D/g, '');
      const isIndianMobile =
        digits.length === 10 && /^[6-9]/.test(digits);
      const isIndianWithCountry =
        trimmed.startsWith('+91') &&
        digits.length === 12 &&
        /^[6-9]/.test(digits.slice(2));
      if (!isIndianMobile && !isIndianWithCountry) {
        errors[name] = 'Please enter a valid Indian phone number (e.g. +91 80888 92105).';
      }
    }
  }

  if (name === 'email') {
    const trimmed = String(value || '').trim();
    if (trimmed && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      errors[name] = 'Please enter a valid email address.';
    }
  }

  if (name === 'date') {
    if (!value) {
      errors[name] = 'Please select a preferred date.';
    } else if (value < todayString) {
      errors[name] = 'Please choose today or a future date.';
    } else {
      const availableDates = [...new Set((slots || []).map((slot) => slot.date))].sort();
      if (availableDates.length === 0) {
        errors[name] = 'Booking is currently unavailable.';
      } else if (!availableDates.includes(value)) {
        const first = formatDate(availableDates[0]);
        const last = formatDate(availableDates[availableDates.length - 1]);
        errors[name] = `Please select a date between ${first} and ${last}.`;
      }
    }
  }

  if (name === 'time') {
    if (!value) {
      errors[name] = 'Please select a preferred time.';
    } else {
      const availableTimes = selectedDate
        ? (slots || []).filter((slot) => slot.date === selectedDate).map((slot) => slot.time).sort()
        : [];
      if (availableTimes.length === 0) {
        errors[name] = 'No time slots are available for this date.';
      } else if (!availableTimes.includes(value)) {
        const first = formatTime(availableTimes[0]);
        const last = formatTime(availableTimes[availableTimes.length - 1]);
        const examples = availableTimes.slice(0, 3).map(formatTime).join(', ');
        errors[name] = `Please choose a slot between ${first} and ${last} (e.g. ${examples}).`;
      }
    }
  }

  return errors;
}

function formatDate(date) {
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function formatTime(time) {
  return new Date(`1970-01-01T${time}`).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}
