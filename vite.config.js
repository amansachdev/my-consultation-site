import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  // Default base is '/' for Azure / custom domain deployments.
  // GitHub Pages workflow overrides this with VITE_BASE_URL for the /my-consultation-site/ path.
  base: process.env.VITE_BASE_URL || '/',
  plugins: [react()],
});
