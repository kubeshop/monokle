import {execSync} from 'child_process';

import {PROCESS_ENV} from '@utils/env';

let lastId: number = 0;

export const generateId = (prefix: string = 'id'): string => {
  lastId += 1;
  return `${prefix}${lastId}`;
};

export const uniqueArr = <T>(arr: Array<T>): Array<T> => {
  return Array.from(new Set(arr));
};

export const checkMissingDependencies = (dependencies: Array<string>): Array<string> => {
  console.log(`checking dependencies with process path: ${PROCESS_ENV.PATH}`);

  return dependencies.filter(d => {
    try {
      execSync(d, {
        env: {
          NODE_ENV: PROCESS_ENV.NODE_ENV,
          PUBLIC_URL: PROCESS_ENV.PUBLIC_URL,
          PATH: PROCESS_ENV.PATH,
        },
      });
      return false;
    } catch (e: any) {
      // If kubectl kustomize was ran and threw an exception that it could not find any kustomization file - should return false
      if (e.message.includes("unable to find one of 'kustomization.yaml', 'kustomization.yml' or 'Kustomization'")) {
        return false;
      }

      return true;
    }
  });
};
