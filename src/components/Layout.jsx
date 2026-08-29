import {
  CalendarCheck,
  Instagram,
  Mail,
  Menu,
  MapPin,
  MessageCircle,
  Phone,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { adminEmails, brand, doctor } from '../constants';
import { useAuth } from '../context/useAuth';
import { isMockMode } from '../lib/dev-auth';

export function Layout({ children }) {
  return (
    <div className="min-h-screen bg-mist text-ink">
      <Header />
      {isMockMode() && <DevAuthToolbar />}
      <main>{children}</main>
      <Footer />
    </div>
  );
}

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, status, signIn, signOut, user } = useAuth();
  const isClinician = isAuthenticated && user?.email?.toLowerCase() === doctor.email.toLowerCase();
  const isAdmin = isAuthenticated && adminEmails.includes(user?.email?.toLowerCase());

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
          {isAdmin ? <NavLink to="/admin">Admin</NavLink> : isClinician && <NavLink to="/clinician/prescriptions">Prescriptions</NavLink>}
        </div>
        <div className="flex items-center gap-2">
          {status === 'ready' && (isAuthenticated ? (
            <Link to="/account" className="btn-secondary hidden h-10 px-3 text-sm sm:px-4 md:inline-flex">Account</Link>
          ) : (
            <button type="button" onClick={signIn} className="btn-secondary h-10 px-3 text-sm sm:px-4">Sign in</button>
          ))}
          <Link to="/book" className="btn-primary h-10 px-4 text-sm">
            <CalendarCheck size={17} />
            Book
          </Link>
          <button
            type="button"
            className="btn-secondary h-10 w-10 px-0 md:hidden"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </nav>
      {mobileMenuOpen && (
        <div className="absolute right-5 top-[4.5rem] w-64 rounded-lg border border-line bg-white p-2 shadow-lg md:hidden" role="dialog" aria-label="Mobile navigation">
          <div className="grid gap-1 text-sm font-medium text-ink/80">
            <MobileNavLink to="/assessment" onClick={() => setMobileMenuOpen(false)}>Assessments</MobileNavLink>
            <MobileNavLink to="/team" onClick={() => setMobileMenuOpen(false)}>Know your team</MobileNavLink>
            {isAdmin ? <MobileNavLink to="/admin" onClick={() => setMobileMenuOpen(false)}>Admin</MobileNavLink> : isClinician && <MobileNavLink to="/clinician/prescriptions" onClick={() => setMobileMenuOpen(false)}>Prescriptions</MobileNavLink>}
            {isAuthenticated && <MobileNavLink to="/account" onClick={() => setMobileMenuOpen(false)}>Account</MobileNavLink>}
            {isAuthenticated && (
              <button
                type="button"
                className="rounded-md px-3 py-2.5 text-left text-semantic-danger transition hover:bg-semantic-danger/10"
                onClick={async () => {
                  await signOut();
                  setMobileMenuOpen(false);
                }}
              >
                Sign out
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function DevAuthToolbar() {
  const { isAuthenticated, user, isMockUser, devSignIn, devSignOut, status } = useAuth();
  if (status !== 'ready') return null;
  return (
    <div className="border-b border-semantic-info/20 bg-semantic-info/10 px-5 py-2 text-sm">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3">
        <span className="font-semibold text-semantic-info">Mock mode</span>
        {isAuthenticated ? (
          <>
            <span className="text-ink/80">
              Signed in as <strong>{user?.email}</strong>
              {isMockUser && ' (mock)'}
            </span>
            <button type="button" onClick={devSignOut} className="btn-secondary min-h-8 px-3 text-xs">Sign out</button>
          </>
        ) : (
          <>
            <span className="text-ink/70">Sign in as:</span>
            <button type="button" onClick={() => devSignIn(adminEmails[0])} className="btn-secondary min-h-8 px-3 text-xs">Admin</button>
            <button type="button" onClick={() => devSignIn(doctor.email)} className="btn-secondary min-h-8 px-3 text-xs">Clinician</button>
            <button type="button" onClick={() => devSignIn('patient@example.com')} className="btn-secondary min-h-8 px-3 text-xs">Patient</button>
          </>
        )}
      </div>
    </div>
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

function MobileNavLink({ to, children, onClick }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`rounded-md px-3 py-2.5 transition hover:bg-mist hover:text-ink ${
        isActive ? 'bg-mist font-semibold text-ink' : ''
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
