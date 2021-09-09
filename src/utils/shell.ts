import {shell} from 'electron';
// @ts-ignore
import shellPath from 'shell-path';
import * as os from 'os';

let cachedShellPath: string | undefined;

export function getShellPath() {
  if (cachedShellPath === undefined) {
    cachedShellPath = shellPath.sync();
  }

  return cachedShellPath;
}

export function openGitHub() {
  shell.openExternal('https://github.com/kubeshop/monokle');
}

export function openDocumentation() {
  shell.openExternal(`https://kubeshop.github.io/monokle?os=${os.type}`);
}
