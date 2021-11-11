import {execSync} from 'child_process';

import {PROCESS_ENV} from '@utils/env';

const {which} = require('shelljs');

let lastId: number = 0;

export const generateId = (prefix: string = 'id'): string => {
  lastId += 1;
  return `${prefix}${lastId}`;
};

export const uniqueArr = <T>(arr: Array<T>): Array<T> => {
  return Array.from(new Set(arr));
};

export const checkMissingDependencies = (dependencies: Array<string>): Array<string> =>
  dependencies.filter(d => {
    try {
      execSync(d, {
        env: {
          NODE_ENV: PROCESS_ENV.NODE_ENV,
          PUBLIC_URL: PROCESS_ENV.PUBLIC_URL,
        },
      });
      return false;
    } catch (e) {
      return true;
    }
  });
