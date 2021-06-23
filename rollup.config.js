import rollupTypescript from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { terser } from "rollup-plugin-terser"
import pkg from './package.json'
import tsconfig from './tsconfig.json'

const isProd = process.env.NODE_ENV === 'production'

const config = {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.umd,
      format: 'umd',
      name: 'dagre',
    },
    {
      format: 'esm',
      dir: 'dist',
      entryFileNames: 'dagre-layout.js',
    },
  ].concat(isProd ?[
    {
      file: pkg.umd.replace(/\.js$/, '.min.js'),
      format: 'umd',
      name: 'dagre',
      plugins: [terser()]
    },
  ]: []),
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
