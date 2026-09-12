import { useMemo, useState } from 'react';
import { ArrowRight, Search, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

const categories = ['All', 'Anxiety', 'Mood', 'Sleep', 'Attention', 'Stress'];

const concerns = [
  {
    category: 'Anxiety',
    title: 'Anxiety and constant worry',
    summary: 'When worry feels difficult to switch off or starts shaping everyday choices.',
    signs: ['Feeling restless or constantly on edge', 'Difficulty concentrating', 'Muscle tension, fatigue, or disrupted sleep'],
  },
  {
    category: 'Anxiety',
    title: 'Panic and sudden fear',
    summary: 'Episodes of intense fear that arrive quickly and feel difficult to understand.',
    signs: ['Racing heart or shortness of breath', 'Dizziness, trembling, or sweating', 'Fear of losing control or something terrible happening'],
  },
  {
    category: 'Mood',
    title: 'Low mood and depression',
    summary: 'A persistent change in mood, energy, interest, or how you see yourself.',
    signs: ['Sadness, emptiness, or irritability lasting for weeks', 'Loss of interest in activities', 'Changes in sleep, appetite, energy, or concentration'],
  },
  {
    category: 'Mood',
    title: 'Mood changes and emotional ups and downs',
    summary: 'Mood shifts that feel unusually intense or begin affecting daily life and relationships.',
    signs: ['Periods of unusually high or low energy', 'Racing thoughts or reduced need for sleep', 'Impulsive decisions or difficulty slowing down'],
  },
  {
    category: 'Sleep',
    title: 'Sleep difficulties',
    summary: 'Ongoing problems falling asleep, staying asleep, or feeling rested.',
    signs: ['Taking a long time to fall asleep', 'Waking frequently or too early', 'Sleep problems affecting mood, work, or relationships'],
  },
  {
    category: 'Attention',
    title: 'Attention and organisation',
    summary: 'Persistent difficulty with focus, memory, planning, or managing time.',
    signs: ['Easily losing track of tasks or conversations', 'Forgetfulness in daily activities', 'Difficulty organising work or completing routines'],
  },
  {
    category: 'Stress',
    title: 'Work stress and burnout',
    summary: 'Stress that continues beyond a difficult week and begins affecting health or functioning.',
    signs: ['Feeling emotionally or physically exhausted', 'Becoming detached or unusually irritable', 'Difficulty recovering after rest or time away'],
  },
  {
    category: 'Stress',
    title: 'Relationship and life transitions',
    summary: 'Emotional strain connected to conflict, loss, change, or a demanding phase of life.',
    signs: ['Feeling overwhelmed or unable to cope', 'Repeated conflict or withdrawal', 'Changes in mood, sleep, appetite, or confidence'],
  },
];

export function SymptomsPage() {
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const filteredConcerns = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return concerns.filter((concern) => {
      const matchesCategory = category === 'All' || concern.category === category;
      const searchableText = `${concern.title} ${concern.summary} ${concern.signs.join(' ')}`.toLowerCase();
      return matchesCategory && (!normalizedQuery || searchableText.includes(normalizedQuery));
    });
  }, [category, query]);

  return (
    <main>
      <section className="border-b border-line bg-brand-sage/60">
        <div className="section grid gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:py-24">
          <div>
            <p className="eyebrow">Symptoms & concerns</p>
            <h1 className="max-w-3xl font-serif text-5xl font-semibold leading-tight md:text-7xl">A place to begin understanding what you are feeling.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-ink/70">Explore common patterns people bring to a mental-health consultation. Recognising a pattern is a reason to seek support, not a diagnosis.</p>
          </div>
          <div className="rounded-2xl border border-brand-forest/15 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-forest">A gentle next step</p>
            <p className="mt-3 text-lg leading-8 text-ink/75">You do not need to identify the right label before asking for help. A clinician can listen to the full context and help you decide what comes next.</p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link className="btn-primary" to="/assessment">Take an assessment <ArrowRight size={17} /></Link>
              <Link className="btn-secondary" to="/book">Book a consultation</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div><p className="eyebrow">Browse by concern</p><h2 className="font-serif text-4xl font-semibold">What feels familiar?</h2></div>
            <label className="field lg:w-80"><span className="sr-only">Search symptoms and concerns</span><span className="relative"><Search className="pointer-events-none absolute left-3 top-3.5 text-ink/50" size={18} /><input className="pl-10" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search concerns" /></span></label>
          </div>
          <div className="mt-6 flex flex-wrap gap-2" aria-label="Concern categories">
            {categories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} className={`min-h-10 rounded-full border px-4 text-sm font-semibold transition ${category === item ? 'border-brand-forest bg-brand-forest text-white' : 'border-line bg-white text-ink/75 hover:border-brand-leaf'}`}>{item}</button>)}
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {filteredConcerns.map((concern, index) => <ConcernCard key={concern.title} concern={concern} index={index} />)}
          </div>
          {filteredConcerns.length === 0 && <p className="mt-8 rounded-lg border border-line bg-mist p-6 text-center text-ink/65">No concerns match that search. Try another word or browse all categories.</p>}
        </div>
      </section>

      <SafetyNotice />
    </main>
  );
}

function ConcernCard({ concern, index }) {
  return <article className="rounded-xl border border-line bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-start justify-between gap-4"><span className="status-pill">{concern.category}</span><span className="text-sm text-ink/40">{String(index + 1).padStart(2, '0')}</span></div><h3 className="mt-5 font-serif text-2xl font-semibold">{concern.title}</h3><p className="mt-3 leading-7 text-ink/70">{concern.summary}</p><ul className="mt-5 space-y-3 border-t border-line pt-5 text-sm leading-6 text-ink/75">{concern.signs.map((sign) => <li className="flex gap-3" key={sign}><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-coral" />{sign}</li>)}</ul></article>;
}

function SafetyNotice() {
  return <section className="border-t border-line bg-white"><div className="section"><div className="mx-auto max-w-4xl rounded-xl border border-semantic-danger/25 bg-semantic-danger/10 p-6 sm:p-8"><div className="flex gap-4"><ShieldAlert className="mt-1 shrink-0 text-semantic-danger" size={24} /><div><h2 className="text-xl font-semibold text-semantic-danger">This guide is not an emergency service</h2><p className="mt-2 leading-7 text-ink/75">These pages are for general education and do not diagnose or assess immediate risk. If you or someone else may be in immediate danger, call <a className="font-semibold underline" href="tel:112">112</a> or go to the nearest emergency department.</p><p className="mt-3 text-sm leading-6 text-ink/65">For ongoing support in India, you can also contact Tele-MANAS at <a className="font-semibold underline" href="tel:14416">14416</a>. Please verify helpline details before launch as services can change.</p></div></div></div></div></section>;
}
