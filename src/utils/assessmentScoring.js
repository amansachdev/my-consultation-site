/**
 * Scoring utilities for validated clinical assessment scales.
 *
 * IMPORTANT: These functions compute scores and surface risk flags only.
 * They do NOT diagnose. A qualified clinician must interpret all results.
 */

export const PHQ9_QUESTIONS = [
  'Little interest or pleasure in doing things',
  'Feeling down, depressed, or hopeless',
  'Trouble falling or staying asleep, or sleeping too much',
  'Feeling tired or having little energy',
  'Poor appetite or overeating',
  'Feeling bad about yourself — or that you are a failure or have let yourself or your family down',
  'Trouble concentrating on things, such as reading the newspaper or watching television',
  'Moving or speaking so slowly that other people could have noticed; or the opposite — being so fidgety or restless that you have been moving around a lot more than usual',
  'Thoughts that you would be better off dead, or of hurting yourself',
];

export const GAD7_QUESTIONS = [
  'Feeling nervous, anxious, or on edge',
  'Not being able to stop or control worrying',
  'Worrying too much about different things',
  'Trouble relaxing',
  'Being so restless that it is hard to sit still',
  'Becoming easily annoyed or irritable',
  'Feeling afraid, as if something awful might happen',
];

export const ANSWER_OPTIONS = [
  { label: 'Not at all', value: 0 },
  { label: 'Several days', value: 1 },
  { label: 'More than half the days', value: 2 },
  { label: 'Nearly every day', value: 3 },
];

export function scorePhq9(responses) {
  const total = responses.reduce((sum, value) => sum + (Number(value) || 0), 0);
  const suicidalIdeation = responses[8] > 0;

  let severity = 'Minimal depression';
  if (total >= 5) severity = 'Mild depression';
  if (total >= 10) severity = 'Moderate depression';
  if (total >= 15) severity = 'Moderately severe depression';
  if (total >= 20) severity = 'Severe depression';

  return {
    total,
    severity,
    suicidalIdeation,
    isHighRisk: suicidalIdeation,
  };
}

export function scoreGad7(responses) {
  const total = responses.reduce((sum, value) => sum + (Number(value) || 0), 0);

  let severity = 'Minimal anxiety';
  if (total >= 5) severity = 'Mild anxiety';
  if (total >= 10) severity = 'Moderate anxiety';
  if (total >= 15) severity = 'Severe anxiety';

  return {
    total,
    severity,
    isHighRisk: total >= 15,
  };
}

export function isComplete(responses, expectedCount) {
  return (
    responses.length === expectedCount &&
    responses.every((value) => typeof value === 'number')
  );
}
