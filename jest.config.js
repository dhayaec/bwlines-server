module.exports = {
    verbose: true,
    rootDir: './',
    moduleFileExtensions: ['ts', 'tsx', 'js'],
    transform: {
      '^.+\\.tsx?$': 'ts-jest'
    },
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(tsx?)$',
    testPathIgnorePatterns: ['<rootDir>/node_modules/'],
    collectCoverage: true,
    testEnvironment: 'node',
    collectCoverageFrom: [
      'src/**/*.{ts,tsx}',
      '!src/typings/**',
      '!src/utils/createTypes.ts',
      '!**/node_modules/**',
      '!**/vendor/**'
    ]
  };
  