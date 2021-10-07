// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';

export default {
  input: 'Main.ts',
  output: {
    file: '../../dist/build/core.js',
    format: 'umd',
    name: 'CodeMirrorEnhanced',
  },
  plugins: [
    typescript({
      module: 'ESNext',
      target: 'es5',
      experimentalDecorators: true,
    }),
    commonjs({
      extensions: ['.js', '.ts', 'tsx'],
    }),
    json(),
    resolve(),
  ],
};
