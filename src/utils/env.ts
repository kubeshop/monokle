import {shellEnvSync} from '@monokle-desktop/shared/utils/env';

let mainProcessEnv: any | undefined;

export function getMainProcessEnv() {
  if (!mainProcessEnv) {
    mainProcessEnv = shellEnvSync();
  }
  return mainProcessEnv;
}

export function setMainProcessEnv(env: any) {
  mainProcessEnv = env;
}
