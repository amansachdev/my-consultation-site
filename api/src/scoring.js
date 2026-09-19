export function scoreAssessment(type, responses) {
  const expected = type === 'PHQ-9' ? 9 : type === 'GAD-7' ? 7 : 0;
  if (!expected || !Array.isArray(responses) || responses.length !== expected || responses.some((value) => !Number.isInteger(value) || value < 0 || value > 3)) return null;

  const score = responses.reduce((sum, value) => sum + value, 0);
  let severity = type === 'PHQ-9' ? 'Minimal depression' : 'Minimal anxiety';
  if (type === 'PHQ-9') {
    if (score >= 5) severity = 'Mild depression';
    if (score >= 10) severity = 'Moderate depression';
    if (score >= 15) severity = 'Moderately severe depression';
    if (score >= 20) severity = 'Severe depression';
  } else {
    if (score >= 5) severity = 'Mild anxiety';
    if (score >= 10) severity = 'Moderate anxiety';
    if (score >= 15) severity = 'Severe anxiety';
  }

  return {
    score,
    severity,
    isHighRisk: type === 'PHQ-9' ? responses[8] > 0 : score >= 15,
  };
}
