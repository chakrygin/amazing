import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';

import { defineConfig } from 'rollup';

export default defineConfig({
  input: 'src/main.ts',
  context: 'this',
  output: {
    file: 'dist/index.js',
    format: 'es',
  },
  plugins: [
    nodeResolve({
      preferBuiltins: true,
    }),
    commonjs(),
    json(),
    typescript(),
    terser({
      format: {
        comments: false,
      }
    }),
  ],
  onwarn(warning, warn) {
    if (warning.code === 'CIRCULAR_DEPENDENCY') {
      if (warning.message.includes('@actions/core') || warning.message.includes('xmlbuilder')) {
        return;
      }
    }

    warn(warning);
  },
});
