module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.integration.test.ts'],
  collectCoverageFrom: [
    'routes/**/*.ts',
    'services/**/*.ts',
    'config/**/*.ts',
    'server.ts',
    '!**/*.d.ts',
    '!**/__tests__/**',
    '!**/__mocks__/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  setupFilesAfterEnv: [],
  testTimeout: 10000
};
