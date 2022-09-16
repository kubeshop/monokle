/* eslint-disable import/first */

import additionalEnvironmentVariables from './env.json';

Object.keys(additionalEnvironmentVariables).forEach((key: string) => {
  // @ts-ignore
  process.env[key] = additionalEnvironmentVariables[key];
});

/*
  NOTE: This must be imported after the aliases are created
  Prettier is disabled in this file in order to keep this import where it needs to be.
*/
import './app/index.ts';
