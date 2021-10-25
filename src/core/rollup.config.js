// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';

export default {
    input: 'Main.ts',
    external: ['codemirror'],
    output: {
        file: '../../dist/build/core.js',
        format: 'iife',
        globals: {
            codemirror: 'CodeMirror'
        }
    },
    plugins: [
        typescript({
            module: 'ESNext',
            target: 'ES5',
            experimentalDecorators: true,
            allowJs: true,
            noEmit: true,
            downlevelIteration: true,
            isolatedModules: true,
            moduleResolution: 'node',
            removeComments: true,
            esModuleInterop: true
        }),
        commonjs({
            extensions: ['.js', '.ts', 'tsx'],
        }),
        json(),
        resolve(),
    ],
};
