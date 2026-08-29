import '../src/styles.css';
import { AuthProvider } from '../src/context/AuthContext';

const workerReady = (async () => {
  if (import.meta.env.VITE_ENABLE_MSW !== 'true') return;
  const { worker } = await import('../src/mocks/browser');
  await worker.start({ onUnhandledRequest: 'bypass' });
})();

const preview = {
  decorators: [
    (Story) => (
      <AuthProvider>
        <Story />
      </AuthProvider>
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
