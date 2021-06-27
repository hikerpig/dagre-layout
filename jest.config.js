module.exports = {
  transform: {
    '\\.[jt]sx?$': 'babel-jest',
  },
  testRegex: 'test/.+?-test\\.js',
  testPathIgnorePatterns: ['test/e2e/.*\\.js'],
  transformIgnorePatterns: ['node_modules/(?!lodash-es/.*)'],
}
