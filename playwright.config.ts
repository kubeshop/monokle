import {PlaywrightTestConfig} from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './tests',
  testMatch: '**/*.test.ts',
  timeout: 200000,
  expect: {
    toMatchSnapshot: {threshold: 0.2},
  },
  retries: 3,
};

export default config;
