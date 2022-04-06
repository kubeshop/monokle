import {shellEnvSync} from '@utils/env';

export function fixPath() {
  if (process.platform === 'win32') {
    return;
  }

  process.env.PATH =
    shellPathSync() || ['./node_modules/.bin', '/.nodebrew/current/bin', '/usr/local/bin', process.env.PATH].join(':');
}

function shellPathSync() {
  const {PATH} = shellEnvSync();
  return PATH;
}
