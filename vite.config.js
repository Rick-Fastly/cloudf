import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Use the exact repository name here!
const REPO_NAME = '/cloudf/'; 

export default defineConfig({
  base: REPO_NAME, 
  plugins: [react()],
});
