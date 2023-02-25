import {defineConfig} from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: 'src/realAI.ts',
      formats: ['es'],
      fileName: 'realAI',
    },
  },
});
