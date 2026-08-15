import { ANSWER_OPTIONS } from '../../utils/assessmentScoring';

export function AssessmentForm({
  title,
  instructions,
  questions,
  responses,
  onChange,
  onSubmit,
  submitLabel = 'See results',
}) {
  const allAnswered = questions.every((_, index) => typeof responses[index] === 'number');

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (allAnswered) onSubmit();
      }}
      className="grid gap-6 rounded-lg border border-neutral-line bg-white p-5 shadow-sm sm:p-7"
    >
      <div>
        <h2 className="font-serif text-2xl font-semibold text-neutral-ink">
          {title}
        </h2>
        <p className="mt-2 leading-7 text-neutral-slate">{instructions}</p>
      </div>

      <fieldset className="grid gap-6">
        <legend className="sr-only">{title}</legend>
        {questions.map((question, questionIndex) => (
          <div key={questionIndex} className="grid gap-3">
            <p className="font-medium text-neutral-ink">
              <span className="mr-2 text-brand-leaf">{questionIndex + 1}.</span>
              {question}
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {ANSWER_OPTIONS.map((option) => {
                const inputId = `q-${questionIndex}-${option.value}`;
                return (
                  <label
                    key={inputId}
                    htmlFor={inputId}
                    className={`flex cursor-pointer items-center gap-3 rounded-md border px-4 py-3 transition ${
                      responses[questionIndex] === option.value
                        ? 'border-brand-leaf bg-brand-sage'
                        : 'border-neutral-line bg-neutral-mist hover:border-brand-leaf'
                    }`}
                  >
                    <input
                      id={inputId}
                      type="radio"
                      name={`question-${questionIndex}`}
                      value={option.value}
                      checked={responses[questionIndex] === option.value}
                      onChange={() => onChange(questionIndex, option.value)}
                      className="h-4 w-4 accent-brand-forest"
                      required
                    />
                    <span className="text-sm text-neutral-ink">{option.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </fieldset>

      <button
        type="submit"
        disabled={!allAnswered}
        className="inline-flex min-h-12 items-center justify-center rounded-full bg-brand-forest px-6 font-semibold text-white shadow-sm transition hover:bg-neutral-ink disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitLabel}
      </button>
    </form>
  );
}
