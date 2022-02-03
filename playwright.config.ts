import {PlaywrightTestConfig} from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './tests',
  timeout: 80000,
  expect: {
    toMatchSnapshot: {threshold: 0.2},
  },
};

export default config;
