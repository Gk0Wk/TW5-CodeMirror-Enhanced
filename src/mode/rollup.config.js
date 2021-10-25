// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';

const fileName = 'tw5-mode.js';

export default {
    input: 'tw5.ts',
    external: ['codemirror'],
    output: {
        file: '../../dist/build/' + fileName,
        format: 'umd',
        name: 'TW5Mode',
        globals: {
            'codemirror': 'CodeMirror'
        },
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
            extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.node'],
        }),
        json(),
        resolve(),
        {
            name: 'replaceCodeMirrorImport',
            renderChunk(code, chunk) {
                if (chunk.fileName !== fileName) {
                    return {
                        code: code
                    };
                } else {
                    return {
                        code: code.replace('\'codemirror\'', '\'$:/plugins/tiddlywiki/codemirror/lib/codemirror.js\'')
                            .replace('\'codemirror\'', '\'$:/plugins/tiddlywiki/codemirror/lib/codemirror.js\'')
                    };
                }

            },
        }
    ],
};
