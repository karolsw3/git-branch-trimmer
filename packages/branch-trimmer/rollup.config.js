// eslint-disable-next-line @typescript-eslint/no-require-imports
const commonjs = require('@rollup/plugin-commonjs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const json = require('@rollup/plugin-json');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const resolve = require('@rollup/plugin-node-resolve');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const typescript = require('@rollup/plugin-typescript');

module.exports = {
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'cjs',
    sourcemap: true,
    exports: 'auto',
    preserveModules: false,
    banner: '#!/usr/bin/env node',
  },
  plugins: [
    resolve({
      preferBuiltins: true,
    }),
    commonjs(),
    json(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist',
      sourceMap: true,
    }),
  ],
  external: [
    'chalk',
    'commander',
    'inquirer',
    'simple-git',
    'path',
    'fs',
    'os',
    'process',
    'child_process',
    'util',
  ],
};
