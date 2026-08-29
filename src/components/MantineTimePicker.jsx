import { Suspense, lazy } from 'react';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

const MantineProvider = lazy(() =>
  import('@mantine/core').then((module) => ({ default: module.MantineProvider })),
);
const TimePicker = lazy(() =>
  import('@mantine/dates').then((module) => ({ default: module.TimePicker })),
);

function Loader() {
  return <div className="min-h-12 w-full animate-pulse rounded-md bg-mist" />;
}

export function MantineTimePicker(props) {
  return (
    <Suspense fallback={<Loader />}>
      <MantineProvider>
        <TimePicker {...props} />
      </MantineProvider>
    </Suspense>
  );
}
