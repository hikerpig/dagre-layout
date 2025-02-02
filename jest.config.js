module.exports = {
  reporters: ['default', ['jest-junit', { outputDirectory: './reports' }]],
  transform: {
    '\\.[jt]sx?$': ['esbuild-jest', { sourcemap: true }],
  },
  testRegex: 'test/.+?-test\\.[jt]s',
  testPathIgnorePatterns: ['test/e2e/.*\\.js'],
  transformIgnorePatterns: ['node_modules/.pnpm/(?!lodash-es.*)'],
}
