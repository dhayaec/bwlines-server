module.exports = {
  verbose: true,
  rootDir: './',
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(tsx?)$',
  testPathIgnorePatterns: ['<rootDir>/node_modules/'],
  collectCoverage: false,
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/typings/**',
    '!src/utils/create-types.ts',
    '!src/index.ts',
    '!**/node_modules/**',
    '!**/vendor/**',
  ],
};
