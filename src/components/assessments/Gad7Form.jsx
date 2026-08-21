import { useState } from 'react';
import { GAD7_QUESTIONS, scoreGad7 } from '../../utils/assessmentScoring';
import { AssessmentForm } from './AssessmentForm';

export function Gad7Form({ onComplete }) {
  const [responses, setResponses] = useState([]);

  const handleChange = (questionIndex, value) => {
    setResponses((prev) => {
      const next = [...prev];
      next[questionIndex] = value;
      return next;
    });
  };

  const handleSubmit = () => {
    onComplete({ ...scoreGad7(responses), responses });
  };

  return (
    <AssessmentForm
      title="GAD-7"
      instructions="Over the last 2 weeks, how often have you been bothered by the following problems?"
      questions={GAD7_QUESTIONS}
      responses={responses}
      onChange={handleChange}
      onSubmit={handleSubmit}
      submitLabel="Calculate GAD-7 score"
    />
  );
}
