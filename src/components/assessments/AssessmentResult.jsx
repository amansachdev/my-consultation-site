import { CrisisBanner } from './CrisisBanner';

export function AssessmentResult({ title, score, severity, isHighRisk, onReset }) {
  return (
    <div className="grid gap-5 rounded-lg border border-neutral-line bg-white p-5 shadow-sm sm:p-7">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand-coral">
          {title} result
        </p>
        <h2 className="mt-2 font-serif text-4xl font-semibold text-neutral-ink">
          {score} / {title === 'PHQ-9' ? 27 : 21}
        </h2>
        <p className="mt-1 text-lg font-medium text-brand-leaf">{severity}</p>
      </div>

      {isHighRisk && <CrisisBanner />}

      <div className="rounded-md bg-brand-sage p-4 text-sm leading-6 text-neutral-ink">
        <p className="font-semibold">This is not a diagnosis.</p>
        <p>
          The {title} is a screening tool to help your clinician understand how
          you have been feeling. Only a qualified clinician can assess your
          symptoms and recommend next steps.
        </p>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="inline-flex min-h-12 items-center justify-center rounded-full border border-brand-leaf bg-white px-6 font-semibold text-neutral-ink transition hover:bg-brand-sage"
      >
        Retake {title}
      </button>
    </div>
  );
}
