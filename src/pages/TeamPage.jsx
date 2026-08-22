import { Mail, MapPin, Phone } from 'lucide-react';
import teamImage from '../../assets/dr medha profile.png';
import { doctor } from '../constants';

export function TeamPage() {
  return (
    <section className="section bg-white">
      <div className="section-heading">
        <p className="eyebrow">Know your team</p>
        <h2>Meet the clinician behind Antaran.</h2>
        <p>
          Psychiatric care grounded in careful listening, clinical experience,
          and thoughtful planning.
        </p>
      </div>

      <div className="mx-auto grid max-w-4xl gap-8 rounded-2xl border border-line bg-mist p-6 shadow-sm sm:p-10 md:grid-cols-[1fr_1.2fr] md:items-center">
        <div className="overflow-hidden rounded-xl">
          <img
            src={teamImage}
            alt={`${doctor.name}, ${doctor.qualification}`}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="font-serif text-3xl font-semibold text-ink">
              {doctor.name}
            </h3>
            <p className="text-lg font-medium text-moss">{doctor.qualification}</p>
          </div>
          <p className="leading-7 text-ink/70">
            Dr Medha is a Consultant Psychiatrist with an MBBS and MD in
            Psychiatry, currently completing a Clinical Post-Doctoral Fellowship
            at NIMHANS, Bengaluru. Her experience includes psychiatric
            assessment and management across concerns such as anxiety, low
            mood, sleep, stress, addiction, and medication care. She brings an
            evidence-based, patient-centred approach to secure online
            consultations.
          </p>
          <div className="space-y-2 text-sm text-ink/72">
            <div className="flex items-center gap-3">
              <Phone size={18} className="text-clay" />
              <a
                href={`tel:${doctor.phone.replace(/\s/g, '')}`}
                className="hover:text-moss"
              >
                {doctor.phone}
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-clay" />
              <a href={`mailto:${doctor.email}`} className="hover:text-moss">
                {doctor.email}
              </a>
            </div>
            <div className="flex items-center gap-3">
              <MapPin size={18} className="text-clay" />
              <span>{doctor.city}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
