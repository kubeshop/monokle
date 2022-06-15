const config = {
  verbose: true,
};

module.exports = config;

// Or async function
module.exports = async () => {
  return {
    verbose: true,
    preset: 'jest-playwright-preset',
    transform: {
      '\\.[jt]sx?$': 'ts-jest',
    },
    testEnvironmentOptions: {
      'jest-playwright': {
        // Options...
      },
    },
    moduleNameMapper: {
      '@models/(.+)': '<rootDir>/src/models/$1',
      '@redux/(.+)': '<rootDir>/src/redux/$1',
      '@src/(.+)': '<rootDir>/src/$1',
    },
  };
};
