import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  HeartHandshake,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Video,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import heroImage from '../../assets/consultation-hero.png';
import { FaqSection } from '../components/FaqSection';
import { brand, careAreas, consultationTypes, doctor, steps } from '../constants';

export function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <CarePaths />
      <Process />
      <Consultations />
      <FaqSection />
      <BookCta />
    </>
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
            Online mental health consultations
          </p>
          <p className="max-w-lg text-sm font-medium text-moss/80">
            Antaran means a passage forward, with thoughtful care for your emotional health.
          </p>
          <h1 className="py-2 font-serif text-5xl font-semibold leading-[1.1] md:text-7xl">
            Care that starts with being heard.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-ink/72">
            Book a private consultation with {doctor.name}. Get structured,
            thoughtful support for emotional health, sleep, stress, and ongoing
            psychiatric care.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link className="btn-primary" to="/book">
              Book a consultation
              <ArrowRight size={18} />
            </Link>
            <Link className="btn-secondary" to="/assessment">
              Take an assessment
            </Link>
          </div>
          <div className="mt-8 grid gap-3 text-sm text-ink/70 sm:grid-cols-3">
            <Metric label="Private" value="Confidential care" />
            <Metric label="Flexible" value="Online sessions" />
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
          From everyday stress to deeper emotional patterns, Antaran offers a
          calm, structured space to understand what you are going through and
          take meaningful steps forward.
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

const stepIcons = [MessageCircle, CalendarCheck, HeartHandshake];

function Process() {
  return (
    <section className="bg-sage">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="section-heading">
          <p className="eyebrow">How It Works</p>
          <h2>Simple booking, thoughtful follow-through.</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = stepIcons[index];
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
        <h2>Start with a psychiatric consultation.</h2>
        <p>
          Flexible, confidential online psychiatric care designed around your
          schedule and comfort.
        </p>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        {consultationTypes.map((item) => (
          <article key={item.title} className="service-card">
            <p className="text-sm font-semibold text-clay">{item.duration}</p>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <Link to="/book" state={{ consultationType: item.title }}>
              Request slot
              <ArrowRight size={16} />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

function BookCta() {
  return (
    <section className="border-t border-line bg-white">
      <div className="mx-auto max-w-7xl px-5 py-16 text-center lg:px-8">
        <p className="eyebrow">Ready to begin?</p>
        <h2 className="mx-auto max-w-2xl py-2 font-serif text-4xl font-semibold leading-normal md:text-5xl">
          Take the first step towards feeling better.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-lg font-medium text-moss">
          Where Healing Meets Understanding
        </p>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-ink/70">
          Book a private online consultation or complete a quick assessment to
          share how you have been feeling.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link className="btn-primary" to="/book">
            Book a consultation
            <ArrowRight size={18} />
          </Link>
          <Link className="btn-secondary" to="/assessment">
            Take an assessment
          </Link>
        </div>
      </div>
    </section>
  );
}
