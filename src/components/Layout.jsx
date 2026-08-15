import { CalendarCheck, Instagram, Mail, MapPin, Phone } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { brand, doctor } from '../constants';

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
        <Link to="/book" className="btn-primary h-10 px-4 text-sm">
          <CalendarCheck size={17} />
          Book
        </Link>
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
    <footer className="border-t border-line bg-ink px-5 py-10 text-white lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="space-y-4">
          <p className="font-serif text-lg font-semibold">{brand.name}</p>
          <div className="flex flex-col gap-2 text-sm text-white/80">
            <a
              href={`tel:${doctor.phone.replace(/\s/g, '')}`}
              className="flex items-center gap-2 hover:text-white"
            >
              <Phone size={16} />
              {doctor.phone}
            </a>
            <a
              href={`mailto:${doctor.email}`}
              className="flex items-center gap-2 hover:text-white"
            >
              <Mail size={16} />
              {doctor.email}
            </a>
            <div className="flex items-center gap-2">
              <MapPin size={16} />
              {doctor.city}
            </div>
            <a
              href={doctor.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-white"
            >
              <Instagram size={16} />
              @antaran.health
            </a>
          </div>
        </div>
        <div className="max-w-xl space-y-3 text-sm text-white/65">
          <p>
            <span className="font-semibold text-white/90">Cancellation:</span>{' '}
            You can reschedule or cancel up to 24 hours before your appointment.
            Cancellations within 24 hours may not be eligible for a refund.
          </p>
          <p>
            <span className="font-semibold text-white/90">Emergency:</span> This
            site is not for medical emergencies. Call 112 or visit your nearest
            hospital if immediate help is required.
          </p>
        </div>
      </div>
    </footer>
  );
}
