module.exports = {
  presets: [
    [
      '@babel/preset-env',
      { targets: { browsers: ['last 3 versions'], node: 'current' } },
    ],
    ['@babel/preset-typescript', { allExtensions: true }],
  ],
}
