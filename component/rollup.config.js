import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import summary from 'rollup-plugin-summary';
import {terser} from 'rollup-plugin-terser';

export default {
  input: 'dist/deepChat.js',
  output: {
    file: 'dist/deepChat.bundle.js',
    format: 'esm',
  },
  onwarn(warning) {
    if (warning.code !== 'THIS_IS_UNDEFINED') {
      console.error(`(!) ${warning.message}`);
    }
  },
  plugins: [
    replace({'Reflect.decorate': 'undefined'}),
    resolve(),
    terser({
      ecma: 2017,
      module: true,
      warnings: true,
      mangle: {
        properties: {
          regex: /^__/,
        },
      },
    }),
    summary(),
  ],
};
