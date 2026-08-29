import { Suspense, lazy } from 'react';

const TimePicker = lazy(() =>
  import('@mantine/dates').then((module) => ({ default: module.TimePicker })),
);

function Loader() {
  return <div className="min-h-12 w-full animate-pulse rounded-md bg-mist" />;
}

export function MantineTimePicker(props) {
  return (
    <Suspense fallback={<Loader />}>
      <TimePicker {...props} />
    </Suspense>
  );
}
