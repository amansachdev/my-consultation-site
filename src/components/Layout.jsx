import {
  CalendarCheck,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { brand, doctor } from '../constants';
import { useAuth } from '../context/useAuth';

export function Layout({ children }) {
  return (
    <div className="min-h-screen bg-mist text-ink">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

function Header() {
  const { isAuthenticated, status, signIn } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-mist/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <img
            src={brand.logo}
            alt={brand.name}
            className="h-10 w-auto rounded-full object-cover"
          />
          <span className="font-serif text-xl font-semibold tracking-tight text-ink">
            {brand.name}
          </span>
        </Link>
        <div className="hidden items-center gap-7 text-sm font-medium text-ink/70 md:flex">
          <NavLink to="/book">Book</NavLink>
          <NavLink to="/assessment">Assessments</NavLink>
          <NavLink to="/team">Know your team</NavLink>
        </div>
        <div className="flex items-center gap-2">
          {status === 'ready' && (isAuthenticated ? (
            <Link to="/account" className="btn-secondary h-10 px-3 text-sm sm:px-4">Account</Link>
          ) : (
            <button type="button" onClick={signIn} className="btn-secondary h-10 px-3 text-sm sm:px-4">Sign in</button>
          ))}
          <Link to="/book" className="btn-primary h-10 px-4 text-sm">
            <CalendarCheck size={17} />
            Book
          </Link>
        </div>
      </nav>
    </header>
  );
}

function NavLink({ to, children }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`transition hover:text-ink ${
        isActive ? 'font-semibold text-ink' : ''
      }`}
    >
      {children}
    </Link>
  );
}

function Footer() {
  return (
    <footer className="border-t border-line bg-ink px-5 py-12 text-white lg:px-8">
      <div className="mx-auto max-w-7xl space-y-10">
        {/* Brand block */}
        <div className="flex flex-col items-center gap-4 text-center">
          <img
            src={brand.logo}
            alt={brand.name}
            className="h-16 w-auto rounded-full object-cover"
          />
          <div>
            <p className="font-serif text-2xl font-semibold">{brand.name}</p>
            <p className="text-sm tracking-wide text-white/70">{brand.tagline}</p>
          </div>
        </div>

        {/* Contact cards */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <ContactCard
            icon={Phone}
            label="Phone"
            value={doctor.phone}
            href={`tel:${doctor.phone.replace(/\s/g, '')}`}
          />
          <ContactCard
            icon={MessageCircle}
            label="WhatsApp"
            value={doctor.whatsapp}
            href={`https://wa.me/${doctor.whatsapp.replace(/[\s+]/g, '')}`}
          />
          <ContactCard
            icon={Mail}
            label="Email"
            value={doctor.email}
            href={`mailto:${doctor.email}`}
          />
          <ContactCard icon={MapPin} label="Location" value={doctor.city} />
          <ContactCard
            icon={Instagram}
            label="Instagram"
            value="@antaran.health"
            href={doctor.instagram}
          />
        </div>

        <p className="text-center text-xs text-white/40">
          © {new Date().getFullYear()} {brand.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

function ContactCard({ icon: Icon, label, value, href }) {
  const content = (
    <>
      <Icon className="text-brand-gold" size={20} />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-medium text-white">{value}</p>
      </div>
    </>
  );

  const className =
    'flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-4 transition hover:bg-white/10';

  if (href) {
    return (
      <a
        href={href}
        target={href.startsWith('http') ? '_blank' : undefined}
        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
        className={className}
      >
        {content}
      </a>
    );
  }

  return <div className={className}>{content}</div>;
}
