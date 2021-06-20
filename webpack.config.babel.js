const path = require('path')
const nodeExternals = require('webpack-node-externals')

const PATH_ALIASES = {
  lib: path.resolve(__dirname, 'lib')
}

const config = {
  mode: 'development',
  target: 'web',
  entry: {
    'dagre-layout': './lib/index.ts'
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
    library: 'dagre',
    libraryTarget: 'umd',
    libraryExport: 'default'
  },
  resolve: {
    alias: PATH_ALIASES,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        }
      }
    ]
  },
  devtool: 'source-map'
}

const coreConfig = {
  mode: 'development',
  target: 'node',
  entry: {
    'dagre-layout': './lib/index.ts'
  },
  externals: [nodeExternals()],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].core.js',
    libraryTarget: 'commonjs2'
  },
  resolve: {
    alias: PATH_ALIASES,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },
  devtool: 'source-map'
}

// export default [config, coreConfig]
module.exports = [config, coreConfig]
