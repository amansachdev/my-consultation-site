import { useState } from 'react';
import { Gad7Form } from './components/assessments/Gad7Form';
import { Phq9Form } from './components/assessments/Phq9Form';
import { AssessmentResult } from './components/assessments/AssessmentResult';

const SCALES = {
  phq9: 'PHQ-9',
  gad7: 'GAD-7',
};

export function AssessmentDemo() {
  const [activeScale, setActiveScale] = useState('phq9');
  const [result, setResult] = useState(null);

  const handleComplete = (nextResult) => {
    setResult(nextResult);
  };

  const handleReset = () => {
    setResult(null);
  };

  return (
    <section className="mx-auto max-w-3xl px-5 py-10">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-semibold text-neutral-ink md:text-4xl">
            Clinical intake assessments
          </h1>
          <p className="mt-3 leading-7 text-neutral-slate">
            These validated screening tools help your clinician understand how
            you have been feeling. They do not replace a clinical evaluation.
          </p>
        </div>

        <div className="mb-6 inline-flex rounded-full border border-neutral-line bg-white p-1 shadow-sm">
          {Object.entries(SCALES).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setActiveScale(key);
                setResult(null);
              }}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                activeScale === key
                  ? 'bg-brand-forest text-white'
                  : 'text-neutral-ink hover:bg-brand-sage'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {result ? (
          <AssessmentResult
            title={SCALES[activeScale]}
            score={result.total}
            severity={result.severity}
            isHighRisk={result.isHighRisk}
            onReset={handleReset}
          />
        ) : activeScale === 'phq9' ? (
          <Phq9Form onComplete={handleComplete} />
        ) : (
          <Gad7Form onComplete={handleComplete} />
        )}
    </section>
  );
}
