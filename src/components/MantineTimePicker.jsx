import { Suspense, lazy } from 'react';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

const MantineTimePickerRoot = lazy(() =>
  Promise.all([import('@mantine/core'), import('@mantine/dates')]).then(([core, dates]) => {
    const theme = core.createTheme({
      fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
      colors: {
        brand: [
          '#f6f4ef',
          '#e8eee4',
          '#d4ddd0',
          '#b9c5b8',
          '#6b8a75',
          '#5a7865',
          '#4a6655',
          '#3e5748',
          '#2e4f43',
          '#243d33',
        ],
      },
      primaryColor: 'brand',
      defaultRadius: 'md',
      components: {
        Input: {
          styles: () => ({
            input: {
              backgroundColor: '#f6f7f3',
              borderColor: '#dfe3da',
              borderRadius: '0.375rem',
              minHeight: '3rem',
              fontSize: '1rem',
              transition: 'border-color 160ms ease, background-color 160ms ease, box-shadow 160ms ease',
              '&:focus, &:focus-within': {
                backgroundColor: '#ffffff',
                borderColor: '#6b8a75',
                boxShadow: '0 0 0 4px rgba(107, 138, 117, 0.15)',
              },
            },
          }),
        },
        TimePicker: {
          styles: () => ({
            input: {
              backgroundColor: '#f6f7f3',
              borderColor: '#dfe3da',
              borderRadius: '0.375rem',
              minHeight: '3rem',
            },
            timeInput: {
              backgroundColor: 'transparent',
              border: 'none',
              textAlign: 'center',
            },
          }),
        },
      },
    });

    function Root(props) {
      return (
        <core.MantineProvider theme={theme}>
          <dates.TimePicker {...props} />
        </core.MantineProvider>
      );
    }

    return { default: Root };
  }),
);

function Loader() {
  return <div className="min-h-12 w-full animate-pulse rounded-md bg-mist" />;
}

export function MantineTimePicker(props) {
  return (
    <Suspense fallback={<Loader />}>
      <MantineTimePickerRoot {...props} />
    </Suspense>
  );
}
