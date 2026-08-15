import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  HeartHandshake,
  Instagram,
  LockKeyhole,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  Video,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import heroImage from '../assets/consultation-hero.png';

const doctor = {
  name: 'Dr Medha',
  qualification: 'Consultant Psychiatrist',
  city: 'Bengaluru / Online',
  phone: '+91 80888 92105',
  whatsapp: '+91 80888 92105',
  email: 'antaran.health@gmail.com',
  instagram: 'https://www.instagram.com/antaran.health?igsh=MTA4Zjc2am1ibzd4eQ%3D%3D&utm_source=qr',
};

const careAreas = [
  'Anxiety and stress',
  'Low mood and depression',
  'Sleep concerns',
  'Relationship stress',
  'Workplace burnout',
  'Medication reviews',
];

const steps = [
  {
    title: 'Share your concern',
    text: 'Fill a short booking request with your preferred time and consultation mode.',
    icon: MessageCircle,
  },
  {
    title: 'Get confirmation',
    text: 'The clinic team reviews the request and confirms availability.',
    icon: CalendarCheck,
  },
  {
    title: 'Begin care',
    text: 'Meet online or in person and receive a practical care plan.',
    icon: HeartHandshake,
  },
];

const consultationTypes = [
  {
    title: 'Initial Consultation',
    duration: '45-60 min',
    description: 'A first appointment to understand symptoms, history, and goals.',
  },
  {
    title: 'Follow-up',
    duration: '20-30 min',
    description: 'Ongoing support, medication review, and care-plan adjustments.',
  },
];

const GOOGLE_FORM_BASE =
  'https://docs.google.com/forms/d/e/1FAIpQLSdbdGQpTFU8T9KH-H6M9-PvqzBAhcteDhQDIUo2FXuVZesukQ/viewform?usp=pp_url';

const GOOGLE_FORM_ENTRIES = {
  name: 'entry.1757509789',
  age: 'entry.1385558754',
  phone: 'entry.272098946',
  email: 'entry.1222143642',
  consultationType: 'entry.1226581237',
  date: 'entry.1538227956',
  time: 'entry.2033637864',
  message: 'entry.1615957077',
};

function App() {
  const handleBooking = (event) => {
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
    <div className="min-h-screen bg-mist text-ink">
      <Header />
      <main>
        <Hero />
        <TrustBar />
        <CarePaths />
        <Process />
        <Consultations />
        <BookingForm onSubmit={handleBooking} />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-mist/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
        <a href="#top" className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-moss text-sm font-semibold text-white">
            DM
          </span>
          <span className="text-sm font-semibold tracking-wide">
            {doctor.name}
          </span>
        </a>
        <div className="hidden items-center gap-7 text-sm font-medium text-ink/70 md:flex">
          <a href="#care">Care</a>
          <a href="#consultations">Consultations</a>
          <a href="#booking">Book</a>
          <a href="#contact">Contact</a>
          <Link to="/assessment" className="hover:text-ink">
            Assessments
          </Link>
        </div>
        <a className="btn-primary h-10 px-4 text-sm" href="#booking">
          <CalendarCheck size={17} />
          Book
        </a>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden border-b border-line">
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Calm consultation desk with laptop and notes"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(246,247,243,0.98)_0%,rgba(246,247,243,0.88)_42%,rgba(246,247,243,0.2)_100%)]" />
      </div>
      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl content-center px-5 py-16 lg:px-8">
        <div className="max-w-2xl">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-line bg-white/75 px-3 py-1 text-sm font-medium text-moss">
            <Sparkles size={16} />
            Online and in-person mental health consultations
          </p>
          <h1 className="font-serif text-5xl font-semibold leading-[1.05] md:text-7xl">
            Care that starts with being heard.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-ink/72">
            Book a private consultation with {doctor.name}. Get structured,
            thoughtful support for emotional health, sleep, stress, and ongoing
            psychiatric care.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a className="btn-primary" href="#booking">
              Book a consultation
              <ArrowRight size={18} />
            </a>
            <a className="btn-secondary" href="#consultations">
              View consultation types
            </a>
          </div>
          <div className="mt-8 grid gap-3 text-sm text-ink/70 sm:grid-cols-3">
            <Metric label="Private" value="Confidential care" />
            <Metric label="Flexible" value="Online / clinic" />
            <Metric label="Guided" value="Clear next steps" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }) {
  return (
    <div className="border-l border-moss/30 pl-4">
      <p className="font-semibold text-ink">{label}</p>
      <p>{value}</p>
    </div>
  );
}

function TrustBar() {
  const items = [
    [ShieldCheck, 'Registered professional care'],
    [LockKeyhole, 'Confidential consultations'],
    [Video, 'Secure online sessions'],
    [Clock3, 'Flexible appointment slots'],
  ];

  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-7xl gap-4 px-5 py-6 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        {items.map(([Icon, text]) => (
          <div key={text} className="flex items-center gap-3 text-sm font-medium">
            <Icon className="text-clay" size={20} />
            <span>{text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function CarePaths() {
  return (
    <section id="care" className="section">
      <div className="section-heading">
        <p className="eyebrow">Care Areas</p>
        <h2>Support for the concerns people actually bring in.</h2>
        <p>
          This is placeholder service copy until Dr Medha confirms exact
          specialties, credentials, and clinic policies.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {careAreas.map((area) => (
          <div key={area} className="care-item">
            <CheckCircle2 size={20} />
            <span>{area}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Process() {
  return (
    <section className="bg-sage">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="section-heading mx-0">
          <p className="eyebrow">How It Works</p>
          <h2>Simple booking, thoughtful follow-through.</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <article key={step.title} className="step-card">
                <div className="flex items-center justify-between">
                  <Icon className="text-clay" size={26} />
                  <span className="text-sm font-semibold text-moss">
                    0{index + 1}
                  </span>
                </div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Consultations() {
  return (
    <section id="consultations" className="section">
      <div className="section-heading">
        <p className="eyebrow">Consultations</p>
        <h2>Choose the right appointment type.</h2>
        <p>
          Fees, payment collection, cancellation policy, and exact session
          lengths can be connected once the clinic workflow is finalized.
        </p>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        {consultationTypes.map((item) => (
          <article key={item.title} className="service-card">
            <p className="text-sm font-semibold text-clay">{item.duration}</p>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <a href="#booking">
              Request slot
              <ArrowRight size={16} />
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}

function BookingForm({ onSubmit }) {
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
        <form className="booking-form" onSubmit={onSubmit}>
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

function ContactSection() {
  return (
    <section id="contact" className="section">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <p className="eyebrow">Contact</p>
          <h2 className="font-serif text-4xl font-semibold md:text-5xl">
            Reach the clinic.
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <ContactTile icon={Phone} title="Phone" value={doctor.phone} />
          <ContactTile icon={MessageCircle} title="WhatsApp" value={doctor.whatsapp} />
          <ContactTile icon={Mail} title="Email" value={doctor.email} />
          <ContactTile icon={MapPin} title="Clinic" value={doctor.city} />
          <ContactTile
            icon={Instagram}
            title="Instagram"
            value="@antaran.health"
            href={doctor.instagram}
          />
        </div>
      </div>
    </section>
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

function ContactTile({ icon: Icon, title, value, href }) {
  const content = (
    <>
      <Icon className="text-clay" size={24} />
      <div>
        <h3>{title}</h3>
        <p>{value}</p>
      </div>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="contact-tile text-ink"
      >
        {content}
      </a>
    );
  }

  return <div className="contact-tile">{content}</div>;
}

function Footer() {
  return (
    <footer className="border-t border-line bg-ink px-5 py-8 text-white lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm md:flex-row md:items-start md:justify-between">
        <p>{doctor.name} Consultation Clinic</p>
        <div className="max-w-xl space-y-2 text-white/65">
          <p>
            Cancellation: You can reschedule or cancel up to 24 hours before
            your appointment. Cancellations within 24 hours may not be eligible
            for a refund.
          </p>
          <p>
            This site is not for medical emergencies. Call local emergency
            services if immediate help is required.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default App;
