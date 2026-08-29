import { Suspense, lazy } from 'react';

const TimePicker = lazy(() =>
  import('@mantine/dates').then((module) => ({ default: module.TimePicker })),
);

function Loader() {
  return <div className="min-h-12 w-full animate-pulse rounded-md bg-mist" />;
}

export function MantineTimePicker({ onChange, ...props }) {
  const handleChange = (value) => {
    onChange?.(value);
    // Workaround: Mantine keeps focus inside the input group after selecting a
    // preset, so clicking the input again does not reopen the dropdown. Blur
    // the active element so the next click can focus and reopen it.
    if (typeof document !== 'undefined') {
      document.activeElement?.blur?.();
    }
  };

  return (
    <Suspense fallback={<Loader />}>
      <TimePicker {...props} onChange={handleChange} />
    </Suspense>
  );
}
