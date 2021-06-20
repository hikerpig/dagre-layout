import rollupTypescript from '@rollup/plugin-typescript'
import pkg from './package.json'

const config = {
  input: 'src/index.ts',
  output: [
    // {
    //   file: pkg.main,
    //   format: 'cjs',
    // },
    {
      file: pkg.module,
      format: 'esm',
    },
  ],
  plugins: [
    rollupTypescript(),
  ],
}

export default config
