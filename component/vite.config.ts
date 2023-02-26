import {defineConfig} from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: 'src/AIAssistant.ts',
      formats: ['es'],
      fileName: 'AIAssistant',
    },
  },
});
