import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

export default {
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
      // Important for ESM resolution
      exportConditions: ['node', 'import', 'default'],
    }),
    commonjs({
      // Better handling of mixed module types
      transformMixedEsModules: true,
      // Required for chalk 5.x
      esmExternals: true,
    }),
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
