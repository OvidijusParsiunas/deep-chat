import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: 'src/aiAssistant.ts',
      formats: ['es'],
      fileName: 'aiAssistant',
    },
  },
  plugins: [
    dts({
      insertTypesEntry: true,
    }),
  ],
});
