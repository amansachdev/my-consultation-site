import '../src/styles.css';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import { MantineProvider } from '@mantine/core';
import { AuthProvider } from '../src/context/AuthContext';
import { mantineTheme } from '../src/lib/mantine-theme';

const workerReady = (async () => {
  if (import.meta.env.VITE_ENABLE_MSW !== 'true') return;
  const { worker } = await import('../src/mocks/browser');
  await worker.start({ onUnhandledRequest: 'bypass' });
})();

const preview = {
  decorators: [
    (Story) => (
      <MantineProvider theme={mantineTheme}>
        <AuthProvider>
          <Story />
        </AuthProvider>
      </MantineProvider>
    ),
  ],
  loaders: [
    async () => {
      await workerReady;
      return {};
    },
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
  },
};

export default preview;
