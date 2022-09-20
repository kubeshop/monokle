const {pathsToModuleNameMapper} = require('ts-jest');
const {compilerOptions} = require('./tsconfig.json');

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
    moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {prefix: '<rootDir>/'}),
  };
};
