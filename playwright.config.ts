import {PlaywrightTestConfig} from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './tests',
  expect: {
    toMatchSnapshot: {threshold: 0.2},
  },
};

export default config;
