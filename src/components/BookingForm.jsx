import { ArrowRight, Mail, MapPin, Phone } from 'lucide-react';
import {
  consultationTypes,
  doctor,
  GOOGLE_FORM_BASE,
  GOOGLE_FORM_ENTRIES,
} from '../constants';

export function BookingForm() {
  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const params = new URLSearchParams();

    Object.entries(GOOGLE_FORM_ENTRIES).forEach(([field, entryId]) => {
      const value = formData.get(field);
      if (value) params.set(entryId, String(value));
    });

    window.open(`${GOOGLE_FORM_BASE}&${params.toString()}`, '_blank', 'noopener,noreferrer');
    form.reset();
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
          <div className="mt-6 rounded-lg border border-line bg-mist p-4 text-sm leading-6 text-ink/70">
            <p className="font-semibold text-ink">Cancellation policy</p>
            <p>
              You can reschedule or cancel up to 24 hours before your
              appointment. Cancellations within 24 hours may not be eligible for
              a refund.
            </p>
          </div>
        </div>
        <form className="booking-form" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Full name" name="name" required />
            <Field label="Age" name="age" type="number" min="1" max="120" />
            <Field label="Phone / WhatsApp" name="phone" required />
            <Field label="Email" name="email" type="email" />
            <Select
              label="Consultation type"
              name="consultationType"
              options={consultationTypes.map((item) => item.title)}
            />
            <Field label="Preferred date" name="date" type="date" />
            <Field label="Preferred time" name="time" type="time" />
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

function Field({ label, name, type = 'text', ...props }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input name={name} type={type} {...props} />
    </label>
  );
}

function Select({ label, name, options }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select name={name}>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
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
