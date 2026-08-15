import { useState } from 'react';
import { PHQ9_QUESTIONS, scorePhq9 } from '../../utils/assessmentScoring';
import { AssessmentForm } from './AssessmentForm';

export function Phq9Form({ onComplete }) {
  const [responses, setResponses] = useState([]);

  const handleChange = (questionIndex, value) => {
    setResponses((prev) => {
      const next = [...prev];
      next[questionIndex] = value;
      return next;
    });
  };

  const handleSubmit = () => {
    onComplete(scorePhq9(responses));
  };

  return (
    <AssessmentForm
      title="PHQ-9"
      instructions="Over the last 2 weeks, how often have you been bothered by any of the following problems?"
      questions={PHQ9_QUESTIONS}
      responses={responses}
      onChange={handleChange}
      onSubmit={handleSubmit}
      submitLabel="Calculate PHQ-9 score"
    />
  );
}
