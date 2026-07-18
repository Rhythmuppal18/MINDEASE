import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration for MindMaze
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
});
