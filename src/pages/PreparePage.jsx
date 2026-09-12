import { ArrowRight, Check, Clock3, Laptop, LockKeyhole } from 'lucide-react';
import { Link } from 'react-router-dom';

const checklist = [
  ['Choose a private space', 'Find somewhere you can speak comfortably without being overheard.'],
  ['Keep useful information nearby', 'Have current medicines, previous prescriptions, reports, and relevant dates available if you have them.'],
  ['Notice the recent pattern', 'Think about changes in mood, sleep, appetite, energy, concentration, and daily functioning.'],
  ['Bring your questions', 'Write down what you most want to understand or change. There is no need to prepare a perfect story.'],
  ['Check your connection', 'Use a device with a working microphone, camera, and stable internet before the appointment.'],
];

export function PreparePage() {
  return <main>
    <section className="border-b border-line bg-brand-sage/60"><div className="section grid gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:py-24"><div><p className="eyebrow">Prepare for a consultation</p><h1 className="max-w-3xl font-serif text-5xl font-semibold leading-tight md:text-7xl">You do not need perfect words to begin.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-ink/70">A little preparation can make an online consultation feel more comfortable. Use this as a gentle checklist, not homework.</p></div><div className="rounded-2xl border border-brand-forest/15 bg-white p-6 shadow-sm"><div className="grid gap-5 sm:grid-cols-3 lg:grid-cols-1"><Info icon={Clock3} label="Before" text="Give yourself a few quiet minutes." /><Info icon={Laptop} label="During" text="Speak at your own pace." /><Info icon={LockKeyhole} label="Privacy" text="Choose a private setting." /></div></div></div></section>
    <section className="section"><div className="mx-auto max-w-4xl"><div className="section-heading text-left"><p className="eyebrow">A simple checklist</p><h2>Bring what feels relevant.</h2><p>You can still attend if you cannot prepare everything. The clinician will help guide the conversation.</p></div><div className="grid gap-3">{checklist.map(([title, text]) => <article className="flex gap-4 rounded-lg border border-line bg-white p-5 shadow-sm sm:p-6" key={title}><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-sage text-brand-forest"><Check size={17} /></span><div><h3 className="font-semibold">{title}</h3><p className="mt-1 leading-7 text-ink/70">{text}</p></div></article>)}</div></div></section>
    <section className="border-t border-line bg-white"><div className="section grid gap-6 md:grid-cols-2"><div className="rounded-xl border border-line bg-brand-sand p-6 sm:p-8"><p className="eyebrow">What happens next</p><h2 className="font-serif text-3xl font-semibold">After you request a slot</h2><p className="mt-4 leading-7 text-ink/70">The clinic team reviews your preferred time, creates the meeting details when the request is accepted, and shares the next steps with you.</p><Link className="mt-6 inline-flex items-center gap-2 font-semibold text-brand-forest" to="/book">Request a slot <ArrowRight size={16} /></Link></div><div className="rounded-xl border border-semantic-danger/25 bg-semantic-danger/10 p-6 sm:p-8"><p className="eyebrow text-semantic-danger">Important</p><h2 className="font-serif text-3xl font-semibold">Online care is not for emergencies.</h2><p className="mt-4 leading-7 text-ink/75">If there is immediate danger or a risk of harm, call 112 or go to the nearest emergency department rather than waiting for an appointment.</p><a className="mt-6 inline-flex items-center gap-2 font-semibold text-semantic-danger" href="tel:112">Call 112 <ArrowRight size={16} /></a></div></div></section>
  </main>;
}

function Info({ icon: Icon, label, text }) {
  return <div className="flex items-center gap-3 lg:items-start"><Icon className="shrink-0 text-brand-coral" size={21} /><div><p className="text-sm font-semibold text-brand-forest">{label}</p><p className="mt-0.5 text-sm leading-6 text-ink/65">{text}</p></div></div>;
}
