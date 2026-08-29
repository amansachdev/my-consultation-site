import React from 'react';
import { createRoot } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext';
import { mantineTheme } from './lib/mantine-theme';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import './styles.css';

async function enableMocking() {
  if (import.meta.env.VITE_ENABLE_MSW !== 'true') return;
  const { worker } = await import('./mocks/browser');
  return worker.start({ onUnhandledRequest: 'bypass' });
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <MantineProvider theme={mantineTheme}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MantineProvider>
    </React.StrictMode>,
  );
});
