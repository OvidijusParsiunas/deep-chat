import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: 'src/deepChat.ts',
      formats: ['es'],
      fileName: 'deepChat',
    },
  },
  plugins: [
    dts({
      insertTypesEntry: true,
    }),
  ],
});
