import { CrisisBanner } from './CrisisBanner';
import { useState } from 'react';
import { LogIn, Save } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { apiRequest } from '../../lib/api';

export function AssessmentResult({ title, score, severity, isHighRisk, responses, onReset }) {
  const { isAuthenticated, signIn } = useAuth();
  const [consent, setConsent] = useState(false);
  const [saveState, setSaveState] = useState('idle');
  const [saveError, setSaveError] = useState('');

  const saveAssessment = async () => {
    if (!consent) return;
    setSaveState('saving');
    setSaveError('');
    try {
      await apiRequest('/assessments', {
        method: 'POST',
        body: JSON.stringify({
          assessmentType: title,
          responses,
          consentGiven: true,
          consentVersion: 'assessment-storage-v1',
        }),
      });
      setSaveState('saved');
    } catch (error) {
      setSaveState('idle');
      setSaveError(error.message);
    }
  };

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

      {isAuthenticated ? (
        <div className="rounded-md border border-neutral-line bg-neutral-mist p-4">
          <label className="flex gap-3 text-sm leading-6 text-neutral-ink">
            <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1 h-4 w-4 accent-brand-forest" />
            <span>I consent to saving my {title} responses and score to my Antaran account so I can review them later.</span>
          </label>
          <button type="button" onClick={saveAssessment} disabled={!consent || saveState === 'saving' || saveState === 'saved'} className="btn-primary mt-4">
            <Save size={17} />
            {saveState === 'saved' ? 'Saved to account' : saveState === 'saving' ? 'Saving...' : 'Save assessment'}
          </button>
          {saveError && <p className="mt-3 text-sm font-medium text-semantic-danger" role="alert">{saveError}</p>}
        </div>
      ) : (
        <button type="button" onClick={signIn} className="btn-secondary justify-center"><LogIn size={17} /> Sign in with Google to save</button>
      )}

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
