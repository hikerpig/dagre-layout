module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { browsers: ['last 3 versions'] } }],
    ['@babel/preset-typescript', {allExtensions: true}],
  ],
}
