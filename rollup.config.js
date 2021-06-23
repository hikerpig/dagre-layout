import rollupTypescript from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve';
import pkg from './package.json'
import tsconfig from './tsconfig.json'

const config = {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.umd,
      format: 'umd',
      name: 'dagre',
    },
    {
      // file: pkg.module,
      format: 'esm',
      dir: 'dist',
      entryFileNames: 'dagre-layout.esm.js',
    },
  ],
  plugins: [
    commonjs(),
    nodeResolve(),
    rollupTypescript({
      ...tsconfig.compilerOptions,
      declaration: true,
      declarationDir: 'dist/types',
    }),
  ],
}

export default config
