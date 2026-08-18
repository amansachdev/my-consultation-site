import { useMemo, useState } from 'react';
import { ArrowRight, Mail, MapPin, Phone } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import {
  consultationTypes,
  doctor,
  GOOGLE_FORM_BASE,
  GOOGLE_FORM_ENTRIES,
} from '../constants';

export function BookingForm() {
  const location = useLocation();
  const preselectedType = location.state?.consultationType || '';

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const todayString = useMemo(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().split('T')[0];
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    const validationErrors = validate(data, todayString);
    setErrors(validationErrors);
    setTouched({
      name: true,
      age: true,
      phone: true,
      email: true,
      consultationType: true,
      date: true,
      time: true,
    });

    if (Object.keys(validationErrors).length > 0) {
      const firstErrorField = form.querySelector('[aria-invalid="true"]');
      firstErrorField?.focus();
      return;
    }

    const params = new URLSearchParams();
    Object.entries(GOOGLE_FORM_ENTRIES).forEach(([field, entryId]) => {
      const value = formData.get(field);
      if (value) params.set(entryId, String(value));
    });

    window.open(`${GOOGLE_FORM_BASE}&${params.toString()}`, '_blank', 'noopener,noreferrer');
    form.reset();
    setErrors({});
    setTouched({});
  };

  const handleBlur = (event) => {
    const { name, value } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const fieldErrors = validateField(name, value, todayString);
    setErrors((prev) => ({ ...prev, [name]: fieldErrors[name] }));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (touched[name]) {
      const fieldErrors = validateField(name, value, todayString);
      setErrors((prev) => ({ ...prev, [name]: fieldErrors[name] }));
    }
  };

  return (
    <section id="booking" className="bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:px-8">
        <div className="max-w-xl">
          <p className="eyebrow">Book</p>
          <h2 className="font-serif text-4xl font-semibold leading-tight md:text-5xl">
            Request a consultation.
          </h2>
          <p className="mt-5 text-lg leading-8 text-ink/70">
            Fill in your details below. We will open a short Google Form with
            your information pre-filled so you can review and submit it
            securely.
          </p>
          <div className="mt-8 space-y-4 text-sm text-ink/72">
            <ContactRow icon={Phone} label="Phone" value={doctor.phone} />
            <ContactRow icon={Mail} label="Email" value={doctor.email} />
            <ContactRow icon={MapPin} label="Location" value={doctor.city} />
          </div>
        </div>
        <form className="booking-form" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-4 md:grid-cols-2">
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
              error={errors.email}
              touched={touched.email}
              onBlur={handleBlur}
              onChange={handleChange}
            />
            <Select
              label="Consultation type"
              name="consultationType"
              options={consultationTypes.map((item) => item.title)}
              defaultValue={preselectedType}
              required
              error={errors.consultationType}
              touched={touched.consultationType}
              onBlur={handleBlur}
              onChange={handleChange}
            />
            <Field
              label="Preferred date"
              name="date"
              type="date"
              min={todayString}
              required
              error={errors.date}
              touched={touched.date}
              onBlur={handleBlur}
              onChange={handleChange}
            />
            <Field
              label="Preferred time"
              name="time"
              type="time"
              required
              error={errors.time}
              touched={touched.time}
              onBlur={handleBlur}
              onChange={handleChange}
            />
          </div>
          <label className="field">
            <span>What would you like help with?</span>
            <textarea
              name="message"
              rows="4"
              placeholder="Share a short note. Avoid emergency details here."
            />
          </label>
          <button className="btn-primary w-full justify-center" type="submit">
            Send booking request
            <ArrowRight size={18} />
          </button>
        </form>
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

function Select({ label, name, options, defaultValue = '', required, error, touched, onBlur, onChange }) {
  const showError = touched && error;
  return (
    <label className="field">
      <span>
        {label}
        {required && <span className="text-semantic-danger"> *</span>}
      </span>
      <select
        name={name}
        defaultValue={defaultValue}
        aria-invalid={showError ? 'true' : 'false'}
        aria-describedby={showError ? `${name}-error` : undefined}
        className={showError ? 'border-semantic-danger focus:border-semantic-danger focus:ring-semantic-danger/15' : ''}
        onBlur={onBlur}
        onChange={onChange}
      >
        <option value="" disabled>
          Select a consultation type
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
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

function validate(data, todayString) {
  const errors = {};
  Object.entries(data).forEach(([name, value]) => {
    const fieldErrors = validateField(name, value, todayString);
    if (fieldErrors[name]) errors[name] = fieldErrors[name];
  });
  return errors;
}

function validateField(name, value, todayString) {
  const errors = {};

  if (name === 'name') {
    const trimmed = String(value || '').trim();
    if (!trimmed) {
      errors[name] = 'Please enter your full name.';
    } else if (trimmed.length < 2) {
      errors[name] = 'Name must be at least 2 characters.';
    } else if (!/^[\p{L}\s.'-]+$/u.test(trimmed)) {
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

  if (name === 'consultationType') {
    if (!value) {
      errors[name] = 'Please select a consultation type.';
    }
  }

  if (name === 'date') {
    if (!value) {
      errors[name] = 'Please select a preferred date.';
    } else if (value < todayString) {
      errors[name] = 'Please choose today or a future date.';
    }
  }

  if (name === 'time') {
    if (!value) {
      errors[name] = 'Please select a preferred time.';
    }
  }

  return errors;
}
