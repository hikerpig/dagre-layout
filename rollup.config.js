import rollupTypescript from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve';
import pkg from './package.json'

const config = {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.umd,
      format: 'umd',
      name: 'dagre',
    },
    {
      file: pkg.module,
      format: 'esm',
    },
  ],
  plugins: [
    commonjs(),
    nodeResolve(),
    rollupTypescript(),
  ],
}

export default config
