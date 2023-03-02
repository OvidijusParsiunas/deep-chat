import {defineConfig} from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: 'src/AiAssistant.ts',
      formats: ['es'],
      fileName: 'AiAssistant',
    },
  },
});
